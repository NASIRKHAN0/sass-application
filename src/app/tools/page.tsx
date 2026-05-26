import Link from "next/link"
import { ArrowRight, FileText, Image, Mic } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { TOOLS, TOOL_CATEGORIES } from "@/lib/tools"
import type { Tool, ToolCategory } from "@/lib/tools"

const CATEGORY_ICONS = {
  pdf:   { icon: FileText, color: "text-foreground/60" },
  image: { icon: Image,    color: "text-foreground/60" },
  audio: { icon: Mic,      color: "text-foreground/60" },
}

const CATEGORY_ORDER: ToolCategory[] = ["pdf", "image", "audio"]

function ToolRow({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-center justify-between gap-4 py-3 px-4 rounded-sm border border-transparent hover:border-border/60 hover:bg-card/60 transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{tool.label}</span>
            {tool.badge && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-foreground/20 text-foreground/60">
                {tool.badge}
              </span>
            )}
            {tool.priority === "phase2" && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-border/60 text-muted-foreground/40">
                Soon
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">{tool.description}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {tool.inputFormat && (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground/50 font-mono">{tool.inputFormat}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground/30" />
            <span className="text-xs text-muted-foreground/50 font-mono">{tool.outputFormat}</span>
          </div>
        )}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
      </div>
    </Link>
  )
}

export default function ToolsPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16 flex-1">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2">
            All tools
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground">
            70+ tools.<br />
            <span className="italic text-foreground/50">One platform.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg">
            Convert PDFs, process images, and transcribe audio — everything you need without switching apps.
          </p>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-3 gap-2 mb-12 p-4 rounded-sm border border-border/60 bg-card/40">
          {Object.entries(TOOL_CATEGORIES).map(([id, cat]) => {
            const { icon: Icon } = CATEGORY_ICONS[id as ToolCategory]
            return (
              <a href={`#${id}`} key={id} className="flex flex-col items-center gap-1 py-2 group">
                <Icon className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/60 transition-colors" />
                <span className="text-xs font-semibold text-foreground">{cat.count}</span>
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{cat.label}</span>
              </a>
            )
          })}
        </div>

        {/* Tools by category */}
        <div className="flex flex-col gap-16">
          {CATEGORY_ORDER.map((catId) => {
            const cat = TOOL_CATEGORIES[catId]
            const tools = TOOLS.filter((t) => t.category === catId)
            const mvp = tools.filter((t) => t.priority === "mvp")
            const rest = tools.filter((t) => t.priority !== "mvp")
            const { icon: Icon } = CATEGORY_ICONS[catId]

            return (
              <div key={catId} id={catId}>
                {/* Category Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-border/60 bg-card">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">{cat.label}</h2>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground/50 font-mono">{cat.count} tools</span>
                </div>

                {/* MVP tools */}
                <div className="flex flex-col">
                  {mvp.map((tool) => (
                    <ToolRow key={tool.slug} tool={tool} />
                  ))}
                </div>

                {/* Phase 2+ tools */}
                {rest.length > 0 && (
                  <div className="mt-3 flex flex-col opacity-60">
                    {rest.map((tool) => (
                      <ToolRow key={tool.slug} tool={tool} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <Footer />
    </>
  )
}
