import type { Metadata } from "next"
import { Instrument_Serif, DM_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ThemedToaster } from "@/components/ThemedToaster"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
})

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "FileAI — Convert, Compress & Transcribe",
    template: "%s | FileAI",
  },
  description:
    "70+ file conversion tools combined with AI-powered voice transcription. Convert PDFs, process images, and transcribe audio in 50+ languages — all in one platform.",
  keywords: [
    "PDF converter",
    "image converter",
    "voice transcription",
    "PDF to Word",
    "compress PDF",
    "file conversion",
    "AI transcription",
  ],
  authors: [{ name: "FileAI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "FileAI — Convert, Compress & Transcribe",
    description: "70+ file tools + AI voice transcription. One platform.",
    siteName: "FileAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "FileAI — Convert, Compress & Transcribe",
    description: "70+ file tools + AI voice transcription. One platform.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${dmSans.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  )
}
