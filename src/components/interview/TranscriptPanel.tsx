"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Turn, InterviewPhase } from "@/store/interviewStore"

interface TranscriptPanelProps {
  turns: Turn[]
  currentTranscript: string
  phase: InterviewPhase
}

export function TranscriptPanel({
  turns,
  currentTranscript,
  phase,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns, currentTranscript])

  const isActive = phase === "listening" || phase === "processing"
  const statusText =
    phase === "listening"
      ? "Recording..."
      : phase === "processing"
        ? "Analyzing..."
        : phase === "responding"
          ? "AI is speaking..."
          : phase === "briefing"
            ? "Interviewer is introducing..."
            : phase === "wrapping_up"
              ? "Wrapping up..."
              : phase === "completed"
                ? "Session complete"
                : ""

  return (
    <div className="flex h-full flex-col border-l border-white/[0.08] bg-[#0A0A0F]">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.08] px-5 py-4">
        <span className="text-[11px] font-medium tracking-[1px] text-white/60 uppercase">
          Live Transcript
        </span>
      </div>

      {/* Transcript area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth"
      >
        {turns.length === 0 && !currentTranscript ? (
          <p className="text-sm leading-relaxed text-white/40">
            Your responses will appear here as you speak...
          </p>
        ) : (
          <div className="space-y-5">
            {turns.map((turn, i) => (
              <div
                key={i}
                className={cn(
                  "text-sm leading-relaxed",
                  turn.role === "ai"
                    ? "text-cyan-300/80"
                    : "text-white/75"
                )}
              >
                <span className="text-[11px] font-medium tracking-wide uppercase opacity-50">
                  {turn.role === "ai" ? "Interviewer" : "You"}
                </span>
                <p className="mt-1">{turn.content}</p>
              </div>
            ))}
            {currentTranscript && (
              <div className="text-sm leading-relaxed text-white/75">
                <span className="text-[11px] font-medium tracking-wide uppercase opacity-50">
                  You
                </span>
                <p className="mt-1">{currentTranscript}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className={cn(
          "shrink-0 border-t border-white/[0.08] px-5 py-3",
          isActive && "border-t-cyan-500/20"
        )}
      >
        <div className="flex items-center gap-2">
          {phase === "listening" && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
          <span
            className={cn(
              "text-xs tracking-wide",
              isActive ? "text-cyan-400" : "text-white/40"
            )}
          >
            {statusText}
          </span>
        </div>
      </div>
    </div>
  )
}
