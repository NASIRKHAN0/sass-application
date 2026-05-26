import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Called by the Python worker when a job fails.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-worker-secret")
  if (!secret || secret !== process.env.WORKER_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { error } = await req.json() as { error: string }

  const job = await prisma.job.update({
    where: { id },
    data: {
      status: "FAILED",
      errorMessage: error,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ job })
}
