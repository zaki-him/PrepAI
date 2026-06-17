import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VoiceSession } from "@/components/interview/VoiceSession"

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: interview, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !interview) {
    notFound()
  }

  if (interview.user_id !== user.id) {
    redirect("/dashboard")
  }

  if (interview.status === "completed") {
    redirect(`/interview/${id}/results`)
  }

  const { data: turns } = await supabase
    .from("interview_turns")
    .select("role, content")
    .eq("interview_id", id)
    .order("created_at", { ascending: true })

  const existingTurns =
    turns?.map((t) => ({
      role: t.role as "ai" | "user",
      content: t.content,
    })) ?? []

  return (
    <VoiceSession
      interviewId={id}
      existingTurns={existingTurns}
    />
  )
}
