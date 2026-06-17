import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Trophy, Target } from "lucide-react"

export async function ProgressStats() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: interviews } = await supabase
    .from("interviews")
    .select("overall_score, status")
    .eq("user_id", user.id)
    .eq("status", "completed")

  const completed = interviews ?? []
  const scores = completed
    .map((i) => i.overall_score)
    .filter((s): s is number => s !== null)

  const totalSessions = completed.length
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null
  const bestScore = scores.length > 0 ? Math.max(...scores) : null

  const stats = [
    {
      icon: BarChart3,
      label: "Total Sessions",
      value: totalSessions.toString(),
      sub: "Completed interviews",
    },
    {
      icon: Target,
      label: "Average Score",
      value: avgScore !== null ? `${avgScore}%` : "—",
      sub: avgScore !== null ? "Across all sessions" : "No scores yet",
    },
    {
      icon: Trophy,
      label: "Best Score",
      value: bestScore !== null ? `${bestScore}%` : "—",
      sub: bestScore !== null ? "Your top performance" : "Complete an interview",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                <Icon className="h-4 w-4 text-cyan-400" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
