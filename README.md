# Museum of Failures

A digital museum that preserves personal failures as curated artifacts. Each
"exhibit" is a failure story enriched with AI reflection, a psychological
genome, an evolution lineage, an emotional knowledge graph, and optional spoken
audio.

This document describes the system architecture, data model, API surface, and
local development workflow.

---

## 1. Tech stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Three Fiber, Zustand, TanStack Query, sonner |
| Backend | NestJS 11, TypeScript, Prisma 6 |
| Database | PostgreSQL |
| Realtime | Socket.IO (`@nestjs/websockets`) |
| Object storage | Cloudflare R2 (S3-compatible, `@aws-sdk/client-s3`) |
| AI | OpenAI (`gpt-4o` chat, `text-embedding-3-small`, `whisper-1`) |
| Hardening | Helmet, `@nestjs/throttler`, cookie-based sessions |

Requirements: Node ≥ 20, pnpm 11, a PostgreSQL instance.

---

## 2. Repository layout

```
.
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # single source of truth for the DB
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── main.ts           # bootstrap: CORS, Helmet/CSP, ValidationPipe
│   │       ├── app.module.ts     # module registry + global throttler
│   │       └── modules/
│   │           ├── prisma/       # PrismaService (shared)
│   │           ├── auth/         # anonymous / pseudonym / email sessions
│   │           ├── exhibit/      # exhibit CRUD, filters, evolution tree (F4)
│   │           ├── emotion/      # reaction glyphs, "you are not alone"
│   │           ├── room/         # 8 themed rooms, random walk, last attempts
│   │           ├── artifact/     # R2 uploads (image/audio/pdf/code/…)
│   │           ├── ai-reflection/# curator + multi-persona reflections (F2)
│   │           ├── genome/       # practical + emotional DNA (F3)
│   │           ├── constellation/# embeddings + relationship graph (F1)
│   │           ├── audio/        # audio upload + transcription pipeline (F5)
│   │           ├── time-capsule/ # sealed messages, legacy vault
│   │           ├── socket/       # realtime gateway
│   │           └── decay/        # scheduled artifact "decay" job
│   └── frontend/                # Next.js app
│       └── src/
│           ├── app/             # routes (App Router)
│           ├── components/      # lamplit/ design system + feature components
│           ├── lib/             # api client, motion presets, constants, utils
│           └── stores/          # Zustand stores
├── packages/
│   └── shared/                  # @museum/shared — enums + view types
└── docs/                        # specs and design notes
```

---

## 3. Local setup

```bash
pnpm install

# 1. Configure environment
cp apps/backend/.env.example apps/backend/.env   # then fill values
# create apps/frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:4000

# 2. Provision the database schema
pnpm db:generate     # generate the Prisma client
pnpm db:push         # apply schema.prisma to the database
pnpm --filter @museum/backend db:seed   # optional: seed rooms + sample data

# 3. Run everything
pnpm dev             # turbo: backend on :4000, frontend on :3000
```

> **Schema changes use `db push`, not `migrate`.** This project has no
> `prisma/migrations` history; `prisma migrate dev` will report drift and try to
> reset the database. Always apply schema changes with `pnpm db:push`.

> **Windows note:** if `prisma generate` fails with `EPERM` on
> `query_engine-windows.dll.node`, stop `pnpm dev` first (the running server
> locks the engine binary), then regenerate.

---

## 4. Environment variables

Backend (`apps/backend/.env`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `PORT` | API port (default `4000`) |
| `JWT_SECRET` | Cookie/session signing secret |
| `OPENAI_API_KEY` | Enables all AI features; absent → graceful fallbacks |
| `AI_MODEL` | Chat model (default `gpt-4o`) |
| `CONSTELLATION_AUTO_REBUILD` | `true` enables a daily scheduled constellation rebuild (default off; use the `POST /constellation/rebuild` endpoint or UI button otherwise) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 storage (artifacts + audio) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Reserved for OAuth (optional) |

Frontend (`apps/frontend/.env.local`):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:4000`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata |

All AI and storage features **degrade gracefully** when their keys are missing:
reflections/genomes return neutral fallbacks, audio stays in the `uploaded`
state, and the constellation falls back to non-embedding edge types.

---

## 5. Data model

Defined in `apps/backend/prisma/schema.prisma`. Models (13):

| Model | Notes |
|-------|-------|
| `User` | anonymous / pseudonym / real-name identity modes |
| `Exhibit` | the core failure record; also holds `embedding Float[]`, `impactScore`, `parentFailureId` (self-relation), `evolutionStatus`, `recoveredAt` |
| `MuseumRoom` | 8 themed rooms |
| `Artifact` | uploaded media tied to an exhibit |
| `ExhibitReaction` | emotional reaction glyphs (unique per user/exhibit/type) |
| `AIReflection` | curator reflection; `persona` column + `@@unique([exhibitId, persona])` cache |
| `FailureGenome` | one practical + emotional trait profile per exhibit |
| `FailureConnection` | precomputed graph edges (`type`, `strength`) |
| `AudioStory` | audio file ref + transcript/summary/emotion timeline + status |
| `TimeCapsule` | sealed future messages |
| `EmotionalAnalytics`, `CuratedExhibition`, `MuseumState` | aggregate/ambient state |

Enums (11): `ExhibitionCategory`, `MuseumRoomSlug`, `EmotionalReactionType`,
`EndingStatusType`, `RecoveryStatusType`, `VisibilityMode`, `ArtifactType`,
`CuratorPersona`, `EvolutionStatus`, `FailureRelationType`, `AudioStoryStatus`.

Shared TypeScript views/enums for the frontend live in
`packages/shared/src/index.ts`.

---

## 6. API reference

REST, JSON, cookie credentials. AI/upload routes are throttled per IP.

### Auth — `/auth`
`POST /anonymous` · `POST /register` · `POST /login` · `POST /pseudonym` ·
`POST /logout` · `GET /user/:userId` · `POST /identity-mode/:userId`

### Exhibits — `/exhibits`
`GET /` (filters: `category`, `roomId`, `userId`, `endingStatus`,
`recoveryStatus`, `minPain`, `maxPain`, `emotionalTags`, `search`, `limit`,
`offset`, `sortBy`, `sortOrder`) · `GET /one-sentence` · `GET /unread` ·
`GET /emotional-search?q=` · `GET /:id` · `GET /:id/similar` ·
**`GET /:id/evolution`** (lineage tree + recovery metrics) · `POST /` ·
`PUT /:id` · `DELETE /:id` · `POST /:id/retry`

### Emotions — `/emotions`
`POST /:exhibitId/react/:reaction` · `GET /:exhibitId/reactions` ·
`GET /:exhibitId/not-alone`

### Rooms — `/rooms`
`GET /` · `GET /random-walk` · `GET /last-attempts` · `GET /:slug`

### Artifacts — `/artifacts`
`POST /upload/:exhibitId/:type` (multipart) · `GET /:id/url` ·
`GET /exhibit/:exhibitId`

### AI reflection — `/ai-reflection`
`POST /generate/:exhibitId` (default curator) ·
**`POST /generate/:exhibitId/:persona`** (`historian|engineer|therapist|founder|philosopher`) ·
`GET /curated-exhibitions` · `POST /curator` (chat)

### Genome — `/genome`
**`POST /generate/:exhibitId`** · **`GET /compare/:aId/:bId`**

### Constellation — `/constellation`
**`GET /graph`** (nodes + precomputed edges) · **`POST /rebuild`** (recompute
embeddings + edges; run after seeding/bulk import)

### Audio — `/audio`
**`POST /:exhibitId`** (multipart upload, ≤ 25 MB, `audio/*`) ·
**`GET /:exhibitId`** (with signed playback URL) ·
**`POST /:exhibitId/process`** (Whisper → summary → emotion timeline) ·
**`DELETE /:exhibitId`**

### Time capsule — `/time-capsule`
`POST /` · `GET /user/:userId` · `GET /:id/:userId` ·
`POST /legacy/:userId/:exhibitId` · `GET /legacy/:userId`

### Realtime
Socket.IO gateway broadcasts exhibit-created and room presence events.

---

## 7. Frontend routes

`/` (landing) · `/exhibits` (filterable archive) · `/exhibits/create`
(5-step form) · `/exhibits/[id]` (detail: story, reactions, persona curators,
evolution tree, genome, audio) · `/rooms`, `/rooms/[slug]`,
`/rooms/random-walk`, `/rooms/last-attempts` · `/curator` · `/constellation`
(knowledge graph) · `/time-capsule` · `/legacy` · `/about` · `/auth`.

The frontend talks to the backend through the typed client in
`apps/frontend/src/lib/api.ts`.

---

## 8. Design system — "Lamplit Archive"

A warm, editorial, light-first system. Tokens live in
`apps/frontend/src/app/globals.css`; component primitives in
`apps/frontend/src/components/lamplit/`.

- **Surfaces:** `bone` (page), `paper` (cards), `vellum` (wells). Never pure white/black.
- **Ink:** `ink`, `ink-muted`, `whisper` (all meet WCAG AA contrast).
- **Accent:** a single `brass` for CTAs, focus rings, links, active states.
- **Type:** Fraunces (display), Geist (sans/body), JetBrains Mono (labels/IDs).
- **Motion:** one canonical spring; a global route crossfade (`app/template.tsx`);
  `prefers-reduced-motion` honored throughout.

---

## 9. The five flagship features

1. **Multi-Persona Curators** — five lenses (Historian, Engineer, Therapist,
   Founder, Philosopher) generate distinct reflections per exhibit, cached per
   `(exhibit, persona)`.
2. **Failure Evolution Tree** — exhibits link via `parentFailureId`; the detail
   page renders the lineage with recovery metrics (attempts, retries,
   time-to-recover).
3. **Failure Genome** — AI-derived practical (8) + emotional (6) trait scores,
   shown as a radar + bars, with a two-failure comparison mode.
4. **Constellation 2.0** — embeddings drive precomputed similarity edges
   (emotion / lesson / category / cause / journey); an interactive SVG graph
   supports zoom, pan, rotate, search, focus, and edge filtering.
5. **Audio Story Exhibits** — upload audio → Whisper transcription → AI summary,
   lessons, and an emotion timeline; a player with searchable, click-to-seek
   transcript.

Design notes and per-feature specs: `docs/superpowers/specs/`.

---

## 10. Scripts

Run from the repo root:

| Command | Action |
|---------|--------|
| `pnpm dev` | Run backend + frontend in watch mode |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | `tsc --noEmit` across workspaces |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all workspaces |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:push` | Apply `schema.prisma` to the database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm --filter @museum/backend db:seed` | Seed rooms + sample data |

---

## 11. Testing

Backend uses Jest. Service logic is unit-tested with stubbed Prisma/OpenAI
clients (no DB or network required):

```bash
pnpm --filter @museum/backend exec jest
```

Coverage includes exhibit filter shaping, evolution-tree construction + metrics,
curator persona prompts, and genome clamping + similarity math.

---

## 12. Security notes

- All AI/upload endpoints are rate-limited (`@nestjs/throttler`); a global
  default plus per-route limits.
- Helmet sets a strict CSP in production; CORS is restricted to `FRONTEND_URL`.
- Treat external/audio/transcript content as untrusted user input.
- The audio and constellation endpoints are currently unauthenticated at the
  route level (consistent with the rest of the public API); add an auth guard
  before exposing write endpoints publicly.

---

## 13. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `@prisma/client` has no exported members; `PrismaService` has no model delegates | Client not generated → `pnpm db:generate` (stop `pnpm dev` first on Windows) |
| `prisma migrate dev` reports drift / wants to reset | This repo uses `db push`; run `pnpm db:push` instead |
| `EPERM ... query_engine-windows.dll.node` | Dev server locks the engine; stop `pnpm dev`, regenerate, restart |
| Constellation graph empty | Run `POST /constellation/rebuild` after seeding |
| Reflections/genome return neutral text | `OPENAI_API_KEY` not set |
| Audio stuck on `uploaded` | `OPENAI_API_KEY` (Whisper) and/or R2 not configured |
