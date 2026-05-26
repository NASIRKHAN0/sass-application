import sharp from "sharp"
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib"
import { storageRead, storageUpload, buildStorageKey } from "@/lib/storage"
import { prisma } from "@/lib/prisma"

// ─── Tools supported locally (no Python worker needed) ───────────────────────
export const LOCAL_TOOLS = new Set([
  "jpg-to-png", "png-to-jpg", "image-to-webp",
  "compress-image", "resize-image", "grayscale-image",
  "jpg-to-pdf", "png-to-pdf",
  "merge-pdf", "split-pdf", "rotate-pdf", "protect-pdf",
  "merge-images",
])

// ─── Main entry ───────────────────────────────────────────────────────────────

export async function processJobLocally(jobId: string): Promise<void> {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) return

  await prisma.job.update({ where: { id: jobId }, data: { status: "PROCESSING" } })

  try {
    const inputBuffer = await storageRead(job.inputKey)
    const metadata = (job.metadata ?? {}) as Record<string, unknown>
    const { outputBuffer, outputFilename } = await dispatch(job.type, inputBuffer, metadata, job.id)

    const outputKey = buildStorageKey(job.userId, jobId, outputFilename)
    await storageUpload(outputKey, outputBuffer, getContentType(outputFilename))

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        outputKey,
        outputSize: outputBuffer.length,
        completedAt: new Date(),
      },
    })
  } catch (err) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Processing failed",
        completedAt: new Date(),
      },
    })
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

async function dispatch(
  type: string,
  input: Buffer,
  meta: Record<string, unknown>,
  jobId?: string
): Promise<{ outputBuffer: Buffer; outputFilename: string }> {
  const isFree = meta._plan === "FREE"

  switch (type) {
    // ── Image conversions ──
    case "jpg-to-png":
      return { outputBuffer: await sharp(input).png().toBuffer(), outputFilename: "output.png" }
    case "png-to-jpg":
      return { outputBuffer: await sharp(input).jpeg({ quality: 90 }).toBuffer(), outputFilename: "output.jpg" }
    case "image-to-webp":
      return { outputBuffer: await sharp(input).webp({ quality: 85 }).toBuffer(), outputFilename: "output.webp" }
    case "compress-image": {
      const quality = Number(meta.quality ?? 70)
      return { outputBuffer: await sharp(input).jpeg({ quality }).toBuffer(), outputFilename: "compressed.jpg" }
    }
    case "resize-image": {
      const width = Number(meta.width ?? 800)
      const height = meta.height ? Number(meta.height) : undefined
      return {
        outputBuffer: await sharp(input).resize(width, height, { fit: "inside", withoutEnlargement: true }).toBuffer(),
        outputFilename: "resized.jpg",
      }
    }
    case "grayscale-image":
      return { outputBuffer: await sharp(input).grayscale().toBuffer(), outputFilename: "grayscale.jpg" }

    // ── Merge images ──
    case "merge-images": {
      const direction = (meta.direction as string) ?? "horizontal"
      const inputKeys = meta.inputKeys as string[] | undefined
      const buffers = inputKeys && inputKeys.length > 1
        ? await Promise.all(inputKeys.map((k) => storageRead(k)))
        : [input]
      const merged = await mergeImages(buffers, direction as "horizontal" | "vertical")
      return { outputBuffer: isFree ? await addImageWatermark(merged) : merged, outputFilename: "merged.jpg" }
    }

    // ── Image → PDF ──
    case "jpg-to-pdf":
    case "png-to-pdf": {
      const pdf = await imageToPdf(input)
      return { outputBuffer: isFree ? await addPdfWatermark(pdf) : pdf, outputFilename: "output.pdf" }
    }

    // ── PDF operations ──
    case "merge-pdf":
      return { outputBuffer: await mergePdfs([input]), outputFilename: "merged.pdf" }
    case "split-pdf": {
      const page = Number(meta.page ?? 1)
      return { outputBuffer: await extractPage(input, page - 1), outputFilename: `page-${page}.pdf` }
    }
    case "rotate-pdf": {
      const angle = Number(meta.angle ?? 90)
      return { outputBuffer: await rotatePdf(input, angle), outputFilename: "rotated.pdf" }
    }
    case "protect-pdf": {
      const password = String(meta.password ?? "1234")
      return { outputBuffer: await protectPdf(input, password), outputFilename: "protected.pdf" }
    }

    default:
      throw new Error(`Tool "${type}" requires the Python worker (not available locally yet).`)
  }
}

// ─── PDF helpers ─────────────────────────────────────────────────────────────

async function imageToPdf(imageBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const img = await (async () => {
    try { return await pdfDoc.embedJpg(imageBuffer) } catch {
      return await pdfDoc.embedPng(imageBuffer)
    }
  })()
  const page = pdfDoc.addPage([img.width, img.height])
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
  return Buffer.from(await pdfDoc.save())
}

async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  const merged = await PDFDocument.create()
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }
  return Buffer.from(await merged.save())
}

async function extractPage(buffer: Buffer, pageIndex: number): Promise<Buffer> {
  const src = await PDFDocument.load(buffer)
  const out = await PDFDocument.create()
  const [page] = await out.copyPages(src, [pageIndex])
  out.addPage(page)
  return Buffer.from(await out.save())
}

async function rotatePdf(buffer: Buffer, angle: number): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer)
  doc.getPages().forEach((p) => p.setRotation(degrees(angle)))
  return Buffer.from(await doc.save())
}

async function protectPdf(buffer: Buffer, password: string): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer)
  // pdf-lib encrypt signature varies by version — cast to avoid TS strict check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Buffer.from(await (doc as any).save({ userPassword: password, ownerPassword: password }))
}

// ─── Merge images ─────────────────────────────────────────────────────────────

async function mergeImages(buffers: Buffer[], direction: "horizontal" | "vertical"): Promise<Buffer> {
  const metas = await Promise.all(buffers.map((b) => sharp(b).metadata()))

  if (direction === "horizontal") {
    const totalWidth = metas.reduce((sum, m) => sum + (m.width ?? 0), 0)
    const maxHeight = Math.max(...metas.map((m) => m.height ?? 0))
    let left = 0
    const compositeItems = metas.map((m, i) => {
      const item = { input: buffers[i], left, top: 0 }
      left += m.width ?? 0
      return item
    })
    return sharp({ create: { width: totalWidth, height: maxHeight, channels: 3, background: "#ffffff" } })
      .composite(compositeItems)
      .jpeg({ quality: 90 })
      .toBuffer()
  } else {
    const maxWidth = Math.max(...metas.map((m) => m.width ?? 0))
    const totalHeight = metas.reduce((sum, m) => sum + (m.height ?? 0), 0)
    let top = 0
    const compositeItems = metas.map((m, i) => {
      const item = { input: buffers[i], left: 0, top }
      top += m.height ?? 0
      return item
    })
    return sharp({ create: { width: maxWidth, height: totalHeight, channels: 3, background: "#ffffff" } })
      .composite(compositeItems)
      .jpeg({ quality: 90 })
      .toBuffer()
  }
}

// ─── Watermark helpers ────────────────────────────────────────────────────────

async function addPdfWatermark(buffer: Buffer): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  for (const page of doc.getPages()) {
    const { width } = page.getSize()
    page.drawText("Created with FileAI — upgrade for watermark-free output", {
      x: width / 2 - 160,
      y: 12,
      size: 7.5,
      font,
      color: rgb(0.65, 0.65, 0.65),
      opacity: 0.55,
    })
  }
  return Buffer.from(await doc.save())
}

async function addImageWatermark(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata()
  const w = meta.width ?? 600
  const svgOverlay = Buffer.from(
    `<svg width="${w}" height="22" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="${w / 2}" y="16" font-family="sans-serif" font-size="11" ` +
    `fill="rgba(100,100,100,0.55)" text-anchor="middle">Created with FileAI — upgrade for watermark-free output</text>` +
    `</svg>`
  )
  return sharp(buffer).composite([{ input: svgOverlay, gravity: "south" }]).jpeg({ quality: 90 }).toBuffer()
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", webp: "image/webp",
    txt: "text/plain", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  }
  return map[ext ?? ""] ?? "application/octet-stream"
}
