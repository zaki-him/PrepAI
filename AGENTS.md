# AI Interview Practice App — agents.md

## Project Overview

A voice-first AI interview coach web application where users fill a quick setup form, get interviewed by an AI voice interviewer, and receive a score plus improvement suggestions. All progress is saved to their account.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth + Database | Supabase (Auth + Postgres) |
| AI | Gemini API — `gemini-2.0-flash` |
| STT | Web Speech API (`SpeechRecognition`) — browser-native, free |
| TTS | Web Speech Synthesis API (`speechSynthesis`) — browser-native, free |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Hosting | Vercel |

---

## Core User Journey

```
Sign Up / Log In
      ↓
Fill Interview Setup Form
(Job Title + Domain + Seniority)
      ↓
AI generates interview questions dynamically via Gemini API
      ↓
Live Voice Session
[User speaks → SpeechRecognition STT → Gemini API → speechSynthesis TTS → User hears AI]
      ↓
Session ends (user or AI wraps up after N questions)
      ↓
Results Page
(Overall Score + Suggested Improvements)
      ↓
Dashboard (interview history + progress tracking)
```

---

## Project File Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                  # Protected layout — redirect if not authed
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Interview history + progress
│   │   ├── interview/
│   │   │   ├── setup/
│   │   │   │   └── page.tsx            # Interview setup form
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # Live voice session
│   │   │   │   └── results/
│   │   │   │       └── page.tsx        # Score + improvements
│   ├── api/
│   │   ├── interview/
│   │   │   ├── create/
│   │   │   │   └── route.ts            # POST — create interview session in DB
│   │   │   ├── turn/
│   │   │   │   └── route.ts            # POST — send user transcript, get AI response
│   │   │   └── evaluate/
│   │   │       └── route.ts            # POST — generate final score + improvements
│   └── layout.tsx                      # Root layout
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── interview/
│   │   ├── SetupForm.tsx               # Job title + domain + seniority form
│   │   ├── VoiceSession.tsx            # "use client" — core voice loop component
│   │   ├── VoiceOrb.tsx                # "use client" — animated mic/speaking indicator
│   │   ├── TranscriptPanel.tsx         # "use client" — live transcript display
│   │   └── ResultsCard.tsx             # Score + improvements display
│   ├── dashboard/
│   │   ├── InterviewHistory.tsx        # List of past interviews
│   │   └── ProgressStats.tsx           # Avg score, total sessions, trend
│   └── ui/                             # shadcn/ui components live here
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser Supabase client
│   │   └── server.ts                   # Server Supabase client (cookies)
│   ├── gemini.ts                       # Gemini API wrapper (turn + evaluate)
│   ├── prompts.ts                      # All system prompts
│   └── utils.ts                        # cn(), formatters, helpers
├── store/
│   └── interviewStore.ts               # Zustand — session state machine
├── types/
│   └── index.ts                        # Shared TypeScript types
├── middleware.ts                        # Supabase auth session refresh + route protection
└── .env.local                          # Environment variables (never commit)
```

---

## Database Schema (Supabase Postgres)

```sql
-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  domain TEXT NOT NULL,
  seniority TEXT NOT NULL CHECK (seniority IN ('junior', 'mid', 'senior', 'lead')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Interview Turns (transcript)
CREATE TABLE interview_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ai', 'user')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  improvements TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Interviews: users can only CRUD their own interviews
CREATE POLICY "Users can manage own interviews" ON interviews
  FOR ALL USING (auth.uid() = user_id);

-- Interview turns: scoped through interview ownership
CREATE POLICY "Users can manage own turns" ON interview_turns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM interviews WHERE interviews.id = interview_id AND interviews.user_id = auth.uid())
  );

-- Feedback: scoped through interview ownership
CREATE POLICY "Users can view own feedback" ON feedback
  FOR ALL USING (
    EXISTS (SELECT 1 FROM interviews WHERE interviews.id = interview_id AND interviews.user_id = auth.uid())
  );
```

---

## Session State Machine (Zustand)

```typescript
// store/interviewStore.ts
type InterviewPhase =
  | 'idle'
  | 'briefing'       // AI introduces itself
  | 'questioning'    // AI asks a question, waits for user
  | 'listening'      // User is speaking (STT active)
  | 'processing'     // Sending transcript to Claude
  | 'responding'     // AI is speaking (TTS active)
  | 'wrapping_up'    // AI delivers closing remarks
  | 'completed'      // Session over, redirect to results

interface InterviewStore {
  phase: InterviewPhase
  interviewId: string | null
  turns: { role: 'ai' | 'user'; content: string }[]
  currentTranscript: string
  questionCount: number
  setPhase: (phase: InterviewPhase) => void
  addTurn: (turn: { role: 'ai' | 'user'; content: string }) => void
  setCurrentTranscript: (text: string) => void
  reset: () => void
}
```

---

## Gemini API — System Prompts (`lib/prompts.ts`)

### Interviewer Prompt (used during `/api/interview/turn`)

```typescript
export const buildInterviewerPrompt = (
  jobTitle: string,
  domain: string,
  seniority: string
) => `
You are a professional, calm, and encouraging AI interviewer conducting a mock interview.

Candidate profile:
- Job Title: ${jobTitle}
- Domain: ${domain}
- Seniority Level: ${seniority}

Rules:
1. Ask ONE question at a time. Never stack multiple questions.
2. Tailor questions to the candidate's domain and seniority.
3. After each user answer, give ONE brief (1 sentence) acknowledgment, then ask the next question.
4. After exactly 5 questions, say a professional closing statement and output the exact token: [INTERVIEW_COMPLETE]
5. Keep all responses concise — this is a voice interface, not chat.
6. Never break character. Never explain that you are an AI mid-interview.
`;
```

### Evaluator Prompt (used during `/api/interview/evaluate`)

```typescript
export const buildEvaluatorPrompt = () => `
You are a senior hiring manager evaluating a mock interview transcript.

Return ONLY valid JSON in this exact shape, no markdown, no explanation:
{
  "overall_score": <integer 0-100>,
  "improvements": [
    "<specific, actionable improvement tip>",
    "<specific, actionable improvement tip>",
    "<specific, actionable improvement tip>"
  ]
}

Scoring rubric:
- 90-100: Exceptional — clear, structured, confident answers with strong examples
- 70-89: Good — solid answers but missing depth or structure in places
- 50-69: Average — answers are vague or lack concrete examples
- Below 50: Needs significant work — unclear, off-topic, or very thin answers
`;
```

---

## API Routes

### `POST /api/interview/create`
- **Auth:** Required (read user from Supabase server client)
- **Body:** `{ job_title, domain, seniority }`
- **Action:** Insert row into `interviews` table, return `interview_id`

### `POST /api/interview/turn`
- **Auth:** Required
- **Body:** `{ interview_id, user_message, conversation_history }`
- **Action:**
  1. Call Gemini with interviewer system prompt + full conversation history
  2. Insert both user turn and AI turn into `interview_turns`
  3. Check if response contains `[INTERVIEW_COMPLETE]`
  4. Return `{ ai_message, is_complete }`

### `POST /api/interview/evaluate`
- **Auth:** Required
- **Body:** `{ interview_id }`
- **Action:**
  1. Fetch all turns for this interview from DB
  2. Call Gemini with evaluator prompt + full transcript
  3. Parse JSON response → insert into `feedback`, update `interviews.overall_score` and `status = 'completed'`
  4. Return `{ overall_score, improvements }`

---

## Voice Pipeline (`components/interview/VoiceSession.tsx`)

```
Component mounts
      ↓
AI speaks opening briefing via speechSynthesis
      ↓
LOOP:
  1. AI question delivered via speechSynthesis (phase: 'responding')
  2. SpeechRecognition starts listening (phase: 'listening')
  3. User speaks → interim transcript shown in UI
  4. Silence detected → SpeechRecognition fires onend
  5. Final transcript sent to POST /api/interview/turn (phase: 'processing')
  6. AI response text received
  7. Check is_complete flag
     → false: back to step 1 with new question
     → true: call POST /api/interview/evaluate, redirect to /results
```

### Browser Compatibility Warning
- Show a banner if `window.SpeechRecognition` and `window.webkitSpeechRecognition` are both undefined
- Recommend Chrome or Edge
- Block entry to voice session on unsupported browsers

---

## Environment Variables (`.env.local`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-only, never expose to client

# Gemini
GEMINI_API_KEY=                   # Server-only, never expose to client
```

---

## Build Phases

### Phase 1 — Foundation
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind + shadcn/ui
- [ ] Configure Supabase project — run schema SQL + RLS policies
- [ ] Set up Supabase auth (email/password) — login + signup pages
- [ ] `middleware.ts` — protect `/app/**` routes, redirect unauthenticated users
- [ ] `lib/supabase/client.ts` and `lib/supabase/server.ts`

### Phase 2 — Interview Setup
- [ ] `SetupForm.tsx` — job title input, domain input, seniority select
- [ ] `POST /api/interview/create` route
- [ ] On form submit → create interview in DB → redirect to `/interview/[id]`

### Phase 3 — Voice Session
- [ ] `interviewStore.ts` — Zustand state machine
- [ ] `VoiceSession.tsx` — full STT + API + TTS loop
- [ ] `VoiceOrb.tsx` — visual indicator (idle / listening / speaking)
- [ ] `TranscriptPanel.tsx` — live transcript display
- [ ] `POST /api/interview/turn` route
- [ ] `POST /api/interview/evaluate` route
- [ ] Browser compatibility detection + warning banner

### Phase 4 — Results
- [ ] `ResultsCard.tsx` — score display + improvements list
- [ ] `/interview/[id]/results/page.tsx` — fetch feedback from DB, render card

### Phase 5 — Dashboard
- [ ] `InterviewHistory.tsx` — list past interviews with score + date
- [ ] `ProgressStats.tsx` — average score, total sessions, best score
- [ ] `/dashboard/page.tsx` — compose history + stats

### Phase 6 — Polish
- [ ] Loading states for all async operations
- [ ] Error boundaries for voice pipeline failures
- [ ] Empty states (no interviews yet)
- [ ] Responsive design check (mobile-friendly)
- [ ] Toast notifications (shadcn/ui Toaster)

---

## Key Constraints & Rules for the Agent

1. **Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the client.** All Gemini and privileged Supabase calls happen in `app/api/**` server routes only.
2. **All components using `SpeechRecognition`, `speechSynthesis`, `useState`, or `useEffect` must have `"use client"` at the top.**
3. **Always validate user ownership server-side** — never trust `interview_id` from the client without verifying it belongs to the authenticated user via Supabase RLS or an explicit `.eq('user_id', user.id)` query.
4. **Pass full conversation history** on every call to `/api/interview/turn` — Gemini has no memory between requests.
5. **Target Chrome and Edge only** for the voice session. Show a clear unsupported browser message for all others.
6. **shadcn/ui components** are installed via CLI (`npx shadcn@latest add <component>`), not copied manually.
7. **Use the App Router exclusively.** No `pages/` directory. No `getServerSideProps`.