import type { Plan } from "@prisma/client"

export const PLAN_LIMITS = {
  FREE: {
    dailyJobs: 5,
    maxFileSizeMB: 10,
    transcriptionMinutesPerMonth: 0,
    fileRetentionHours: 24,
    watermark: true,
    apiAccess: false,
    teamSeats: 0,
  },
  PRO: {
    dailyJobs: Infinity,
    maxFileSizeMB: 500,
    transcriptionMinutesPerMonth: 600,
    fileRetentionDays: 30,
    watermark: false,
    apiAccess: false,
    teamSeats: 0,
  },
  BUSINESS: {
    dailyJobs: Infinity,
    maxFileSizeMB: 2048,
    transcriptionMinutesPerMonth: 3000,
    fileRetentionDays: 90,
    watermark: false,
    apiAccess: true,
    teamSeats: 5,
  },
} as const satisfies Record<Plan, object>

export type PlanLimits = (typeof PLAN_LIMITS)[Plan]

export function getLimits(plan: Plan) {
  return PLAN_LIMITS[plan]
}

export function canUploadFile(plan: Plan, fileSizeMB: number): boolean {
  return fileSizeMB <= PLAN_LIMITS[plan].maxFileSizeMB
}

export function canTranscribe(plan: Plan): boolean {
  return PLAN_LIMITS[plan].transcriptionMinutesPerMonth > 0
}
