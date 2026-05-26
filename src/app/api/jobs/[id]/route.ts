import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storageGetSignedUrl, storageDelete } from "@/lib/storage"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user
  try {
    user = await getCurrentUser()
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })

  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
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
  let user
  try {
    user = await getCurrentUser()
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })

  if (!job || job.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Clean up files from storage
  await storageDelete(job.inputKey)
  if (job.outputKey) await storageDelete(job.outputKey)

  await prisma.job.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
