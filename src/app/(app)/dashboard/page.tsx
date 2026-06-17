import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProgressStats } from "@/components/dashboard/ProgressStats"
import { InterviewHistory } from "@/components/dashboard/InterviewHistory"
import { Plus } from "lucide-react"

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-1 h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="mb-6 h-5 w-40" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="mb-3 h-10 w-full" />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your interview practice progress
          </p>
        </div>
        <Button className="gap-1.5">
          <Link href="/interview/setup" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <ProgressStats />
      </Suspense>

      <Suspense fallback={<HistorySkeleton />}>
        <InterviewHistory />
      </Suspense>
    </div>
  )
}
