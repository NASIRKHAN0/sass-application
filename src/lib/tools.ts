export type ToolCategory = "pdf" | "image" | "audio" | "video" | "document" | "utility"
export type ToolPriority = "mvp" | "phase2" | "phase3"

export type MinPlan = "PRO" | "BUSINESS"

export interface Tool {
  slug: string
  label: string
  description: string
  category: ToolCategory
  priority: ToolPriority
  inputFormat?: string
  outputFormat?: string
  badge?: string
  minPlan?: MinPlan  // undefined = free for everyone
}

// ─── FREE TIER ONLY ──────────────────────────────────────────────────────────
// Tools marked with [PAID] require the Python worker or OpenAI API — commented
// out for the free deployment. Uncomment when the paid infrastructure is ready.
// ─────────────────────────────────────────────────────────────────────────────

export const TOOLS: Tool[] = [
  // ─── PDF Convert FROM ─────────────────────────────────────
  // [PAID] Requires Python worker + LibreOffice
  // { slug: "pdf-to-word",        label: "PDF to Word",        description: "Convert PDF to editable .docx",              category: "pdf",      priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".docx" },
  // { slug: "pdf-to-excel",       label: "PDF to Excel",       description: "Extract tables into spreadsheet",             category: "pdf",      priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".xlsx" },
  // { slug: "pdf-to-powerpoint",  label: "PDF to PowerPoint",  description: "Convert slides back to .pptx",               category: "pdf",      priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".pptx" },
  // [PAID] Requires Python worker (PyMuPDF)
  // { slug: "pdf-to-jpg",         label: "PDF to JPG",         description: "Render every page as a JPEG image",           category: "pdf",      priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".jpg"  },
  // { slug: "pdf-to-png",         label: "PDF to PNG",         description: "Render every page as a PNG image",            category: "pdf",      priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".png"  },
  // { slug: "pdf-to-txt",         label: "PDF to Text",        description: "Extract all text content from PDF",           category: "pdf",      priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".txt"  },
  // [PAID] Phase 2 — Python worker
  // { slug: "pdf-to-webp",        label: "PDF to WEBP",        description: "Modern web-optimized image output",           category: "pdf",      priority: "phase2", inputFormat: ".pdf",  outputFormat: ".webp" },
  // { slug: "pdf-to-html",        label: "PDF to HTML",        description: "Convert PDF layout to web page",              category: "pdf",      priority: "phase2", inputFormat: ".pdf",  outputFormat: ".html" },
  // { slug: "pdf-to-epub",        label: "PDF to EPUB",        description: "Convert to e-book format",                   category: "pdf",      priority: "phase2", inputFormat: ".pdf",  outputFormat: ".epub" },
  // ─── PDF Convert TO ──────────────────────────────────────
  // [PAID] Requires Python worker + LibreOffice
  // { slug: "word-to-pdf",        label: "Word to PDF",        description: "Convert .docx / .doc to PDF",                category: "pdf",      priority: "mvp",    inputFormat: ".docx", outputFormat: ".pdf"  },
  // { slug: "excel-to-pdf",       label: "Excel to PDF",       description: "Convert .xlsx / .xls to PDF",                category: "pdf",      priority: "mvp",    inputFormat: ".xlsx", outputFormat: ".pdf"  },
  // { slug: "ppt-to-pdf",         label: "PowerPoint to PDF",  description: "Convert .pptx / .ppt to PDF",                category: "pdf",      priority: "mvp",    inputFormat: ".pptx", outputFormat: ".pdf"  },
  { slug: "jpg-to-pdf",         label: "JPG to PDF",         description: "Combine images into a PDF",                  category: "pdf",      priority: "mvp",    inputFormat: ".jpg",  outputFormat: ".pdf"  },
  // [PAID] Requires Python worker
  // { slug: "images-to-pdf",      label: "Images to PDF",      description: "Merge multiple images into one PDF",         category: "pdf",      priority: "mvp",    inputFormat: "image", outputFormat: ".pdf"  },
  // ─── PDF Management ──────────────────────────────────────
  { slug: "merge-pdf",          label: "Merge PDF",          description: "Combine multiple PDFs into one",             category: "pdf",      priority: "mvp"   },
  { slug: "split-pdf",          label: "Split PDF",          description: "Split by range, every N pages",              category: "pdf",      priority: "mvp"   },
  // [PAID] Requires Python worker (pikepdf)
  // { slug: "compress-pdf",       label: "Compress PDF",       description: "Reduce file size, keep quality",             category: "pdf",      priority: "mvp"   },
  { slug: "rotate-pdf",         label: "Rotate PDF",         description: "Rotate pages 90° / 180° / 270°",            category: "pdf",      priority: "mvp"   },
  { slug: "protect-pdf",        label: "Protect PDF",        description: "Add AES-256 password encryption",            category: "pdf",      priority: "mvp"   },
  // [PAID] Requires Python worker (pikepdf)
  // { slug: "unlock-pdf",         label: "Unlock PDF",         description: "Remove password from PDF",                   category: "pdf",      priority: "mvp"   },
  // [PAID] Phase 2 — Python worker / AI
  // { slug: "ocr-pdf",            label: "OCR PDF",            description: "Make scanned PDFs searchable",               category: "pdf",      priority: "phase2", badge: "AI" },
  // { slug: "sign-pdf",           label: "Sign PDF",           description: "Draw, type, or upload signature",            category: "pdf",      priority: "phase2" },
  // { slug: "watermark-pdf",      label: "Add Watermark",      description: "Text or image watermark on pages",           category: "pdf",      priority: "phase2" },
  // { slug: "page-numbers-pdf",   label: "Add Page Numbers",   description: "Header / footer page numbering",             category: "pdf",      priority: "phase2" },
  // { slug: "reorder-pdf",        label: "Reorder Pages",      description: "Drag-and-drop page reordering",              category: "pdf",      priority: "phase2" },
  // { slug: "delete-pages-pdf",   label: "Delete Pages",       description: "Remove specific pages from PDF",             category: "pdf",      priority: "phase2" },
  // { slug: "repair-pdf",         label: "Repair PDF",         description: "Fix corrupted or damaged PDF files",         category: "pdf",      priority: "phase2" },
  // [PAID] Phase 3 — Python worker
  // { slug: "redact-pdf",         label: "Redact PDF",         description: "Permanently black out sensitive text",       category: "pdf",      priority: "phase3" },
  // { slug: "crop-pdf",           label: "Crop PDF",           description: "Adjust margins and crop area",               category: "pdf",      priority: "phase3" },
  // ─── Image Tools ─────────────────────────────────────────
  { slug: "jpg-to-png",         label: "JPG to PNG",         description: "Convert JPEG to lossless PNG",               category: "image",    priority: "mvp",    inputFormat: ".jpg",  outputFormat: ".png"  },
  { slug: "png-to-jpg",         label: "PNG to JPG",         description: "Convert PNG to smaller JPEG",                category: "image",    priority: "mvp",    inputFormat: ".png",  outputFormat: ".jpg"  },
  { slug: "image-to-webp",      label: "Convert to WEBP",    description: "Shrink images for the web",                  category: "image",    priority: "mvp",    outputFormat: ".webp" },
  { slug: "compress-image",     label: "Compress Image",     description: "Reduce size, set quality percentage",        category: "image",    priority: "mvp"   },
  { slug: "resize-image",       label: "Resize Image",       description: "Resize by px, %, or preset dimensions",     category: "image",    priority: "mvp"   },
  { slug: "grayscale-image",    label: "Grayscale Image",    description: "Convert any image to black & white",        category: "image",    priority: "mvp"   },
  { slug: "merge-images",       label: "Merge Images",       description: "Combine multiple images side by side",      category: "image",    priority: "mvp",    outputFormat: ".jpg"  },
  { slug: "qr-code",            label: "QR Code Generator",  description: "Generate QR codes from any URL or text",    category: "image",    priority: "mvp",    outputFormat: ".png"  },
  { slug: "tiff-to-jpg",        label: "TIFF to JPG",        description: "Convert TIFF images to JPEG",               category: "image",    priority: "mvp",    inputFormat: ".tiff", outputFormat: ".jpg"  },
  { slug: "bmp-to-jpg",         label: "BMP to JPG",         description: "Convert BMP images to JPEG",                category: "image",    priority: "mvp",    inputFormat: ".bmp",  outputFormat: ".jpg"  },
  { slug: "image-to-avif",      label: "Convert to AVIF",    description: "Modern high-efficiency image format",       category: "image",    priority: "mvp",    outputFormat: ".avif" },
  { slug: "flip-image",         label: "Flip / Mirror",      description: "Flip image horizontally or vertically",     category: "image",    priority: "mvp"   },
  { slug: "favicon-generator",  label: "Favicon Generator",  description: "Create multi-size favicon from any image",  category: "image",    priority: "mvp",    outputFormat: ".png"  },
  { slug: "image-to-base64",    label: "Image to Base64",    description: "Convert image to Base64 data URL",          category: "image",    priority: "mvp"   },
  // [PAID] Requires Python worker (not in LOCAL_TOOLS)
  // { slug: "add-text-image",     label: "Add Text to Image",  description: "Overlay custom text on any image",          category: "image",    priority: "mvp"   },
  // { slug: "photo-enhancer",     label: "Photo Enhancer",     description: "Adjust brightness, contrast and sharpness", category: "image",    priority: "mvp"   },
  // [PAID] Phase 2 — Python worker + AI (OCR)
  // { slug: "image-to-text",      label: "Image to Text",      description: "Extract text from images with OCR",         category: "image",    priority: "phase2", badge: "AI",  minPlan: "PRO" },
  // [PAID] Requires Python worker (pillow-heif)
  // { slug: "heic-to-jpg",        label: "HEIC to JPG",        description: "Convert iPhone photos to JPEG",             category: "image",    priority: "mvp"   },
  // [PAID] Requires Python worker (cairosvg)
  // { slug: "svg-to-png",         label: "SVG to PNG",         description: "Rasterize vector graphics",                  category: "image",    priority: "mvp",    inputFormat: ".svg",  outputFormat: ".png"  },
  // [PAID] Phase 2 — Python worker
  // { slug: "crop-image",         label: "Crop & Rotate",      description: "Crop selection and rotate images",           category: "image",    priority: "phase2" },
  // [PAID] Requires Python worker + AI (rembg) — PRO plan
  // { slug: "remove-background",  label: "Remove Background",  description: "AI-powered background removal",             category: "image",    priority: "mvp",    badge: "AI",  minPlan: "PRO" },
  // [PAID] Phase 3 — Python worker + AI — PRO plan
  // { slug: "upscale-image",      label: "AI Upscale",         description: "Increase resolution with AI",               category: "image",    priority: "phase3", badge: "AI",  minPlan: "PRO" },
  // ─── Voice & Audio (ALL COMMENTED — require OpenAI Whisper API $0.006/min) ──
  // [PAID] OpenAI Whisper API — costs $0.006/minute
  // { slug: "transcribe-mp3",     label: "Transcribe MP3",     description: "Convert MP3 audio to text",                  category: "audio",    priority: "mvp",                  minPlan: "PRO" },
  // { slug: "transcribe-audio",   label: "Transcribe Audio",   description: "WAV, M4A, FLAC, OGG → text",                category: "audio",    priority: "mvp",                  minPlan: "PRO" },
  // { slug: "transcribe-video",   label: "Transcribe Video",   description: "MP4 / MOV — extract & transcribe audio",    category: "audio",    priority: "mvp",                  minPlan: "PRO" },
  // { slug: "transcribe-50lang",  label: "50+ Languages",      description: "Auto-detect or select language",             category: "audio",    priority: "mvp",    badge: "AI",  minPlan: "PRO" },
  // [PAID] Requires Python worker (FFmpeg)
  // { slug: "mp4-to-mp3",         label: "MP4 to MP3",         description: "Extract audio track from video file",       category: "audio",    priority: "mvp",    inputFormat: ".mp4",  outputFormat: ".mp3"  },
  // { slug: "audio-to-mp3",       label: "Audio to MP3",       description: "Convert WAV, M4A, FLAC, OGG to MP3",        category: "audio",    priority: "mvp",    outputFormat: ".mp3"  },
  // { slug: "trim-audio",         label: "Trim Audio",         description: "Cut audio clip by start and end time",      category: "audio",    priority: "mvp"   },
  // { slug: "compress-audio",     label: "Compress Audio",     description: "Reduce audio file size with lower bitrate", category: "audio",    priority: "mvp"   },
  // { slug: "merge-audio",        label: "Merge Audio",        description: "Combine multiple audio files into one",     category: "audio",    priority: "mvp"   },
  // [PAID] Phase 2 — OpenAI Whisper + GPT-4o
  // { slug: "export-srt",         label: "Export SRT / VTT",   description: "Subtitle files for video editors",          category: "audio",    priority: "phase2",               minPlan: "PRO" },
  // { slug: "ai-summarize",       label: "AI Summarize",       description: "Auto-generate summary from transcript",     category: "audio",    priority: "phase2", badge: "AI",  minPlan: "PRO" },
  // { slug: "ai-translate",       label: "AI Translate",       description: "Translate transcript to any language",      category: "audio",    priority: "phase2", badge: "AI",  minPlan: "PRO" },
  // { slug: "key-points",         label: "Key Points",         description: "Extract action items and topics",            category: "audio",    priority: "phase2", badge: "AI",  minPlan: "PRO" },
  // { slug: "speaker-id",         label: "Speaker ID",         description: "Who said what — diarization",               category: "audio",    priority: "phase2", badge: "AI",  minPlan: "PRO" },
  // ─── Video Tools (ALL COMMENTED — require Python worker + FFmpeg hosting) ────
  // [PAID] Requires Python worker (FFmpeg) — server hosting cost
  // { slug: "mp4-to-gif",         label: "MP4 to GIF",         description: "Convert video clip to animated GIF",        category: "video",    priority: "mvp",    inputFormat: ".mp4",  outputFormat: ".gif"  },
  // { slug: "trim-video",         label: "Trim Video",         description: "Cut video to a specific time range",        category: "video",    priority: "mvp"   },
  // { slug: "compress-video",     label: "Compress Video",     description: "Reduce video file size with H.264",         category: "video",    priority: "mvp"   },
  // { slug: "video-to-mp4",       label: "Convert to MP4",     description: "Convert MOV, AVI, MKV to MP4",             category: "video",    priority: "mvp",    outputFormat: ".mp4"  },
  // ─── Document Tools (ALL COMMENTED — require Python worker + LibreOffice) ────
  // [PAID] Requires Python worker (WeasyPrint / LibreOffice) — server hosting cost
  // { slug: "html-to-pdf",        label: "HTML to PDF",        description: "Convert HTML web pages to PDF",             category: "document", priority: "mvp",    inputFormat: ".html", outputFormat: ".pdf"  },
  // { slug: "markdown-to-pdf",    label: "Markdown to PDF",    description: "Convert Markdown documents to PDF",         category: "document", priority: "mvp",    inputFormat: ".md",   outputFormat: ".pdf"  },
  // { slug: "txt-to-pdf",         label: "Text to PDF",        description: "Convert plain text files to PDF",           category: "document", priority: "mvp",    inputFormat: ".txt",  outputFormat: ".pdf"  },
  // { slug: "csv-to-excel",       label: "CSV to Excel",       description: "Convert CSV files to Excel spreadsheet",    category: "document", priority: "mvp",    inputFormat: ".csv",  outputFormat: ".xlsx" },
  // { slug: "csv-to-json",        label: "CSV to JSON",        description: "Convert CSV data to JSON format",           category: "document", priority: "mvp",    inputFormat: ".csv",  outputFormat: ".json" },
  // ─── Developer Utilities ─────────────────────────────────
  { slug: "base64-encode",      label: "Base64 Encoder",     description: "Encode and decode Base64 strings instantly", category: "utility", priority: "mvp"   },
  { slug: "json-formatter",     label: "JSON Formatter",     description: "Format, validate and minify JSON",          category: "utility",  priority: "mvp"   },
  { slug: "url-encoder",        label: "URL Encoder",        description: "Encode and decode URL components",          category: "utility",  priority: "mvp"   },
  { slug: "hash-generator",     label: "Hash Generator",     description: "Generate SHA-256, SHA-512, SHA-1 hashes",   category: "utility",  priority: "mvp"   },
  { slug: "color-converter",    label: "Color Converter",    description: "Convert between HEX, RGB, and HSL",         category: "utility",  priority: "mvp"   },
  { slug: "uuid-generator",     label: "UUID Generator",     description: "Generate random UUIDs v4 instantly",        category: "utility",  priority: "mvp"   },
  { slug: "text-case-converter",label: "Text Case Converter",description: "camelCase, snake_case, PascalCase and more",category: "utility",  priority: "mvp"   },
]

export const TOOL_CATEGORIES = {
  pdf: {
    label: "PDF Tools",
    description: "Merge, split, rotate, protect and convert PDF files",
    count: TOOLS.filter((t) => t.category === "pdf").length,
  },
  image: {
    label: "Image Tools",
    description: "Convert, compress, resize and transform images",
    count: TOOLS.filter((t) => t.category === "image").length,
  },
  // [PAID] Audio category disabled — requires OpenAI Whisper API ($0.006/min)
  // audio: {
  //   label: "Voice & Audio",
  //   description: "Transcribe in 50+ languages with AI",
  //   count: TOOLS.filter((t) => t.category === "audio").length,
  // },
  // [PAID] Video category disabled — requires Python worker + FFmpeg hosting
  // video: {
  //   label: "Video Tools",
  //   description: "Convert, trim and compress video files",
  //   count: TOOLS.filter((t) => t.category === "video").length,
  // },
  // [PAID] Document category disabled — requires Python worker + LibreOffice hosting
  // document: {
  //   label: "Document Tools",
  //   description: "Convert HTML, Markdown, CSV and more",
  //   count: TOOLS.filter((t) => t.category === "document").length,
  // },
  utility: {
    label: "Developer Utilities",
    description: "Base64, JSON, UUID, hashing and more",
    count: TOOLS.filter((t) => t.category === "utility").length,
  },
} as const

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

const PLAN_RANK: Record<string, number> = { FREE: 0, PRO: 1, BUSINESS: 2 }

export function canAccessTool(tool: Tool, userPlan: string): boolean {
  if (!tool.minPlan) return true
  return PLAN_RANK[userPlan] >= PLAN_RANK[tool.minPlan]
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category)
}

export const MVP_TOOLS = TOOLS.filter((t) => t.priority === "mvp")
export const TICKER_FORMATS = [
  "PDF", "DOCX", "XLSX", "PPTX", "JPG", "PNG", "WEBP", "MP3",
  "WAV", "MP4", "HEIC", "SVG", "EPUB", "TXT", "HTML", "MOV",
  "M4A", "FLAC", "OGG", "AVIF", "TIFF", "BMP", "GIF", "ICO",
  "SRT", "VTT", "CSV", "JSON", "MD", "MKV", "AVI",
]
