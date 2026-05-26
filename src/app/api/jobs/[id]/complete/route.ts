import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWorkerRequest } from "@/lib/worker-auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyWorkerRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { outputKey, outputSize } = await req.json() as {
    outputKey: string
    outputSize: number
  }

  // Only update if the job is still PROCESSING — prevents double-complete
  // and rejects callbacks for jobs that were already reset as stale.
  const result = await prisma.job.updateMany({
    where: { id, status: "PROCESSING" },
    data: {
      status: "COMPLETED",
      outputKey,
      outputSize,
      completedAt: new Date(),
    },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Job not found or not in PROCESSING state" }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
