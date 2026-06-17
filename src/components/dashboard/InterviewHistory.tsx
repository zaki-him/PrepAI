import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { History, Calendar, Briefcase } from "lucide-react"
import Link from "next/link"

const seniorityLabel: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "ghost" | "link"
> = {
  pending: "outline",
  active: "secondary",
  completed: "default",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export async function InterviewHistory() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: interviews } = await supabase
    .from("interviews")
    .select("id, job_title, domain, seniority, status, overall_score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (!interviews || interviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Interview History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Briefcase className="h-4 w-4" />
              </EmptyMedia>
              <EmptyTitle>No interviews yet</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <EmptyDescription>
                Start your first practice interview to see your history here.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Interview History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell className="font-medium">
                  <Link
                    href={
                      interview.status === "completed"
                        ? `/interview/${interview.id}/results`
                        : `/interview/${interview.id}`
                    }
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {interview.job_title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {seniorityLabel[interview.seniority] ?? interview.seniority}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {formatDate(interview.created_at)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[interview.status]}>
                    {interview.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {interview.overall_score !== null
                    ? `${interview.overall_score}%`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
