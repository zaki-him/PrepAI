import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { callClaude } from "@/lib/claude"
import { buildEvaluatorPrompt } from "@/lib/prompts"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { interview_id } = await request.json()

  if (!interview_id) {
    return NextResponse.json(
      { error: "Missing interview_id" },
      { status: 400 }
    )
  }

  const { data: interview, error: interviewError } = await supabase
    .from("interviews")
    .select("user_id")
    .eq("id", interview_id)
    .single()

  if (interviewError || !interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 })
  }

  if (interview.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: turns, error: turnsError } = await supabase
    .from("interview_turns")
    .select("role, content, created_at")
    .eq("interview_id", interview_id)
    .order("created_at", { ascending: true })

  if (turnsError || !turns) {
    return NextResponse.json(
      { error: "Failed to fetch turns" },
      { status: 500 }
    )
  }

  const transcript = turns
    .map((t) => `${t.role === "ai" ? "Interviewer" : "Candidate"}: ${t.content}`)
    .join("\n\n")

  const systemPrompt = buildEvaluatorPrompt()
  const claudeMessages = [{ role: "user" as const, content: transcript }]

  let evaluationText: string
  try {
    evaluationText = await callClaude(systemPrompt, claudeMessages)
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    )
  }

  let evaluation: { overall_score: number; improvements: string[] }
  try {
    evaluation = JSON.parse(evaluationText)
  } catch {
    return NextResponse.json(
      { error: "Failed to parse evaluation" },
      { status: 500 }
    )
  }

  if (
    typeof evaluation.overall_score !== "number" ||
    !Array.isArray(evaluation.improvements)
  ) {
    return NextResponse.json(
      { error: "Invalid evaluation format" },
      { status: 500 }
    )
  }

  const { error: feedbackError } = await supabase.from("feedback").insert({
    interview_id,
    improvements: evaluation.improvements,
  })

  if (feedbackError) {
    return NextResponse.json({ error: feedbackError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from("interviews")
    .update({
      overall_score: evaluation.overall_score,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", interview_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    overall_score: evaluation.overall_score,
    improvements: evaluation.improvements,
  })
}
