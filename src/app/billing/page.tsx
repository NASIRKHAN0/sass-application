import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Zap, CheckCircle, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getCurrentUser } from "@/lib/auth"
import { getLimits } from "@/lib/limits"

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: [
    "5 conversions per day",
    "10 MB max file size",
    "24-hour file retention",
    "All basic tools",
  ],
  PRO: [
    "Unlimited conversions",
    "500 MB max file size",
    "600 min/month transcription",
    "30-day file retention",
    "No watermarks",
    "All tools including AI",
  ],
  BUSINESS: [
    "Unlimited conversions",
    "2 GB max file size",
    "3,000 min/month transcription",
    "90-day file retention",
    "API access",
    "5 team seats",
    "Priority support",
  ],
}

export default async function BillingPage() {
  let user
  try {
    user = await getCurrentUser()
  } catch {
    redirect("/sign-in")
  }

  const limits = getLimits(user.plan)
  const planLabel = user.plan.charAt(0) + user.plan.slice(1).toLowerCase()
  const features = PLAN_FEATURES[user.plan] ?? []

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10 flex-1 w-full">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-1">
            Billing
          </p>
          <h1 className="text-3xl font-bold text-foreground">Plan & billing</h1>
        </div>

        {/* Current plan card */}
        <div className="rounded-sm border border-border/60 bg-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-semibold text-foreground">{planLabel} Plan</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-foreground/8 border border-border/60 text-muted-foreground/60">
                  Current
                </span>
              </div>
              <p className="text-xs text-muted-foreground/60">
                {user.email}
              </p>
            </div>
            {user.plan !== "FREE" && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground/50">Billing managed via Stripe</p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-border/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
              What&apos;s included
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <CheckCircle className="h-3 w-3 text-foreground/40 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 pt-5 border-t border-border/60 flex items-center gap-3">
            {user.plan === "FREE" ? (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Upgrade plan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm border border-border/60 text-muted-foreground/50 cursor-not-allowed"
                  title="Stripe billing portal — coming soon"
                >
                  Manage subscription
                </button>
                <p className="text-xs text-muted-foreground/40">Stripe portal coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage this month */}
        <div className="rounded-sm border border-border/60 bg-card p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-4">
            Usage limits
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground/60 mb-0.5">File size limit</p>
              <p className="font-medium text-foreground">{limits.maxFileSizeMB} MB</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/60 mb-0.5">Daily conversions</p>
              <p className="font-medium text-foreground">
                {limits.dailyJobs === Infinity ? "Unlimited" : `${limits.dailyJobs} / day`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/60 mb-0.5">Transcription</p>
              <p className="font-medium text-foreground">
                {limits.transcriptionMinutesPerMonth === 0
                  ? "Not included"
                  : `${limits.transcriptionMinutesPerMonth} min / month`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/60 mb-0.5">File retention</p>
              <p className="font-medium text-foreground">
                {"fileRetentionHours" in limits
                  ? `${limits.fileRetentionHours} hours`
                  : `${"fileRetentionDays" in limits ? (limits as { fileRetentionDays: number }).fileRetentionDays : 30} days`}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade prompt for free users */}
        {user.plan === "FREE" && (
          <div className="rounded-sm border border-border/60 bg-card/40 p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-0.5">Need more?</p>
              <p className="text-xs text-muted-foreground/60">
                Upgrade to Pro for unlimited conversions, 500 MB files, and transcription.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              See plans <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
