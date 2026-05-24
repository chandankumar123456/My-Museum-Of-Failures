# My Museum of Failures

> An emotionally immersive digital museum where failures, regrets, and abandoned dreams are preserved as meaningful artifacts — not hidden.

**Live Demo:** https://museum-of-failures.vercel.app (when deployed)

---

## Core Philosophy

Success is everywhere on the internet. Failure is hidden.

This platform exists to preserve what people lost, what never worked, what broke them, what changed them, and what still hurts. It is not a motivational platform. It is not toxic positivity. It is an archive of emotional honesty.

Users can post anonymously, under a pseudonym, or with their real identity — because emotional safety is critical to authenticity.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Monorepo (pnpm workspaces)            │
│                                                         │
│  ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │   apps/frontend     │   │   apps/backend           │  │
│  │   (Next.js 15)      │   │   (NestJS 11)            │  │
│  │                     │   │                          │  │
│  │  • App Router       │   │  • Prisma + PostgreSQL   │  │
│  │  • TailwindCSS v4   │   │  • Socket.IO             │  │
│  │  • Framer Motion    │   │  • Cloudflare R2         │  │
│  │  • React Three Fiber│   │  • OpenAI / Vercel AI    │  │
│  │  • Zustand          │   │  • Better Auth           │  │
│  │  • TanStack Query   │   │  • tRPC-ready            │  │
│  │  • Howler.js        │   │  • Multer                │  │
│  └─────────┬───────────┘   └──────────┬──────────────┘  │
│            │                          │                 │
│            └──────────┬───────────────┘                │
│                       │                                │
│            ┌──────────▼──────────┐                     │
│            │  packages/shared    │                     │
│            │  (types, enums)     │                     │
│            └─────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | SSR, RSC, routing |
| **Language** | TypeScript (strict mode) | Type safety everywhere |
| **Styling** | TailwindCSS v4 + CSS custom properties | Design token system |
| **UI Primitives** | shadcn/ui patterns | Accessible foundation |
| **Animation** | Framer Motion | Cinematic transitions |
| **3D / Immersive** | React Three Fiber, Drei, Three.js | Museum spaces, particles |
| **Post-processing** | react-postprocessing | Bloom, vignette, fog |
| **State** | Zustand | Lightweight stores |
| **Data Fetching** | TanStack Query | Server state |
| **Audio** | Howler.js | Ambient soundscapes |
| **Backend** | NestJS 11 | Modular, scalable API |
| **Database** | PostgreSQL (Neon) | Relational persistence |
| **ORM** | Prisma | Type-safe queries |
| **Storage** | Cloudflare R2 | Artifact file uploads |
| **Auth** | Better Auth (email/password, Google OAuth, anonymous) | Identity control |
| **AI** | OpenAI + Vercel AI SDK | Reflections, curator, exhibitions |
| **Real-time** | Socket.IO | Live ambience, room sync |
| **API** | tRPC-ready | End-to-end type safety |
| **Deployment** | Vercel (frontend), Railway (backend), Neon (DB) | Production hosting |

---

## Monorepo Structure

```
museum-of-failures/
├── apps/
│   ├── frontend/              # Next.js application
│   │   └── src/
│   │       ├── app/           # App Router pages
│   │       ├── components/    # React components
│   │       │   ├── museum/    # Layout, navigation, atmosphere
│   │       │   ├── exhibits/  # Card, detail, form
│   │       │   ├── emotions/  # Reactions, "You Are Not Alone"
│   │       │   ├── rooms/     # Room card, atmosphere
│   │       │   ├── audio/     # Sound manager
│   │       │   ├── ai/        # Reflection panel, curator chat
│   │       │   ├── time-capsule/ # Capsule create/view
│   │       │   ├── 3d/        # R3F museum scenes
│   │       │   └── effects/   # Memory decay overlays
│   │       ├── stores/        # Zustand stores
│   │       └── lib/           # Utilities, API client, constants
│   └── backend/               # NestJS application
│       ├── prisma/
│       │   ├── schema.prisma  # 11 models
│       │   └── seed.ts        # Room seeding
│       └── src/
│           ├── main.ts        # Bootstrap
│           ├── app.module.ts  # Root module
│           └── modules/
│               ├── auth/      # Auth service + controller
│               ├── exhibit/   # Full CRUD + emotional search
│               ├── emotion/   # Reactions + similarity
│               ├── room/      # Museum rooms + random walk
│               ├── artifact/  # R2 upload + signed URLs
│               ├── ai-reflection/ # OpenAI integration
│               ├── time-capsule/  # Locked messages
│               ├── socket/    # WebSocket gateway
│               └── prisma/    # Database service
└── packages/
    └── shared/                # Shared TypeScript types
```

---

## Database Schema

11 models with full relational structure:

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| **User** | email, identityMode, pseudonym, legacyExhibitId | exhibits, reactions, timeCapsules, emotionalAnalytics |
| **Exhibit** | exhibitId, title, category, story, painLevel, endingStatus, decayLevel | user, room, artifacts, reactions, aiReflections, legacyOf |
| **MuseumRoom** | slug, name, ambience, lighting, orderIndex | exhibits |
| **Artifact** | type, url, filename, decayed | exhibit |
| **ExhibitReaction** | reaction (enum) | exhibit, user |
| **AIReflection** | emotionalSummary, patterns, reframing | exhibit |
| **TimeCapsule** | message, unlockDate, isLocked | user |
| **EmotionalAnalytics** | totalPain, totalRegret, dominantEmotion | user |
| **CuratedExhibition** | title, theme, isActive | — |
| **MuseumState** | weather, lighting, intensity | — |

Enums: `ExhibitionCategory` (15), `MuseumRoomSlug` (8), `EmotionalReactionType` (6), `EndingStatusType` (5), `RecoveryStatusType` (6), `VisibilityMode` (3), `ArtifactType` (6)

---

## Features

### Exhibit System
- Multi-step creation form with validation
- Emotional metadata (pain, regret, recovery sliders)
- Two-panel "Expectation vs Reality" storytelling
- "What I Learned" section (visually highlighted)
- Artifact upload (drag-drop)
- Emotional tags
- One-sentence confessions
- Unread confessions tab
- Emotional search (search by feeling)
- Memory decay (visual deterioration over time)
- Retry tracking

### Museum Rooms
- 8 themed rooms with unique atmospheres
- Room-specific lighting, weather, sound
- Random museum walk (serendipitous discovery)
- "The Last Attempt" dedicated section
- Room exhibit count

### Emotional Interaction
- 6 reaction types (I relate, I survived this too, Still recovering, This hurt, You were brave, I understand)
- No likes, no follower metrics
- "You Are Not Alone" similarity engine
- Ending status display (Destroyed me, Changed me, etc.)

### AI Features
- Emotional summary generation (OpenAI)
- Pattern recognition across exhibits
- Gentle cognitive reframing
- AI-curated themed exhibitions
- Museum Curator AI chat (melancholic guide, conversational)

### Immersive Atmosphere
- Dynamic weather engine (mist, rain, storm, fog)
- Cinematic lighting system (dim, dark, warm, flicker)
- Ambient dust particles (canvas-based)
- Room-specific ambience
- Midnight mode (time-based)
- Emotional intensity reactivity
- Audio manager (Howler.js)
- Curator Chat floating button

### 3D Museum (React Three Fiber)
- Walkable 3D room with OrbitControls
- Bloom + Vignette post-processing
- Floating atmospheric particles
- Exhibit pedestals with accent lighting
- Room-specific color themes

### Time Capsule
- Write messages to future self
- Lock with future unlock date
- Auto-unlock at target date
- Legacy vault (one permanent exhibit)

### Identity System
- Anonymous posting (no account required)
- Pseudonym accounts
- Real-name accounts
- Identity mode switching

---

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 8

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/museum-of-failures.git
cd museum-of-failures

# Install dependencies
pnpm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your database URL, R2 credentials, etc.
cp apps/frontend/.env.local apps/frontend/.env.local

# Generate Prisma client
pnpm db:generate

# Seed the database (requires PostgreSQL connection)
# pnpm db:push   # Push schema to DB
# pnpm db:seed   # Seed museum rooms
```

### Development

```bash
# Start both frontend and backend
pnpm dev

# Frontend only (port 3000)
pnpm --filter @museum/frontend dev

# Backend only (port 4000)
pnpm --filter @museum/backend dev
```

### Build

```bash
# Build everything
pnpm build

# Frontend only
pnpm --filter @museum/frontend build

# Backend only
pnpm --filter @museum/backend build
```

---

## API Endpoints

### Exhibits
| Method | Path | Description |
|--------|------|-------------|
| GET | `/exhibits` | List exhibits (with filters) |
| GET | `/exhibits/:id` | Get exhibit by ID |
| POST | `/exhibits` | Create exhibit |
| PUT | `/exhibits/:id` | Update exhibit |
| DELETE | `/exhibits/:id` | Delete exhibit |
| GET | `/exhibits/one-sentence` | One-sentence confessions |
| GET | `/exhibits/unread` | Unread confessions |
| GET | `/exhibits/emotional-search?q=` | Search by emotion |
| GET | `/exhibits/:id/similar` | Similar exhibits |
| POST | `/exhibits/:id/retry` | Increment retry count |

### Emotions
| Method | Path | Description |
|--------|------|-------------|
| POST | `/emotions/:exhibitId/react/:reaction` | Add reaction |
| GET | `/emotions/:exhibitId/reactions` | Get reactions |
| GET | `/emotions/:exhibitId/not-alone` | Get related exhibits |

### Rooms
| Method | Path | Description |
|--------|------|-------------|
| GET | `/rooms` | List all rooms |
| GET | `/rooms/:slug` | Get room with exhibits |
| GET | `/rooms/random-walk` | Random exhibits |
| GET | `/rooms/last-attempts` | Retry exhibits |

### Artifacts
| Method | Path | Description |
|--------|------|-------------|
| POST | `/artifacts/upload/:exhibitId/:type` | Upload file |
| GET | `/artifacts/:id/url` | Get signed URL |
| GET | `/artifacts/exhibit/:exhibitId` | List exhibit artifacts |

### AI
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai-reflection/generate/:exhibitId` | Generate reflection |
| GET | `/ai-reflection/curated-exhibitions` | Get curated exhibitions |
| POST | `/ai-reflection/curator` | Chat with curator |

### Time Capsule
| Method | Path | Description |
|--------|------|-------------|
| POST | `/time-capsule` | Create capsule |
| GET | `/time-capsule/user/:userId` | Get user capsules |
| GET | `/time-capsule/:id/:userId` | Get capsule |
| POST | `/time-capsule/legacy/:userId/:exhibitId` | Set legacy |
| GET | `/time-capsule/legacy/:userId` | Get legacy exhibit |

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/anonymous` | Anonymous session |
| POST | `/auth/register` | Email/password register |
| POST | `/auth/pseudonym` | Pseudonym account |
| GET | `/auth/user/:userId` | Get user |
| POST | `/auth/identity-mode/:userId` | Update identity |

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with entrance door |
| `/exhibits` | Exhibit archive with filters |
| `/exhibits/:id` | Exhibit detail with reactions, reflection, similar |
| `/exhibits/create` | Multi-step exhibit creation form |
| `/rooms` | Museum room gallery |
| `/rooms/:slug` | Room detail with exhibits |
| `/rooms/random-walk` | Random exhibit discovery |
| `/rooms/last-attempts` | Retry-focused exhibits |
| `/curator` | Museum curator chat |
| `/time-capsule` | Time capsule management |
| `/about` | Museum philosophy |
| `/constellation` | Failure constellation map (placeholder) |
| `/legacy` | Legacy vault (placeholder) |

---

## Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL="postgresql://..."
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="museum-artifacts"
R2_PUBLIC_URL=""
OPENAI_API_KEY=""
AI_MODEL="gpt-4o"
```

### Frontend (`apps/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Design Tokens

The TailwindCSS theme defines a custom museum palette:

| Token | Hex | Usage |
|-------|-----|-------|
| `museum-50` | `#f7f5f0` | Lightest |
| `museum-800` | `#52473c` | Borders, muted |
| `museum-950` | `#2a2420` | Dark backgrounds |
| `ember` | `#d4592b` | Primary accent |
| `ember-light` | `#e87a4a` | Hover accent |
| `void` | `#0d0b0a` | Deepest background |
| `void-light` | `#1a1513` | Card backgrounds |
| `whisper` | `#c4bcb0` | Primary text |
| `whisper-dark` | `#8a7b63` | Muted text |

Typography: `EB Garamond` (serif, headings), `Inter` (sans, UI), `JetBrains Mono` (mono, code).

---

## Deployment

### Frontend → Vercel

```bash
cd apps/frontend
vercel --prod
```

### Backend → Railway

```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Railway auto-detects NestJS
```

### Database → Neon

```bash
# Create a Neon PostgreSQL database
# Copy connection string to backend .env
# Run: pnpm db:push
# Run: pnpm db:seed
```

---

## License

MIT © [Your Name]

---

*"The goal is not motivation culture or toxic positivity. The goal is emotional honesty."*
