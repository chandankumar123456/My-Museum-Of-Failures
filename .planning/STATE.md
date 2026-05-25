# My Museum of Failures — State

## Current Status
- All 18 product phases complete.
- Phase 19 (Integration, Hardening & Documentation) — **complete locally**. Deployment to managed services is the only remaining track.

## Completed Phases
1. Project Scaffolding & Infrastructure ✓
2. Database Schema & Prisma Setup ✓
3. Authentication System ✓ (scrypt, anonymous bootstrap, login, JWT cookie sessions)
4. Backend Exhibit Module ✓
5. Backend Emotional Systems ✓
6. Backend Artifact & Storage ✓ (FileTypeValidator + per-type MIME regex)
7. Backend AI Reflection System ✓ (typed payloads, throttled)
8. Backend Time Capsule & Dynamic Systems ✓
9. Backend Real-Time Systems ✓ (presence, exhibit_created, atmosphere broadcasts)
10. Frontend Foundations ✓
11. Frontend Exhibit System ✓
12. Frontend Museum Room System ✓
13. Frontend Emotional Interaction System ✓
14. Frontend Atmosphere & Audio Engine ✓ (procedural Web Audio fallback)
15. Frontend 3D Museum (R3F) ✓
16. Frontend Memory Decay & Dynamic Environment ✓
17. Frontend AI & Time Capsule ✓
18. Frontend Advanced Features ✓ (legacy + constellation real)

## Phase 19 — what shipped this pass

### Tooling
- ESLint flat-config (`eslint.config.mjs`) for backend and frontend; `pnpm lint` runs through Turbo.
- Jest + ts-jest for backend; **22 unit tests** across `auth.service`, `session.service`, `exhibit.service`. `pnpm test`.
- Playwright for frontend; 4 smoke tests in `e2e/smoke.spec.ts`. `pnpm e2e`.
- GitHub Actions CI in `.github/workflows/ci.yml`: build / lint / typecheck / unit tests on every push and PR; E2E job runs on PRs to `main` and `main` pushes (installs chromium, boots the app, executes Playwright).

### Security & reliability
- `@nestjs/throttler` global guard with three windows; per-route stricter limits on `/auth/login`, `/auth/register`, `/auth/pseudonym`, `/ai-reflection/generate`, `/ai-reflection/curator`.
- Helmet CSP enabled in production with explicit directives for fonts, OpenAI, R2, ws/wss.
- `cookie-parser` + JWT-secret HMAC signed `museum_session` httpOnly cookie. `SessionGuard`, `/auth/me`, `/auth/logout`. The localStorage flow remains so anonymous visitors still work.
- `FileTypeValidator` + per-artifact-type MIME regex on uploads.
- `@nestjs/schedule`: `DecayScheduler` runs nightly at 03:17 to age exhibits and artifacts; hourly touchup in production.

### Real-time
- `SocketGateway` events: `museum:exhibit_created`, `museum:atmosphere`, `museum:presence`. `ExhibitService` broadcasts on create.
- Frontend `useMuseumSocket` hook subscribes; auto-joins a room slug if provided.

### Content gaps closed
- `apps/frontend/public/audio/` is no longer empty: it has `README.md` documenting the expected filenames and a procedural Web Audio engine in `lib/ambient-engine.ts` with 9 unique room presets that synthesize ambience at runtime. Real recordings, when shipped, are auto-detected via HEAD probe.
- Brand assets shipped under `apps/frontend/public/`: `favicon.svg`, `apple-touch-icon.svg`, `og-image.svg`, `manifest.webmanifest`. Wired into `layout.tsx` metadata + viewport.

### Type cleanup
- `@museum/shared` expanded with view shapes (`ExhibitView`, `ExhibitListView`, `AIReflectionView`, `CuratedExhibitionView`, `TimeCapsuleView`, `CapsulesUserView`, `ArtifactView`, `ReactionView`, `RoomSummaryView`).
- All consuming components/pages now import these instead of `any`.
- `room-atmosphere` typed with `Lighting | Weather | Intensity` unions.

## Build Status
| Check | Result |
| --- | --- |
| `pnpm --filter @museum/backend lint` | ✓ |
| `pnpm --filter @museum/backend typecheck` | ✓ |
| `pnpm --filter @museum/backend test` | ✓ (22 tests) |
| `pnpm --filter @museum/backend build` | ✓ |
| `pnpm --filter @museum/frontend lint` | ✓ |
| `pnpm --filter @museum/frontend typecheck` | ✓ |
| `pnpm --filter @museum/frontend build` | ✓ (14 routes) |
| Prisma generate | ✓ |

## Remaining work — deployment track only

These can't be verified locally without managed services:

1. Provision Neon Postgres → `pnpm db:push` + `pnpm db:seed`.
2. Deploy backend to Railway / Fly.io with all `apps/backend/.env.example` keys.
3. Deploy frontend to Vercel; set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`.
4. Provision Cloudflare R2 bucket and rotate `R2_*` credentials.
5. Set `OPENAI_API_KEY` and `JWT_SECRET` (≠ the dev fallback) on the backend.
6. (Optional) Drop ambient MP3s under `apps/frontend/public/audio/` if a sound designer is available — the procedural engine plays in the meantime.

## Verification
```bash
pnpm install
pnpm db:generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm dev
```
