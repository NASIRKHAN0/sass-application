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
  const { error } = await req.json() as { error: string }

  // Only update if still PROCESSING — prevents a delayed failure callback
  // from overwriting a job that was already reset or completed.
  const result = await prisma.job.updateMany({
    where: { id, status: "PROCESSING" },
    data: {
      status: "FAILED",
      errorMessage: error,
      completedAt: new Date(),
    },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Job not found or not in PROCESSING state" }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
