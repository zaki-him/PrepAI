"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bot, Loader2 } from "lucide-react"

const seniorityOptions = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
] as const

export function SetupForm() {
  const router = useRouter()
  const [jobTitle, setJobTitle] = useState("")
  const [domain, setDomain] = useState("")
  const [seniority, setSeniority] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSeniorityChange(value: string | null) {
    if (value) setSeniority(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!jobTitle || !domain || !seniority) {
      setError("All fields are required")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle,
          domain,
          seniority,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Something went wrong")
        return
      }

      router.push(`/interview/${data.interview_id}`)
      router.refresh()
    } catch(error) {
      setError("Failed to create interview. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
            <Bot className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <CardTitle>Interview Setup</CardTitle>
            <CardDescription>
              Tell us about the role you&apos;re preparing for
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="job-title">Job Title</FieldLabel>
              <Input
                id="job-title"
                type="text"
                placeholder="e.g. Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
              <FieldDescription>
                The specific role you&apos;re interviewing for
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="domain">Domain / Industry</FieldLabel>
              <Input
                id="domain"
                type="text"
                placeholder="e.g. Fintech, Healthcare, SaaS"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
              <FieldDescription>
                The industry or technology domain
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="seniority">Seniority Level</FieldLabel>
              <Select value={seniority} onValueChange={handleSeniorityChange}>
                <SelectTrigger className="w-full" id="seniority">
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  {seniorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Your experience level for this role
              </FieldDescription>
            </Field>

            {error && (
              <p className="text-sm text-destructive">Failed to create interview. Try again later</p>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Interview"
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
