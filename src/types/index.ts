import type { Job, User, Plan, JobStatus } from "@prisma/client"

export type { Job, User, Plan, JobStatus }

export interface JobWithMeta extends Job {
  downloadUrl?: string
}

export interface UsageSummary {
  plan: Plan
  jobCount: number
  transcriptionMinutes: number
  month: string
}

export interface ApiError {
  error: string
  code?: string
}
