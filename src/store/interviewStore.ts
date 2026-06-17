import { create } from "zustand"

export type InterviewPhase =
  | "idle"
  | "briefing"
  | "questioning"
  | "listening"
  | "processing"
  | "responding"
  | "wrapping_up"
  | "completed"

export interface Turn {
  role: "ai" | "user"
  content: string
}

interface InterviewStore {
  phase: InterviewPhase
  interviewId: string | null
  turns: Turn[]
  currentTranscript: string
  questionCount: number
  setPhase: (phase: InterviewPhase) => void
  addTurn: (turn: Turn) => void
  setCurrentTranscript: (text: string) => void
  reset: () => void
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  phase: "idle",
  interviewId: null,
  turns: [],
  currentTranscript: "",
  questionCount: 0,
  setPhase: (phase) => set({ phase }),
  addTurn: (turn) =>
    set((state) => ({
      turns: [...state.turns, turn],
      questionCount:
        turn.role === "ai"
          ? state.questionCount + 1
          : state.questionCount,
    })),
  setCurrentTranscript: (text) => set({ currentTranscript: text }),
  reset: () =>
    set({
      phase: "idle",
      interviewId: null,
      turns: [],
      currentTranscript: "",
      questionCount: 0,
    }),
}))
