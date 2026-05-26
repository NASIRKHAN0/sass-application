import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of FileAI.",
}

const SECTIONS = [
  { id: "acceptance",   label: "Acceptance of Terms" },
  { id: "service",      label: "Description of Service" },
  { id: "accounts",     label: "User Accounts" },
  { id: "use",          label: "Acceptable Use" },
  { id: "files",        label: "Your Files & Content" },
  { id: "billing",      label: "Subscription & Billing" },
  { id: "ip",           label: "Intellectual Property" },
  { id: "disclaimer",   label: "Disclaimers" },
  { id: "liability",    label: "Limitation of Liability" },
  { id: "termination",  label: "Termination" },
  { id: "governing",    label: "Governing Law" },
  { id: "changes",      label: "Changes to Terms" },
  { id: "contact",      label: "Contact" },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3 w-3" /> Home
        </Link>

        <div className="flex gap-12">

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

          <article className="flex-1 min-w-0">

            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                Legal
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: <span className="font-medium text-foreground">May 26, 2026</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) govern your access to and use of FileAI
                (&quot;Service&quot;), operated by FileAI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Please read them
                carefully before using the Service.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-border/60">

              <Section id="acceptance" title="1. Acceptance of Terms">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By accessing or using FileAI you confirm that you are at least 16 years old,
                  have the legal capacity to enter into a binding agreement, and agree to be
                  bound by these Terms. If you are using the Service on behalf of an organisation,
                  you represent that you have authority to bind that organisation to these Terms.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  If you do not agree to these Terms, do not use the Service.
                </p>
              </Section>

              <Section id="service" title="2. Description of Service">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  FileAI provides browser-based file conversion, compression, and AI-powered
                  transcription tools. The Service is provided on an &quot;as-is&quot; basis. We reserve
                  the right to modify, suspend, or discontinue any part of the Service at any
                  time with reasonable notice.
                </p>
              </Section>

              <Section id="accounts" title="3. User Accounts">
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You are responsible for all activity that occurs under your account.</li>
                  <li>You must notify us immediately at{" "}
                    <a href="mailto:support@fileai.com" className="text-foreground hover:underline underline-offset-2">
                      support@fileai.com
                    </a>{" "}if you suspect unauthorised access.
                  </li>
                  <li>You may not share your account with others or create multiple accounts to circumvent usage limits.</li>
                  <li>Accounts are non-transferable.</li>
                </ul>
              </Section>

              <Section id="use" title="4. Acceptable Use">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>Upload or process files containing illegal content, malware, or material that infringes third-party rights</li>
                  <li>Attempt to reverse engineer, scrape, or extract data from the platform beyond normal use</li>
                  <li>Use automated scripts or bots to submit conversion jobs without prior written consent</li>
                  <li>Circumvent rate limits, quotas, or payment requirements</li>
                  <li>Engage in any activity that disrupts, damages, or imposes an unreasonable load on the Service</li>
                  <li>Use the Service in a manner that violates any applicable law or regulation</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these rules
                  without prior notice.
                </p>
              </Section>

              <Section id="files" title="5. Your Files & Content">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You retain full ownership of all files you upload. By uploading a file, you grant
                  FileAI a limited, non-exclusive licence to process that file solely for the purpose
                  of performing the requested conversion or transcription.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  You are solely responsible for ensuring you have the right to upload and process
                  any file. We do not review file contents except as technically necessary to
                  perform the conversion.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Files are automatically deleted according to your plan&apos;s retention policy
                  (24 hours on Free, 30 days on Pro, 90 days on Business). See our{" "}
                  <Link href="/privacy" className="text-foreground hover:underline underline-offset-2">
                    Privacy Policy
                  </Link>{" "}for details.
                </p>
              </Section>

              <Section id="billing" title="6. Subscription & Billing">
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>Paid plans are billed in advance on a monthly or annual cycle via Stripe.</li>
                  <li>All prices are in USD and exclude applicable taxes unless stated otherwise.</li>
                  <li>You may cancel your subscription at any time; access continues until the end of the current billing period. No prorated refunds are issued.</li>
                  <li>We reserve the right to change pricing with at least 30 days&apos; notice. Continued use after the effective date constitutes acceptance of the new pricing.</li>
                  <li>Failed payments will trigger retry attempts. Persistent failures may result in plan downgrade to Free.</li>
                  <li>One-time credit packs are non-refundable once credits have been used.</li>
                </ul>
              </Section>

              <Section id="ip" title="7. Intellectual Property">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All rights, title, and interest in the Service — including the platform,
                  software, design, trademarks, and content created by us — are owned by FileAI
                  or our licensors. Nothing in these Terms transfers any IP rights to you beyond
                  the limited right to use the Service as described herein.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Converted output files produced from your input are yours. We make no claim
                  to output files generated by the Service.
                </p>
              </Section>

              <Section id="disclaimer" title="8. Disclaimers">
                <p className="text-sm text-muted-foreground leading-relaxed uppercase text-xs tracking-wide font-medium">
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                  express or implied, including but not limited to warranties of merchantability,
                  fitness for a particular purpose, or non-infringement. We do not warrant that
                  the Service will be uninterrupted, error-free, or that conversion results will
                  be perfectly accurate.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  AI transcription accuracy depends on audio quality and language complexity.
                  Always verify AI-generated content before relying on it for critical purposes.
                </p>
              </Section>

              <Section id="liability" title="9. Limitation of Liability">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by applicable law, FileAI and its directors,
                  employees, and licensors shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including loss of data, profits,
                  or goodwill, arising from your use of or inability to use the Service.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Our total aggregate liability to you for any claim arising out of or relating
                  to these Terms or the Service shall not exceed the greater of (a) USD $100 or
                  (b) the total fees paid by you to FileAI in the 3 months preceding the event
                  giving rise to the claim.
                </p>
              </Section>

              <Section id="termination" title="10. Termination">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You may close your account at any time from your account settings. We may
                  suspend or terminate your account immediately if you breach these Terms, engage
                  in fraudulent activity, or if we are required to do so by law.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Upon termination, your right to use the Service ceases immediately. We will
                  delete your files and personal data in accordance with our Privacy Policy.
                  Sections 7, 8, 9, and 11 survive termination.
                </p>
              </Section>

              <Section id="governing" title="11. Governing Law">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws
                  of the jurisdiction in which FileAI is registered, without regard to its
                  conflict of law provisions. Any disputes shall first be attempted to be
                  resolved through good-faith negotiation before resorting to formal proceedings.
                </p>
              </Section>

              <Section id="changes" title="12. Changes to Terms">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may revise these Terms at any time. Material changes will be communicated
                  via email or in-app notice at least 14 days before taking effect. Your
                  continued use of the Service after the effective date constitutes acceptance
                  of the revised Terms.
                </p>
              </Section>

              <Section id="contact" title="13. Contact">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For questions about these Terms, please contact:
                </p>
                <div className="mt-4 p-4 rounded-sm border border-border/60 bg-muted/20 text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground/80">Email:</span>{" "}
                    <a href="mailto:legal@fileai.com" className="text-foreground hover:underline underline-offset-2">legal@fileai.com</a>
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
