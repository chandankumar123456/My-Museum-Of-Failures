# My Museum of Failures — State

## Current Status
- All 18 product phases complete.
- Phase 19 (Integration, Hardening & Documentation) — **complete locally**. Deployment to managed services is the only remaining track.
- **Phase 20 (UI/UX Overhaul — Lamplit Archive) — complete locally.** All 14 frontend routes ported onto the new design system. Stitch source designs, lamplit primitives, 3-layer 3D system, and per-room atmospheric tints are wired in. Frontend `tsc`, `lint`, and `next build` all pass.

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
19. Integration, Testing, Hardening, & Documentation ✓ (locally)
20. **UI/UX Overhaul — Lamplit Archive ✓ (locally)**

## Phase 20 — Lamplit Archive (this pass)

### Direction
Replaced the previous dark/cinematic/EB-Garamond/ember-orange aesthetic with **Lamplit Archive** — a bright editorial museum interface. Warm bone canvas, distinctive serif headlines (Fraunces), brass-warm accent (#A8794B). The melancholy now lives in the content (vulnerable failure confessions); the chrome treats those confessions with curatorial reverence rather than horror-house drama.

### Foundations (`apps/frontend`)
- `src/app/layout.tsx` — Fraunces (variable opsz axis) + Geist (UI sans) + JetBrains Mono. Dropped the forced `dark` class and the film-grain overlay. `themeColor` switched to `#F4EFE6`.
- `src/app/globals.css` — Lamplit Bone `@theme` tokens (bone, paper, vellum, ink, ink-muted, whisper, brass, brass-deep, brass-soft, glass-edge) + 8 per-room tints + clamp() type scale + 4 / 8 / 12 / 16 / 20 px radii + restrained `breathe-soft` and `brass-pulse` keyframes. Backwards-compat aliases map old `void` / `ember` / `museum-*` tokens onto the new palette so any unported consumers stay readable. Strict `prefers-reduced-motion` honour.
- `src/lib/motion.ts` — single canonical `SPRING` (stiffness 110, damping 22, mass 0.9). 60 ms `STAGGER_INTERVAL`. `breathe(index)` factory generates ±0.5% scale 6 s loops with deterministic phase offsets. `fadeUp` / `fadeIn` / `liftIn` / `stagger` reuse `SPRING`.
- `src/components/providers.tsx` — `ThemeProvider` defaults to `light`. Sonner re-themed to paper bg with hairline glass-edge border, ink text, geist font, soft 6 px shadow.

### Lamplit primitives (`src/components/lamplit/`)
- `button.tsx` — primary / secondary / outline / ghost variants × sm / md / lg sizes. -1 px push on active, brass focus ring with bone offset, no pills.
- `input.tsx` — `<Input>` and `<Textarea>` with bottom-border-only style and animated brass focus underline.
- `eyebrow.tsx` — `<Eyebrow>` (mono caps + brass tick + `// ` prefix) and `<Tag>` (engraved-glyph mono caps).
- `tick-marks.tsx` — `<TickMarks>` (4-slab pain/regret meter; brass=filled, vellum=empty) and `<EngravedDivider>` (hairline brass line + optional centred mono label).
- `reaction-glyph.tsx` — six SVG line icons mapped to the actual `EmotionalReaction` enum (`i_relate`, `i_survived_this_too`, `still_recovering`, `this_hurt`, `you_were_brave`, `i_understand`) with `REACTION_LABELS`.
- `plaque.tsx` — `<Artifact>` (vellum well with breathe loop + optional next/image) and `<Plaque>` (paper-tinted metadata column).
- `exhibit-card.tsx` — the signature Plaque + Artifact composition; derives thumbnails from `exhibit.artifacts[]`, uses TickMarks + ReactionGlyph + Eyebrow + utils.
- `empty-composed.tsx` — composed empty state with default pressed-flower SVG illustration + serif italic title + sans body copy.
- `index.ts` barrel.

### 3-layer 3D system (`src/components/lamplit-3d/`)
- `lamplit-3d.tsx` + `root-canvas.tsx` — single shared `<Canvas>` mounted full-viewport, fixed, behind page content (`pointer-events:none`, `z-0`, `position:fixed`). Lazy-loaded with `dynamic(..., { ssr: false })`. DPR capped at 1.5. Three-point museum lighting (paper key + brass warmth) shines on whatever set piece is registered.
- `room-context.tsx` — `RoomTintProvider` + `useRoomTint()`; named tints (`brass`, `ash`, `sage`, `dusk`, `rust`, `bruise`, `pearl`, `clay`, `amber`).
- `set-piece-context.tsx` — `<SetPiece>` registers a 3D scene as the active layer-3 set piece for the page.
- `ambient-shader.tsx` — Layer 1 fullscreen plane with custom GLSL: slow time-driven gradient + value-noise drift + soft vignette, lerping toward `uTint` on each frame. Honours reduced-motion (freezes time uniform).
- `artifacts/families.tsx` + `artifacts/index.tsx` — Layer 2 stub families (BrokenInstrument, SealedLetter, FadingPhotograph, SeveredThread, LockedBox, DustVeiledFrame), each a small low-poly group with a brass/ink/paper material + slow pedestal spin. `<Artifact3D category={...} />` dispatcher maps all 15 `ExhibitionCategory` enum values onto the 6 families.
- `set-pieces/landing-hero.tsx` — Layer 3 demonstrator set piece: brass desk lamp (with warm point light), tipped-open archive drawer with folded papers, sealed-letter artifact, drifts on a slow lateral sine + tilt.

### Pages ported (14 / 14)
- `/` landing — hero, philosophy band, anatomy 8/4 grid, curator pull-quote, preservation 5/6 split. Mounts `<LandingHeroSetPiece>`.
- `/exhibits` archive — asymmetric 12-col mixed grid, brass-soft active filter chips, skeletons match card height, composed empty state.
- `/exhibits/[id]` exhibit detail — two-panel 8/4: story essay + expectation/reality + lessons quote + reflection on the left; sticky paper-card plaque + meters + reactions + YANA rail on the right.
- `/exhibits/create` 5-step form (The Failure / The Story / The Lesson / The Weight / Review) — brass-tick progress strip, paper-card pickers, brass-soft active state, bottom-border-only inputs, brass slider, summary review card.
- `/rooms` — 8 rooms in a 7/5/5/7 asymmetric grid with per-room tint chips + 2 special-walk cards (pearl + amber).
- `/rooms/[slug]` — sets ambient shader tint via `setRoomTint(slug→tint)`, 7/5 asymmetric exhibit grid, prev/next floor nav.
- `/rooms/random-walk` — pearl-tinted variant, staggered 2-per-row grid, shuffle bar with walk counter, end-of-walk band.
- `/rooms/last-attempts` — amber-tinted variant, ALL/RESOLVED/STILL OPEN filter chips, retry-intent metadata.
- `/constellation` — vellum SVG canvas with brass centre + ink stars, paper tooltip on hover, category legend.
- `/time-capsule` — sign-in gate for anonymous, Create panel with brass key motif, 6/4 split between Sealed (paper) and Opened (paper + brass-left-border italic letters), Legacy CTA.
- `/legacy` — current legacy spotlit (paper card with brass border + ★ Legacy badge), candidate grid with pin/pinned states.
- `/curator` — slower-paced explainer with a brass orb, points the visitor to the floating CuratorChat candle.
- `/about` — manifesto + 60/40 split + 4-card 2×2 offset feature grid + closing band.
- `/auth` — 50/50 asymmetric split, brass-key SVG hero on vellum, 3-tab form (Sign in / Register / Pseudonym only), bottom-border inputs, no social logins, no remember-me.
- `/_not-found` — composed empty state at the route level. Brass tick, faded sealed-envelope SVG, single brass return CTA.

### Supporting components ported
- `components/museum/navigation.tsx` — Lamplit nav: bone/85 backdrop-blur, brass-tick wordmark, animated brass-underline on active link, mobile drop-down on paper.
- `components/auth/identity-badge.tsx` — paper-card popover with brass-soft active mode.
- `components/emotions/reaction-buttons.tsx` — engraved-glyph 6-button grid using `ReactionGlyph`, brass-soft active state.
- `components/emotions/you-are-not-alone.tsx` — compact paper-card rail mirroring the ExhibitCard grammar.
- `components/ai/reflection-panel.tsx` — paper card with curator italic quote, mono-tag patterns, engraved divider.
- `components/exhibits/exhibit-form.tsx` — fully rebuilt 5-step form on Lamplit primitives.
- `components/time-capsule/capsule-create.tsx` — lamplit `<Input>` / `<Textarea>` / `<Button>` with brass-key seal motif.

### Stitch source-of-truth
- New project: `projects/17109180484966666574` (My Museum of Failures — Lamplit Archive).
- Design system asset: `assets/9564904009759904157` (Lamplit Archive theme — LIGHT mode, ROUND_EIGHT, customColor `#A8794B`, headlineFont LITERATA as Stitch substitute for Fraunces, bodyFont GEIST, labelFont JETBRAINS_MONO).
- All 14 reference HTML+PNG screens downloaded to `.stitch/designs/`. Two predecessor projects (`13013234473010496850`, `14161085687201820559`) and the dark-cinematic `.stitch.archived-2026-05-25-dark-cinematic/` directory remain untouched as before-references.
- Phase spec: `.planning/phases/20-ui-overhaul/20-CONTEXT.md` (693 lines, approved).
- Design system reference for future contributors: `docs/design-system.md`.

## Build Status
| Check | Result |
| --- | --- |
| `pnpm --filter @museum/backend lint` | ✓ |
| `pnpm --filter @museum/backend typecheck` | ✓ |
| `pnpm --filter @museum/backend test` | ✓ (22 tests) |
| `pnpm --filter @museum/backend build` | ✓ |
| `pnpm --filter @museum/frontend lint` | ✓ |
| `pnpm --filter @museum/frontend typecheck` | ✓ |
| `pnpm --filter @museum/frontend build` | ✓ (15 routes — 13 static, 2 dynamic) |
| Prisma generate | ✓ |

Frontend bundle (post-Phase-20): First Load JS shared = **102 kB**, per-route 405–409 kB. Above the spec's 220 kB gzipped target — primary culprits are Framer Motion 12 and the Three.js + R3F + drei stack. Mitigations to consider in a follow-up polish pass: lazy-load R3F per page that needs it (instead of always-on root canvas), code-split the curator chat, dynamic-import the constellation SVG.

## Known follow-ups (Phase 20-adjacent, deferred)

These are scoped out of the current pass but worth tracking:

1. **Bundle budget.** Hit the 220 kB target by deferring R3F/three behind a route-level boundary and lazy-loading the curator chat.
2. **Backwards-compat aliases.** `globals.css` still maps the retired `void` / `ember` / `museum-*` token names onto Lamplit equivalents so consumers in vendored or future-restored code keep rendering. Drop the alias block once nothing references those names.
3. **Layer 2 sculpting.** The 6 artifact families are intentional schematic placeholders. A follow-up can sculpt richer geometry — or replace with photogrammetry-baked GLB models.
4. **Layer 3 set pieces.** Only `LandingHeroSetPiece` is built so far. Each Tier 1 / Tier 2 page can register its own per-spec set piece (rooms corridor, exhibit pedestal, capsule envelope, constellation orb, etc.).
5. **Lighthouse pass + reduced-motion audit on real devices.** Spec target: ≥ 75 mobile, ≥ 90 desktop.
6. **E2E parity.** The Playwright smoke suite was written for the dark direction — selectors / page text need updating after the Lamplit chrome lands. Re-run on staging when redeployed.

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
