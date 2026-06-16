---
name: glamspot-project
description: GlamSpot Mumbai — the salon marketplace app being built in this repo (stack, scope, decisions)
metadata:
  type: project
---

GlamSpot Mumbai is a customer-facing beauty-salon discovery & booking marketplace for the SuperXgen AI Buildathon 2026 (judged on product thinking, UI/UX, AI usage, execution, UX).

**Key decisions (user-approved):**
- Backend consolidated into **Next.js 16 full-stack** (App Router + API routes + Prisma/SQLite) instead of the brief's separate FastAPI+Postgres+Redis — chosen for single run command, one deploy, demo reliability. Redis → in-memory TTL cache (`src/lib/cache.ts`). API routes map 1:1 to planned endpoints, port to FastAPI later if needed.
- Design = **editorial luxury**: Playfair Display + DM Sans, rose accent `#C9184A`, off-white `#FAFAF8`. (Supersedes the earlier "black & white" ask — user's later detailed spec won.)
- **Customer-side only** — no owner/admin panel (explicit).
- Razorpay / Twilio / Firebase / Cloudinary **stubbed**; user will provide keys later. AI (Gemini/Groq/GPT-4o) built with **smart fallbacks** so everything works with zero keys; add keys in `.env` to go live.
- Prisma pinned to **v6** (v7 needs driver-adapter config that broke `url` in schema). lucide-react dropped brand icons (Twitter/Facebook/Instagram) — use generic ones.

**Status:** All 7 pages + components + API + AI fallbacks built. `npm run build` passes clean (no type/lint errors); all 21 routes return 200; booking write→dashboard read verified. Dev: `npm run dev` (was running on :3000).

Not yet done / possible next steps: real API keys, deploy (Vercel), demo video, optional visual screenshot pass, before/after reel "wow" section.
