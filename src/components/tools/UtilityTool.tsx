"use client"
import { useState, useRef, useCallback } from "react"
import { Copy, RefreshCw, Upload, Download } from "lucide-react"
import { toast } from "sonner"

export type UtilitySlug =
  | "base64-encode"
  | "json-formatter"
  | "url-encoder"
  | "hash-generator"
  | "color-converter"
  | "uuid-generator"
  | "text-case-converter"
  | "image-to-base64"
  | "csv-to-json"

interface Props {
  slug: UtilitySlug
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

async function sha(text: string, algo: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function toCase(text: string, mode: string): string {
  const words = text.trim().replace(/[_\-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").split(/\s+/)
  switch (mode) {
    case "camelCase":    return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")
    case "PascalCase":   return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")
    case "snake_case":   return words.map((w) => w.toLowerCase()).join("_")
    case "UPPER_SNAKE":  return words.map((w) => w.toUpperCase()).join("_")
    case "kebab-case":   return words.map((w) => w.toLowerCase()).join("-")
    case "Title Case":   return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
    case "UPPERCASE":    return text.toUpperCase()
    case "lowercase":    return text.toLowerCase()
    default:             return text
  }
}

function csvToJson(csvText: string): string {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return "[]"
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))
  })
  return JSON.stringify(rows, null, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied!") }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
    >
      <Copy className="h-3 w-3" /> Copy
    </button>
  )
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</span>
      {children}
    </div>
  )
}

const TEXTAREA = "w-full h-48 px-3.5 py-3 text-sm font-mono bg-card border border-border/60 rounded-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-foreground/30 transition-colors"

// ─── Tool renderers ───────────────────────────────────────────────────────────

function Base64Tool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  const run = () => {
    try {
      setOutput(mode === "encode" ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input))))
    } catch {
      toast.error(mode === "decode" ? "Invalid Base64 input" : "Encoding failed")
    }
  }

  return (
    <TwoPanel
      inputLabel="Input text" outputLabel="Output"
      input={input} output={output}
      onInputChange={setInput}
      modeBar={
        <ModeToggle modes={["encode", "decode"]} active={mode} onChange={(m) => setMode(m as "encode" | "decode")} />
      }
      onRun={run} runLabel={mode === "encode" ? "Encode →" : "Decode →"}
    />
  )
}

function JsonFormatterTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"format" | "minify" | "validate">("format")

  const run = () => {
    try {
      const parsed = JSON.parse(input)
      if (mode === "minify") setOutput(JSON.stringify(parsed))
      else setOutput(JSON.stringify(parsed, null, 2))
      if (mode === "validate") toast.success("Valid JSON ✓")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON"
      toast.error(msg)
      setOutput(`Error: ${msg}`)
    }
  }

  return (
    <TwoPanel
      inputLabel="JSON input" outputLabel="Result"
      input={input} output={output}
      onInputChange={setInput}
      modeBar={<ModeToggle modes={["format", "minify", "validate"]} active={mode} onChange={(m) => setMode(m as "format" | "minify" | "validate")} />}
      onRun={run} runLabel={mode === "validate" ? "Validate" : mode === "minify" ? "Minify →" : "Format →"}
    />
  )
}

function UrlEncoderTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  const run = () => {
    try {
      setOutput(mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input))
    } catch {
      toast.error("Invalid input for decoding")
    }
  }

  return (
    <TwoPanel
      inputLabel="Input" outputLabel="Output"
      input={input} output={output}
      onInputChange={setInput}
      modeBar={<ModeToggle modes={["encode", "decode"]} active={mode} onChange={(m) => setMode(m as "encode" | "decode")} />}
      onRun={run} runLabel={mode === "encode" ? "Encode →" : "Decode →"}
    />
  )
}

function HashGeneratorTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [algo, setAlgo] = useState("SHA-256")

  const run = async () => {
    if (!input.trim()) { toast.error("Enter text to hash"); return }
    const hash = await sha(input, algo)
    setOutput(hash)
  }

  return (
    <TwoPanel
      inputLabel="Input text" outputLabel={`${algo} hash`}
      input={input} output={output}
      onInputChange={setInput}
      modeBar={<ModeToggle modes={["SHA-1", "SHA-256", "SHA-384", "SHA-512"]} active={algo} onChange={setAlgo} />}
      onRun={run} runLabel="Generate hash"
    />
  )
}

function ColorConverterTool() {
  const [hex, setHex] = useState("#BE5B50")
  const rgb = hexToRgb(hex)
  const hsl = rgb ? rgbToHsl(...rgb) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Color picker</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-12 w-16 rounded-sm border border-border/60 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="px-3 py-2 text-sm font-mono bg-card border border-border/60 rounded-sm text-foreground w-28 focus:outline-none focus:border-foreground/30"
            />
          </div>
        </div>
        <div className="h-16 w-16 rounded-sm border border-border/60 shrink-0" style={{ background: hex }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "HEX", value: hex.toUpperCase() },
          { label: "RGB", value: rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : "—" },
          { label: "HSL", value: hsl ? `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="p-3.5 rounded-sm border border-border/60 bg-card flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{label}</span>
            <span className="text-sm font-mono text-foreground">{value}</span>
            <CopyButton text={value} />
          </div>
        ))}
      </div>
    </div>
  )
}

function UuidGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(5)

  const generate = () => {
    const generated = Array.from({ length: count }, () => crypto.randomUUID())
    setUuids(generated)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Count</span>
          <input
            type="number" min={1} max={50}
            value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
            className="w-24 px-3 py-2 text-sm font-mono bg-card border border-border/60 rounded-sm text-foreground focus:outline-none focus:border-foreground/30"
          />
        </div>
        <button
          onClick={generate}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Generate
        </button>
        {uuids.length > 0 && (
          <button
            onClick={() => { navigator.clipboard.writeText(uuids.join("\n")); toast.success("All UUIDs copied!") }}
            className="mt-5 inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-sm border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3 w-3" /> Copy all
          </button>
        )}
      </div>

      {uuids.length > 0 && (
        <div className="flex flex-col divide-y divide-border/60 border border-border/60 rounded-sm bg-card overflow-hidden">
          {uuids.map((u) => (
            <div key={u} className="flex items-center justify-between px-4 py-2.5 group hover:bg-muted/20 transition-colors">
              <span className="text-sm font-mono text-foreground">{u}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(u); toast.success("Copied!") }}
                className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all px-2 py-1 rounded-sm border border-border/60"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TextCaseTool() {
  const [input, setInput] = useState("")
  const [active, setActive] = useState("camelCase")
  const output = input ? toCase(input, active) : ""
  const cases = ["camelCase", "PascalCase", "snake_case", "UPPER_SNAKE", "kebab-case", "Title Case", "UPPERCASE", "lowercase"]

  return (
    <div className="flex flex-col gap-4">
      <Panel label="Input text">
        <textarea
          className={TEXTAREA}
          placeholder="Enter your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Panel>

      <div className="flex flex-wrap gap-1.5">
        {cases.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-3 py-1.5 text-xs rounded-sm border transition-colors font-mono ${
              active === c
                ? "bg-foreground text-background border-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {output && (
        <Panel label={`Result — ${active}`}>
          <div className="relative">
            <textarea readOnly className={TEXTAREA} value={output} />
            <div className="absolute top-2 right-2">
              <CopyButton text={output} />
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}

function ImageToBase64Tool() {
  const [output, setOutput] = useState("")
  const [preview, setPreview] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPreview(result)
      setOutput(result)
    }
    reader.readAsDataURL(file)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 p-10 rounded-sm border-2 border-dashed border-border/60 hover:border-foreground/30 transition-colors cursor-pointer"
      >
        <Upload className="h-6 w-6 text-muted-foreground/50" />
        <span className="text-sm text-muted-foreground">Click to select an image</span>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </button>

      {preview && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-32 rounded-sm border border-border/60 object-contain" />
          </div>
          <Panel label="Base64 data URL">
            <div className="relative">
              <textarea readOnly className={`${TEXTAREA} h-32 break-all`} value={output} />
              <div className="absolute top-2 right-2">
                <CopyButton text={output} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}

function CsvToJsonTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const convert = () => {
    if (!input.trim()) { toast.error("Paste CSV or upload a file"); return }
    try {
      setOutput(csvToJson(input))
    } catch {
      toast.error("Could not parse CSV")
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInput(ev.target?.result as string)
    reader.readAsText(file)
  }

  const downloadJson = () => {
    const blob = new Blob([output], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "output.json"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border border-border/60 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Upload className="h-3 w-3" /> Upload CSV file
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        <span className="text-xs text-muted-foreground/40">or paste below</span>
      </div>

      <TwoPanel
        inputLabel="CSV input" outputLabel="JSON output"
        input={input} output={output}
        onInputChange={setInput}
        onRun={convert} runLabel="Convert →"
        extraAction={output ? (
          <button onClick={downloadJson} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-sm border border-border/60 text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3 w-3" /> Download
          </button>
        ) : undefined}
      />
    </div>
  )
}

// ─── Shared layout helpers ────────────────────────────────────────────────────

function ModeToggle({ modes, active, onChange }: { modes: string[]; active: string; onChange: (m: string) => void }) {
  return (
    <div className="flex gap-1">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
            active === m
              ? "bg-foreground text-background border-foreground"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/30"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

function TwoPanel({
  inputLabel, outputLabel, input, output,
  onInputChange, modeBar, onRun, runLabel, extraAction,
}: {
  inputLabel: string; outputLabel: string
  input: string; output: string
  onInputChange: (v: string) => void
  modeBar?: React.ReactNode
  onRun: () => void; runLabel: string
  extraAction?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      {modeBar && <div>{modeBar}</div>}
      <div className="flex flex-col lg:flex-row gap-4">
        <Panel label={inputLabel}>
          <textarea
            className={TEXTAREA}
            placeholder="Enter input here..."
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
          />
        </Panel>
        <Panel label={outputLabel}>
          <div className="relative">
            <textarea readOnly className={TEXTAREA} value={output} placeholder="Output will appear here..." />
            {output && <div className="absolute top-2 right-2"><CopyButton text={output} /></div>}
          </div>
        </Panel>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          {runLabel}
        </button>
        {extraAction}
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function UtilityTool({ slug }: Props) {
  switch (slug) {
    case "base64-encode":       return <Base64Tool />
    case "json-formatter":      return <JsonFormatterTool />
    case "url-encoder":         return <UrlEncoderTool />
    case "hash-generator":      return <HashGeneratorTool />
    case "color-converter":     return <ColorConverterTool />
    case "uuid-generator":      return <UuidGeneratorTool />
    case "text-case-converter": return <TextCaseTool />
    case "image-to-base64":     return <ImageToBase64Tool />
    case "csv-to-json":         return <CsvToJsonTool />
    default:                    return null
  }
}
