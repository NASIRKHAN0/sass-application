"use client"

import { useState, useCallback } from "react"
import QRCode from "qrcode"
import { ArrowRight, Download, RefreshCw, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

const ERROR_LEVELS = [
  { value: "L", label: "L — Low (7%)" },
  { value: "M", label: "M — Medium (15%)" },
  { value: "Q", label: "Q — Quartile (25%)" },
  { value: "H", label: "H — High (30%)" },
] as const

const SIZES = [256, 512, 1024] as const

export function QRCodeTool() {
  const [text, setText] = useState("")
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [size, setSize] = useState<number>(512)
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M")
  const [generating, setGenerating] = useState(false)

  const generate = useCallback(async () => {
    if (!text.trim()) return
    setGenerating(true)
    try {
      const url = await QRCode.toDataURL(text.trim(), {
        width: size,
        margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: "#1A1714", light: "#FAF7F2" },
      })
      setDataUrl(url)
    } finally {
      setGenerating(false)
    }
  }, [text, size, errorLevel])

  function handleDownload() {
    if (!dataUrl) return
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `qr-code-${size}.png`
    a.click()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="rounded-sm border border-border/60 bg-card p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">URL or text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate() }}
            placeholder="https://example.com or any text…"
            rows={2}
            className="w-full rounded-sm border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-foreground mb-1.5">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full rounded-sm border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>{s} × {s}px</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-foreground mb-1.5">Error correction</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as typeof errorLevel)}
              className="w-full rounded-sm border border-border/60 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {ERROR_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={generate}
            disabled={!text.trim() || generating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <QrCode className="h-3.5 w-3.5" />}
            Generate QR
          </button>
        </div>
      </div>

      {/* Preview */}
      {dataUrl ? (
        <div className="rounded-sm border border-foreground/20 bg-card/60 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0 rounded-sm border border-border/60 bg-background p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">QR Code ready</p>
              <p className="text-xs text-muted-foreground mb-1 break-all">{text.length > 60 ? text.slice(0, 60) + "…" : text}</p>
              <p className="text-xs text-muted-foreground/50 mb-4">{size} × {size}px · Error correction {errorLevel}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDataUrl(null); setText("") }}
                  className="px-3 py-1.5 text-xs text-muted-foreground border border-border/60 rounded-sm hover:text-foreground transition-colors"
                >
                  New code
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Download PNG <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          "flex flex-col items-center justify-center gap-4 py-16 rounded-sm border-2 border-dashed border-border/60",
          text.trim() && "cursor-pointer hover:border-foreground/20 transition-colors"
        )}
          onClick={() => text.trim() && generate()}
        >
          <QrCode className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground/60">
            {text.trim() ? "Click Generate QR to preview" : "Enter a URL or text above"}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground/50 text-center">
        Free · No sign-up required · QR codes generated in your browser
      </p>
    </div>
  )
}
