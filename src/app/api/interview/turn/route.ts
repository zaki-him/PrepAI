import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { callGemini } from "@/lib/gemini"
import { buildInterviewerPrompt } from "@/lib/prompts"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { interview_id, user_message, conversation_history } =
    await request.json()

  if (!interview_id) {
    return NextResponse.json(
      { error: "Missing interview_id" },
      { status: 400 }
    )
  }

  const { data: interview, error: fetchError } = await supabase
    .from("interviews")
    .select("job_title, domain, seniority, user_id")
    .eq("id", interview_id)
    .single()

  if (fetchError || !interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 })
  }

  if (interview.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await supabase
    .from("interviews")
    .update({ status: "active" })
    .eq("id", interview_id)
    .eq("status", "pending")

  const systemPrompt = buildInterviewerPrompt(
    interview.job_title,
    interview.domain,
    interview.seniority
  )

  const geminiMessages = [
    ...(conversation_history ?? []),
    { role: "user" as const, content: user_message },
  ]

  let aiMessage: string
  try {
    aiMessage = await callGemini(systemPrompt, geminiMessages)
  } catch {
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 503 }
    )
  }

  const isComplete = aiMessage.includes("[INTERVIEW_COMPLETE]")
  const cleanMessage = aiMessage.replace("[INTERVIEW_COMPLETE]", "").trim()

  const turnInserts = [
    { interview_id, role: "user", content: user_message },
    { interview_id, role: "ai", content: cleanMessage || aiMessage },
  ]

  const { error: insertError } = await supabase
    .from("interview_turns")
    .insert(turnInserts)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (isComplete) {
    await supabase
      .from("interviews")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", interview_id)
  }

  return NextResponse.json({
    ai_message: cleanMessage || aiMessage,
    is_complete: isComplete,
  })
}
