import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { storageRead, storageDelete } from "@/lib/storage"
import mime from "mime"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const decodedKey = decodeURIComponent(key)

  let buffer: Buffer
  try {
    buffer = await storageRead(decodedKey)
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const filename = decodedKey.split("/").pop() ?? "download"
  const contentType = mime.getType(filename) ?? "application/octet-stream"

  // Delete the file and clear the job record after serving — no permanent storage
  setImmediate(async () => {
    try {
      await storageDelete(decodedKey)
      await prisma.job.updateMany({
        where: { outputKey: decodedKey },
        data: { outputKey: null },
      })
    } catch {
      // Best-effort cleanup — ignore errors
    }
  })

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
    },
  })
}
