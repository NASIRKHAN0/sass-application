import Link from "next/link"
import { Check, X, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For casual users who need occasional conversions",
    cta: "Get started free",
    ctaHref: "/sign-up",
    highlighted: false,
    features: [
      { text: "5 conversions per day",         included: true },
      { text: "10 MB max file size",            included: true },
      { text: "Basic PDF tools",                included: true },
      { text: "Basic image conversion",         included: true },
      { text: "File history",                   included: false },
      { text: "Voice transcription",            included: false },
      { text: "No watermarks",                  included: false },
      { text: "Priority queue",                 included: false },
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    yearlyPrice: "$90/year",
    description: "For individuals and freelancers who work with files daily",
    cta: "Start Pro",
    ctaHref: "/sign-up?plan=pro",
    highlighted: true,
    features: [
      { text: "Unlimited conversions",          included: true },
      { text: "500 MB max file size",           included: true },
      { text: "All PDF & image tools",          included: true },
      { text: "10 hours transcription / month", included: true },
      { text: "30-day file history",            included: true },
      { text: "No watermarks",                  included: true },
      { text: "Priority queue",                 included: false },
      { text: "API access",                     included: false },
    ],
  },
  {
    name: "Business",
    price: "$29",
    period: "per month",
    yearlyPrice: "$290/year",
    description: "For teams and businesses processing high volumes",
    cta: "Start Business",
    ctaHref: "/sign-up?plan=business",
    highlighted: false,
    features: [
      { text: "Unlimited conversions",          included: true },
      { text: "2 GB max file size",             included: true },
      { text: "All PDF & image tools",          included: true },
      { text: "50 hours transcription / month", included: true },
      { text: "90-day file history",            included: true },
      { text: "No watermarks",                  included: true },
      { text: "Priority processing queue",      included: true },
      { text: "API access + webhooks",          included: true },
    ],
  },
]

const COMPARISON_FEATURES = [
  { feature: "Conversions per day",     free: "5",         pro: "Unlimited",  business: "Unlimited" },
  { feature: "Max file size",           free: "10 MB",     pro: "500 MB",     business: "2 GB" },
  { feature: "File history",            free: "None",      pro: "30 days",    business: "90 days" },
  { feature: "PDF tools",               free: "Basic",     pro: "All 30+",    business: "All 30+" },
  { feature: "Image tools",             free: "Basic",     pro: "All 15+",    business: "All 15+" },
  { feature: "Voice transcription",     free: "—",         pro: "10 hrs/mo",  business: "50 hrs/mo" },
  { feature: "AI Summaries",            free: "—",         pro: "✓",          business: "✓" },
  { feature: "AI Translation",          free: "—",         pro: "✓",          business: "✓" },
  { feature: "Remove Background (AI)",  free: "—",         pro: "✓",          business: "✓" },
  { feature: "Watermark on output",     free: "Yes",       pro: "No",         business: "No" },
  { feature: "Priority queue",          free: "—",         pro: "—",          business: "✓" },
  { feature: "REST API access",         free: "—",         pro: "—",          business: "✓" },
  { feature: "Webhook notifications",   free: "—",         pro: "—",          business: "✓" },
  { feature: "Team workspace",          free: "—",         pro: "—",          business: "5 seats" },
  { feature: "Billing portal",          free: "—",         pro: "✓",          business: "✓" },
]

const ADDONS = [
  { name: "Yearly Pro",          price: "$90/year",    description: "2 months free vs monthly" },
  { name: "Yearly Business",     price: "$290/year",   description: "2 months free vs monthly" },
  { name: "Credit Pack — Small", price: "$5 once",     description: "100 credits, no subscription" },
  { name: "Credit Pack — Large", price: "$15 once",    description: "400 credits (bonus 100)" },
  { name: "Extra API Calls",     price: "+$10/month",  description: "10k additional API calls" },
  { name: "Extra Team Seats",    price: "$5/seat/mo",  description: "Add users to Business workspace" },
]

const FAQS = [
  {
    q: "Can I convert files without signing up?",
    a: "Yes. You get 1 free conversion without an account. Sign up free to get 5 per day.",
  },
  {
    q: "What happens when I exceed my daily limit?",
    a: "On Free, conversions are blocked until the next day. Upgrade to Pro for unlimited.",
  },
  {
    q: "Are files stored securely?",
    a: "Files are stored encrypted on Cloudflare R2 and automatically deleted after 24 hours (Free) or 30/90 days (Pro/Business).",
  },
  {
    q: "How accurate is the voice transcription?",
    a: "We use OpenAI Whisper — one of the most accurate transcription models available, supporting 50+ languages.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing dashboard at any time. You keep access until the end of the billing period.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "The Free plan lets you test the platform. We plan to add a 7-day Pro trial — sign up to be notified.",
  },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />

      <main className="flex-1">

        {/* ── Header ── */}
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
            Pricing
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground mb-4">
            Simple,{" "}
            <span className="italic text-foreground/50">transparent</span>
            {" "}pricing.
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start free. No credit card required. Upgrade when you need more power.
          </p>
        </section>

        {/* ── Plans ── */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col gap-6 rounded-sm border p-6 transition-all ${
                  plan.highlighted
                    ? "border-foreground/30 bg-card"
                    : "border-border/60 bg-card/50"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-px left-8 right-8 h-px bg-foreground/40" />
                )}

                {/* Plan header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                      {plan.name}
                    </p>
                    {plan.highlighted && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 border border-foreground/20 rounded-sm text-foreground/70">
                        Most popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-1 mb-0.5">
                    <span className="font-serif text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground mb-1.5">/{plan.period}</span>
                  </div>
                  {plan.yearlyPrice && (
                    <p className="text-xs text-muted-foreground/60">or {plan.yearlyPrice} (save 2 months)</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2">
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-foreground/60" />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
                      )}
                      <span className={`text-sm ${f.included ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`text-center text-sm font-medium py-2.5 rounded-sm border transition-colors ${
                    plan.highlighted
                      ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                      : "border-border/60 text-foreground hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Add-ons ── */}
        <section className="section-line bg-card/30">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                Add-ons
              </p>
              <h2 className="font-serif text-2xl text-foreground">
                Pay for what you need,{" "}
                <span className="italic text-foreground/50">when you need it.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ADDONS.map((addon) => (
                <div
                  key={addon.name}
                  className="flex flex-col gap-1.5 p-4 rounded-sm border border-border/60 bg-card/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{addon.name}</span>
                    <span className="text-sm font-semibold text-foreground font-serif">{addon.price}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{addon.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Full Comparison Table ── */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
              Compare plans
            </p>
            <h2 className="font-serif text-2xl text-foreground">Full comparison</h2>
          </div>

          <div className="rounded-sm border border-border/60 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-card">
              <div className="p-4 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Feature</div>
              {["Free", "Pro", "Business"].map((p) => (
                <div key={p} className="p-4 text-xs font-semibold text-center text-foreground uppercase tracking-wider">
                  {p}
                </div>
              ))}
            </div>

            {COMPARISON_FEATURES.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 border-t border-border/60 ${i % 2 === 0 ? "bg-transparent" : "bg-card/30"}`}
              >
                <div className="p-3.5 text-sm text-muted-foreground">{row.feature}</div>
                {[row.free, row.pro, row.business].map((val, j) => (
                  <div key={j} className="p-3.5 text-sm text-center text-foreground/70">
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section-line bg-card/30">
          <div className="max-w-3xl mx-auto px-6 py-16">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                FAQ
              </p>
              <h2 className="font-serif text-2xl text-foreground">
                Common questions
              </h2>
            </div>
            <div className="flex flex-col divide-y divide-border/60">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="py-5">
                  <p className="text-sm font-semibold text-foreground mb-2">{q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
            Ready to start?
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            No credit card required. 5 free conversions per day.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Get started free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
