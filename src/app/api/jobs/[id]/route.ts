import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUserOrNull } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storageGetSignedUrl, storageDelete } from "@/lib/storage"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Signed-in users can only see their own jobs; guests access by job ID (CUID is unguessable)
  const user = await getCurrentUserOrNull()
  if (user && job.userId !== user.id) {
    // Allow access if the job belongs to the shared guest account
    const guestUser = await prisma.user.findUnique({ where: { clerkId: "guest_anonymous" } })
    if (!guestUser || job.userId !== guestUser.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
  }

  let downloadUrl: string | undefined
  if (job.status === "COMPLETED" && job.outputKey) {
    downloadUrl = await storageGetSignedUrl(job.outputKey)
  }

  return NextResponse.json({ job, downloadUrl })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUserOrNull()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })

  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await storageDelete(job.inputKey)
  if (job.outputKey) await storageDelete(job.outputKey)
  await prisma.job.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
