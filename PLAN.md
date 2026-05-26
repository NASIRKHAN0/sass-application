# PDF & File Conversion SaaS — Master Build Plan
> Prepared for: shahid@vuebytes.com | Last Updated: May 2026
> Status: **FULL STACK WORKING LOCALLY — Stripe + VPS deployment remaining**

---

## Quick Context for Any Agent Reading This

This is a full-stack SaaS application — a PDF/image/audio conversion platform that competes with
ilovepdf.com but adds AI-powered voice transcription, image background removal, and AI summaries.
The codebase lives at `E:\cuebytes-project\sass-application`.

**Full stack is working locally. Users can sign in, upload files, convert them, and download results.
Remaining work: Stripe billing, VPS deployment, Cloudflare R2 (deferred by user), Phase 2 features.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack — Every Tool and Why](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Full Feature List by Phase](#4-full-feature-list)
5. [Database Schema](#5-database-schema)
6. [File & Folder Structure](#6-folder-structure)
7. [Environment Variables](#7-environment-variables)
8. [Build Phases & Checklist](#8-build-phases)
9. [API Routes Reference](#9-api-routes)
10. [Pricing & Plan Logic](#10-pricing-and-plans)
11. [Job Queue Architecture](#11-job-queue)
12. [Python Worker Architecture](#12-python-workers)
13. [Development Conventions](#13-conventions)
14. [Deployment Guide](#14-deployment)
15. [PM Risk Register](#15-risks)

---

## 1. Project Overview

**What we are building:**
A web-based SaaS platform where users can:
- Convert, merge, split, compress, and manage PDF files (30+ operations)
- Convert and process images across 15+ formats
- Transcribe audio and video files in 50+ languages using AI
- Access all tools under one subscription

**Target competitors:** ilovepdf.com, Smallpdf, Adobe Acrobat Online
**Core differentiator:** Voice transcription + AI features (summarization, translation) — none of the
competitors offer this alongside PDF tools.

**Revenue model:**
- Free: $0/month (5 conversions/day, 10MB limit, watermark)
- Pro: $9/month (unlimited, 500MB, 10hr transcription/month)
- Business: $29/month (2GB, 50hr transcription, API access, team workspace)
- Credit packs: $5 (100 credits), $15 (400 credits)
- Yearly plans: Pro $90/yr, Business $290/yr

---

## 2. Tech Stack

### Languages
| Language | Where Used | Why |
|---|---|---|
| TypeScript | Frontend + Next.js API | Type safety, fewer runtime bugs |
| Python | File processing workers | Best PDF/image/audio library ecosystem |
| SQL | Via Prisma ORM | Relational data: users, jobs, subscriptions |
| CSS (Tailwind) | UI styling | Utility-first, no custom CSS files |

### Frontend
| Package | Purpose |
|---|---|
| next@14 | React framework — routing, SSR, API routes |
| react@18 | UI component library |
| tailwindcss | Utility-first CSS |
| shadcn/ui | Pre-built accessible components |
| framer-motion | Animations and transitions |
| @tanstack/react-query | Data fetching, polling, caching |
| react-hook-form + zod | Form handling and validation |
| react-dropzone | Drag and drop file upload |
| zustand | Global state (upload progress, user plan) |
| lucide-react | Icon library |

### Backend (Next.js API Routes)
| Package | Purpose |
|---|---|
| @clerk/nextjs | Auth — email, Google OAuth, GitHub OAuth |
| stripe + @stripe/stripe-js | Subscriptions and one-time payments |
| prisma + @prisma/client | Database ORM and migrations |
| @aws-sdk/client-s3 | Cloudflare R2 file storage (S3-compatible) |
| bullmq + ioredis | Job queue for async file processing |
| resend + react-email | Transactional emails |
| zod | Request validation |
| sharp | Server-side image processing |
| pdf-lib | Client-side PDF operations |
| openai | Whisper API + GPT-4o calls |
| date-fns | Date utilities |
| zustand | Global state |

### Python Worker (FastAPI)
| Package | Version | Purpose |
|---|---|---|
| fastapi | 0.115.0 | HTTP server for worker |
| uvicorn[standard] | 0.30.0 | ASGI server |
| pymupdf | 1.24.0 | PDF extract, compress, render |
| pillow | 10.4.0 | Image editing, format conversion |
| pillow-heif | 0.16.0 | HEIC/HEIF (iPhone photos) |
| rembg | 2.0.57 | AI background removal (offline) |
| opencv-python | 4.10.0 | Advanced image processing |
| pydub | 0.25.1 | Split audio into chunks |
| ffmpeg-python | 0.2.0 | Audio/video processing wrapper |
| pytesseract | 0.3.13 | OCR on scanned PDFs |
| pikepdf | 9.0.0 | Encrypt, decrypt, repair PDFs |
| pdfplumber | 0.11.0 | Extract tables from PDF → Excel |
| weasyprint | 62.0 | HTML → PDF conversion |
| reportlab | 4.2.0 | Generate PDFs programmatically |
| openai | 1.40.0 | Whisper API + GPT-4o |
| redis | 5.0.8 | Queue connection |
| boto3 | 1.34.0 | S3/R2 file operations |
| python-multipart | 0.0.9 | File upload parsing |
| celery | 5.4.0 | Task queue |
| python-dotenv | 1.0.0 | Environment variables |

### Infrastructure & Services
| Service | Purpose | Cost |
|---|---|---|
| Vercel | Next.js hosting | Free tier |
| Railway | Python FastAPI + workers | $5–$20/month |
| Neon PostgreSQL | Serverless database | Free tier (0.5GB) |
| Cloudflare R2 | File storage (no egress fees) | Free 10GB |
| Upstash Redis | BullMQ queue + caching | Free 10k req/day |
| Clerk | Authentication | Free 10k MAU |
| Stripe | Payments and subscriptions | 2.9% + $0.30 |
| Resend | Transactional email | Free 3k/month |
| OpenAI Whisper | Audio transcription | $0.006/min |
| OpenAI GPT-4o | Summaries, translation | $0.01–$0.03/req |
| Sentry | Error monitoring | Free tier |

---

## 3. System Architecture

```
USER BROWSER
    │
    ▼
NEXT.JS FRONTEND (Vercel)
├── React UI — Tailwind + shadcn/ui
├── Clerk Authentication
├── TanStack Query — polling job status
└── Zustand — upload state, user plan
    │
    ▼ (API calls)
NEXT.JS API ROUTES (/api/*)
├── POST /api/upload          → upload to R2, create job in DB
├── GET  /api/jobs/:id        → poll job status
├── GET  /api/jobs            → list user's job history
├── POST /api/webhooks/stripe → update plan on payment event
├── POST /api/webhooks/clerk  → create DB user on Clerk signup
├── POST /api/billing/checkout → create Stripe checkout session
├── POST /api/billing/portal   → open Stripe customer portal
└── GET  /api/usage            → return current month usage
    │
    ▼ (enqueue job via BullMQ)
UPSTASH REDIS (job queue)
    │
    ▼ (workers pull jobs)
PYTHON WORKERS (Railway)
├── PDF Worker   → LibreOffice, PyMuPDF, pikepdf, pdfplumber
├── Image Worker → Pillow, Sharp, rembg, pillow-heif, cairosvg
└── Audio Worker → FFmpeg, pydub, Whisper API, GPT-4o
    │
    ▼ (output uploaded)
CLOUDFLARE R2 STORAGE
├── Input files deleted immediately after processing
├── Output files: deleted after 24h (Free) / 30 days (Paid)
└── Signed URLs generated for secure download (time-limited)
    │
    ▼
USER DOWNLOADS FILE
```

### Job Lifecycle
```
PENDING → PROCESSING → COMPLETED
                ↘ FAILED (retry up to 3x, then DEAD)
```

On FAILED: notify user via email, log to Sentry, move to dead-letter queue.

---

## 4. Full Feature List

### MVP (Phase 1 — Weeks 1–6)

#### PDF Convert FROM
- [ ] PDF to Word (.docx) — LibreOffice  ← UI done, worker NOT built
- [ ] PDF to Excel (.xlsx) — LibreOffice + pdfplumber  ← UI done, worker NOT built
- [ ] PDF to PowerPoint (.pptx) — LibreOffice  ← UI done, worker NOT built
- [ ] PDF to JPG — PyMuPDF  ← UI done, worker NOT built
- [ ] PDF to PNG — PyMuPDF  ← UI done, worker NOT built
- [ ] PDF to TXT — PyMuPDF  ← UI done, worker NOT built

#### PDF Convert TO
- [ ] Word to PDF — LibreOffice  ← UI done, worker NOT built
- [ ] Excel to PDF — LibreOffice  ← UI done, worker NOT built
- [ ] PowerPoint to PDF — LibreOffice  ← UI done, worker NOT built
- [ ] JPG/PNG to PDF — pdf-lib  ← UI done, worker NOT built
- [ ] Multiple Images to PDF — pdf-lib  ← UI done, worker NOT built

#### PDF Management
- [ ] Merge PDFs — pikepdf  ← UI done, worker NOT built
- [ ] Split PDF — pikepdf  ← UI done, worker NOT built
- [ ] Compress PDF — Ghostscript + PyMuPDF  ← UI done, worker NOT built
- [ ] Rotate PDF — pikepdf  ← UI done, worker NOT built
- [ ] Protect PDF — pikepdf (AES-256)  ← UI done, worker NOT built
- [ ] Unlock PDF — pikepdf  ← UI done, worker NOT built

#### Image Tools
- [ ] JPG ↔ PNG conversion — Sharp/Pillow  ← UI done, worker NOT built
- [ ] Any format to WEBP — Sharp  ← UI done, worker NOT built
- [ ] Compress Image — Sharp (quality %)  ← UI done, worker NOT built
- [ ] Resize Image — Sharp (px / % / preset)  ← UI done, worker NOT built
- [ ] Grayscale Conversion — Pillow  ← UI done, worker NOT built

#### Voice Transcription (Basic)
- [ ] MP3 transcription — Whisper API  ← UI done, worker NOT built
- [ ] WAV, M4A, FLAC, OGG — FFmpeg + Whisper  ← UI done, worker NOT built
- [ ] MP4 / MOV video — FFmpeg extract + Whisper  ← UI done, worker NOT built
- [ ] 50+ languages — Whisper API  ← UI done, worker NOT built
- [ ] Timestamps — Whisper API  ← UI done, worker NOT built
- [ ] Export to TXT / DOCX  ← UI done, worker NOT built

#### Platform
- [ ] Email + password auth (Clerk)
- [ ] Google OAuth + GitHub OAuth (Clerk)
- [ ] Email verification + password reset (Clerk)
- [x] User dashboard with job history — **UI complete (mock data)**
- [x] Usage meter per plan — **UI complete (mock data)**
- [ ] Stripe billing — Free / Pro / Business
- [ ] Plan limit enforcement (job count, file size, transcription minutes)
- [ ] Auto file deletion (24h free / 30 days paid) — cron job
- [x] Landing page with all tools listed — **DONE**
- [x] Drag and drop upload UI — **DONE (demo mode, no real upload)**
- [x] Progress bar on all jobs — **UI only (simulated)**
- [ ] Bulk download as ZIP

---

### Growth Features (Phase 2 — Weeks 7–12)

#### PDF
- [ ] OCR PDF — pytesseract
- [ ] Sign PDF — draw / type / upload signature
- [ ] Add Watermark — text or image
- [ ] Add Page Numbers
- [ ] Reorder Pages — drag and drop
- [ ] Delete Pages
- [ ] Repair PDF — pikepdf
- [ ] PDF to WEBP
- [ ] PDF to HTML — WeasyPrint reverse
- [ ] PDF to EPUB

#### Image
- [ ] HEIC to JPG — pillow-heif
- [ ] SVG to PNG/JPG — cairosvg
- [ ] TIFF, BMP, AVIF support
- [ ] Crop & Rotate — Pillow
- [ ] Remove Background — rembg (offline AI, no API cost)

#### Transcription
- [ ] Speaker identification (diarization) — pyannote
- [ ] SRT / VTT subtitle export
- [ ] AI Summarization — GPT-4o
- [ ] AI Translation — GPT-4o
- [ ] Key Points Extraction — GPT-4o

#### Platform
- [ ] Re-download previous files
- [ ] Email notifications on job completion — Resend
- [ ] Billing history + PDF invoices — Stripe
- [ ] Dark mode / light mode toggle
- [ ] Blog for SEO (Next.js MDX)
- [ ] Paste from clipboard (images)

---

### Scale & Monetize (Phase 3 — Weeks 13–20)

- [ ] REST API for Business tier with full documentation
- [ ] API key management UI
- [ ] Webhook on job completion
- [ ] Team workspace with multiple seats
- [ ] Credit pack purchases (one-time via Stripe)
- [ ] Admin panel — users, revenue, job logs
- [ ] Zapier / Make.com integration
- [ ] AI upscale / enhance images — Real-ESRGAN
- [ ] PDF Redact — black out sensitive text
- [ ] Browser extension (Chrome)
- [ ] WordPress plugin
- [ ] White-label API offering

---

## 5. Database Schema

### Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Plan {
  FREE
  PRO
  BUSINESS
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  DEAD
}

model User {
  id            String         @id @default(cuid())
  clerkId       String         @unique
  email         String         @unique
  name          String?
  plan          Plan           @default(FREE)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  subscription  Subscription?
  jobs          Job[]
  usage         Usage[]
  apiKeys       ApiKey[]
  credits       Credit[]
  teamMemberships TeamMember[]
}

model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  stripeCustomerId   String   @unique
  stripeSubId        String   @unique
  plan               Plan
  status             String
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Job {
  id           String    @id @default(cuid())
  userId       String
  type         String    // e.g. "pdf-to-word", "transcribe-mp3", "compress-image"
  status       JobStatus @default(PENDING)
  inputUrl     String    // R2 key
  outputUrl    String?   // R2 key, set on completion
  outputSize   Int?      // bytes
  errorMessage String?
  metadata     Json?     // e.g. { language: "en", quality: 80 }
  createdAt    DateTime  @default(now())
  completedAt  DateTime?
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model Usage {
  id                    String   @id @default(cuid())
  userId                String
  month                 String   // "2026-05" format
  jobCount              Int      @default(0)
  transcriptionMinutes  Int      @default(0)
  updatedAt             DateTime @updatedAt
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month])
  @@index([userId])
}

model ApiKey {
  id          String    @id @default(cuid())
  userId      String
  name        String
  keyHash     String    @unique
  lastUsed    DateTime?
  revoked     Boolean   @default(false)
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Credit {
  id        String   @id @default(cuid())
  userId    String
  amount    Int
  used      Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Team {
  id        String       @id @default(cuid())
  name      String
  ownerId   String
  createdAt DateTime     @default(now())
  members   TeamMember[]
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      String   @default("member") // "owner" | "admin" | "member"
  createdAt DateTime @default(now())
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}

model WebhookEndpoint {
  id        String   @id @default(cuid())
  userId    String
  url       String
  secret    String
  events    String[] // ["job.completed", "job.failed"]
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  @@index([userId])
}
```

### Plan Limits Reference

```typescript
export const PLAN_LIMITS = {
  FREE: {
    dailyJobs: 5,
    maxFileSizeMB: 10,
    transcriptionMinutesPerMonth: 0,
    fileRetentionHours: 24,
    watermark: true,
  },
  PRO: {
    dailyJobs: Infinity,
    maxFileSizeMB: 500,
    transcriptionMinutesPerMonth: 600, // 10 hours
    fileRetentionDays: 30,
    watermark: false,
  },
  BUSINESS: {
    dailyJobs: Infinity,
    maxFileSizeMB: 2048,
    transcriptionMinutesPerMonth: 3000, // 50 hours
    fileRetentionDays: 90,
    watermark: false,
    apiAccess: true,
    teamSeats: 5,
  },
} as const
```

---

## 6. Folder Structure

```
sass-application/
├── PLAN.md                          ← this file
├── .env.local                       ← environment variables (never commit)
├── .env.example                     ← template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── icons/                       ← tool icons
│   └── og/                          ← Open Graph images
├── src/
│   ├── app/                         ← Next.js App Router
│   │   ├── (marketing)/             ← landing, about, pricing pages
│   │   │   ├── page.tsx             ← homepage
│   │   │   ├── pricing/page.tsx
│   │   │   └── tools/[tool]/page.tsx ← individual tool SEO pages
│   │   ├── (app)/                   ← authenticated app
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── tools/[tool]/page.tsx ← tool UI pages
│   │   │   ├── history/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── upload/route.ts
│   │   │   ├── jobs/
│   │   │   │   ├── route.ts         ← GET list
│   │   │   │   └── [id]/route.ts    ← GET single, DELETE
│   │   │   ├── billing/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   └── portal/route.ts
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts
│   │   │   │   └── clerk/route.ts
│   │   │   └── usage/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                      ← shadcn/ui components
│   │   ├── upload/
│   │   │   ├── DropZone.tsx
│   │   │   ├── UploadProgress.tsx
│   │   │   └── FilePreview.tsx
│   │   ├── tools/
│   │   │   ├── ToolCard.tsx
│   │   │   ├── ToolGrid.tsx
│   │   │   └── JobResult.tsx
│   │   ├── dashboard/
│   │   │   ├── UsageMeter.tsx
│   │   │   └── JobHistory.tsx
│   │   └── billing/
│   │       └── PricingCard.tsx
│   ├── lib/
│   │   ├── prisma.ts                ← Prisma client singleton
│   │   ├── r2.ts                    ← Cloudflare R2 client
│   │   ├── queue.ts                 ← BullMQ producer
│   │   ├── stripe.ts                ← Stripe client
│   │   ├── limits.ts                ← plan limit checker
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useJobPolling.ts         ← TanStack Query job status poller
│   │   └── useUpload.ts
│   ├── store/
│   │   └── uploadStore.ts           ← Zustand store
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts                ← Clerk auth middleware
├── python-worker/                   ← deployed separately to Railway
│   ├── main.py                      ← FastAPI app
│   ├── requirements.txt
│   ├── workers/
│   │   ├── pdf_worker.py
│   │   ├── image_worker.py
│   │   └── audio_worker.py
│   ├── processors/
│   │   ├── pdf/
│   │   │   ├── convert.py           ← LibreOffice conversions
│   │   │   ├── merge.py
│   │   │   ├── split.py
│   │   │   ├── compress.py
│   │   │   └── ocr.py
│   │   ├── image/
│   │   │   ├── convert.py
│   │   │   ├── compress.py
│   │   │   ├── resize.py
│   │   │   └── remove_bg.py
│   │   └── audio/
│   │       ├── transcribe.py
│   │       ├── summarize.py
│   │       └── translate.py
│   ├── utils/
│   │   ├── r2.py                    ← download input / upload output
│   │   ├── db.py                    ← update job status in DB
│   │   └── cleanup.py               ← delete temp files
│   └── Dockerfile
└── scripts/
    └── cleanup-cron.ts              ← delete expired R2 files
```

---

## 7. Environment Variables

### `.env.example` (Next.js — `.env.local`)

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
CLERK_WEBHOOK_SECRET="whsec_..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_BUSINESS_PRICE_ID="price_..."

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="saas-files"
R2_PUBLIC_URL="https://..."

# Upstash Redis (BullMQ)
UPSTASH_REDIS_URL="redis://..."
UPSTASH_REDIS_TOKEN="..."

# Python Worker
WORKER_API_URL="https://your-worker.railway.app"
WORKER_API_SECRET="..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Resend Email
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Python Worker (Railway env vars)

```bash
DATABASE_URL="postgresql://..."
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="saas-files"
REDIS_URL="redis://..."
OPENAI_API_KEY="sk-..."
WORKER_API_SECRET="..."
```

---

## 8. Build Phases

### Phase 1 — MVP (Weeks 1–6)

**Week 1 — Project Foundation**
- [x] Init Next.js project with TypeScript, Tailwind, shadcn/ui — **DONE**
- [x] Set up Prisma + Neon PostgreSQL, run initial migration — **DONE**
- [x] Configure Clerk auth (email/password + OAuth UI) — **DONE** ⚠️ Google/GitHub OAuth needs enabling in Clerk dashboard
- [ ] Set up Cloudflare R2 bucket + signed URL generation — **deferred, using local disk for now**
- [x] Python worker running locally (FastAPI, polls DB every 2s) — **DONE**
- [ ] Configure VPS deployment (Nginx + PM2)

**Week 2 — File Upload & Job System**
- [x] DropZone UI (react-dropzone) wired to real API — **DONE**
- [x] POST /api/upload — file size + MIME check + daily limit + DB record — **DONE**
- [x] GET /api/jobs/:id — job status + download URL — **DONE**
- [x] GET /api/jobs — list user job history — **DONE**
- [x] POST /api/internal/jobs/claim — Python worker claims jobs — **DONE**
- [x] PATCH /api/jobs/:id/complete — Python worker marks done — **DONE**
- [x] PATCH /api/jobs/:id/failed — Python worker marks failed — **DONE**
- [x] GET /api/files/[key] — serves files from local disk — **DONE**
- [x] Job status polling (real API, 1.5s interval) — **DONE**
- [x] Progress bar with real status — **DONE**

**Week 3 — PDF Processing**
- [x] Python PDF worker: PDF → JPG/PNG/TXT (PyMuPDF) — **DONE**
- [x] Python PDF worker: Merge, Split, Rotate, Protect, Unlock (pikepdf) — **DONE**
- [x] Python PDF worker: Compress PDF (pikepdf) — **DONE**
- [ ] Python PDF worker: PDF ↔ Word/Excel/PPT (LibreOffice) — **Linux VPS only**
- [x] JS in-process: JPG/PNG to PDF (pdf-lib) — **DONE**
- [x] JS in-process: Merge, Split, Rotate, Protect PDF (pdf-lib) — **DONE**
- [x] Tool UI pages for all PDF tools — **DONE**

**Week 4 — Image Processing & Transcription**
- [x] JS in-process: JPG↔PNG, WebP, Compress, Resize, Grayscale (sharp) — **DONE**
- [x] Python Image worker: HEIC→JPG (pillow-heif) — **DONE**
- [ ] Python Image worker: Remove Background (rembg) — **Windows: excluded (onnxruntime)**
- [ ] Python Image worker: SVG→PNG (cairosvg) — **Windows: excluded (Cairo DLLs)**
- [x] Python Audio worker: MP3/WAV → Whisper API → TXT/DOCX — **DONE**
- [x] Python Audio worker: MP4 → audio extract → Whisper — **DONE**
- [x] Tool UI pages for image and transcription tools — **DONE**

**Week 5 — Auth, Billing, Dashboard**
- [x] Clerk webhooks → create/update/delete user in DB — **DONE**
- [x] Auto-create DB user on first API call (for local dev without public webhook) — **DONE**
- [x] Plan limit enforcement in /api/upload (file size, daily jobs) — **DONE**
- [x] Dashboard with real DB data — **DONE**
- [x] /history page — full job list with download — **DONE**
- [x] /billing page — current plan, usage limits, upgrade prompt — **DONE**
- [x] Download button on completed jobs — **DONE**
- [ ] Stripe checkout + customer portal — **NOT STARTED**
- [ ] Stripe webhooks → update plan on payment — **NOT STARTED**

**Week 6 — Landing Page, Polish, Launch**
- [x] Landing page with all 70+ tools listed — **DONE**
- [x] Individual SEO tool pages (`/tools/pdf-to-word`, etc.) — **DONE**
- [x] Pricing page — **DONE**
- [ ] Auto file deletion cron (24h free / 30 days paid) — **NOT STARTED**
- [ ] Error handling and Sentry integration — **NOT STARTED**
- [ ] Mobile responsive audit — **NOT STARTED**
- [ ] Smoke test all tools end-to-end on VPS — **NOT STARTED**

---

### Phase 2 — Growth (Weeks 7–12)
*(Detailed checklist to be added when Phase 1 is complete)*

- OCR PDF, Sign PDF, Watermark, Reorder/Delete pages
- HEIC → JPG, SVG → PNG, Remove Background
- Speaker diarization, SRT/VTT export
- AI Summarization, Translation, Key Points (GPT-4o)
- Re-download history, email notifications
- Dark mode, blog for SEO

---

### Phase 3 — Scale (Weeks 13–20)
*(Scope to be narrowed before starting — max 4 items)*

Candidates:
- REST API + API key management
- Team workspace
- Credit pack purchases
- Admin panel
- Webhook endpoints

---

## 9. API Routes

### Upload
```
POST /api/upload
Body: FormData { file, jobType, options }
Auth: Required
Returns: { jobId, status: "pending" }
```

### Jobs
```
GET /api/jobs
Auth: Required
Returns: { jobs: Job[], total: number }

GET /api/jobs/:id
Auth: Required
Returns: { job: Job, downloadUrl?: string }

DELETE /api/jobs/:id
Auth: Required
Returns: { success: true }
```

### Billing
```
POST /api/billing/checkout
Body: { priceId, plan }
Auth: Required
Returns: { url: string } (Stripe checkout URL)

POST /api/billing/portal
Auth: Required
Returns: { url: string } (Stripe portal URL)
```

### Usage
```
GET /api/usage
Auth: Required
Returns: { jobCount, transcriptionMinutes, plan, limits }
```

### Webhooks (no auth — use signature verification)
```
POST /api/webhooks/stripe  → Stripe signature verified
POST /api/webhooks/clerk   → Clerk signature verified
```

---

## 10. Pricing and Plans

### Stripe Products to Create
1. Pro Monthly — $9/month
2. Pro Yearly — $90/year
3. Business Monthly — $29/month
4. Business Yearly — $290/year
5. Credit Pack Small — $5 one-time (100 credits)
6. Credit Pack Large — $15 one-time (400 credits)

### Plan Enforcement Logic
Every job submission must check:
1. Is user authenticated?
2. Does file size exceed plan limit?
3. If FREE plan: has user exceeded daily job count?
4. If job is transcription: does user have remaining transcription minutes this month?
5. If FREE plan: does user have credits? (for one-time credit purchases)

### Watermark Logic
- Free plan: add text watermark "Converted with [AppName]" to output PDF/image
- Pro/Business: no watermark

---

## 11. Job Queue

### Queue Names
- `pdf-jobs` — all PDF operations
- `image-jobs` — all image operations
- `audio-jobs` — all transcription operations

### Job Payload Shape
```typescript
interface JobPayload {
  jobId: string        // DB job ID
  userId: string
  jobType: string      // "pdf-to-word" | "transcribe-mp3" | etc.
  inputKey: string     // R2 object key
  options: Record<string, unknown>  // tool-specific options
}
```

### Retry Config
```typescript
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 200,
}
```

### On Job Complete (Python worker must call back)
```
PATCH /api/jobs/:id/complete
Body: { outputKey: string, outputSize: number }
```

### On Job Failed (Python worker must call back)
```
PATCH /api/jobs/:id/failed
Body: { error: string }
```

---

## 12. Python Workers

### Worker Entry Pattern
Each worker listens to Redis queue, processes the job, uploads output to R2, then calls back to Next.js API to update job status.

```python
# workers/pdf_worker.py
import asyncio
from redis import Redis
from utils.r2 import download_input, upload_output
from utils.db import mark_completed, mark_failed
from processors.pdf import convert, merge, split, compress

async def process_job(job: dict):
    job_id = job["jobId"]
    job_type = job["jobType"]
    input_key = job["inputKey"]
    options = job.get("options", {})

    try:
        # Download input from R2
        input_path = await download_input(input_key)

        # Route to correct processor
        output_path = await route_job(job_type, input_path, options)

        # Upload output to R2
        output_key = await upload_output(output_path, job_id)

        # Notify Next.js
        await mark_completed(job_id, output_key)

    except Exception as e:
        await mark_failed(job_id, str(e))
    finally:
        # Always clean up temp files
        cleanup_temp(input_path, output_path)
```

### Job Type → Processor Mapping
| Job Type | Processor | Library |
|---|---|---|
| pdf-to-word | processors/pdf/convert.py | LibreOffice |
| pdf-to-excel | processors/pdf/convert.py | LibreOffice + pdfplumber |
| pdf-to-ppt | processors/pdf/convert.py | LibreOffice |
| pdf-to-jpg | processors/pdf/convert.py | PyMuPDF |
| word-to-pdf | processors/pdf/convert.py | LibreOffice |
| merge-pdf | processors/pdf/merge.py | pikepdf |
| split-pdf | processors/pdf/split.py | pikepdf |
| compress-pdf | processors/pdf/compress.py | Ghostscript |
| protect-pdf | processors/pdf/protect.py | pikepdf |
| unlock-pdf | processors/pdf/protect.py | pikepdf |
| ocr-pdf | processors/pdf/ocr.py | pytesseract |
| convert-image | processors/image/convert.py | Pillow + Sharp |
| compress-image | processors/image/compress.py | Sharp |
| resize-image | processors/image/resize.py | Sharp |
| remove-background | processors/image/remove_bg.py | rembg |
| transcribe-audio | processors/audio/transcribe.py | Whisper API |
| transcribe-video | processors/audio/transcribe.py | FFmpeg + Whisper |

---

## 13. Development Conventions

### TypeScript
- All API routes use Zod for request validation
- All DB queries go through Prisma client singleton (`src/lib/prisma.ts`)
- No `any` types — use `unknown` and narrow
- Server components fetch data directly; client components use TanStack Query

### Python
- All processors are async functions
- All temp files go to `/tmp/saas-{jobId}/`
- All temp files cleaned up in `finally` block regardless of success/failure
- All R2 operations use signed URLs (never expose bucket directly)

### Git
- Branch: `main` (production)
- Commit format: `feat:`, `fix:`, `chore:`, `docs:`
- Never commit `.env.local` or any secrets

### Security Rules
- All file uploads must be scanned for MIME type mismatch
- Max file size enforced at API level before R2 upload
- Signed URLs expire in 1 hour for downloads
- Stripe webhooks verified with `stripe.webhooks.constructEvent`
- Clerk webhooks verified with `svix` signature
- Python worker API protected by shared secret header (`X-Worker-Secret`)
- No user data logged — only job IDs and error messages

---

## 14. Deployment

### Vercel (Next.js)
1. Connect GitHub repo to Vercel
2. Set all `NEXT_PUBLIC_*` and server env vars in Vercel dashboard
3. Vercel auto-deploys on push to `main`

### Railway (Python Worker)
1. Create new Railway project
2. Connect GitHub repo, set root to `/python-worker`
3. Add Dockerfile (Railway detects it automatically)
4. Set all Python env vars in Railway dashboard
5. Scale worker replicas as load increases

### Database (Neon)
```bash
npx prisma migrate deploy   # run migrations
npx prisma generate         # generate client
```

### Cloudflare R2
1. Create bucket `saas-files`
2. Enable public access or use signed URLs (prefer signed)
3. Set CORS for your domain
4. Configure lifecycle rules for auto-deletion (backup to cron)

---

## 15. PM Risk Register

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| MVP timeline overrun | High | High | Cut scope to 10 features; 10-12 week realistic estimate |
| AI API costs exceed plan revenue | High | Medium | Model cost per user persona; add transcription minute caps |
| LibreOffice headless setup fails on Railway | Medium | Medium | Test Railway Docker deploy in Week 1 before building features |
| BullMQ job lost with no retry | High | Low | Configure 3x retry with exponential backoff + DLQ |
| File upload abuse on free tier | Medium | Medium | Rate limit by IP + require email verify before first upload |
| Phase 3 scope creep | Medium | High | Lock Phase 3 to 4 features max before starting Phase 2 |
| OpenAI API outage breaks transcription | Medium | Low | Wrap in try/catch; queue retry after 5 min; notify user |
| Cloudflare R2 free tier exceeded | Low | Medium | Set storage alert at 8GB; auto-delete expired files aggressively |
| 10% conversion rate assumption too high | Medium | High | Plan runway for 4% conversion; re-validate at 3 months |
| Security: malicious PDF upload | High | Medium | Validate MIME type; run LibreOffice in sandboxed container |

---

## Current Status

```
Phase 1 Frontend:  [x] COMPLETE
Phase 1 Backend:   [x] COMPLETE (local dev — Stripe + VPS + R2 remaining)
Phase 2:           [ ] NOT STARTED
Phase 3:           [ ] NOT STARTED
```

### What is DONE (as of May 2026)

#### Frontend
| Item | Status |
|---|---|
| Next.js project (TypeScript, Tailwind v4, shadcn/ui) | ✅ Done |
| Design system — black/white theme, oklch tokens, fonts | ✅ Done |
| `src/lib/tools.ts` — 50+ tools data, categories, types | ✅ Done |
| `Navbar.tsx` + `Footer.tsx` layout components | ✅ Done |
| `UploadZone.tsx` — drag & drop, wired to real API, polling, download | ✅ Done |
| `/` — Landing page (hero, ticker, categories, how it works, pricing, CTA) | ✅ Done |
| `/tools` — Full tool directory by category | ✅ Done |
| `/tools/[tool]` — Individual tool page + UploadZone + related tools | ✅ Done |
| `/pricing` — Pricing cards, comparison table, FAQ | ✅ Done |
| `/dashboard` — Real DB data: stats, job history, usage bars, download | ✅ Done |
| `/history` — Full job list, table view, download buttons | ✅ Done |
| `/billing` — Current plan, usage limits, upgrade prompt | ✅ Done |
| `/sign-in` + `/sign-up` pages | ✅ Done |

#### Backend — Database & Auth
| Item | Status |
|---|---|
| Prisma 7 schema — 9 models (User, Job, Usage, Subscription, etc.) | ✅ Done |
| Neon PostgreSQL — live DB, all tables created | ✅ Done |
| `src/lib/prisma.ts` — Prisma 7 + `@prisma/adapter-pg` singleton | ✅ Done |
| `src/lib/auth.ts` — getCurrentUser (auto-creates on first call), requireAuth | ✅ Done |
| `src/lib/limits.ts` — PLAN_LIMITS, getLimits, canUploadFile | ✅ Done |
| `src/middleware.ts` — Clerk route protection | ✅ Done |
| `ClerkProvider` in layout.tsx | ✅ Done |
| Navbar auth state — UserButton / SignIn / SignUp | ✅ Done |
| `/api/webhooks/clerk` — user.created / updated / deleted → DB | ✅ Done |

#### Backend — File Upload & Job System
| Item | Status |
|---|---|
| `src/lib/storage.ts` — local disk driver (swap to R2 with one env var) | ✅ Done |
| `.uploads/` directory — shared between Next.js and Python worker | ✅ Done |
| `src/lib/processor.ts` — in-process JS processor (12 tools via sharp + pdf-lib) | ✅ Done |
| `POST /api/upload` — MIME check, size limit, daily limit, DB record, local processing | ✅ Done |
| `GET /api/jobs/:id` — status + signed download URL | ✅ Done |
| `GET /api/jobs` — user job history | ✅ Done |
| `GET /api/usage` — current month usage | ✅ Done |
| `POST /api/internal/jobs/claim` — Python worker claims next PENDING job | ✅ Done |
| `PATCH /api/jobs/:id/complete` — Python worker marks job done | ✅ Done |
| `PATCH /api/jobs/:id/failed` — Python worker marks job failed | ✅ Done |
| `GET /api/files/[key]` — serves files from local disk | ✅ Done |

#### Python Worker
| Item | Status |
|---|---|
| FastAPI app with polling loop (every 2s) | ✅ Done |
| `GET /health` endpoint | ✅ Done |
| `processors/pdf_processor.py` — 16 PDF tools (PyMuPDF + pikepdf) | ✅ Done |
| `processors/image_processor.py` — 9 image tools (Pillow + pillow-heif) | ✅ Done |
| `processors/audio_processor.py` — 5 transcription tools (OpenAI Whisper) | ✅ Done |
| `utils/storage.py` — reads/writes from shared `.uploads/` dir | ✅ Done |
| `utils/api.py` — claim_job, mark_complete, mark_failed | ✅ Done |
| `requirements-windows.txt` — Python 3.13 compatible wheels | ✅ Done |
| `Dockerfile` — for Linux VPS deployment | ✅ Done |
| venv at `python-worker/venv/` — all deps installed | ✅ Done |

#### Tools that work RIGHT NOW (local)
| Category | Tools |
|---|---|
| Image (JS/sharp) | jpg↔png, webp, compress, resize, grayscale |
| PDF (JS/pdf-lib) | jpg-to-pdf, png-to-pdf, merge, split, rotate, protect |
| PDF (Python/PyMuPDF) | pdf-to-jpg, pdf-to-png, pdf-to-txt, compress-pdf, unlock-pdf, repair-pdf |
| PDF (Python/pikepdf) | split, merge, rotate, protect, unlock |
| Image (Python/Pillow) | heic-to-jpg, jpg/png conversions |
| Audio (Python/Whisper) | transcribe mp3/wav/m4a, video transcription, SRT export |

#### Tools that need Linux VPS (LibreOffice)
| Tool |
|---|
| pdf-to-word, pdf-to-excel, pdf-to-powerpoint |
| word-to-pdf, excel-to-pdf, powerpoint-to-pdf |

#### Tools excluded on Windows (need native deps)
| Tool | Reason |
|---|---|
| remove-background | rembg needs onnxruntime (excluded from Windows requirements) |
| svg-to-png | cairosvg needs Cairo DLLs |

---

### What is NOT YET DONE

| Item | Priority | Notes |
|---|---|---|
| Stripe checkout + webhooks + customer portal | 🔴 Next | User needs Stripe account |
| `/api/billing/checkout` + `/portal` + `/api/webhooks/stripe` | 🔴 Next | Blocked on Stripe setup |
| VPS deployment (Nginx + PM2 for Next.js, Docker for Python worker) | 🔴 Next | User getting VPS + subdomain |
| Cloudflare R2 (swap `STORAGE_DRIVER=r2` + fill credentials) | 🟡 Soon | User deferred — local disk for now |
| Set `CLERK_WEBHOOK_SECRET` in prod env | ⚠️ Post-deploy | Needs public URL first |
| Enable Google + GitHub OAuth in Clerk dashboard | ⚠️ Manual | 2-minute task in Clerk UI |
| Auto file deletion cron (24h free / 30 days paid) | 🟠 Later | After VPS deploy |
| Sentry error monitoring | 🟢 Optional | Any time |
| Mobile responsive audit | 🟠 Later | Before launch |
| All Phase 2 features | — | After Phase 1 complete |
| All Phase 3 features | — | After Phase 2 complete |

**Next action:** Set up Stripe → wire `/api/billing/checkout` + `/api/webhooks/stripe` → deploy to VPS.

---

*This file is the single source of truth for the project. Update it as decisions are made.*
*Any AI agent working on this project should read this file first before taking any action.*
