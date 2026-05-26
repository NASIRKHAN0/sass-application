import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FileAI collects, uses, and protects your personal data.",
}

const SECTIONS = [
  { id: "information",  label: "Information We Collect" },
  { id: "use",          label: "How We Use Your Information" },
  { id: "files",        label: "File Storage & Processing" },
  { id: "retention",   label: "Data Retention" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "rights",      label: "Your Rights" },
  { id: "cookies",     label: "Cookies" },
  { id: "security",    label: "Security" },
  { id: "changes",     label: "Changes to This Policy" },
  { id: "contact",     label: "Contact Us" },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>

        <div className="flex gap-12">

          {/* Sidebar TOC — desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-20">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
                Contents
              </p>
              <nav className="flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="flex-1 min-w-0">

            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                Legal
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: <span className="font-medium text-foreground">May 26, 2026</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                This Privacy Policy explains how FileAI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and safeguards
                your information when you use our file conversion and transcription platform at fileai.com.
                By using our services you agree to the collection and use of information described here.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-border/60">

              <Section id="information" title="1. Information We Collect">
                <Subsection title="Account Information">
                  When you create an account we collect your name, email address, and authentication
                  credentials managed by Clerk. If you sign in via Google or another OAuth provider,
                  we receive only the profile information that provider exposes.
                </Subsection>
                <Subsection title="Usage Data">
                  We log the tools you use, file types processed, conversion counts, timestamps,
                  and aggregate performance metrics. This data is tied to your account for billing
                  and limit enforcement.
                </Subsection>
                <Subsection title="Payment Information">
                  Payments are processed by Stripe. We never store full card numbers or banking
                  details on our servers. We retain only a Stripe customer ID, subscription status,
                  and billing email.
                </Subsection>
                <Subsection title="Technical Data">
                  IP addresses, browser type, operating system, and referring URLs are collected
                  automatically. We use this data for security, fraud prevention, and analytics.
                </Subsection>
              </Section>

              <Section id="use" title="2. How We Use Your Information">
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>Provide, operate, and improve our file conversion and transcription services</li>
                  <li>Authenticate your identity and manage your account</li>
                  <li>Enforce usage limits and process billing through Stripe</li>
                  <li>Send transactional emails (receipts, plan updates, security alerts)</li>
                  <li>Detect and prevent abuse, fraud, or violations of our Terms of Service</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We do not sell your personal information to third parties. We do not use your
                  uploaded files for training AI models or any purpose beyond performing the
                  conversion you requested.
                </p>
              </Section>

              <Section id="files" title="3. File Storage & Processing">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Files you upload are stored temporarily on our infrastructure solely to perform
                  the requested conversion or transcription. Storage location depends on your plan:
                </p>
                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li><strong className="text-foreground/80">Free plan:</strong> Input and output files are deleted within 24 hours of job completion.</li>
                  <li><strong className="text-foreground/80">Pro plan:</strong> Files are retained for up to 30 days to allow re-download from history.</li>
                  <li><strong className="text-foreground/80">Business plan:</strong> Files are retained for up to 90 days.</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  You may manually delete any job and its associated files at any time from your
                  Dashboard or History page. We use encrypted storage and transmit files over TLS.
                  We do not access or read the contents of your files except as necessary to
                  perform the conversion.
                </p>
              </Section>

              <Section id="retention" title="4. Data Retention">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Account data (name, email, billing status) is retained for as long as your
                  account is active. Upon account deletion we remove your personal data within
                  30 days, except where retention is required by law (e.g. billing records for
                  tax compliance, which are kept for 7 years).
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Usage logs are anonymised after 90 days and retained in aggregate form for
                  product analytics.
                </p>
              </Section>

              <Section id="third-party" title="5. Third-Party Services">
                <table className="w-full text-sm mt-2 border border-border/60 rounded-sm overflow-hidden">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Service</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[
                      ["Clerk",        "Authentication & user management"],
                      ["Stripe",       "Payment processing & billing"],
                      ["OpenAI",       "AI transcription (Whisper) & summarization"],
                      ["Cloudflare R2","File storage (production)"],
                      ["Vercel",       "Hosting & edge compute"],
                    ].map(([service, purpose]) => (
                      <tr key={service} className="text-muted-foreground">
                        <td className="px-4 py-2.5 font-medium text-foreground/80 whitespace-nowrap">{service}</td>
                        <td className="px-4 py-2.5">{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Each provider is bound by their own privacy policy and data processing agreements.
                  We only share the minimum data necessary for each service to function.
                </p>
              </Section>

              <Section id="rights" title="6. Your Rights">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Depending on your jurisdiction you may have the right to:
                </p>
                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li><strong className="text-foreground/80">Access</strong> — request a copy of the personal data we hold about you</li>
                  <li><strong className="text-foreground/80">Rectification</strong> — correct inaccurate personal data</li>
                  <li><strong className="text-foreground/80">Erasure</strong> — request deletion of your account and associated data</li>
                  <li><strong className="text-foreground/80">Portability</strong> — receive your data in a machine-readable format</li>
                  <li><strong className="text-foreground/80">Restriction</strong> — limit how we process your data in certain circumstances</li>
                  <li><strong className="text-foreground/80">Objection</strong> — object to processing based on legitimate interests</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  To exercise any of these rights, email us at{" "}
                  <a href="mailto:privacy@fileai.com" className="text-foreground hover:underline underline-offset-2">
                    privacy@fileai.com
                  </a>. We will respond within 30 days.
                </p>
              </Section>

              <Section id="cookies" title="7. Cookies">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use strictly necessary cookies for authentication (session tokens managed by Clerk)
                  and preference storage (e.g. theme). We do not use advertising cookies or
                  cross-site tracking cookies. No cookie consent banner is required as we only
                  use cookies essential to service operation.
                </p>
              </Section>

              <Section id="security" title="8. Security">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including TLS encryption in
                  transit, encrypted storage at rest, access controls, and regular security reviews.
                  However, no method of transmission over the internet is 100% secure. We encourage
                  you to use a strong, unique password and enable two-factor authentication on
                  your account.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  In the event of a data breach that affects your personal data we will notify
                  you within 72 hours as required by applicable law.
                </p>
              </Section>

              <Section id="changes" title="9. Changes to This Policy">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. Material changes will be
                  communicated via email or a prominent notice on our platform at least 14 days
                  before taking effect. Continued use of the service after that date constitutes
                  acceptance of the updated policy.
                </p>
              </Section>

              <Section id="contact" title="10. Contact Us">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you have questions or concerns about this Privacy Policy or how we handle
                  your data, please contact us:
                </p>
                <div className="mt-4 p-4 rounded-sm border border-border/60 bg-muted/20 text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground/80">Email:</span>{" "}
                    <a href="mailto:privacy@fileai.com" className="text-foreground hover:underline underline-offset-2">privacy@fileai.com</a>
                  </p>
                  <p><span className="font-medium text-foreground/80">Support:</span>{" "}
                    <a href="mailto:support@fileai.com" className="text-foreground hover:underline underline-offset-2">support@fileai.com</a>
                  </p>
                </div>
              </Section>

            </div>
          </article>
        </div>
      </main>

      <Footer />
    </>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-8 scroll-mt-20">
      <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}
