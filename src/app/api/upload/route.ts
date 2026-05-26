import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storageUpload, buildStorageKey } from "@/lib/storage"
import { getLimits } from "@/lib/limits"
import { processJobLocally, LOCAL_TOOLS } from "@/lib/processor"
import { getToolBySlug, canAccessTool } from "@/lib/tools"

const ALLOWED_TYPES: Record<string, string[]> = {
  "pdf-to-word":       ["application/pdf"],
  "pdf-to-excel":      ["application/pdf"],
  "pdf-to-powerpoint": ["application/pdf"],
  "pdf-to-jpg":        ["application/pdf"],
  "pdf-to-png":        ["application/pdf"],
  "pdf-to-txt":        ["application/pdf"],
  "word-to-pdf":       ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"],
  "excel-to-pdf":      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  "powerpoint-to-pdf": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  "ppt-to-pdf":        ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  "jpg-to-pdf":        ["image/jpeg", "image/jpg"],
  "png-to-pdf":        ["image/png"],
  "merge-pdf":         ["application/pdf"],
  "split-pdf":         ["application/pdf"],
  "compress-pdf":      ["application/pdf"],
  "rotate-pdf":        ["application/pdf"],
  "protect-pdf":       ["application/pdf"],
  "unlock-pdf":        ["application/pdf"],
  "jpg-to-png":        ["image/jpeg", "image/jpg"],
  "png-to-jpg":        ["image/png"],
  "image-to-webp":     ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  "compress-image":    ["image/jpeg", "image/png", "image/webp"],
  "resize-image":      ["image/jpeg", "image/png", "image/webp"],
  "grayscale-image":   ["image/jpeg", "image/png"],
  "merge-images":      ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "transcribe-mp3":    ["audio/mpeg", "audio/mp3"],
  "transcribe-audio":  ["audio/mpeg", "audio/wav", "audio/m4a", "audio/ogg", "audio/flac"],
  "transcribe-video":  ["video/mp4", "video/quicktime", "video/x-msvideo"],
  // ── New image tools ──
  "tiff-to-jpg":       ["image/tiff"],
  "bmp-to-jpg":        ["image/bmp"],
  "image-to-avif":     ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "flip-image":        ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "favicon-generator": ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
  "add-text-image":    ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "photo-enhancer":    ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "heic-to-jpg":       ["image/heic", "image/heif"],
  "svg-to-png":        ["image/svg+xml"],
  "remove-background": ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  // ── Audio conversion ──
  "mp4-to-mp3":        ["video/mp4", "video/mpeg", "video/x-m4v"],
  "audio-to-mp3":      ["audio/mpeg", "audio/wav", "audio/m4a", "audio/x-m4a", "audio/ogg", "audio/flac", "audio/aac"],
  "trim-audio":        ["audio/mpeg", "audio/wav", "audio/m4a", "audio/x-m4a", "audio/ogg", "audio/flac"],
  "compress-audio":    ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
  "merge-audio":       ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
  // ── Video tools ──
  "mp4-to-gif":        ["video/mp4", "video/x-m4v", "video/mpeg"],
  "trim-video":        ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"],
  "compress-video":    ["video/mp4", "video/quicktime"],
  "video-to-mp4":      ["video/quicktime", "video/x-msvideo", "video/x-matroska", "video/avi"],
  // ── Document tools ──
  "html-to-pdf":       ["text/html"],
  "markdown-to-pdf":   ["text/markdown", "text/plain", "text/x-markdown"],
  "txt-to-pdf":        ["text/plain"],
  "csv-to-excel":      ["text/csv", "application/csv", "text/x-csv"],
}

// Tools that require LibreOffice — only available on VPS, not local dev
const LIBREOFFICE_TOOLS = new Set([
  "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint",
  "word-to-pdf", "excel-to-pdf", "ppt-to-pdf",
])

export async function POST(req: Request) {
  let user
  try {
    user = await getCurrentUser()
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limits = getLimits(user.plan)
  const formData = await req.formData()
  const files = formData.getAll("file") as File[]
  const file = files[0] ?? null
  const jobType = formData.get("jobType") as string | null
  const optionsRaw = formData.get("options") as string | null

  if (!file || !jobType) {
    return NextResponse.json({ error: "Missing file or jobType" }, { status: 400 })
  }

  // LibreOffice tools require VPS deployment — reject in local dev
  if (LIBREOFFICE_TOOLS.has(jobType) && !process.env.LIBREOFFICE_AVAILABLE) {
    return NextResponse.json(
      { error: "This conversion requires LibreOffice which is only available on our cloud servers. It will work after deployment." },
      { status: 503 }
    )
  }

  // Plan access check — block free users from premium tools
  const toolDef = getToolBySlug(jobType)
  if (toolDef && !canAccessTool(toolDef, user.plan)) {
    return NextResponse.json(
      { error: `${toolDef.label} requires a ${toolDef.minPlan} plan. Upgrade to continue.` },
      { status: 403 }
    )
  }

  // File size check
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > limits.maxFileSizeMB) {
    return NextResponse.json(
      { error: `File too large. Your ${user.plan} plan allows ${limits.maxFileSizeMB}MB.` },
      { status: 413 }
    )
  }

  // MIME type check
  const allowed = ALLOWED_TYPES[jobType]
  if (allowed && !allowed.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type "${file.type}" for ${jobType}.` },
      { status: 415 }
    )
  }

  // Daily job limit check for FREE plan
  if (user.plan === "FREE") {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = await prisma.job.count({
      where: { userId: user.id, createdAt: { gte: today } },
    })
    if (todayCount >= limits.dailyJobs) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Pro for unlimited conversions." },
        { status: 429 }
      )
    }
  }

  // Store files — merge-images supports multiple uploads
  const options: Record<string, unknown> = optionsRaw ? JSON.parse(optionsRaw) : {}
  options._plan = user.plan

  let inputKey: string
  if (jobType === "merge-images" && files.length > 1) {
    const inputKeys = await Promise.all(files.map(async (f) => {
      const buf = Buffer.from(await f.arrayBuffer())
      const key = buildStorageKey(user.id, crypto.randomUUID(), f.name)
      await storageUpload(key, buf, f.type)
      return key
    }))
    inputKey = inputKeys[0]
    options.inputKeys = inputKeys
  } else {
    const buffer = Buffer.from(await file.arrayBuffer())
    inputKey = buildStorageKey(user.id, crypto.randomUUID(), file.name)
    await storageUpload(inputKey, buffer, file.type)
  }

  // Create job record
  const job = await prisma.job.create({
    data: {
      userId: user.id,
      type: jobType,
      status: "PENDING",
      inputKey,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: options as any,
    },
  })

  // Update usage counter
  const month = new Date().toISOString().slice(0, 7)
  await prisma.usage.upsert({
    where: { userId_month: { userId: user.id, month } },
    create: { userId: user.id, month, jobCount: 1 },
    update: { jobCount: { increment: 1 } },
  })

  // Process immediately if this tool is supported locally (no Python worker needed)
  if (LOCAL_TOOLS.has(jobType)) {
    await processJobLocally(job.id)
    const updated = await prisma.job.findUnique({ where: { id: job.id } })
    return NextResponse.json({ jobId: job.id, status: updated?.status ?? "PENDING" }, { status: 201 })
  }

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 201 })
}
