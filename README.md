# GlamSpot Mumbai 💄

> Mumbai's most beautiful salons, one tap away.

A city-based beauty salon discovery & booking marketplace built for the **SuperXgen AI Startup Buildathon 2026**. Discover salons by locality, book appointments, get AI style recommendations, chat with an AI booking assistant, and read AI-summarised reviews.

**Editorial-luxury design** · Playfair Display + DM Sans · rose `#C9184A` accent · Framer Motion throughout.

---

## ✨ Features

**Customer experience (7 pages)**
- **Home** — cinematic video hero, category chips, trending salons, flash deals with live countdowns, AI style promo, home-service banner.
- **Search & Discovery** — sidebar filters (locality, category, price slider, rating, open-now, home-service), sort, **grid + Leaflet map** views, mobile filter sheet.
- **Salon Detail** — gallery lightbox, Services / Staff / Reviews / About tabs, **AI Review Summary** card, mini-map, sticky booking bar.
- **Booking Flow** — 4-step stepper: Service → Staff → Date & Time → Confirm, real-time slots, Pay-at-Salon (Razorpay-ready).
- **Confirmation** — animated tick, copyable booking ID, Add-to-Calendar (.ics), WhatsApp reminder.
- **Dashboard** — Upcoming / Past / Saved / Profile, cancel, inline review modal.
- **AI Style Match** — upload a selfie → face shape + hairstyle & colour recommendations → matched salons.
- **GlamBot Chat** — streaming AI booking assistant with inline salon cards.

**3 AI integrations** (live with keys, smart fallback without):
| Feature | Model | Fallback |
|---|---|---|
| Style Recommender | Gemini 1.5 Flash (vision) | Heuristic by face shape |
| GlamBot Chat | Groq Llama 3.3 70B (SSE stream) | Keyword salon matcher |
| Review Summary | OpenAI GPT-4o | Sentiment heuristic |

---

## 🧱 Tech stack

- **Next.js 16** (App Router) — frontend **and** backend (API routes) in one app
- **Prisma + SQLite** — zero-setup relational database
- **Tailwind CSS v4** + **Framer Motion** (`motion`)
- **Leaflet** + OpenStreetMap (Carto tiles) for maps
- **lucide-react** icons, **next/font** (Playfair Display + DM Sans)

> Architecture note: the original brief specified a separate FastAPI + PostgreSQL + Redis backend. This was consolidated into Next.js full-stack for a single run command, one deploy target, and demo reliability. The API layer (`src/app/api/*`) maps 1:1 to the planned endpoints and ports cleanly to FastAPI later. Redis is stood in by an in-memory TTL cache (`src/lib/cache.ts`).

---

## 🚀 Local setup

```bash
npm install
npx prisma generate
npx prisma db push      # creates prisma/dev.db
npm run db:seed         # 8 Mumbai salons + services, staff, reviews
npm run dev             # http://localhost:3000
```

Optional: `cp .env.example .env` and add AI keys to switch from fallbacks to live models. Everything runs without any keys.

Scripts: `npm run dev | build | start | db:seed | db:push | db:studio`

---

## 🗂️ Structure

```
src/
  app/
    page.tsx                       Home
    search/                        Discovery (grid + map)
    salon/[id]/                    Salon detail
    book/[salonId]/                Booking flow
    booking-confirmed/[id]/        Confirmation
    dashboard/                     User dashboard
    style-ai/                      AI Style Match
    chat/                          GlamBot
    api/                           REST backend (salons, bookings, reviews, users, ai)
  components/                      SalonCard, ServiceCard, ReviewCard, SlotGrid, ChatBubble, ...
  lib/                             prisma, data, ai, api, types, utils, cache
prisma/                           schema.prisma + seed.ts
```

## 🏙️ Seed data
8 real Mumbai salons across Bandra, Andheri, Juhu, Powai, Colaba, Dadar, Borivali & Worli — with services, staff, ratings and reviews.

---

Built with AI · Next.js · Gemini · Groq · GPT-4o — for SuperXgen Buildathon 2026.
