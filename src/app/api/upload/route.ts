import { NextResponse } from "next/server"
import { getCurrentUserOrGuest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storageUpload, buildStorageKey } from "@/lib/storage"
import { getLimits } from "@/lib/limits"
import { processJobLocally, LOCAL_TOOLS } from "@/lib/processor"
import { getToolBySlug, canAccessTool } from "@/lib/tools"
import { checkRateLimit } from "@/lib/rate-limit"

// ─── Tools disabled for free deployment ──────────────────────────────────────
// These tools require the Python worker (server hosting cost) or OpenAI API
// (per-minute charge). Re-enable when paid infrastructure is set up.
const DISABLED_TOOLS = new Set([
  // [PAID] Python worker + LibreOffice
  "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint",
  "word-to-pdf", "excel-to-pdf", "ppt-to-pdf",
  // [PAID] Python worker (PyMuPDF)
  "pdf-to-jpg", "pdf-to-png", "pdf-to-txt",
  "pdf-to-webp", "pdf-to-html", "pdf-to-epub",
  // [PAID] Python worker (pikepdf)
  "compress-pdf", "unlock-pdf",
  // [PAID] Python worker
  "images-to-pdf",
  // [PAID] Phase 2/3 PDF — Python worker / AI
  "ocr-pdf", "sign-pdf", "watermark-pdf", "page-numbers-pdf",
  "reorder-pdf", "delete-pages-pdf", "repair-pdf", "redact-pdf", "crop-pdf",
  // [PAID] Python worker (not in LOCAL_TOOLS)
  "add-text-image", "photo-enhancer",
  // [PAID] Python worker (pillow-heif / cairosvg)
  "heic-to-jpg", "svg-to-png",
  // [PAID] Phase 2 image — Python worker + AI
  "image-to-text", "crop-image", "remove-background", "upscale-image",
  // [PAID] ALL audio — OpenAI Whisper API ($0.006/min) + Python worker (FFmpeg)
  "transcribe-mp3", "transcribe-audio", "transcribe-video", "transcribe-50lang",
  "mp4-to-mp3", "audio-to-mp3", "trim-audio", "compress-audio", "merge-audio",
  "export-srt", "ai-summarize", "ai-translate", "key-points", "speaker-id",
  // [PAID] ALL video — Python worker + FFmpeg hosting
  "mp4-to-gif", "trim-video", "compress-video", "video-to-mp4",
  // [PAID] ALL documents — Python worker + LibreOffice/WeasyPrint hosting
  "html-to-pdf", "markdown-to-pdf", "txt-to-pdf", "csv-to-excel", "csv-to-json",
])

const ALLOWED_TYPES: Record<string, string[]> = {
  // [PAID] "pdf-to-word":       ["application/pdf"],
  // [PAID] "pdf-to-excel":      ["application/pdf"],
  // [PAID] "pdf-to-powerpoint": ["application/pdf"],
  // [PAID] "pdf-to-jpg":        ["application/pdf"],
  // [PAID] "pdf-to-png":        ["application/pdf"],
  // [PAID] "pdf-to-txt":        ["application/pdf"],
  // [PAID] "word-to-pdf":       ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"],
  // [PAID] "excel-to-pdf":      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  // [PAID] "powerpoint-to-pdf": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  // [PAID] "ppt-to-pdf":        ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  "jpg-to-pdf":        ["image/jpeg", "image/jpg"],
  "png-to-pdf":        ["image/png"],
  "merge-pdf":         ["application/pdf"],
  "split-pdf":         ["application/pdf"],
  // [PAID] "compress-pdf":      ["application/pdf"],
  "rotate-pdf":        ["application/pdf"],
  "protect-pdf":       ["application/pdf"],
  // [PAID] "unlock-pdf":        ["application/pdf"],
  "jpg-to-png":        ["image/jpeg", "image/jpg"],
  "png-to-jpg":        ["image/png"],
  "image-to-webp":     ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  "compress-image":    ["image/jpeg", "image/png", "image/webp"],
  "resize-image":      ["image/jpeg", "image/png", "image/webp"],
  "grayscale-image":   ["image/jpeg", "image/png"],
  "merge-images":      ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  // [PAID] "transcribe-mp3":    ["audio/mpeg", "audio/mp3"],
  // [PAID] "transcribe-audio":  ["audio/mpeg", "audio/wav", "audio/m4a", "audio/ogg", "audio/flac"],
  // [PAID] "transcribe-video":  ["video/mp4", "video/quicktime", "video/x-msvideo"],
  // ── Active image tools ──
  "tiff-to-jpg":       ["image/tiff"],
  "bmp-to-jpg":        ["image/bmp"],
  "image-to-avif":     ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "flip-image":        ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  "favicon-generator": ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"],
  // [PAID] "add-text-image":    ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  // [PAID] "photo-enhancer":    ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  // [PAID] "heic-to-jpg":       ["image/heic", "image/heif"],
  // [PAID] "svg-to-png":        ["image/svg+xml"],
  // [PAID] "remove-background": ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  // ── Audio — ALL DISABLED (OpenAI Whisper cost + FFmpeg hosting) ──
  // [PAID] "mp4-to-mp3":        ["video/mp4", "video/mpeg", "video/x-m4v"],
  // [PAID] "audio-to-mp3":      ["audio/mpeg", "audio/wav", "audio/m4a", "audio/x-m4a", "audio/ogg", "audio/flac", "audio/aac"],
  // [PAID] "trim-audio":        ["audio/mpeg", "audio/wav", "audio/m4a", "audio/x-m4a", "audio/ogg", "audio/flac"],
  // [PAID] "compress-audio":    ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
  // [PAID] "merge-audio":       ["audio/mpeg", "audio/wav", "audio/ogg", "audio/flac"],
  // ── Video — ALL DISABLED (FFmpeg hosting cost) ──
  // [PAID] "mp4-to-gif":        ["video/mp4", "video/x-m4v", "video/mpeg"],
  // [PAID] "trim-video":        ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"],
  // [PAID] "compress-video":    ["video/mp4", "video/quicktime"],
  // [PAID] "video-to-mp4":      ["video/quicktime", "video/x-msvideo", "video/x-matroska", "video/avi"],
  // ── Documents — ALL DISABLED (LibreOffice/WeasyPrint hosting cost) ──
  // [PAID] "html-to-pdf":       ["text/html"],
  // [PAID] "markdown-to-pdf":   ["text/markdown", "text/plain", "text/x-markdown"],
  // [PAID] "txt-to-pdf":        ["text/plain"],
  // [PAID] "csv-to-excel":      ["text/csv", "application/csv", "text/x-csv"],
}

// Tools that require LibreOffice — only available on VPS, not local dev
const LIBREOFFICE_TOOLS = new Set([
  "pdf-to-word", "pdf-to-excel", "pdf-to-powerpoint",
  "word-to-pdf", "excel-to-pdf", "ppt-to-pdf",
])

export async function POST(req: Request) {
  // Reject requests not originating from our own app (CSRF-style protection)
  // In dev, allow any localhost port (Next.js may pick 3001, 3002, etc. if 3000 is busy)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const origin = req.headers.get("origin")
  const isDev = process.env.NODE_ENV === "development"
  const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:")
  if (origin && origin !== appUrl && !(isDev && isLocalhost)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let user: Awaited<ReturnType<typeof getCurrentUserOrGuest>>
  try {
    user = await getCurrentUserOrGuest()
  } catch (e) {
    if (e instanceof Response) return e
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Per-user sliding window: 20 uploads / minute
  const rl = checkRateLimit(user.id)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before uploading again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      }
    )
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

  // Block tools that require the Python worker or OpenAI API (not available on free tier)
  if (DISABLED_TOOLS.has(jobType)) {
    return NextResponse.json(
      { error: "This tool is coming soon. Only free tools are available during the current launch." },
      { status: 503 }
    )
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

  // Daily job limit check — guests are exempt (no login required), signed-in FREE users get 5/day
  if (user.plan === "FREE" && !user.isGuest) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = await prisma.job.count({
      where: { userId: user.id, status: { in: ["PENDING", "PROCESSING", "COMPLETED"] }, createdAt: { gte: today } },
    })
    if (todayCount >= limits.dailyJobs) {
      return NextResponse.json(
        { error: "Daily limit reached. Sign up free for 5 conversions per day." },
        { status: 429 }
      )
    }
  }

  // Upload file(s) to storage — only after all checks pass
  // _plan is intentionally NOT stored in metadata; processor reads plan from DB
  const options: Record<string, unknown> = optionsRaw ? JSON.parse(optionsRaw) : {}

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

  // Create job + update usage counter atomically so they can never diverge
  const month = new Date().toISOString().slice(0, 7)
  const [job] = await prisma.$transaction([
    prisma.job.create({
      data: {
        userId: user.id,
        type: jobType,
        status: "PENDING",
        inputKey,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: options as any,
      },
    }),
    prisma.usage.upsert({
      where: { userId_month: { userId: user.id, month } },
      create: { userId: user.id, month, jobCount: 1 },
      update: { jobCount: { increment: 1 } },
    }),
  ])

  // Process immediately if this tool is supported locally (no Python worker needed)
  if (LOCAL_TOOLS.has(jobType)) {
    // Fire-and-forget: don't block the response on processing time
    processJobLocally(job.id).catch(() => {/* status saved to DB by processJobLocally */})
    return NextResponse.json({ jobId: job.id, status: "PROCESSING" }, { status: 201 })
  }

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 201 })
}
