export type ToolCategory = "pdf" | "image" | "audio"
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

export const TOOLS: Tool[] = [
  // ─── PDF Convert FROM ─────────────────────────────────────
  { slug: "pdf-to-word",        label: "PDF to Word",       description: "Convert PDF to editable .docx",              category: "pdf",   priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".docx" },
  { slug: "pdf-to-excel",       label: "PDF to Excel",      description: "Extract tables into spreadsheet",             category: "pdf",   priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".xlsx" },
  { slug: "pdf-to-powerpoint",  label: "PDF to PowerPoint", description: "Convert slides back to .pptx",               category: "pdf",   priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".pptx" },
  { slug: "pdf-to-jpg",         label: "PDF to JPG",        description: "Render every page as a JPEG image",           category: "pdf",   priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".jpg" },
  { slug: "pdf-to-png",         label: "PDF to PNG",        description: "Render every page as a PNG image",            category: "pdf",   priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".png" },
  { slug: "pdf-to-txt",         label: "PDF to Text",       description: "Extract all text content from PDF",           category: "pdf",   priority: "mvp",    inputFormat: ".pdf",  outputFormat: ".txt" },
  { slug: "pdf-to-webp",        label: "PDF to WEBP",       description: "Modern web-optimized image output",           category: "pdf",   priority: "phase2", inputFormat: ".pdf",  outputFormat: ".webp" },
  { slug: "pdf-to-html",        label: "PDF to HTML",       description: "Convert PDF layout to web page",              category: "pdf",   priority: "phase2", inputFormat: ".pdf",  outputFormat: ".html" },
  { slug: "pdf-to-epub",        label: "PDF to EPUB",       description: "Convert to e-book format",                   category: "pdf",   priority: "phase2", inputFormat: ".pdf",  outputFormat: ".epub" },
  // ─── PDF Convert TO ──────────────────────────────────────
  { slug: "word-to-pdf",        label: "Word to PDF",       description: "Convert .docx / .doc to PDF",                category: "pdf",   priority: "mvp",    inputFormat: ".docx", outputFormat: ".pdf" },
  { slug: "excel-to-pdf",       label: "Excel to PDF",      description: "Convert .xlsx / .xls to PDF",                category: "pdf",   priority: "mvp",    inputFormat: ".xlsx", outputFormat: ".pdf" },
  { slug: "ppt-to-pdf",         label: "PowerPoint to PDF", description: "Convert .pptx / .ppt to PDF",                category: "pdf",   priority: "mvp",    inputFormat: ".pptx", outputFormat: ".pdf" },
  { slug: "jpg-to-pdf",         label: "JPG to PDF",        description: "Combine images into a PDF",                  category: "pdf",   priority: "mvp",    inputFormat: ".jpg",  outputFormat: ".pdf" },
  { slug: "images-to-pdf",      label: "Images to PDF",     description: "Merge multiple images into one PDF",         category: "pdf",   priority: "mvp",    inputFormat: "image", outputFormat: ".pdf" },
  // ─── PDF Management ──────────────────────────────────────
  { slug: "merge-pdf",          label: "Merge PDF",         description: "Combine multiple PDFs into one",             category: "pdf",   priority: "mvp" },
  { slug: "split-pdf",          label: "Split PDF",         description: "Split by range, every N pages",              category: "pdf",   priority: "mvp" },
  { slug: "compress-pdf",       label: "Compress PDF",      description: "Reduce file size, keep quality",             category: "pdf",   priority: "mvp" },
  { slug: "rotate-pdf",         label: "Rotate PDF",        description: "Rotate pages 90° / 180° / 270°",            category: "pdf",   priority: "mvp" },
  { slug: "protect-pdf",        label: "Protect PDF",       description: "Add AES-256 password encryption",            category: "pdf",   priority: "mvp" },
  { slug: "unlock-pdf",         label: "Unlock PDF",        description: "Remove password from PDF",                   category: "pdf",   priority: "mvp" },
  { slug: "ocr-pdf",            label: "OCR PDF",           description: "Make scanned PDFs searchable",               category: "pdf",   priority: "phase2", badge: "AI" },
  { slug: "sign-pdf",           label: "Sign PDF",          description: "Draw, type, or upload signature",            category: "pdf",   priority: "phase2" },
  { slug: "watermark-pdf",      label: "Add Watermark",     description: "Text or image watermark on pages",           category: "pdf",   priority: "phase2" },
  { slug: "page-numbers-pdf",   label: "Add Page Numbers",  description: "Header / footer page numbering",             category: "pdf",   priority: "phase2" },
  { slug: "reorder-pdf",        label: "Reorder Pages",     description: "Drag-and-drop page reordering",              category: "pdf",   priority: "phase2" },
  { slug: "delete-pages-pdf",   label: "Delete Pages",      description: "Remove specific pages from PDF",             category: "pdf",   priority: "phase2" },
  { slug: "repair-pdf",         label: "Repair PDF",        description: "Fix corrupted or damaged PDF files",         category: "pdf",   priority: "phase2" },
  { slug: "redact-pdf",         label: "Redact PDF",        description: "Permanently black out sensitive text",       category: "pdf",   priority: "phase3" },
  { slug: "crop-pdf",           label: "Crop PDF",          description: "Adjust margins and crop area",               category: "pdf",   priority: "phase3" },
  // ─── Image Tools ─────────────────────────────────────────
  { slug: "jpg-to-png",         label: "JPG to PNG",        description: "Convert JPEG to lossless PNG",               category: "image", priority: "mvp",    inputFormat: ".jpg",  outputFormat: ".png" },
  { slug: "png-to-jpg",         label: "PNG to JPG",        description: "Convert PNG to smaller JPEG",                category: "image", priority: "mvp",    inputFormat: ".png",  outputFormat: ".jpg" },
  { slug: "image-to-webp",       label: "Convert to WEBP",   description: "Shrink images for the web",                  category: "image", priority: "mvp",    outputFormat: ".webp" },
  { slug: "compress-image",     label: "Compress Image",    description: "Reduce size, set quality percentage",        category: "image", priority: "mvp" },
  { slug: "resize-image",       label: "Resize Image",      description: "Resize by px, %, or preset dimensions",     category: "image", priority: "mvp" },
  { slug: "grayscale-image",    label: "Grayscale Image",   description: "Convert any image to black & white",        category: "image", priority: "mvp" },
  { slug: "merge-images",       label: "Merge Images",      description: "Combine multiple images side by side",      category: "image", priority: "mvp",    outputFormat: ".jpg" },
  { slug: "qr-code",            label: "QR Code Generator", description: "Generate QR codes from any URL or text",    category: "image", priority: "mvp",    outputFormat: ".png" },
  { slug: "image-to-text",      label: "Image to Text",     description: "Extract text from images with OCR",         category: "image", priority: "phase2", badge: "AI", minPlan: "PRO" },
  { slug: "heic-to-jpg",        label: "HEIC to JPG",       description: "Convert iPhone photos to JPEG",             category: "image", priority: "phase2" },
  { slug: "svg-to-png",         label: "SVG to PNG",        description: "Rasterize vector graphics",                  category: "image", priority: "phase2", inputFormat: ".svg",  outputFormat: ".png" },
  { slug: "crop-image",         label: "Crop & Rotate",     description: "Crop selection and rotate images",           category: "image", priority: "phase2" },
  { slug: "remove-background",  label: "Remove Background", description: "AI-powered background removal",             category: "image", priority: "phase2", badge: "AI",  minPlan: "PRO" },
  { slug: "upscale-image",      label: "AI Upscale",        description: "Increase resolution with AI",               category: "image", priority: "phase3", badge: "AI",  minPlan: "PRO" },
  // ─── Voice & Audio ───────────────────────────────────────
  { slug: "transcribe-mp3",     label: "Transcribe MP3",    description: "Convert MP3 audio to text",                  category: "audio", priority: "mvp",    minPlan: "PRO" },
  { slug: "transcribe-audio",   label: "Transcribe Audio",  description: "WAV, M4A, FLAC, OGG → text",                category: "audio", priority: "mvp",    minPlan: "PRO" },
  { slug: "transcribe-video",   label: "Transcribe Video",  description: "MP4 / MOV — extract & transcribe audio",    category: "audio", priority: "mvp",    minPlan: "PRO" },
  { slug: "transcribe-50lang",  label: "50+ Languages",     description: "Auto-detect or select language",             category: "audio", priority: "mvp",    badge: "AI",   minPlan: "PRO" },
  { slug: "export-srt",         label: "Export SRT / VTT",  description: "Subtitle files for video editors",          category: "audio", priority: "phase2",                minPlan: "PRO" },
  { slug: "ai-summarize",       label: "AI Summarize",      description: "Auto-generate summary from transcript",     category: "audio", priority: "phase2", badge: "AI",   minPlan: "PRO" },
  { slug: "ai-translate",       label: "AI Translate",      description: "Translate transcript to any language",      category: "audio", priority: "phase2", badge: "AI",   minPlan: "PRO" },
  { slug: "key-points",         label: "Key Points",        description: "Extract action items and topics",            category: "audio", priority: "phase2", badge: "AI",   minPlan: "PRO" },
  { slug: "speaker-id",         label: "Speaker ID",        description: "Who said what — diarization",               category: "audio", priority: "phase2", badge: "AI",   minPlan: "PRO" },
]

export const TOOL_CATEGORIES = {
  pdf: {
    label: "PDF Tools",
    description: "30+ operations for every PDF task",
    count: TOOLS.filter((t) => t.category === "pdf").length,
  },
  image: {
    label: "Image Tools",
    description: "15+ formats, AI-powered processing",
    count: TOOLS.filter((t) => t.category === "image").length,
  },
  audio: {
    label: "Voice & Audio",
    description: "Transcribe in 50+ languages with AI",
    count: TOOLS.filter((t) => t.category === "audio").length,
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
  "M4A", "FLAC", "OGG", "AVIF", "TIFF", "BMP", "SRT", "VTT",
]
