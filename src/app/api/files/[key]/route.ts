import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { storageRead } from "@/lib/storage"
import mime from "mime"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { key } = await params
  const decodedKey = decodeURIComponent(key)

  // Verify the file belongs to this user (key starts with their userId)
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || !decodedKey.startsWith(user.id + "/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const buffer = await storageRead(decodedKey)
    const filename = decodedKey.split("/").pop() ?? "download"
    const contentType = mime.getType(filename) ?? "application/octet-stream"

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
