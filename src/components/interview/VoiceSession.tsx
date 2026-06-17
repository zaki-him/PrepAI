"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useInterviewStore } from "@/store/interviewStore"
import type { Turn } from "@/store/interviewStore"
import { VoiceOrb } from "./VoiceOrb"
import { TranscriptPanel } from "./TranscriptPanel"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Bot, Mic, MicOff, SkipForward, LogOut, AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"

interface VoiceSessionProps {
  interviewId: string
  existingTurns: Turn[]
}

function BrowserWarning() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        </div>
        <h2 className="font-heading text-lg font-semibold">Browser Not Supported</h2>
        <p className="text-sm text-muted-foreground">
          Voice interviews require Chrome or Edge. Your current browser doesn&apos;t
          support the Speech Recognition API needed for this feature.
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-cyan-400 underline-offset-4 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

function useBrowserSupport() {
  const [supported] = useState(() =>
    typeof window !== "undefined" &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition)
  )
  return supported
}

export function VoiceSession({
  interviewId,
  existingTurns,
}: VoiceSessionProps) {
  const router = useRouter()
  const {
    phase,
    turns,
    currentTranscript,
    questionCount,
    setPhase,
    addTurn,
    setCurrentTranscript,
    reset,
  } = useInterviewStore()

  const browserSupported = useBrowserSupport()
  const [currentAiText, setCurrentAiText] = useState("")
  const [evaluating, setEvaluating] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef("")
  const turnsRef = useRef(turns)
  const initializedRef = useRef(false)

  turnsRef.current = turns

  const maxQuestions = 5

  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
      recognitionRef.current?.abort()
      reset()
    }
  }, [reset])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initializedRef.current || !browserSupported) return
    initializedRef.current = true

    if (existingTurns.length > 0) {
      for (const turn of existingTurns) {
        addTurn(turn)
      }
      const lastAiTurn = [...existingTurns].reverse().find((t) => t.role === "ai")
      if (lastAiTurn) {
        setCurrentAiText(lastAiTurn.content)
      }
      setPhase("questioning")
    } else {
      startInterview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserSupported])
  /* eslint-enable react-hooks/set-state-in-effect */

  function speakText(text: string, onEnd?: () => void) {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.onend = () => onEnd?.()
    speechSynthesis.speak(utterance)
  }

  function startSpeechRecognition() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript
        } else {
          interim += transcript
        }
      }
      if (final) {
        finalTranscriptRef.current += " " + final
      }
      setCurrentTranscript(finalTranscriptRef.current.trim() || interim)
    }

    recognition.onend = () => {
      const text = finalTranscriptRef.current.trim()
      if (text) {
        sendTurn(text)
      } else {
        setPhase("questioning")
      }
    }

    recognition.onerror = () => {
      setPhase("questioning")
    }

    recognitionRef.current = recognition
    finalTranscriptRef.current = ""
    setCurrentTranscript("")
    recognition.start()
  }

  async function startInterview() {
    setPhase("processing")
    try {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: interviewId,
          user_message: "Start the interview.",
          conversation_history: [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const aiTurn: Turn = { role: "ai", content: data.ai_message }
      addTurn(aiTurn)
      setCurrentAiText(data.ai_message)
      setPhase("responding")
      speakText(data.ai_message, () => {
        setPhase("listening")
        startSpeechRecognition()
      })
    } catch {
      setPhase("idle")
    }
  }

  async function sendTurn(userMessage: string) {
    setPhase("processing")
    const history = turnsRef.current.map((t) => ({
      role: t.role === "ai" ? ("model" as const) : ("user" as const),
      content: t.content,
    }))

    try {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interview_id: interviewId,
          user_message: userMessage,
          conversation_history: history,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      addTurn({ role: "user", content: userMessage })
      const aiTurn: Turn = { role: "ai", content: data.ai_message }
      addTurn(aiTurn)
      setCurrentAiText(data.ai_message)

      if (data.is_complete) {
        setPhase("wrapping_up")
        speakText(data.ai_message, () => {
          evaluateInterview()
        })
      } else {
        setPhase("responding")
        speakText(data.ai_message, () => {
          finalTranscriptRef.current = ""
          setCurrentTranscript("")
          setPhase("listening")
          startSpeechRecognition()
        })
      }
    } catch {
      setPhase("questioning")
    }
  }

  async function evaluateInterview() {
    setEvaluating(true)
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_id: interviewId }),
      })
      if (!res.ok) throw new Error("Evaluation failed")
      setPhase("completed")
      router.push(`/interview/${interviewId}/results`)
      router.refresh()
    } catch {
      setEvaluating(false)
      setPhase("completed")
      router.push(`/interview/${interviewId}/results`)
      router.refresh()
    }
  }

  function handleMicClick() {
    if (phase === "listening") {
      recognitionRef.current?.stop()
    }
  }

  function handleSkip() {
    recognitionRef.current?.abort()
    speechSynthesis.cancel()
    finalTranscriptRef.current = ""
    setCurrentTranscript("")
    sendTurn("[SKIP]")
  }

  function handleExit() {
    const confirmed = window.confirm(
      "Are you sure you want to exit this interview? Your progress will be saved."
    )
    if (confirmed) {
      speechSynthesis.cancel()
      recognitionRef.current?.abort()
      router.push("/dashboard")
    }
  }

  if (!browserSupported) {
    return <BrowserWarning />
  }

  const displayQuestion = Math.min(questionCount, maxQuestions)
  const progressLabel =
    displayQuestion > 0
      ? `Question ${displayQuestion} of ${maxQuestions}`
      : ""

  return (
    <Drawer>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left panel */}
        <div className="flex flex-1 flex-col" style={{ background: "#0A0A0F" }}>
          {/* Ambient background glow */}
          <div
            className="pointer-events-none fixed top-0 left-0 h-[calc(100vh-3.5rem)] w-[65vw]"
            style={{
              background:
                "radial-gradient(circle at 45% 45%, rgba(0,255,220,0.08) 0%, rgba(0,180,255,0.04) 25%, transparent 60%)",
            }}
          />

          {/* Top bar */}
          <div className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <span className="font-heading text-sm font-semibold tracking-tight">
                PrepAI
              </span>
            </div>
            {progressLabel && (
              <span className="text-sm text-white/60">{progressLabel}</span>
            )}
          </div>

          {/* Center content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 pb-4">
            {/* Question text */}
            <div className="mb-6 max-w-2xl text-center">
              <p className="text-[32px] font-semibold leading-tight text-white">
                {currentAiText}
              </p>
              <p className="mt-4 text-sm text-white/50">
                {phase === "questioning" || phase === "responding"
                  ? "Listen carefully to the question. You'll be prompted when it's your turn to speak."
                  : phase === "listening"
                    ? "Speak naturally. I'm listening..."
                    : phase === "processing"
                      ? "Processing your response..."
                      : phase === "wrapping_up" || phase === "completed"
                        ? "Session complete. Generating feedback..."
                        : phase === "briefing"
                          ? "The interviewer is introducing themselves..."
                          : "Take a moment to reflect. Speak naturally when you're ready."}
              </p>
            </div>

            {/* Voice orb */}
            <div className="mb-8">
              <VoiceOrb phase={phase} />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="relative z-10 flex shrink-0 flex-col items-center gap-4 pb-8">
            <div className="flex items-center gap-4">
              {/* Transcript toggle (mobile only) */}
              <DrawerTrigger className="flex md:hidden h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60">
                <FileText className="h-4 w-4" />
              </DrawerTrigger>

              {/* Mic button */}
              <button
                onClick={handleMicClick}
                disabled={phase !== "listening"}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                  phase === "listening"
                    ? "bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500/30"
                    : "bg-white/5 text-white/40"
                )}
              >
                {phase === "listening" ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              {/* Skip button */}
              <button
                onClick={handleSkip}
                disabled={
                  phase !== "listening" &&
                  phase !== "questioning" &&
                  phase !== "responding"
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm transition-all",
                  phase === "listening" || phase === "questioning" || phase === "responding"
                    ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                    : "bg-white/[0.02] text-white/20"
                )}
              >
                <SkipForward className="h-3.5 w-3.5" />
                Skip Question
              </button>
            </div>

            {/* Exit link */}
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/60"
            >
              <LogOut className="h-3 w-3" />
              Exit Interview
            </button>
          </div>

          {/* Full-screen loading overlay during evaluation */}
          {evaluating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <p className="text-sm text-white/60">Generating your feedback...</p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px shrink-0 bg-white/[0.08]" />

        {/* Right panel — Transcript (desktop) */}
        <div className="hidden md:flex w-[35%] shrink-0">
          <TranscriptPanel
            turns={turns}
            currentTranscript={currentTranscript}
            phase={phase}
          />
        </div>
      </div>

      {/* Drawer content — Transcript (mobile) */}
      <DrawerContent>
        <div className="h-[80vh] overflow-hidden">
          <TranscriptPanel
            turns={turns}
            currentTranscript={currentTranscript}
            phase={phase}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
