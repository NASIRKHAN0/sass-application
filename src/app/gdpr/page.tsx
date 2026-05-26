import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "GDPR Compliance",
  description: "FileAI's commitment to GDPR — how we protect the rights of EU/EEA data subjects.",
}

const SECTIONS = [
  { id: "controller",   label: "Data Controller" },
  { id: "legal-basis",  label: "Legal Basis for Processing" },
  { id: "data",         label: "Data We Process" },
  { id: "rights",       label: "Your Rights Under GDPR" },
  { id: "retention",   label: "Data Retention" },
  { id: "transfers",    label: "International Transfers" },
  { id: "dpo",          label: "Data Protection Contact" },
  { id: "complaints",   label: "Supervisory Authority" },
]

export default function GdprPage() {
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

              {/* GDPR commitment badge */}
              <div className="mt-8 p-3 rounded-sm border border-border/60 bg-muted/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-foreground/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                    GDPR Compliant
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  FileAI is committed to full compliance with the EU General Data Protection Regulation.
                </p>
              </div>
            </div>
          </aside>

          <article className="flex-1 min-w-0">

            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
                Legal
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-3">GDPR Compliance</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: <span className="font-medium text-foreground">May 26, 2026</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                FileAI is committed to protecting the privacy rights of individuals in the
                European Union and European Economic Area in accordance with the General Data
                Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;). This page explains how we
                meet our obligations as a data controller and outlines your rights as a
                data subject.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                This page should be read alongside our full{" "}
                <Link href="/privacy" className="text-foreground hover:underline underline-offset-2">
                  Privacy Policy
                </Link>.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-border/60">

              <Section id="controller" title="1. Data Controller">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  FileAI acts as the <strong className="text-foreground/80">data controller</strong> for
                  personal data collected through the platform. This means we determine the
                  purposes and means of processing your personal data.
                </p>
                <div className="mt-4 p-4 rounded-sm border border-border/60 bg-muted/20 text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground/80">Organisation:</span> FileAI</p>
                  <p><span className="font-medium text-foreground/80">Contact:</span>{" "}
                    <a href="mailto:privacy@fileai.com" className="text-foreground hover:underline underline-offset-2">privacy@fileai.com</a>
                  </p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Third-party processors (Clerk, Stripe, OpenAI, Cloudflare) act as
                  <strong className="text-foreground/80"> data processors</strong> on our behalf,
                  operating under Data Processing Agreements (DPAs) that bind them to GDPR
                  obligations.
                </p>
              </Section>

              <Section id="legal-basis" title="2. Legal Basis for Processing">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  We process personal data under one or more of the following GDPR lawful bases:
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      basis: "Contract (Art. 6(1)(b))",
                      desc: "Processing your account details, uploaded files, and usage data is necessary to provide the service you signed up for."
                    },
                    {
                      basis: "Legitimate Interests (Art. 6(1)(f))",
                      desc: "Security monitoring, fraud prevention, product analytics (anonymised), and service improvement — balanced against your interests and rights."
                    },
                    {
                      basis: "Legal Obligation (Art. 6(1)(c))",
                      desc: "Retaining billing records for tax and regulatory compliance."
                    },
                    {
                      basis: "Consent (Art. 6(1)(a))",
                      desc: "Optional marketing communications. You can withdraw consent at any time."
                    },
                  ].map(({ basis, desc }) => (
                    <div key={basis} className="p-3.5 rounded-sm border border-border/60 bg-muted/10">
                      <p className="text-sm font-semibold text-foreground/80 mb-1">{basis}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="data" title="3. Data We Process">
                <table className="w-full text-sm border border-border/60 rounded-sm overflow-hidden">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Category</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Data</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-muted-foreground">
                    {[
                      ["Identity",  "Name, email address",                                   "Contract"],
                      ["Account",   "Clerk user ID, OAuth tokens, 2FA status",               "Contract"],
                      ["Files",     "Uploaded files (temp), converted output (temp)",         "Contract"],
                      ["Billing",   "Stripe customer ID, plan, payment history",             "Contract / Legal obligation"],
                      ["Usage",     "Tool usage counts, conversion history, job logs",        "Contract / Legitimate interests"],
                      ["Technical", "IP address, browser, OS, session cookies",              "Legitimate interests"],
                    ].map(([cat, data, basis]) => (
                      <tr key={cat}>
                        <td className="px-4 py-3 font-medium text-foreground/80 whitespace-nowrap align-top">{cat}</td>
                        <td className="px-4 py-3 align-top">{data}</td>
                        <td className="px-4 py-3 align-top text-xs">{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We do not process special category data (health, biometric, etc.) and do not
                  engage in automated decision-making that produces legal effects on individuals.
                </p>
              </Section>

              <Section id="rights" title="4. Your Rights Under GDPR">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  As an EU/EEA data subject you have the following rights under Articles 15–22
                  of the GDPR. To exercise any right, email{" "}
                  <a href="mailto:privacy@fileai.com" className="text-foreground hover:underline underline-offset-2">
                    privacy@fileai.com
                  </a>{" "}with &quot;GDPR Request&quot; in the subject line. We will respond within
                  <strong className="text-foreground/80"> 30 days</strong> (extendable to 90 days
                  for complex requests with notice).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      right: "Right of Access (Art. 15)",
                      desc: "Request a copy of the personal data we hold about you, including processing purposes and recipients."
                    },
                    {
                      right: "Right to Rectification (Art. 16)",
                      desc: "Request correction of inaccurate or incomplete personal data without undue delay."
                    },
                    {
                      right: "Right to Erasure (Art. 17)",
                      desc: "Request deletion of your personal data ('right to be forgotten') where no legitimate ground for retention exists."
                    },
                    {
                      right: "Right to Restriction (Art. 18)",
                      desc: "Request we restrict processing in certain circumstances, e.g. while a rectification request is being resolved."
                    },
                    {
                      right: "Right to Portability (Art. 20)",
                      desc: "Receive your personal data in a structured, machine-readable format (JSON/CSV) to transfer to another controller."
                    },
                    {
                      right: "Right to Object (Art. 21)",
                      desc: "Object to processing based on legitimate interests, including for direct marketing purposes."
                    },
                    {
                      right: "Withdraw Consent (Art. 7)",
                      desc: "Where processing is consent-based (e.g. marketing emails), withdraw consent at any time with immediate effect."
                    },
                    {
                      right: "No Automated Decisions (Art. 22)",
                      desc: "Not be subject to solely automated decisions producing legal or significant effects. We do not do this."
                    },
                  ].map(({ right, desc }) => (
                    <div key={right} className="p-3.5 rounded-sm border border-border/60 bg-muted/10">
                      <p className="text-sm font-semibold text-foreground/80 mb-1">{right}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="retention" title="5. Data Retention">
                <table className="w-full text-sm border border-border/60 rounded-sm overflow-hidden">
                  <thead>
                    <tr className="bg-muted/30 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Data type</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-foreground/70">Retention period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-muted-foreground">
                    {[
                      ["Uploaded files (Free)",          "24 hours after job completion"],
                      ["Uploaded files (Pro)",           "30 days after job completion"],
                      ["Uploaded files (Business)",      "90 days after job completion"],
                      ["Account & profile data",         "Duration of account + 30 days post-deletion"],
                      ["Billing records",                "7 years (legal / tax obligation)"],
                      ["Usage logs (identifiable)",      "90 days, then anonymised"],
                      ["Usage logs (anonymised)",        "Indefinitely for aggregate analytics"],
                      ["Support communications",         "3 years from last interaction"],
                    ].map(([type, period]) => (
                      <tr key={type}>
                        <td className="px-4 py-3 font-medium text-foreground/80 align-top">{type}</td>
                        <td className="px-4 py-3 align-top">{period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>

              <Section id="transfers" title="6. International Data Transfers">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Some of our sub-processors (including Clerk and Stripe) are based in the
                  United States. Transfers of personal data to the US are protected by:
                </p>
                <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>
                    <strong className="text-foreground/80">Standard Contractual Clauses (SCCs)</strong> — EU Commission-approved
                    transfer mechanisms incorporated into our DPAs with each processor.
                  </li>
                  <li>
                    <strong className="text-foreground/80">EU–US Data Privacy Framework</strong> — where processors are certified
                    under this framework.
                  </li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We only transfer data where adequate protections are in place and do not
                  transfer data to countries without an adequacy decision or appropriate safeguards.
                </p>
              </Section>

              <Section id="dpo" title="7. Data Protection Contact">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  While we are not currently required to appoint a formal Data Protection Officer
                  (DPO) under Article 37 GDPR, we have designated a point of contact for all
                  data protection matters:
                </p>
                <div className="mt-4 p-4 rounded-sm border border-border/60 bg-muted/20 text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground/80">Data Protection Enquiries:</span>{" "}
                    <a href="mailto:privacy@fileai.com" className="text-foreground hover:underline underline-offset-2">privacy@fileai.com</a>
                  </p>
                  <p><span className="font-medium text-foreground/80">Subject line:</span> &quot;GDPR Request — [your name]&quot;</p>
                  <p><span className="font-medium text-foreground/80">Response time:</span> Within 30 days</p>
                </div>
              </Section>

              <Section id="complaints" title="8. Supervisory Authority">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you believe we have not handled your personal data in accordance with the GDPR,
                  you have the right to lodge a complaint with your local supervisory authority
                  (Data Protection Authority). In the EU/EEA, you can find your authority at{" "}
                  <a
                    href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline underline-offset-2"
                  >
                    edpb.europa.eu
                  </a>.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We encourage you to contact us first at{" "}
                  <a href="mailto:privacy@fileai.com" className="text-foreground hover:underline underline-offset-2">
                    privacy@fileai.com
                  </a>{" "}so we can try to resolve your concern directly before escalation.
                </p>
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
