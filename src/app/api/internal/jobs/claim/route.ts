import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Called by the Python worker every few seconds to claim the next pending job.
// Returns 204 when there are no pending jobs.
// Returns 200 with job data when a job is claimed.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-worker-secret")
  if (!secret || secret !== process.env.WORKER_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Atomically find and claim the oldest PENDING job
  const job = await prisma.job.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  })

  if (!job) {
    return new Response(null, { status: 204 })
  }

  // Mark as PROCESSING so another worker instance doesn't pick it up
  const claimed = await prisma.job.updateMany({
    where: { id: job.id, status: "PENDING" },
    data: { status: "PROCESSING" },
  })

  // If another worker claimed it first, return 204
  if (claimed.count === 0) {
    return new Response(null, { status: 204 })
  }

  const uploadsDir = process.env.UPLOADS_DIR ?? `${process.cwd()}/.uploads`

  return NextResponse.json({
    jobId: job.id,
    userId: job.userId,
    type: job.type,
    inputKey: job.inputKey,
    metadata: job.metadata,
    uploadsDir,
  })
}
