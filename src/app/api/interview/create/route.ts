import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { job_title, domain, seniority } = await request.json()

  if (!job_title || !domain || !seniority) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  if (!["junior", "mid", "senior", "lead"].includes(seniority)) {
    return NextResponse.json(
      { error: "Invalid seniority value" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("interviews")
    .insert({
      user_id: user.id,
      job_title,
      domain,
      seniority,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ interview_id: data.id })
}
