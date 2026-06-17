"use client"

import { cn } from "@/lib/utils"
import type { InterviewPhase } from "@/store/interviewStore"

interface VoiceOrbProps {
  phase: InterviewPhase
}

export function VoiceOrb({ phase }: VoiceOrbProps) {
  const isListening = phase === "listening"
  const isResponding = phase === "responding" || phase === "briefing" || phase === "questioning"
  const isProcessing = phase === "processing"
  const isIdle = phase === "idle" || phase === "completed"

  return (
    <div className="relative flex items-center justify-center">
      {/* Ring 4 (outermost) */}
      <div
        className={cn(
          "absolute rounded-full border",
          isListening
            ? "border-cyan-400/20 animate-ring-expand-fast"
            : isResponding
              ? "border-white/[0.06] animate-ring-wave"
              : "border-white/10 animate-ring-expand",
          isProcessing && "border-cyan-400/10 animate-spin-slow",
          isIdle && "border-white/10"
        )}
        style={{ width: 300, height: 300 }}
      />

      {/* Ring 3 */}
      <div
        className={cn(
          "absolute rounded-full border",
          isListening
            ? "border-cyan-400/15 animate-ring-expand-fast"
            : isResponding
              ? "border-white/[0.05] animate-ring-wave"
              : "border-white/8",
          isProcessing && "border-cyan-400/8",
          isIdle && "border-white/8"
        )}
        style={{
          width: 230,
          height: 230,
          animationDelay: isResponding ? "0.4s" : "0.5s",
        }}
      />

      {/* Ring 2 */}
      <div
        className={cn(
          "absolute rounded-full border",
          isListening
            ? "border-cyan-400/10 animate-ring-expand-fast"
            : isResponding
              ? "border-white/[0.04] animate-ring-wave"
              : "border-white/6",
          isProcessing && "border-cyan-400/6",
          isIdle && "border-white/6"
        )}
        style={{
          width: 160,
          height: 160,
          animationDelay: isResponding ? "0.8s" : "1s",
        }}
      />

      {/* Ring 1 (innermost) */}
      <div
        className={cn(
          "absolute rounded-full border",
          isListening
            ? "border-cyan-400/5"
            : isResponding
              ? "border-white/[0.03]"
              : "border-white/5",
          isProcessing && "border-cyan-400/5"
        )}
        style={{ width: 100, height: 100 }}
      />

      {/* Glow orb */}
      <div className="relative" style={{ width: 140, height: 140 }}>
        {/* Ambient light layer */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-700",
            isListening && "scale-110"
          )}
          style={{
            background:
              "radial-gradient(circle, rgba(0,255,220,0.45) 0%, rgba(0,180,255,0.18) 35%, transparent 60%)",
            filter: "blur(25px)",
            boxShadow: isListening
              ? "0 0 80px rgba(0,255,220,0.35), 0 0 160px rgba(0,180,255,0.2), 0 0 240px rgba(0,255,220,0.1)"
              : "0 0 60px rgba(0,255,220,0.25), 0 0 120px rgba(0,180,255,0.15), 0 0 180px rgba(0,255,220,0.08)",
          }}
        />

        {/* Core glow */}
        <div
          className={cn(
            "absolute inset-6 rounded-full transition-all duration-500",
            isListening
              ? "animate-orb-pulse-fast"
              : isResponding
                ? "animate-orb-pulse"
                : isProcessing
                  ? "opacity-60"
                  : "opacity-50"
          )}
          style={{
            background:
              "radial-gradient(circle, rgba(0,255,220,0.7) 0%, rgba(0,180,255,0.35) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Processing spinner icon */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400/40 border-t-cyan-400 animate-spin" />
        </div>
      )}
    </div>
  )
}
