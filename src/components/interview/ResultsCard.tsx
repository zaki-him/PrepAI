"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface ResultsCardProps {
  score: number
  className?: string
}

export function ResultsCard({ score, className }: ResultsCardProps) {
  const [animatedOffset, setAnimatedOffset] = useState(CIRCUMFERENCE)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const targetOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
    const showTimer = setTimeout(() => setVisible(true), 50)
    const animTimer = setTimeout(() => setAnimatedOffset(targetOffset), 200)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(animTimer)
    }
  }, [score])

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-700",
          visible ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="h-[280px] w-[280px] rounded-full bg-cyan-500/10 blur-[60px]" />
      </div>

      <svg
        width="260"
        height="260"
        viewBox="0 0 200 200"
        className="relative z-10"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-white/[0.04]"
        />

        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{
            strokeDashoffset: animatedOffset,
            transition: visible
              ? "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
          className="text-cyan-400"
          filter="url(#glow)"
          transform="rotate(-90 100 100)"
        />
      </svg>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-6xl font-bold tracking-tight text-white tabular-nums transition-all duration-700",
            visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          {score}
        </span>
        <span
          className={cn(
            "mt-1.5 text-[11px] font-medium tracking-[0.25em] text-white/40 transition-all duration-700 delay-100",
            visible ? "opacity-100" : "opacity-0"
          )}
        >
          SCORE / 100
        </span>
      </div>
    </div>
  )
}
