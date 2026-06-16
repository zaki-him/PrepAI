import { Button } from "@/components/ui/button"
import {
  Bot,
  Sparkles,
  Mic,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Bot,
    title: "AI Interviewer",
    description:
      "Realistic voice conversations with an AI interviewer that adapts to your industry, role, and seniority level.",
  },
  {
    icon: Sparkles,
    title: "Instant Scoring",
    description:
      "Get detailed scores and actionable feedback after each session. Know exactly what to improve.",
  },
  {
    icon: Mic,
    title: "Voice-First",
    description:
      "Speak naturally using your browser. No downloads, no complicated setup — just you and the AI.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description:
      "Monitor your improvement over time with a personal dashboard. See your scores, history, and trends.",
  },
]

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]">
        <div className="animate-scanline h-[2px] w-full bg-cyan-400" />
      </div>

      {/* Floating Navbar */}
      <header className="fixed left-4 right-4 top-4 z-40 mx-auto max-w-6xl">
        <nav className="flex items-center justify-between rounded-xl border border-border bg-[#111118]/80 px-6 py-3 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight">
              PrepAI
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#cta" className="transition-colors hover:text-foreground">
              Get Started
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all hover:text-foreground"
            >
              Sign In
            </Link>
            <Button size="sm" className="gap-1.5 text-sm">
              <Link href="/signup" className="flex items-center gap-1.5">
                Start Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative flex min-h-screen items-center overflow-hidden bg-grid pt-16">
          {/* Background glow orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-cyan-400/5 blur-[100px]" />
            <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[80px] animate-pulse-glow" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-32 text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Interview Practice
            </div>

            {/* Headline */}
            <h1 className="font-heading mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Ace Your Next Interview{" "}
              <span className="text-glow-cyan text-cyan-400">with AI</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Practice with a voice-first AI interviewer that simulates real
              interviews. Get scored, get feedback, and land the job.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="glow-cyan-lg h-12 gap-2 px-8 text-base font-medium"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Start Practicing Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 border-cyan-500/30 px-8 text-base text-cyan-300 hover:bg-cyan-500/10"
              >
                <Link href="#features" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Floating visual */}
            <div className="animate-float mx-auto mt-16 w-fit">
              <div className="border-glow-cyan flex items-center gap-3 rounded-2xl border bg-[#111118]/60 px-6 py-4 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
                  <Bot className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    AI Interviewer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &ldquo;Tell me about a time you led a team...&rdquo;
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-1 rounded-full bg-cyan-400/60"
                      style={{
                        animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                        height: `${12 + i * 6}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ===== FEATURES ===== */}
        <section
          id="features"
          className="relative border-t border-border py-24"
        >
          <div className="mx-auto max-w-6xl px-4">
            {/* Section header */}
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything You Need to{" "}
                <span className="text-cyan-400">Succeed</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From realistic voice practice to detailed analytics — PrepAI
                gives you the tools to walk into any interview with confidence.
              </p>
            </div>

            {/* Feature cards */}
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-cyan-500/30 hover:glow-cyan"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 transition-colors group-hover:bg-cyan-500/20">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h3 className="font-heading mb-2 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section
          id="cta"
          className="relative overflow-hidden border-t border-border py-24"
        >
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Ready to Ace Your Interview?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of candidates who prepare smarter with PrepAI.
              Start practicing in under 60 seconds — no credit card required.
            </p>

            {/* Value props */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
                Free to start
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
                No downloads
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
                Real-time AI feedback
              </div>
            </div>

            <div className="mt-10">
              <Button
                size="lg"
                className="glow-cyan-lg h-14 gap-2 px-10 text-lg font-medium"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  Start Practicing Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-cyan-400" />
            <span className="font-heading font-semibold text-foreground">
              PrepAI
            </span>
          </div>
          <p>&copy; {new Date().getFullYear()} PrepAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
