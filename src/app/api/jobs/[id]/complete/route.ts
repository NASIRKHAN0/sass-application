import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Called by the Python worker when a job finishes successfully.
// Protected by a shared secret header, not Clerk auth.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = req.headers.get("x-worker-secret")
  if (!secret || secret !== process.env.WORKER_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { outputKey, outputSize } = await req.json() as {
    outputKey: string
    outputSize: number
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      status: "COMPLETED",
      outputKey,
      outputSize,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ job })
}
