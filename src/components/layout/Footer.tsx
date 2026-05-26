import Link from "next/link"
import { Zap } from "lucide-react"

const FOOTER_LINKS = {
  Product: [
    { href: "/tools",   label: "All Tools" },
    { href: "/pricing", label: "Pricing" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  "PDF Tools": [
    { href: "/tools/pdf-to-word",   label: "PDF to Word" },
    { href: "/tools/compress-pdf",  label: "Compress PDF" },
    { href: "/tools/merge-pdf",     label: "Merge PDF" },
    { href: "/tools/ocr-pdf",       label: "OCR PDF" },
  ],
  "Image & Audio": [
    { href: "/tools/remove-background", label: "Remove Background" },
    { href: "/tools/transcribe-mp3",    label: "Transcribe MP3" },
    { href: "/tools/compress-image",    label: "Compress Image" },
    { href: "/tools/ai-summarize",      label: "AI Summarize" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms",   label: "Terms of Service" },
    { href: "/gdpr",    label: "GDPR" },
  ],
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-border/80 bg-card">
                <Zap className="h-3.5 w-3.5 text-foreground" />
              </div>
              <span className="text-sm font-semibold tracking-tight">FileAI</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              70+ file tools with AI-powered voice transcription. One platform.
            </p>
            <p className="mt-4 text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} FileAI
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
