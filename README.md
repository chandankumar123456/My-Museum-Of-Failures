# My Museum of Failures

> An emotionally immersive digital museum where failures, regrets, and abandoned dreams are preserved as meaningful artifacts — not hidden.

This document is the technical reference for the codebase. For product philosophy and feature scope see [`.planning/PROJECT.md`](.planning/PROJECT.md), [`.planning/REQUIREMENTS.md`](.planning/REQUIREMENTS.md), and [`.planning/ROADMAP.md`](.planning/ROADMAP.md).

---

## 1. Overview

| | |
| --- | --- |
| **Type** | Full-stack monorepo (pnpm + Turborepo) |
| **Frontend** | Next.js 15 App Router, TypeScript, Tailwind v4, Framer Motion, React Three Fiber, Zustand |
| **Backend** | NestJS 11, Prisma 6, PostgreSQL, Socket.IO, Cloudflare R2, OpenAI |
| **Languages** | TypeScript (strict mode) only |
| **Node** | `>= 20` |
| **Package manager** | `pnpm@11` |

Both apps build clean. The frontend produces 14 routes (12 static, 2 dynamic). The backend produces a NestJS dist with 8 feature modules and a WebSocket gateway.

---

## 2. Repository Layout

```
museum-of-failures/
├── apps/
│   ├── frontend/              Next.js 15 application
│   │   ├── src/
│   │   │   ├── app/           App Router pages (14 routes)
│   │   │   ├── components/    React components, grouped by domain
│   │   │   │   ├── 3d/        React Three Fiber museum scenes
│   │   │   │   ├── ai/        Curator chat + reflection panel
│   │   │   │   ├── audio/     Howler-style ambient manager
│   │   │   │   ├── auth/      AuthBootstrap, IdentityBadge
│   │   │   │   ├── effects/   Memory decay overlays
│   │   │   │   ├── emotions/  Reactions, "You Are Not Alone"
│   │   │   │   ├── exhibits/  Card, detail, multi-step form
│   │   │   │   ├── museum/    Layout, navigation, atmosphere, particles
│   │   │   │   ├── rooms/     Room card, room atmosphere effect
│   │   │   │   └── time-capsule/  Capsule create
│   │   │   ├── lib/           api, constants, utils, motion presets
│   │   │   └── stores/        Zustand stores (auth, exhibit, atmosphere, audio)
│   │   ├── next.config.ts
│   │   └── tsconfig.json
│   └── backend/               NestJS 11 application
│       ├── prisma/
│       │   ├── schema.prisma  11 models, 7 enums
│       │   └── seed.ts        Museum room seeder
│       └── src/
│           ├── main.ts        Bootstrap (helmet, CORS, validation)
│           ├── app.module.ts  Composition root
│           └── modules/
│               ├── ai-reflection/   OpenAI reflections + curator chat
│               ├── artifact/        R2 uploads + signed URLs
│               ├── auth/            Anonymous, pseudonym, email accounts
│               ├── emotion/         Reactions + similarity engine
│               ├── exhibit/         Exhibit CRUD + emotional search
│               ├── prisma/          Shared PrismaService
│               ├── room/            8 themed rooms + random walk
│               ├── socket/          Real-time gateway
│               └── time-capsule/    Locked messages + legacy vault
├── packages/
│   └── shared/                Shared TypeScript types & enums
├── package.json               Workspace root scripts
├── pnpm-workspace.yaml
├── tsconfig.json              Base TS config
└── turbo.json                 Turborepo pipeline
```

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Browser                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 App Router (RSC + Client Components)           │ │
│  │  • Tailwind v4 design tokens                                │ │
│  │  • Framer Motion (cinematic transitions)                    │ │
│  │  • React Three Fiber (3D museum spaces)                     │ │
│  │  • Zustand (auth, exhibit filters, atmosphere, audio)       │ │
│  │  • TanStack Query (server state)                            │ │
│  │  • Howler-shaped audio manager                              │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP / JSON  +  Socket.IO
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                       NestJS 11 backend                         │
│  • Helmet + CORS + ValidationPipe                               │
│  • Modular feature DI                                           │
│  ┌──────────────┬──────────────┬─────────────┬───────────────┐  │
│  │ ExhibitModule│ EmotionModule│ RoomModule  │ AuthModule    │  │
│  ├──────────────┼──────────────┼─────────────┼───────────────┤  │
│  │ ArtifactModule│ AiReflection │ TimeCapsule │ SocketGateway │  │
│  └──────┬───────┴──────┬───────┴──────┬──────┴──────┬────────┘  │
│         └──────────────┴──────────────┴─────────────┘           │
│                              │                                  │
│                       PrismaService                             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌────────────┐     ┌────────────┐     ┌────────────┐
       │ PostgreSQL │     │   OpenAI   │     │ Cloudflare │
       │   (Neon)   │     │  (gpt-4o)  │     │     R2     │
       └────────────┘     └────────────┘     └────────────┘
```

### Data flow

1. The browser loads the App Router shell. `Providers` wraps the tree with `QueryClientProvider`, `ThemeProvider`, and the `AuthBootstrap` effect.
2. `AuthBootstrap` calls `POST /auth/anonymous` once per visitor, receives a `userId`, and persists it through `zustand/middleware/persist` in `localStorage` under `museum-auth`.
3. Pages call typed methods on `apps/frontend/src/lib/api.ts`, which throws `ApiError` on non-2xx so TanStack Query can surface failures.
4. The NestJS controllers delegate to services, which use `PrismaService` for queries and `OpenAI` / `S3Client` for the AI and storage modules.
5. The `SocketGateway` accepts WebSocket connections for room presence and live atmosphere events (extension point — gateway is wired and CORS-aware).

---

## 4. Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend framework | Next.js `15.5.x` | App Router, RSC, edge-friendly. |
| Language | TypeScript `5.9` | `strict: true`, `strictNullChecks`, `noImplicitAny`. |
| Styling | Tailwind CSS v4 | `@theme` tokens, `@layer components`, custom keyframes. |
| Animation | Framer Motion `12` | Slow easings (`[0.16,1,0.3,1]`), respects `prefers-reduced-motion`. |
| 3D | React Three Fiber `9`, Drei `10`, postprocessing | Bloom + Vignette + atmospheric particles. |
| State | Zustand `5` | Persistent auth, transient atmosphere/audio/exhibit. |
| Server state | TanStack Query `5` | 60s `staleTime`, 1 retry, no focus refetch. |
| Forms | React Hook Form + zod | Multi-step exhibit creation form. |
| Toasts | Sonner | Themed to match museum palette. |
| Backend framework | NestJS `11` | Modular, decorator-driven controllers. |
| ORM | Prisma `6` | Generated client with strict typing. |
| Database | PostgreSQL `15+` | 11 relational models, generous indexing. |
| Storage | Cloudflare R2 | S3-compatible, accessed via `@aws-sdk/client-s3`. |
| AI | OpenAI `gpt-4o` (default) | JSON mode for reflections, plain text for curator. |
| Real-time | Socket.IO `4.8` | NestJS `@WebSocketGateway`. |
| Security | Helmet | CSP intentionally disabled (Next + R2 image policy). |

---

## 5. Setup

### 5.1 Prerequisites

- Node.js `>= 20`
- pnpm `>= 8` (the repo pins `pnpm@11`)
- A PostgreSQL database (local or Neon)
- Optional: Cloudflare R2 bucket, OpenAI API key

### 5.2 Install

```bash
git clone <your-fork-or-repo>
cd "My Museum Of Failures"
pnpm install
```

### 5.3 Configure environment

Copy and fill the backend env:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Frontend env:

```bash
echo NEXT_PUBLIC_API_URL=http://localhost:4000 > apps/frontend/.env.local
```

See [§9 Environment Variables](#9-environment-variables) for every key.

### 5.4 Generate the Prisma client and apply schema

```bash
pnpm db:generate         # generates the typed client into node_modules
pnpm db:push             # creates tables in the configured DATABASE_URL
pnpm --filter @museum/backend db:seed   # seeds the 8 museum rooms
```

### 5.5 Run

```bash
# both apps in parallel
pnpm dev

# frontend only (port 3000)
pnpm --filter @museum/frontend dev

# backend only (port 4000)
pnpm --filter @museum/backend dev
```

### 5.6 Build / typecheck

```bash
pnpm build                                        # turbo-coordinated
pnpm --filter @museum/backend exec tsc --noEmit   # backend types
pnpm --filter @museum/frontend exec tsc --noEmit  # frontend types
```

---

## 6. Database Schema

11 models, 7 enums. See [`apps/backend/prisma/schema.prisma`](apps/backend/prisma/schema.prisma) for the source of truth.

### 6.1 Models

| Model | Purpose | Key fields |
| --- | --- | --- |
| `User` | Visitor identity (anonymous, pseudonym, real name). | `id`, `email?` (unique), `passwordHash?`, `pseudonym?` (unique), `identityMode`, `isAnonymous`, `legacyExhibitId?` |
| `Exhibit` | A preserved failure. | `exhibitId` (public id), `title`, `category`, `story`, `expectedOutcome`, `actualOutcome`, `lessonLearned`, `painLevel`, `regretLevel`, `recoveryProgress`, `endingStatus`, `recoveryStatus`, `decayLevel`, `viewCount`, `isOneSentence`, `isHidden` |
| `MuseumRoom` | One of 8 themed rooms. | `slug` (unique enum), `name`, `ambience`, `lighting`, `orderIndex` |
| `Artifact` | File attached to an exhibit. | `type`, `url` (R2 key), `filename`, `mimeType`, `size`, `decayed` |
| `ExhibitReaction` | One emotional reaction. | `reaction` (enum), `userId?`, unique on `(exhibitId, userId, reaction)` |
| `AIReflection` | Generated curator reflection. | `emotionalSummary`, `patterns[]`, `reframing`, `observations` |
| `TimeCapsule` | Locked message to future self. | `unlockDate`, `isLocked`, `openedAt?` |
| `EmotionalAnalytics` | Per-user aggregates (private). | `totalPain`, `totalRegret`, `dominantEmotion` |
| `CuratedExhibition` | Editorial collections. | `title`, `theme`, `isActive` |
| `MuseumState` | Global atmosphere state. | `weather`, `lighting`, `intensity` |

### 6.2 Enums

`ExhibitionCategory` (15), `MuseumRoomSlug` (8), `EmotionalReactionType` (6), `EndingStatusType` (5), `RecoveryStatusType` (6), `VisibilityMode` (3), `ArtifactType` (6).

### 6.3 Indexes

`Exhibit` is indexed on `category`, `roomId`, `userId`, `createdAt`, `painLevel`, `endingStatus`. `ExhibitReaction` is indexed on `exhibitId`. `TimeCapsule` is indexed on `userId` and `unlockDate`.

---

## 7. Backend API

Base URL: `process.env.FRONTEND_URL` is the only allowed CORS origin in production. All endpoints return JSON.

### 7.1 Auth

| Method | Path | Body / Params | Notes |
| --- | --- | --- | --- |
| POST | `/auth/anonymous` | — | Creates an anonymous user and returns `{ userId, identityMode, isAnonymous }`. |
| POST | `/auth/register` | `{ email, password, displayName? }` | Hashes with `scrypt` + per-user salt. |
| POST | `/auth/login` | `{ email, password }` | Constant-time verify. |
| POST | `/auth/pseudonym` | `{ pseudonym }` | Pseudonym must be unique, ≥ 2 chars. |
| GET | `/auth/user/:userId` | — | Sanitized user (no `passwordHash`). |
| POST | `/auth/identity-mode/:userId` | `{ mode: 'anonymous' \| 'pseudonym' \| 'real_name' }` | |

### 7.2 Exhibits

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/exhibits` | Filters: `category`, `roomId`, `endingStatus`, `recoveryStatus`, `minPain`, `maxPain`, `emotionalTags`, `search`, `limit`, `offset`, `sortBy`, `sortOrder`. |
| GET | `/exhibits/one-sentence` | One-sentence confessions. |
| GET | `/exhibits/unread` | Exhibits with `viewCount === 0`. |
| GET | `/exhibits/emotional-search?q=` | Searches `emotionalTags`, `emotionalState`, `story`. |
| GET | `/exhibits/:id` | Increments `viewCount`. |
| GET | `/exhibits/:id/similar` | Same category / overlapping tags / same ending. |
| POST | `/exhibits` | Create with full metadata, optional `userId`. |
| PUT | `/exhibits/:id` | Partial update. |
| DELETE | `/exhibits/:id` | Hard delete. |
| POST | `/exhibits/:id/retry` | Increments `retryCount`. |

### 7.3 Emotions

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/emotions/:exhibitId/react/:reaction?userId=` | Toggles for known users; appends for anonymous. |
| GET | `/emotions/:exhibitId/reactions` | Returns `{ total, counts, reactions }`. |
| GET | `/emotions/:exhibitId/not-alone` | Related exhibits (You Are Not Alone). |

### 7.4 Rooms

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/rooms` | Ordered by `orderIndex`, includes exhibit count. |
| GET | `/rooms/random-walk` | 10 randomly offset exhibits. |
| GET | `/rooms/last-attempts` | `wouldRetry: true` and `retryCount >= 1`. |
| GET | `/rooms/:slug` | Room + 20 newest exhibits. |

### 7.5 Artifacts

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/artifacts/upload/:exhibitId/:type` | `multipart/form-data`, max 10MB. |
| GET | `/artifacts/:id/url` | Signed R2 URL, 1h TTL. |
| GET | `/artifacts/exhibit/:exhibitId` | Lists all artifacts. |

### 7.6 AI

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/ai-reflection/generate/:exhibitId` | Returns existing reflection if present. |
| GET | `/ai-reflection/curated-exhibitions` | 5 themed collections. |
| POST | `/ai-reflection/curator` | `{ message, context? }`. |

### 7.7 Time capsule + legacy

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/time-capsule` | `{ userId, title, message, unlockDate }`. |
| GET | `/time-capsule/user/:userId` | Auto-unlocks anything past `unlockDate`. |
| GET | `/time-capsule/:id/:userId` | Hides the message until unlocked. |
| POST | `/time-capsule/legacy/:userId/:exhibitId` | Pins one exhibit as legacy. |
| GET | `/time-capsule/legacy/:userId` | Returns the pinned exhibit (if any). |

### 7.8 WebSocket gateway

`SocketGateway` listens on the same HTTP port. Events: `joinRoom(slug)`, `leaveRoom(slug)`. Extend with broadcast events for live ambience as the platform grows.

---

## 8. Frontend Routes

| Route | Type | Description |
| --- | --- | --- |
| `/` | Static | Landing with entrance door, particles, flicker title. |
| `/exhibits` | Static + client query | Archive with filters and skeletons. |
| `/exhibits/[id]` | Dynamic | Detail page: two-panel storytelling, lessons, reactions, AI reflection, "You Are Not Alone". |
| `/exhibits/create` | Static (CSR-driven) | Multi-step exhibit creation form. |
| `/rooms` | Static | Gallery of 8 themed rooms + random walk + last attempts. |
| `/rooms/[slug]` | Dynamic | Room with up to 20 newest exhibits and matched atmosphere. |
| `/rooms/random-walk` | Static | Random exhibits, refreshable. |
| `/rooms/last-attempts` | Static | Retry-focused exhibits. |
| `/curator` | Static | Curator entry point (chat is global via floating button). |
| `/time-capsule` | Static | Locked + unlocked capsules per user. |
| `/legacy` | Static | Pin one exhibit as a permanent legacy. |
| `/constellation` | Static | SVG node graph clustered by category, sized by pain. |
| `/about` | Static | Philosophy and feature overview. |
| `/_not-found` | Static | "This exhibit has been lost to time." |

---

## 9. Environment Variables

### 9.1 Backend (`apps/backend/.env`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | — | PostgreSQL connection string. |
| `FRONTEND_URL` | no | `http://localhost:3000` | CORS allow-list (single origin). |
| `PORT` | no | `4000` | Server port. |
| `JWT_SECRET` | no | — | Reserved for future signed cookies. |
| `OPENAI_API_KEY` | no | — | Disables AI features when missing. |
| `AI_MODEL` | no | `gpt-4o` | OpenAI model override. |
| `R2_ACCOUNT_ID` | no | — | Cloudflare R2 account. |
| `R2_ACCESS_KEY_ID` | no | — | R2 access key. |
| `R2_SECRET_ACCESS_KEY` | no | — | R2 secret. |
| `R2_BUCKET_NAME` | no | `museum-artifacts` | Target bucket. |
| `R2_PUBLIC_URL` | no | — | Public CDN base for served artifacts. |
| `GOOGLE_CLIENT_ID` / `_SECRET` | no | — | Reserved for future OAuth. |

### 9.2 Frontend (`apps/frontend/.env.local`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | yes | `http://localhost:4000` | Browser-visible API base. |

---

## 10. Design Tokens

Defined in [`apps/frontend/src/app/globals.css`](apps/frontend/src/app/globals.css) inside `@theme`.

| Token | Hex | Role |
| --- | --- | --- |
| `museum-50 … 950` | `#f7f5f0 … #2a2420` | Surfaces and borders. |
| `ember`, `ember-light`, `ember-dark` | `#d4592b`, `#e87a4a`, `#a8431e` | Primary accent (the only warm color). |
| `void`, `void-light`, `shadow` | `#0d0b0a`, `#1a1513`, `#1e1a18` | Background depth. |
| `whisper`, `whisper-light`, `whisper-dark` | `#c4bcb0`, `#e0dad0`, `#8a7b63` | Text. |
| `rot`, `rot-light`, `fade` | — | Decay motifs. |

Typography:

- `EB Garamond` — serif, used for titles and emotional copy.
- `Inter` — sans, used for UI controls and metadata.
- `JetBrains Mono` — mono, used for exhibit IDs and tags.

Reusable utilities: `museum-card`, `glass-pane`, `museum-glow`, `museum-divider`, `film-grain`, `decayed-text`. Reusable keyframes: `flicker`, `pulse-slow`, `breathe`, `glow`, `dust-drift`, `shimmer`. The site honors `prefers-reduced-motion`.

Shared motion presets live in [`apps/frontend/src/lib/motion.ts`](apps/frontend/src/lib/motion.ts) — use `fadeUp`, `fadeIn`, `stagger`, `cinematicEntrance`, `slowFade` instead of inline variants.

---

## 11. State Management

| Store | Persistence | Purpose |
| --- | --- | --- |
| `useAuthStore` | `localStorage` (`museum-auth`) | `userId`, `identityMode`, `displayName`, `isAnonymous`. |
| `useExhibitStore` | none | Filter / search state for the archive. |
| `useAtmosphereStore` | none | `weather`, `lighting`, `intensity`, `isNight`. |
| `useAudioStore` | none | Mute, volume, current track. |

All stores are typed and use `zustand` directly. Server state is owned by TanStack Query.

---

## 12. Security & Reliability Notes

- Passwords are hashed with `crypto.scrypt` (`scrypt$<salt>$<key>` envelope) and verified with `timingSafeEqual`.
- The API client throws `ApiError` so callers have a single failure type to handle.
- The `room.controller` no longer exposes a public `POST /rooms/seed`. Seeding lives in `prisma/seed.ts` and runs through `pnpm db:seed`.
- `helmet` is enabled in `main.ts`. CSP is intentionally off to allow Next.js inline styles and R2 image hosts; tighten before going to production behind a CDN.
- `ParseFilePipe` enforces a 10MB upload cap; widen this consciously and add `FileTypeValidator` before exposing public uploads.
- Secrets in `.env` and `.env.local` are not committed (see [`.gitignore`](.gitignore)).

---

## 13. Deployment

### 13.1 Frontend → Vercel

```bash
cd apps/frontend
vercel --prod
```

Set `NEXT_PUBLIC_API_URL` in the Vercel project settings.

### 13.2 Backend → Railway / Fly.io

Railway auto-detects NestJS. Provide every variable from §9.1 and run `pnpm db:push` and `pnpm db:seed` once after the first deploy.

### 13.3 Database → Neon

Create a Neon Postgres project, copy the connection string into `DATABASE_URL`, then:

```bash
pnpm db:push
pnpm --filter @museum/backend db:seed
```

### 13.4 Object storage → Cloudflare R2

Create a bucket named `museum-artifacts` (or override via `R2_BUCKET_NAME`). Generate an access key pair scoped to that bucket and provide it through `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`.

---

## 14. Scripts

```bash
# Workspace root
pnpm dev                         # turbo dev (frontend + backend in parallel)
pnpm build                       # turbo build
pnpm format                      # prettier --write
pnpm db:generate                 # prisma generate
pnpm db:push                     # prisma db push
pnpm db:migrate                  # prisma migrate dev
pnpm db:studio                   # prisma studio

# Backend
pnpm --filter @museum/backend dev
pnpm --filter @museum/backend build
pnpm --filter @museum/backend start          # production server (dist/)
pnpm --filter @museum/backend db:seed

# Frontend
pnpm --filter @museum/frontend dev
pnpm --filter @museum/frontend build
pnpm --filter @museum/frontend start         # next start
```

---

## 15. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Frontend renders but every fetch fails | Backend not running or `NEXT_PUBLIC_API_URL` wrong | Start backend and confirm the URL in `apps/frontend/.env.local`. |
| `Prisma Client not generated` | `db:generate` skipped after editing `schema.prisma` | Run `pnpm db:generate`. |
| `IdentityBadge` shows `offline` | `AuthBootstrap` could not reach `/auth/anonymous` | Start the backend and reload; the badge picks up the new session automatically. |
| Audio never plays | Browser autoplay policy or missing `/audio/*.mp3` assets | Click anywhere once to unlock the `AudioContext`; add files under `apps/frontend/public/audio/`. |
| `next lint` opens an interactive prompt | `next lint` is being deprecated in Next 16 | Run `pnpm --filter @museum/frontend exec tsc --noEmit` for type checking, or migrate ESLint via the official codemod. |
| OpenAI calls return generic copy | `OPENAI_API_KEY` missing or hitting rate limits | Set the key, fall through to defaults if absent. |

---

## 16. Project Status

See [`.planning/STATE.md`](.planning/STATE.md). At the time of this revision:

- All 18 product phases complete.
- Phase 19 (integration, testing, deployment) in progress — auth hardened, anonymous bootstrap shipped, placeholder routes (`/legacy`, `/constellation`) replaced with working features, atmosphere polished, README rewritten as technical documentation.
- Frontend and backend builds clean (`tsc --noEmit`, `next build`, `nest build`).

---

## 17. License

MIT — see [`LICENSE`](LICENSE) if present, or treat as MIT by default.

---

> *"The goal is not motivation culture or toxic positivity. The goal is emotional honesty."*
