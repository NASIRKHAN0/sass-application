import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getLimits } from "@/lib/limits"

export async function GET() {
  let user
  try {
    user = await getCurrentUser()
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const month = new Date().toISOString().slice(0, 7)
  const usage = await prisma.usage.findUnique({
    where: { userId_month: { userId: user.id, month } },
  })

  const limits = getLimits(user.plan)

  return NextResponse.json({
    plan: user.plan,
    month,
    jobCount: usage?.jobCount ?? 0,
    transcriptionMinutes: usage?.transcriptionMinutes ?? 0,
    limits: {
      dailyJobs: limits.dailyJobs === Infinity ? null : limits.dailyJobs,
      maxFileSizeMB: limits.maxFileSizeMB,
      transcriptionMinutesPerMonth: limits.transcriptionMinutesPerMonth,
    },
  })
}
