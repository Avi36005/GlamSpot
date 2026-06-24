# GlamSpot Mumbai 💄

> Mumbai's most beautiful salons, one tap away.

A city-based beauty-salon discovery & booking marketplace built for the **SuperXgen AI Startup Buildathon 2026**. Discover real Mumbai salons by locality, book appointments, get AI style recommendations from a selfie, chat with an AI booking assistant, and read AI-summarised reviews.

**Editorial-luxury design** · Playfair Display + DM Sans · rose `#C9184A` accent · Framer Motion + a WebGL hero throughout.

### 🔗 Live demo

**→ https://glamspot-mumbai-v2.web.app**

| | |
|---|---|
| **Hosting** | Firebase Hosting (Next.js web frameworks) |
| **Compute** | Google Cloud Run — 2nd-gen function `ssrglamspotmumbaiv2` (us-central1) |
| **GCP / Firebase project** | `mediflow-nexus-2026` |
| **Hosting site** | `glamspot-mumbai-v2` |

---

## ✨ Features

**Customer experience (8 pages / flows)**
- **Home** — WebGL/Three.js hero, category chips, trending salons, flash deals with live countdowns, AI style promo, home-service banner, smooth (Lenis) scroll.
- **Search & Discovery** — sidebar filters (locality multi-select, category, price slider, rating, open-now, home-service), sort, **grid + Leaflet map** views, mobile filter sheet.
- **Salon Detail** — gallery lightbox, Services / Staff / Reviews / About tabs, **AI Review Summary** card, mini-map, sticky booking bar.
- **Booking Flow** — 4-step stepper: Service → Staff → Date & Time → Confirm, real-time slot availability, Pay-at-Salon (Razorpay-ready).
- **Confirmation** — animated tick, copyable booking ID, Add-to-Calendar (.ics), WhatsApp reminder hook.
- **Dashboard** — Upcoming / Past / Saved / Profile, cancel booking, inline review modal.
- **AI Style Match** — upload a selfie → face-shape detection + hairstyle & colour recommendations → matched salons.
- **GlamBot Chat** — streaming AI booking assistant with inline salon cards.

**3 AI integrations** (live with keys, smart fallback without):

| Feature | Model | Provider | Fallback when no key |
|---|---|---|---|
| AI Style Recommender | `gemini-1.5-flash` (vision) | **Google Gemini API** | Heuristic by face shape |
| GlamBot Chat | `llama-3.3-70b-versatile` (SSE stream) | Groq | Keyword salon matcher |
| AI Review Summary | `llama-3.3-70b-versatile` | Groq | Sentiment heuristic |

> Every AI path has a deterministic fallback, so the whole app runs end-to-end with **zero API keys**. Add keys in `.env` to switch to the live models.

**Real data, not lorem ipsum** — the 12 seeded salons are **real Mumbai businesses synced from the Google Places API** (text search → place details → place photos), complete with addresses, geo-coordinates, ratings, review counts and photography.

---

## ☁️ Google Cloud Platform usage

This project uses Google Cloud / Firebase across **three** areas: hosting, AI, and real-world data.

### 1. Keys & environment variables

| Env var | Google product | Used for |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **Google Maps Platform** (Places API) | Syncing real salons: `place/textsearch`, `place/details`, and salon **photos** via `place/photo`. *(See `src/lib/google-places.ts`.)* |
| `GEMINI_API_KEY` | **Google Gemini API** (`generativelanguage.googleapis.com`) | AI Style Recommender — vision analysis of an uploaded selfie. |
| *(ADC / gcloud login)* | **Firebase / Cloud Run** | Deployment auth — the Firebase CLI authenticates via gcloud Application Default Credentials (no `firebase login` token committed). |

> Note: the on-screen **map** is rendered with **Leaflet + OpenStreetMap (Carto tiles)** — free, no key. The Google Maps Platform key is used server-side for the **Places API** (salon data + photos), not for map tiles.

### 2. GCP services / APIs enabled on `mediflow-nexus-2026`

- **Firebase Hosting API** — CDN + routing for the live site
- **Cloud Run Admin API** — runs the SSR Next.js function (2nd-gen)
- **Cloud Functions API** — web-frameworks function wrapper
- **Cloud Build API** — builds the deployment container
- **Artifact Registry API** — stores the built image
- **Cloud Billing API** — required by the deploy pre-check (Blaze plan)
- **Gemini API** (`generativelanguage.googleapis.com`) — AI style recommendations
- **Maps JavaScript API** + **Places API** (`maps-backend` / `places-backend`) — salon data & photos

### 3. Serverless Prisma + SQLite on Cloud Run

Cloud Run's filesystem is read-only except `/tmp`, which breaks Prisma + SQLite out of the box. The app works around this (see `src/lib/prisma.ts`, `next.config.ts`):

1. **Dynamic engine loading** — on Cloud Run (`process.env.K_SERVICE`), the Prisma `debian-openssl-3.0.x` query-engine binary is copied to `/tmp/prisma-engines/`, `chmod 0o755`, and `PRISMA_QUERY_ENGINE_LIBRARY` is pointed at it.
2. **Writable database** — the seed DB (`prisma/dev.db`) is copied to writable `/tmp/dev.db` at startup and `DATABASE_URL` is redirected there so CRUD works.
3. **Build staging** — `next.config.ts` (with `output: "standalone"`) stages `prisma/` and the generated client into the Firebase functions directory so engine versions match at runtime.
4. **Image delivery** — `images.unoptimized: true` serves images straight from the Google Places / Unsplash / Cloudinary CDNs, avoiding CPU-bound on-demand optimization on a single Cloud Run instance (and fixing the Places-photo → `lh3.googleusercontent.com` redirect that the Next optimizer rejects).

---

## 🧱 Tech stack

- **Next.js 16** (App Router, Turbopack) — frontend **and** backend (API routes) in one app
- **Prisma 6 + SQLite** — zero-setup relational database
- **Tailwind CSS v4** + **Framer Motion** (`motion`)
- **Three.js / @react-three/fiber + drei + postprocessing** — WebGL hero
- **Leaflet + react-leaflet** + OpenStreetMap (Carto tiles) for maps
- **Lenis** smooth scrolling, **lucide-react** icons, **next/font** (Playfair Display + DM Sans)

> Architecture note: the original brief specified a separate FastAPI + PostgreSQL + Redis backend. This was consolidated into Next.js full-stack for a single run command, one deploy target, and demo reliability. The API layer (`src/app/api/*`) maps 1:1 to the planned endpoints and ports cleanly to FastAPI later. Redis is stood in by an in-memory TTL cache (`src/lib/cache.ts`).

---

## 🚀 Local setup

```bash
npm install
npx prisma generate     # generates client incl. debian engine (binaryTargets in schema)
npx prisma db push      # creates prisma/dev.db
npm run db:seed         # seeds real Mumbai salons + services, staff, reviews
npm run dev             # http://localhost:3000
```

Optional: `cp .env.example .env` and add keys to switch from fallbacks to live models / live Google Places sync. **Everything runs without any keys.**

Scripts: `npm run dev | build | start | lint | db:seed | db:push | db:studio`

---

## ☁️ Deploying to Firebase / GCP

The app deploys to **Firebase Hosting via Next.js web frameworks**, which provisions a **Cloud Run** SSR function automatically.

```bash
# 1. Generate the Prisma client (MUST include the debian engine for Cloud Run).
#    package.json `build` is just `next build` and does NOT run this.
npx prisma generate

# 2. Deploy. Firebase CLI authenticates via gcloud ADC (no interactive login).
npx firebase-tools@latest deploy --only hosting --project mediflow-nexus-2026
```

**First-time / troubleshooting notes**
- **Auth:** uses gcloud Application Default Credentials — `gcloud auth application-default login` once; no `firebase login` needed.
- **Billing pre-check:** the deploy calls the Cloud Billing API. If it 429s against the shared quota bucket (`consumer project_number:764086051850`), set the ADC quota project and enable the API:
  ```bash
  gcloud auth application-default set-quota-project mediflow-nexus-2026
  gcloud services enable cloudbilling.googleapis.com --project mediflow-nexus-2026
  ```
- **Config:** project in `.firebaserc` (`mediflow-nexus-2026`), hosting site in `firebase.json` (`glamspot-mumbai-v2`).

---

## 🗂️ Structure

```
src/
  app/
    page.tsx                       Home (WebGL hero)
    search/                        Discovery (grid + Leaflet map)
    salon/[id]/                    Salon detail
    book/[salonId]/                Booking flow
    booking-confirmed/[id]/        Confirmation
    dashboard/                     User dashboard
    style-ai/                      AI Style Match (Gemini vision)
    chat/                          GlamBot (Groq stream)
    api/                           REST backend (salons, bookings, reviews, users, ai)
  components/
    3d/                            ThreeGLHero (WebGL)
    home/ salon/ booking/ chat/    Feature components (SalonCard, SlotGrid, ChatBubble, ...)
    layout/ motion/ ui/            Navbar, Footer, SmoothScroll, page transitions, primitives
  lib/
    prisma.ts                      Prisma client + Cloud Run /tmp sync
    google-places.ts               Live salon sync via Google Places API
    ai.ts  groq.ts                 Gemini (vision) / Groq Llama 3.3 (chat + summaries, key rotation) + fallbacks
    cache.ts data.ts api.ts        In-memory TTL cache, data access, client helpers
    auth.ts serialize.ts           Mock auth, Prisma→JSON serialization
    constants.ts types.ts utils.ts Localities, categories, types, helpers
prisma/
  schema.prisma                    binaryTargets = ["native", "debian-openssl-3.0.x"]
  seed.ts  real_salons*.json       Seed script + Google-Places-sourced salon data
```

### REST API (`src/app/api`)
`GET/POST /salons`, `GET /salons/[id]`, `/salons/[id]/reviews`, `/salons/[id]/slots` ·
`GET/POST /bookings`, `GET/PATCH/DELETE /bookings/[id]` ·
`POST /reviews` ·
`GET /users/[id]/bookings`, `GET/POST/DELETE /users/[id]/saved-salons[/...]` ·
`POST /ai/chat` (stream), `POST /ai/style-recommend`, `GET /ai/review-summary/[salonId]`

---

## 🏙️ Seed data
12 **real Mumbai salons** sourced from the Google Places API across localities including Bandra, Andheri, Juhu, Powai, Colaba, Dadar, Borivali & Worli — with services, staff, ratings, reviews and live photography.

---

Built with AI · Next.js · Google Cloud Run · Gemini · Groq (Llama 3.3 70B) — for SuperXgen Buildathon 2026.
