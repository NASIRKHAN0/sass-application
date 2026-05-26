import Link from "next/link"
import { redirect } from "next/navigation"
import { FileText, ImageIcon, Mic, CheckCircle, AlertCircle, Loader2, Download, ArrowLeft, Clock } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storageGetSignedUrl } from "@/lib/storage"
import { TOOLS } from "@/lib/tools"
import { DeleteJobButton } from "@/components/jobs/DeleteJobButton"

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getToolMeta(slug: string) {
  const t = TOOLS.find((t) => t.slug === slug)
  return { label: t?.label ?? slug, category: t?.category ?? "pdf" }
}

function inputFilename(inputKey: string): string {
  const parts = inputKey.split("/")
  return parts[parts.length - 1] ?? inputKey
}

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED")
    return <span className="flex items-center gap-1 text-xs text-foreground/60"><CheckCircle className="h-3 w-3" /> Done</span>
  if (status === "PROCESSING" || status === "PENDING")
    return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Processing</span>
  if (status === "FAILED")
    return <span className="flex items-center gap-1 text-xs text-destructive/70"><AlertCircle className="h-3 w-3" /> Failed</span>
  return null
}

export default async function HistoryPage() {
  let user
  try {
    user = await getCurrentUser()
  } catch {
    redirect("/sign-in")
  }

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const downloadUrls: Record<string, string> = {}
  await Promise.all(
    jobs
      .filter((j) => j.status === "COMPLETED" && j.outputKey)
      .map(async (j) => {
        downloadUrls[j.id] = await storageGetSignedUrl(j.outputKey!)
      })
  )

  const completed = jobs.filter((j) => j.status === "COMPLETED").length
  const failed = jobs.filter((j) => j.status === "FAILED").length

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">
                Conversion history
              </p>
              <h1 className="text-3xl font-bold text-foreground">All jobs</h1>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60 pt-1">
              <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {completed} completed</span>
              {failed > 0 && <span className="flex items-center gap-1 text-destructive/50"><AlertCircle className="h-3 w-3" /> {failed} failed</span>}
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {jobs.length} total</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-sm border border-border/60 bg-card overflow-hidden">
          {jobs.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm text-muted-foreground/50">No conversions yet.</p>
              <Link
                href="/tools"
                className="mt-2 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Start your first one →
              </Link>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border/60 bg-muted/20">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">File</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Tool</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Size</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Date</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Status</span>
              </div>

              <div className="flex flex-col divide-y divide-border/60">
                {jobs.map((job) => {
                  const { label: toolLabel, category } = getToolMeta(job.type)
                  const filename = inputFilename(job.inputKey)
                  const dlUrl = downloadUrls[job.id]

                  return (
                    <div
                      key={job.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors group"
                    >
                      {/* File */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 h-7 w-7 flex items-center justify-center rounded-sm border border-border/60 bg-background">
                          {category === "audio" ? (
                            <Mic className="h-3 w-3 text-muted-foreground/50" />
                          ) : category === "image" ? (
                            <ImageIcon className="h-3 w-3 text-muted-foreground/50" />
                          ) : (
                            <FileText className="h-3 w-3 text-muted-foreground/50" />
                          )}
                        </div>
                        <span className="text-sm text-foreground truncate">{filename}</span>
                      </div>

                      {/* Tool */}
                      <span className="text-xs text-muted-foreground/70 truncate">{toolLabel}</span>

                      {/* Size */}
                      <span className="text-xs text-muted-foreground/50 font-mono">
                        {job.outputSize != null ? formatBytes(job.outputSize) : "—"}
                      </span>

                      {/* Date */}
                      <span className="text-xs text-muted-foreground/50">{timeAgo(job.createdAt)}</span>

                      {/* Status + actions */}
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} />
                        {job.status === "COMPLETED" && dlUrl && (
                          <a
                            href={dlUrl}
                            download
                            className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center h-[26px] w-[26px] rounded-sm border border-border/60 text-muted-foreground hover:text-foreground transition-all"
                            aria-label="Download"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                        )}
                        <DeleteJobButton jobId={job.id} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {jobs.length >= 100 && (
          <p className="mt-4 text-center text-xs text-muted-foreground/40">
            Showing most recent 100 jobs.
          </p>
        )}
      </main>

      <Footer />
    </>
  )
}
