import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, FileText, ImageIcon, Mic, Clock, CheckCircle, AlertCircle, Loader2, Zap, Plus, Download } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storageGetSignedUrl } from "@/lib/storage"
import { getLimits } from "@/lib/limits"
import { TOOLS } from "@/lib/tools"

const QUICK_TOOLS = [
  { slug: "pdf-to-word",    label: "PDF to Word" },
  { slug: "compress-pdf",   label: "Compress PDF" },
  { slug: "transcribe-mp3", label: "Transcribe Audio" },
  { slug: "merge-pdf",      label: "Merge PDF" },
  { slug: "jpg-to-pdf",     label: "JPG to PDF" },
  { slug: "png-to-jpg",     label: "PNG to JPG" },
]

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
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
  // Key format: userId/jobId/original-filename — stored as userId_jobId_original-filename
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

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0
  const isHigh = pct > 80
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground/70 font-mono">
          {limit ? `${used} / ${limit}` : `${used} (unlimited)`}
        </span>
      </div>
      {limit && (
        <div className="h-1 rounded-full bg-border/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isHigh ? "bg-destructive/60" : "bg-foreground/50"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  let user
  try {
    user = await getCurrentUser()
  } catch {
    redirect("/sign-in")
  }

  const month = new Date().toISOString().slice(0, 7)
  const limits = getLimits(user.plan)

  const [jobs, usage] = await Promise.all([
    prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.usage.findUnique({
      where: { userId_month: { userId: user.id, month } },
    }),
  ])

  // Pre-generate download URLs server-side
  const downloadUrls: Record<string, string> = {}
  await Promise.all(
    jobs
      .filter((j) => j.status === "COMPLETED" && j.outputKey)
      .map(async (j) => {
        downloadUrls[j.id] = await storageGetSignedUrl(j.outputKey!)
      })
  )

  const jobsThisMonth = usage?.jobCount ?? 0
  const transcriptionMinutes = usage?.transcriptionMinutes ?? 0
  const planLabel = user.plan.charAt(0) + user.plan.slice(1).toLowerCase()
  const firstName = user.name?.split(" ")[0] ?? null

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">
              Dashboard
            </p>
            <h1 className="font-serif text-3xl text-foreground">
              Welcome back{firstName ? `, ${firstName}` : ""}.
            </h1>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            New conversion
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Conversions",
                  value: String(jobsThisMonth),
                  sub: "this month",
                },
                {
                  label: "Transcribed",
                  value: transcriptionMinutes > 0
                    ? `${Math.floor(transcriptionMinutes / 60)}h ${transcriptionMinutes % 60}m`
                    : "—",
                  sub: limits.transcriptionMinutesPerMonth > 0
                    ? `of ${limits.transcriptionMinutesPerMonth / 60}h limit`
                    : "upgrade to unlock",
                },
                {
                  label: "Plan",
                  value: planLabel,
                  sub: "active",
                },
              ].map(({ label, value, sub }) => (
                <div key={label} className="flex flex-col gap-1 p-4 rounded-sm border border-border/60 bg-card">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{label}</p>
                  <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground/60">{sub}</p>
                </div>
              ))}
            </div>

            {/* Job History */}
            <div className="rounded-sm border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
                <h2 className="text-sm font-semibold text-foreground">Recent jobs</h2>
                <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>

              {jobs.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm text-muted-foreground/50">No conversions yet.</p>
                  <Link
                    href="/tools"
                    className="mt-2 inline-block text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Start your first one →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/60">
                  {jobs.map((job) => {
                    const { label: toolLabel, category } = getToolMeta(job.type)
                    const filename = inputFilename(job.inputKey)
                    const dlUrl = downloadUrls[job.id]

                    return (
                      <div
                        key={job.id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                      >
                        {/* Icon */}
                        <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-sm border border-border/60 bg-background">
                          {category === "audio" ? (
                            <Mic className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ) : category === "image" ? (
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate block">{filename}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground/60">{toolLabel}</span>
                            {job.outputSize != null && (
                              <>
                                <span className="text-muted-foreground/30">·</span>
                                <span className="text-xs text-muted-foreground/50 font-mono">{formatBytes(job.outputSize)}</span>
                              </>
                            )}
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-xs text-muted-foreground/50">{timeAgo(job.createdAt)}</span>
                          </div>
                        </div>

                        {/* Status + Download */}
                        <div className="flex items-center gap-3 shrink-0">
                          <StatusBadge status={job.status} />
                          {job.status === "COMPLETED" && dlUrl && (
                            <a
                              href={dlUrl}
                              download
                              className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all px-2.5 py-1 rounded-sm border border-border/60 hover:border-foreground/30"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="px-5 py-3 border-t border-border/60 bg-card/40">
                <Link
                  href="/history"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View full history <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">

            {/* Plan + Usage */}
            <div className="rounded-sm border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-sm font-semibold text-foreground">{planLabel} Plan</span>
                </div>
                {user.plan === "FREE" && (
                  <Link href="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Upgrade →
                  </Link>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {limits.transcriptionMinutesPerMonth > 0 && (
                  <UsageBar
                    used={transcriptionMinutes}
                    limit={limits.transcriptionMinutesPerMonth}
                    label="Transcription minutes"
                  />
                )}
                <UsageBar
                  used={jobsThisMonth}
                  limit={limits.dailyJobs === Infinity ? null : limits.dailyJobs * 30}
                  label="Conversions this month"
                />
              </div>

              <Link
                href="/billing"
                className="mt-4 block w-full text-center text-xs font-medium py-2 rounded-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Manage billing
              </Link>
            </div>

            {/* Quick Tools */}
            <div className="rounded-sm border border-border/60 bg-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                Quick convert
              </h2>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_TOOLS.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="flex items-center justify-between gap-1 px-3 py-2.5 text-xs font-medium rounded-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-muted/40 transition-all"
                  >
                    <span>{t.label}</span>
                    <ArrowRight className="h-3 w-3 opacity-40" />
                  </Link>
                ))}
              </div>
              <Link
                href="/tools"
                className="mt-3 block text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                View all tools →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
