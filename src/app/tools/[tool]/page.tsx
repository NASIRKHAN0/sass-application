import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Zap, Lock } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { getToolBySlug, canAccessTool, TOOLS } from "@/lib/tools"
import { UploadZone } from "@/components/tools/UploadZone"
import { QRCodeTool } from "@/components/tools/QRCodeTool"
import { getCurrentUserOrNull } from "@/lib/auth"

interface Props {
  params: Promise<{ tool: string }>
}

export async function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { tool: slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) return {}
  return {
    title: `${tool.label} — Free Online Converter`,
    description: tool.description,
  }
}

export default async function ToolPage({ params }: Props) {
  const { tool: slug } = await params
  const tool = getToolBySlug(slug)
  if (!tool) notFound()

  const user = await getCurrentUserOrNull()
  const userPlan = user?.plan ?? "FREE"
  const hasAccess = canAccessTool(tool, userPlan)

  const relatedTools = TOOLS
    .filter((t) => t.category === tool.category && t.slug !== tool.slug && t.priority === "mvp")
    .slice(0, 4)

  const isComingSoon = tool.priority !== "mvp"

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            All tools
          </Link>
          <span>/</span>
          <span className="text-foreground/60">{tool.category.toUpperCase()}</span>
          <span>/</span>
          <span className="text-foreground">{tool.label}</span>
        </div>

        {/* Tool Header */}
        <div className="mb-10 pb-8 border-b border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  {tool.category}
                </span>
                {tool.badge && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-foreground/20 text-foreground/60">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">{tool.label}</h1>
              <p className="text-sm text-muted-foreground max-w-lg">{tool.description}</p>
            </div>

            {tool.inputFormat && tool.outputFormat && (
              <div className="hidden sm:flex items-center gap-2 shrink-0 bg-card rounded-sm border border-border/60 px-4 py-2.5">
                <span className="text-xs font-mono font-semibold text-foreground/70">{tool.inputFormat}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-xs font-mono font-semibold text-foreground/70">{tool.outputFormat}</span>
              </div>
            )}
          </div>
        </div>

        {isComingSoon ? (
          /* Coming Soon */
          <div className="flex flex-col items-center justify-center text-center gap-5 py-20 rounded-sm border border-border/60 bg-card/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border/60 bg-card">
              <Zap className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-1">Coming soon</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                This tool is in development and will be available in a future update.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Get notified <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : !hasAccess ? (
          /* Plan Gate */
          <div className="flex flex-col items-center justify-center text-center gap-5 py-20 rounded-sm border border-border/60 bg-card/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-foreground/20 bg-card">
              <Lock className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-foreground/20 text-[10px] font-semibold uppercase tracking-wider text-foreground/60 mb-3">
                <Zap className="h-3 w-3" /> {tool.minPlan} Plan Required
              </div>
              <h2 className="text-sm font-semibold text-foreground mb-1">{tool.label} is a premium tool</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                {tool.category === "audio"
                  ? "Audio transcription uses AI and is available on the Pro plan and above."
                  : "This AI-powered tool is available on the Pro plan and above."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!user && (
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium rounded-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Upgrade to {tool.minPlan} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : tool.slug === "qr-code" ? (
          /* QR Code Generator — no file upload needed */
          <QRCodeTool />
        ) : (
          /* Upload Zone */
          <UploadZone tool={tool} userPlan={userPlan} />
        )}

        {/* How it works for this tool */}
        {!isComingSoon && (
          <div className="mt-12 pt-10 border-t border-border/60">
            <h2 className="text-sm font-semibold text-foreground mb-6">How to use {tool.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", text: `Upload your ${tool.inputFormat ?? "file"}` },
                { step: "2", text: "Click Convert and wait a moment" },
                { step: "3", text: `Download your ${tool.outputFormat ?? "result"}` },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3 p-4 rounded-sm border border-border/60 bg-card/40">
                  <span className="font-serif text-2xl text-foreground/15 select-none leading-none mt-0.5">{step}</span>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-12 pt-10 border-t border-border/60">
            <h2 className="text-sm font-semibold text-foreground mb-5">Related tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {relatedTools.map((related) => (
                <Link
                  key={related.slug}
                  href={`/tools/${related.slug}`}
                  className="group flex flex-col gap-1 p-3.5 rounded-sm border border-border/60 bg-card hover:border-foreground/20 transition-all"
                >
                  <span className="text-xs font-medium text-foreground leading-tight group-hover:text-foreground">
                    {related.label}
                  </span>
                  {related.outputFormat && (
                    <span className="text-[10px] text-muted-foreground/50 font-mono">{related.outputFormat}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
