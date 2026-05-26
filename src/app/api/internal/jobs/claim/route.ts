import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const STALE_PROCESSING_MS = 10 * 60 * 1000 // 10 minutes

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-worker-secret")
  if (!secret || secret !== process.env.WORKER_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Reset stale PROCESSING jobs back to PENDING before claiming a new one.
  // This recovers jobs orphaned by a worker crash.
  const staleThreshold = new Date(Date.now() - STALE_PROCESSING_MS)
  await prisma.job.updateMany({
    where: {
      status: "PROCESSING",
      processingStartedAt: { lt: staleThreshold },
    },
    data: { status: "PENDING", processingStartedAt: null },
  })

  // Atomically claim the oldest PENDING job using FOR UPDATE SKIP LOCKED.
  // This prevents two worker instances from claiming the same job even under
  // heavy concurrency — no two transactions can lock the same row simultaneously.
  const claimed = await prisma.$queryRaw<Array<{
    id: string
    userId: string
    type: string
    inputKey: string
    metadata: unknown
  }>>`
    UPDATE "Job"
    SET status = 'PROCESSING'::"JobStatus", "processingStartedAt" = NOW()
    WHERE id = (
      SELECT id FROM "Job"
      WHERE status = 'PENDING'::"JobStatus"
      ORDER BY "createdAt" ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id, "userId", type, "inputKey", metadata
  `

  if (!claimed.length) {
    return new Response(null, { status: 204 })
  }

  const job = claimed[0]
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
