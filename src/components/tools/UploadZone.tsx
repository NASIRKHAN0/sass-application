"use client"

import { useCallback, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, AlertCircle, ArrowRight, Loader2, CheckCircle2, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tool } from "@/lib/tools"

interface UploadZoneProps {
  tool: Tool
  userPlan?: string
}

type UploadState = "idle" | "uploading" | "processing" | "done" | "error"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const IMAGE_OUTPUT_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])
const POLL_INTERVAL = 1500

export function UploadZone({ tool, userPlan = "FREE" }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [outputFilename, setOutputFilename] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isMulti = tool.slug === "merge-images"
  const primaryFile = files[0] ?? null

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFiles(isMulti ? accepted : [accepted[0]])
      setState("idle")
      setError(null)
      setProgress(0)
      setDownloadUrl(null)
      setPreviewUrl(null)
    }
  }, [isMulti])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: isMulti ? 10 : 1,
    maxSize: 500 * 1024 * 1024,
    onDropRejected: (rejected) => {
      const err = rejected[0]?.errors[0]
      if (err?.code === "file-too-large") setError("File is too large for your plan.")
      else setError("File type not accepted for this tool.")
    },
  })

  function clearAll() {
    if (pollRef.current) clearInterval(pollRef.current)
    setFiles([])
    setState("idle")
    setError(null)
    setProgress(0)
    setDownloadUrl(null)
    setOutputFilename(null)
    setPreviewUrl(null)
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function startPolling(jobId: string) {
    let attempts = 0
    const MAX_ATTEMPTS = 120

    pollRef.current = setInterval(async () => {
      attempts++
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(pollRef.current!)
        setState("error")
        setError("Processing timed out. Please try again.")
        return
      }

      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        if (!res.ok) return
        const data = await res.json() as { job: { status: string }; downloadUrl?: string }

        if (data.job.status === "COMPLETED") {
          clearInterval(pollRef.current!)
          setProgress(100)
          setDownloadUrl(data.downloadUrl ?? null)
          const ext = tool.outputFormat ?? ".bin"
          const base = primaryFile?.name.replace(/\.[^/.]+$/, "") ?? "output"
          setOutputFilename(`${base}${ext}`)
          // Fetch preview for image outputs
          if (data.downloadUrl && IMAGE_OUTPUT_EXTS.has(ext)) {
            setPreviewUrl(data.downloadUrl)
          }
          setState("done")
        } else if (data.job.status === "FAILED") {
          clearInterval(pollRef.current!)
          setState("error")
          setError("Conversion failed. Please try a different file.")
        } else {
          setProgress((p) => Math.min(p + 5, 90))
        }
      } catch {
        // Network blip — keep polling
      }
    }, POLL_INTERVAL)
  }

  async function handleConvert() {
    if (files.length === 0) return
    setState("uploading")
    setProgress(10)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((f) => formData.append("file", f))
      formData.append("jobType", tool.slug)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json() as { jobId?: string; status?: string; error?: string }

      if (!res.ok) {
        setState("error")
        setError(data.error ?? "Upload failed. Please try again.")
        return
      }

      setProgress(30)
      setState("processing")

      if (data.status === "COMPLETED") {
        const jobRes = await fetch(`/api/jobs/${data.jobId}`)
        const jobData = await jobRes.json() as { downloadUrl?: string }
        setProgress(100)
        setDownloadUrl(jobData.downloadUrl ?? null)
        const ext = tool.outputFormat ?? ".bin"
        const base = primaryFile?.name.replace(/\.[^/.]+$/, "") ?? "output"
        setOutputFilename(`${base}${ext}`)
        if (jobData.downloadUrl && IMAGE_OUTPUT_EXTS.has(ext)) {
          setPreviewUrl(jobData.downloadUrl)
        }
        setState("done")
      } else {
        startPolling(data.jobId!)
      }
    } catch {
      setState("error")
      setError("Something went wrong. Please check your connection and try again.")
    }
  }

  async function handleDownload() {
    if (!downloadUrl || !outputFilename) return
    const a = document.createElement("a")
    a.href = downloadUrl
    a.download = outputFilename
    a.click()
  }

  const planNote = userPlan === "FREE"
    ? "Free plan · 10 MB limit · 5 conversions/day"
    : userPlan === "PRO"
    ? "Pro plan · 500 MB limit · Unlimited conversions"
    : "Business plan · 2 GB limit · Unlimited conversions"

  return (
    <div className="flex flex-col gap-4">

      {/* Drop Zone — idle, no files */}
      {state === "idle" && files.length === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed p-12 cursor-pointer transition-all",
            isDragActive && !isDragReject
              ? "border-foreground/40 bg-foreground/5"
              : isDragReject
              ? "border-destructive/50 bg-destructive/5"
              : "border-border/60 hover:border-foreground/20 hover:bg-card/40"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border/60 bg-card">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              {isDragActive ? "Drop it here" : isMulti ? "Drag & drop your images" : "Drag & drop your file"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMulti ? "Select multiple files — they'll be merged in order" : "or click to browse"}
            </p>
            {tool.inputFormat && (
              <p className="text-xs text-muted-foreground/50 mt-1 font-mono">{tool.inputFormat}</p>
            )}
          </div>
        </div>
      )}

      {/* Files selected (idle state) */}
      {files.length > 0 && state === "idle" && (
        <div className="rounded-sm border border-border/60 bg-card overflow-hidden">
          {files.map((f, i) => (
            <div key={i} className={cn("flex items-center gap-4 p-4", i > 0 && "border-t border-border/60")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-background">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add more for merge-images */}
          {isMulti && (
            <div {...getRootProps()} className="px-4 py-2.5 border-t border-border/60 cursor-pointer hover:bg-muted/40 transition-colors">
              <input {...getInputProps()} />
              <p className="text-xs text-muted-foreground text-center">+ Drop more images to add</p>
            </div>
          )}

          <div className="px-4 pb-4 pt-1 border-t border-border/60 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground/60">
              {isMulti
                ? `${files.length} image${files.length > 1 ? "s" : ""} selected`
                : `${tool.inputFormat} → ${tool.outputFormat ?? tool.label}`
              }
            </span>
            <button
              onClick={handleConvert}
              disabled={files.length < (isMulti ? 2 : 1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {isMulti ? "Merge" : "Convert"} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Uploading / Processing */}
      {(state === "uploading" || state === "processing") && (
        <div className="rounded-sm border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
            <span className="text-sm text-foreground">
              {state === "uploading" ? "Uploading…" : "Converting…"}
            </span>
            <span className="ml-auto text-xs text-muted-foreground font-mono">{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-border/60 overflow-hidden">
            <div
              className="h-full bg-foreground/70 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground truncate">{primaryFile?.name}</p>
        </div>
      )}

      {/* Done */}
      {state === "done" && (
        <div className="rounded-sm border border-foreground/20 bg-card/60 overflow-hidden">
          {previewUrl && (
            <div className="p-4 border-b border-border/60 flex items-center justify-center bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 max-w-full rounded-sm border border-border/60 object-contain"
              />
            </div>
          )}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <ImageIcon className="h-5 w-5 text-foreground/60 shrink-0" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-foreground/60 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">Conversion complete</p>
                <p className="text-xs text-muted-foreground mt-0.5">{outputFilename}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearAll}
                className="px-3 py-1.5 text-xs text-muted-foreground border border-border/60 rounded-sm hover:text-foreground transition-colors"
              >
                New file
              </button>
              <button
                onClick={handleDownload}
                disabled={!downloadUrl}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-sm bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                Download <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && error && (
        <div className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-4 w-4 text-destructive/70 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={clearAll}
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Drop error */}
      {state === "idle" && error && files.length === 0 && (
        <div className="flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-4 w-4 text-destructive/70 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground/50 text-center">
        {planNote} ·{" "}
        <a href="/pricing" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
          Upgrade for more
        </a>
      </p>
    </div>
  )
}
