import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResultsCard } from "@/components/interview/ResultsCard"
import { Lightbulb } from "lucide-react"
import Link from "next/link"

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

const performanceTiers = [
  {
    min: 90,
    label: "Exceptional Performance",
    description:
      "You delivered clear, structured, and confident answers with strong, relevant examples. Your responses demonstrated deep domain knowledge and thoughtful preparation.",
    color: "text-cyan-400",
  },
  {
    min: 70,
    label: "Strong Performance",
    description:
      "You provided solid answers with good domain awareness. Your responses were relevant and coherent, though adding more structure and concrete examples would elevate them further.",
    color: "text-cyan-400",
  },
  {
    min: 50,
    label: "Average Performance",
    description:
      "Your answers touched on the right topics but lacked depth and specificity. Focusing on structured responses with real-world examples will help you build more compelling answers.",
    color: "text-amber-400",
  },
  {
    min: 0,
    label: "Needs Improvement",
    description:
      "Your responses would benefit from clearer structure and more relevant content. Practice organizing your thoughts around specific examples and staying focused on the question asked.",
    color: "text-red-400",
  },
] as const

function getPerformanceTier(score: number) {
  return (
    performanceTiers.find((tier) => score >= tier.min) ??
    performanceTiers[performanceTiers.length - 1]
  )
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single()

  if (interviewError || !interview) {
    notFound()
  }

  if (interview.status !== "completed" || interview.overall_score === null) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        <p className="text-sm text-muted-foreground">
          Your interview is still being evaluated. Please wait...
        </p>
      </div>
    )
  }

  const { data: feedback } = await supabase
    .from("feedback")
    .select("improvements")
    .eq("interview_id", id)
    .single()

  const improvements = feedback?.improvements ?? []
  const tier = getPerformanceTier(interview.overall_score)

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="glow-cyan-lg rounded-2xl border border-white/[0.06] bg-card/50 p-8 backdrop-blur-sm">
        <ResultsCard
          score={interview.overall_score}
          className="mx-auto h-[280px] w-[280px]"
        />

        <div className="mt-6 text-center">
          <h1 className={`text-2xl font-bold ${tier.color}`}>
            {tier.label}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {tier.description}
          </p>
        </div>
      </div>

      {improvements.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold tracking-wider text-white/40 uppercase">
            Improvement Areas
          </h2>
          {improvements.map((improvement: string, index: number) => (
            <div
              key={index}
              className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-card/30 p-4 transition-colors hover:border-cyan-500/20 hover:bg-card/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Lightbulb className="h-4 w-4" />
              </div>
              <p className="pt-1 text-sm leading-relaxed text-muted-foreground">
                {improvement}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-cyan-400"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
