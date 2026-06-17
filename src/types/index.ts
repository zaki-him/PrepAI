export type Seniority = "junior" | "mid" | "senior" | "lead"

export type InterviewStatus = "pending" | "active" | "completed"

export interface Interview {
  id: string
  user_id: string
  job_title: string
  domain: string
  seniority: Seniority
  status: InterviewStatus
  overall_score: number | null
  created_at: string
  completed_at: string | null
}

export interface InterviewTurn {
  id: string
  interview_id: string
  role: "ai" | "user"
  content: string
  created_at: string
}

export interface Feedback {
  id: string
  interview_id: string
  improvements: string[]
  generated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  created_at: string
}
