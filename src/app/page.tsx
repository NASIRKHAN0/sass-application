import Link from "next/link"
import { ArrowRight, Check, FileText, Image, Mic, Sparkles, Zap, Shield, Video, BookOpen, Wrench } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { TOOL_CATEGORIES, TICKER_FORMATS, MVP_TOOLS } from "@/lib/tools"

/* ─── Ticker Strip ───────────────────────────────────────────────── */
function TickerStrip() {
  const items = [...TICKER_FORMATS, ...TICKER_FORMATS]
  return (
    <div className="overflow-hidden border-y border-border/60 bg-card/40 py-3">
      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((fmt, i) => (
          <span
            key={i}
            className="mx-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60"
          >
            {fmt}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Category Card ──────────────────────────────────────────────── */
const CATEGORY_ICONS = {
  pdf:      FileText,
  image:    Image,
  audio:    Mic,
  video:    Video,
  document: BookOpen,
  utility:  Wrench,
}

function CategoryCard({ id, data }: { id: string; data: { label: string; description: string; count: number } }) {
  const Icon = CATEGORY_ICONS[id as keyof typeof CATEGORY_ICONS]
  return (
    <Link
      href={`/tools?category=${id}`}
      className="group relative flex flex-col gap-4 rounded-sm border border-border/60 bg-card p-6 card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/60 bg-background group-hover:border-foreground/20 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <span className="text-xs font-medium tabular-nums text-muted-foreground/60 bg-muted px-2 py-1 rounded-sm">
          {data.count} tools
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{data.label}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{data.description}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 group-hover:text-foreground/60 transition-colors">
        <span>View all</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

/* ─── Feature Block ──────────────────────────────────────────────── */
function FeatureBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-3 py-6 border-b border-border/60 last:border-0 md:border-b-0 md:border-r md:last:border-r-0 md:px-8 first:md:pl-0 last:md:pr-0">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

/* ─── Pricing Card ───────────────────────────────────────────────── */
function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  highlighted,
}: {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}) {
  return (
    <div
      className={`relative flex flex-col gap-6 rounded-sm border p-6 transition-all ${
        highlighted
          ? "border-foreground/30 bg-card"
          : "border-border/60 bg-card/60 hover:border-border"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-px left-6 right-6 h-px bg-foreground/40" />
      )}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
            {name}
          </p>
          {highlighted && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-sm border border-foreground/20 text-foreground/70">
              Popular
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-foreground">{price}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <ul className="flex flex-col gap-2 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-foreground/60" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/sign-up"
        className={`text-center text-sm font-medium py-2.5 rounded-sm border transition-colors ${
          highlighted
            ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
            : "border-border/60 text-foreground hover:bg-muted"
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function HomePage() {
  const categories = Object.entries(TOOL_CATEGORIES)

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "#FFF0DD" }}>
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-16 md:pt-8 md:pb-20 text-center">

          {/* Top label */}
          <div className="flex items-center justify-center gap-2 mb-8 animate-fade-up">
            <span className="flex h-1.5 w-1.5 rounded-full" style={{ background: "#E2A16F" }} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#86B0BD" }}>
              70+ File Tools · AI Transcription · $5/mo to launch
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up animate-fade-up-delay-1 font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8"
            style={{ color: "#2C2422" }}
          >
            Convert,{" "}Compress<br />
            <span className="italic" style={{ color: "#86B0BD" }}>&amp; Transcribe.</span>
          </h1>

          {/* Sub */}
          <p
            className="animate-fade-up animate-fade-up-delay-2 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: "#6B7F88" }}
          >
            The only platform combining 70+ professional file conversion tools
            with AI-powered voice transcription in 50+ languages.{" "}
            <span style={{ color: "#2C2422", fontWeight: 500 }}>No watermarks. No limits. Start free.</span>
          </p>

          {/* CTAs */}
          <div className="animate-fade-up animate-fade-up-delay-3 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm hover:opacity-90 transition-opacity"
              style={{ background: "#E2A16F", color: "#ffffff" }}
            >
              Start for free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-sm group transition-opacity hover:opacity-70"
              style={{ color: "#2C2422" }}
            >
              View all 70+ tools
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm group transition-opacity hover:opacity-70"
              style={{ color: "#2C2422" }}
            >
              See pricing
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="animate-fade-up animate-fade-up-delay-4 mt-14 flex flex-wrap items-center justify-center gap-10 pt-10"
            style={{ borderTop: "1px solid #D1D3D4" }}
          >
            {[
              { value: "70+",  label: "Total tools" },
              { value: "50+",  label: "Languages" },
              { value: "$9",   label: "Pro plan / mo" },
              { value: "2 GB", label: "Max file size" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-2xl font-bold font-serif" style={{ color: "#2C2422" }}>{stat.value}</span>
                <span className="text-xs mt-0.5" style={{ color: "#86B0BD" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────────────── */}
      <TickerStrip />

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
              What you can do
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Every tool you need,<br />
              <span className="text-foreground/50">in one place.</span>
            </h2>
          </div>
          <Link
            href="/tools"
            className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            All tools <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.slice(0, 3).map(([id, data]) => (
            <CategoryCard key={id} id={id} data={data} />
          ))}
          {/* AI Card */}
          <Link
            href="/tools?category=audio"
            className="group relative flex flex-col gap-4 rounded-sm border border-border/60 bg-card p-6 card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border/60 bg-background group-hover:border-foreground/20 transition-colors">
                <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-sm border border-foreground/20 text-foreground/60">
                NEW
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">AI Features</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Summaries, translation &amp; key-point extraction powered by GPT-4o.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 group-hover:text-foreground/60 transition-colors">
              <span>Explore AI</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="section-line bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Three steps.<br />
              <span className="text-foreground/50">That&apos;s all.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/60">
            {[
              { step: "01", title: "Upload your file",    desc: "Drag & drop or click to select. Up to 2 GB on Business plan." },
              { step: "02", title: "Choose conversion",   desc: "Select output format. Configure quality, language, or page range." },
              { step: "03", title: "Download the result", desc: "Ready instantly. Download or save to history for 30 days." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-background p-8 md:p-10">
                <p className="text-5xl font-bold text-foreground/10 mb-4 select-none">{step}</p>
                <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY FILEAI ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
            Why FileAI
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Not just another<br />
            <span className="text-foreground/50">PDF tool.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60 border border-border/60 rounded-sm">
          <FeatureBlock
            icon={Mic}
            title="AI Voice Transcription"
            description="Transcribe audio & video in 50+ languages with timestamps, speaker detection, and AI summaries. Unique in the market — ilovepdf has none of this."
          />
          <FeatureBlock
            icon={Shield}
            title="Better Free Tier"
            description="No watermarks on basic conversions. 5 free tasks per day, no credit card. Files deleted after 24 hours for your privacy."
          />
          <FeatureBlock
            icon={Zap}
            title="Dedicated Job Queue"
            description="Async processing via BullMQ means large files never time out. Priority queue keeps Pro and Business users fast."
          />
        </div>

        <div className="mt-8 rounded-sm border border-border/60 bg-card/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-5">
            vs ilovepdf.com — what we have that they don&apos;t
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Voice transcription (50+ languages)",
              "AI summarization & translation",
              "AI background removal",
              "HEIC / iPhone photo support",
              "Developer API with webhooks",
              "Team workspaces",
              "No watermarks on free tier",
              "Faster dedicated processing queue",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-foreground/60" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR TOOLS ────────────────────────────────────────── */}
      <section className="section-line bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                Popular tools
              </p>
              <h2 className="text-2xl font-bold text-foreground">Start converting now</h2>
            </div>
            <Link
              href="/tools"
              className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {MVP_TOOLS.slice(0, 12).map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col gap-1 rounded-sm border border-border/60 bg-card p-3.5 hover:border-foreground/20 hover:bg-muted/40 transition-all"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-0.5">
                  {tool.category}
                </span>
                <span className="text-sm font-medium text-foreground leading-tight">{tool.label}</span>
                {tool.outputFormat && (
                  <span className="text-xs text-muted-foreground/50">{tool.outputFormat}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            description="For casual users"
            features={[
              "5 conversions per day",
              "10 MB file size limit",
              "Basic PDF & image tools",
              "Files deleted after 24h",
              "Watermark on output",
            ]}
            cta="Get started free"
          />
          <PricingCard
            name="Pro"
            price="$9/mo"
            description="For individuals & freelancers"
            features={[
              "Unlimited conversions",
              "500 MB file size",
              "All PDF & image tools",
              "10 hours transcription / month",
              "30-day file history",
              "No watermarks",
            ]}
            cta="Start Pro"
            highlighted
          />
          <PricingCard
            name="Business"
            price="$29/mo"
            description="For teams & businesses"
            features={[
              "Everything in Pro",
              "2 GB file size",
              "50 hours transcription / month",
              "API access + webhooks",
              "Team workspace (5 seats)",
              "90-day file history",
            ]}
            cta="Start Business"
          />
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="section-line">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
            Ready?
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Start converting for free.
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            No credit card required. 5 free conversions per day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Create free account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Browse all tools
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
