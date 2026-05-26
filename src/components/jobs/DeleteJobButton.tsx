"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this job and its files? This cannot be undone.")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Job deleted")
      router.refresh()
    } catch {
      toast.error("Could not delete job")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="opacity-0 group-hover:opacity-100 inline-flex items-center justify-center h-[26px] w-[26px] rounded-sm border border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all disabled:opacity-40"
      aria-label="Delete job"
    >
      {loading
        ? <Loader2 className="h-3 w-3 animate-spin" />
        : <Trash2 className="h-3 w-3" />
      }
    </button>
  )
}
