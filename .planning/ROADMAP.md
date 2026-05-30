# My Museum of Failures — Roadmap

## Phase Structure

### Phase 1: Project Scaffolding & Infrastructure
**Goal:** Initialize monorepo, scaffold both frontend (Next.js) and backend (NestJS), install all dependencies, configure TypeScript, Tailwind, ESLint, and establish build pipeline.

**Waves:**
- Wave 1: Init frontend (Next.js + TypeScript + Tailwind + shadcn/ui + all deps)
- Wave 2: Init backend (NestJS + TypeScript + Prisma + tRPC + all deps)
- Wave 3: Configure shared types package, monorepo tooling (turborepo/pnpm workspaces)
- Wave 4: Verify both apps build and dev servers run

**Success Criteria:**
- `npm run dev` starts both frontend and backend
- TypeScript strict mode compiles without errors
- TailwindCSS theme tokens are defined
- shadcn/ui components render correctly
- Prisma schema can be generated

---

### Phase 2: Database Schema & Prisma Setup
**Goal:** Design and implement the complete Prisma schema covering all entities: users, exhibits, artifacts, reactions, rooms, emotional metadata, time capsules, memory decay state.

**Waves:**
- Wave 1: Core entities (User, Exhibit, ExhibitCategory)
- Wave 2: Emotional metadata (EmotionalMetadata, EmotionalTag, Reaction)
- Wave 3: Artifacts, Rooms, TimeCapsule
- Wave 4: AI reflections, Memory decay, Analytics
- Wave 5: Relations, indexes, enums

**Success Criteria:**
- `npx prisma generate` succeeds
- All entity relations are defined
- Emotional metadata schema supports all REQ-050-056
- Migration can be created

---

### Phase 3: Authentication System
**Goal:** Implement complete auth with Better Auth — email/password, Google OAuth, anonymous session, pseudonym accounts, real identity accounts. tRPC auth middleware.

**Waves:**
- Wave 1: Better Auth setup + email/password
- Wave 2: Google OAuth integration
- Wave 3: Anonymous session handling
- Wave 4: tRPC auth context + middleware
- Wave 5: Profile endpoints + identity visibility control

**Success Criteria:**
- Register/login with email works
- Google OAuth works
- Anonymous users can create exhibits
- Auth middleware protects routes
- Users can change visibility mode

---

### Phase 4: Backend Exhibit Module
**Goal:** Build the complete exhibit CRUD module in NestJS with tRPC routers. Including create with all metadata, read with filtering, update, delete (with burned archive logic), emotional search.

**Waves:**
- Wave 1: Exhibit create with full metadata payload
- Wave 2: Exhibit read (single + list with filters)
- Wave 3: Exhibit update + delete (burned archive)
- Wave 4: Category-based queries + emotional search
- Wave 5: "Before vs Reality" two-panel data handling

**Success Criteria:**
- tRPC procedures for all exhibit CRUD operations
- Emotional search returns relevant results
- Burned archive retains fragments after delete
- Category filtering works

---

### Phase 5: Backend Emotional Systems
**Goal:** Build emotional reaction system, emotional metadata processing, room assignment, ending status, "You Are Not Alone" connections.

**Waves:**
- Wave 1: Emotional reaction CRUD (6 reaction types, no likes)
- Wave 2: Room assignment logic + room metadata
- Wave 3: Ending status processing
- Wave 4: "You Are Not Alone" similarity engine
- Wave 5: One Sentence Confessions endpoint

**Success Criteria:**
- Reactions work without like-style metrics
- Rooms return appropriate exhibits
- Similarity engine finds related failures
- One Sentence Confessions are a distinct flow

---

### Phase 6: Backend Artifact & Storage
**Goal:** Cloudflare R2 integration for file uploads. Images, audio, PDFs, code snippets. Artifact metadata storage, signed URLs, upload progress.

**Waves:**
- Wave 1: R2 client setup + configuration
- Wave 2: File upload endpoint with signed URLs
- Wave 3: Artifact metadata persistence
- Wave 4: Artifact retrieval + gallery endpoints
- Wave 5: Code snippet storage with language detection

**Success Criteria:**
- Files upload to R2 successfully
- Signed URLs expire appropriately
- Artifacts are linked to exhibits
- Gallery view returns all artifacts for an exhibit

---

### Phase 7: Backend AI Reflection System
**Goal:** Integrate Vercel AI SDK with OpenAI for emotional summarization, pattern recognition, reframing, and AI-curated exhibitions. Museum Curator AI guide.

**Waves:**
- Wave 1: AI SDK setup + OpenAI integration
- Wave 2: Emotional summary generation
- Wave 3: Pattern recognition across user's exhibits
- Wave 4: AI-curated exhibition creation
- Wave 5: Museum Curator AI (conversational guide)

**Success Criteria:**
- AI generates emotional summary for an exhibit
- Pattern recognition works across multiple exhibits
- Curated exhibitions return themed collections
- Curator AI responds in-character

---

### Phase 8: Backend Time Capsule & Dynamic Systems
**Goal:** Time capsule CRUD, memory decay scheduling, dynamic environment state, hidden exhibit unlock logic, legacy vault.

**Waves:**
- Wave 1: Time capsule CRUD with lock/unlock dates
- Wave 2: Memory decay scheduler (cron job)
- Wave 3: Dynamic environment state management
- Wave 4: Hidden exhibit unlock conditions
- Wave 5: Legacy vault endpoint

**Success Criteria:**
- Time capsules lock and unlock on schedule
- Memory decay state updates periodically
- Hidden exhibits become visible when conditions met
- Legacy vault stores one permanent exhibit per user

---

### Phase 9: Backend Real-Time Systems
**Goal:** Socket.IO integration for live emotional ambience, synchronized interactions, dynamic room atmosphere changes, real-time updates for new exhibits.

**Waves:**
- Wave 1: Socket.IO gateway setup in NestJS
- Wave 2: Room-based socket rooms (museum rooms)
- Wave 3: Live ambience events (weather, lighting changes)
- Wave 4: Real-time exhibit updates
- Wave 5: Presence tracking

**Success Criteria:**
- Sockets connect and authenticate
- Museum room channels broadcast events
- Emotional weather changes propagate in real-time
- New exhibits appear without page refresh

---

### Phase 10: Frontend Foundations
**Goal:** Build the complete frontend shell — layout, navigation, theme system, museum atmosphere, typography, Framer Motion animation system, Zustand stores, TanStack Query setup.

**Waves:**
- Wave 1: Next.js App Router layout + global CSS
- Wave 2: TailwindCSS design tokens + theme system
- Wave 3: Framer Motion animation library + shared animations
- Wave 4: Zustand stores (auth, exhibit, atmosphere, audio)
- Wave 5: TanStack Query setup + API client (tRPC)
- Wave 6: shadcn/ui primitives integration
- Wave 7: Museum-style layout (atmospheric, immersive)

**Success Criteria:**
- App renders with museum aesthetic
- Theme system works (light/dim/midnight)
- Animation system reusable across components
- All stores initialized with correct types
- API client connects to backend tRPC

---

### Phase 11: Frontend Exhibit System
**Goal:** Build the complete exhibit creation flow and viewing experience. Two-panel storytelling, emotional metadata UI, artifact upload, lesson learning section.

**Waves:**
- Wave 1: Exhibit creation form (multi-step, cinematic)
- Wave 2: Emotional metadata UI (pain slider, regret, toggles)
- Wave 3: "What I Expected" vs "What Happened" two-panel
- Wave 4: Artifact upload component (drag-drop, preview)
- Wave 5: Exhibit detail page (museum card presentation)
- Wave 6: Exhibit listing/gallery view (archived aesthetic)
- Wave 7: One Sentence Confession mini-exhibit

**Success Criteria:**
- Multi-step creation form works with validation
- Two-panel storytelling renders correctly
- Artifacts upload and display in exhibit
- Exhibit detail page feels like a museum display
- Gallery shows exhibits with decaying aesthetics
- One Sentence Confessions have compact display

---

### Phase 12: Frontend Museum Room System
**Goal:** Build the museum room navigation — themed rooms with unique atmospheres, random museum walk, room-specific lighting/sounds, "The Last Attempt" section.

**Waves:**
- Wave 1: Room grid/overview page (museum map)
- Wave 2: Individual room page with theme
- Wave 3: Room-specific atmosphere (CSS + audio)
- Wave 4: Random museum walk feature
- Wave 5: "The Last Attempt" dedicated section
- Wave 6: Silence rooms (no reactions UI)

**Success Criteria:**
- Each room has distinct visual theme
- Room atmosphere changes (lighting, textures)
- Random walk navigates to random exhibits
- "The Last Attempt" filters correctly
- Silence rooms hide reaction UI

---

### Phase 13: Frontend Emotional Interaction
**Goal:** Emotional reaction UI, "You Are Not Alone" widget, emotional search bar, ending status display, and identity visibility controls.

**Waves:**
- Wave 1: Emotional reaction component (6 reactions, no likes)
- Wave 2: "You Are Not Alone" related exhibits sidebar
- Wave 3: Emotional tag display + filtering
- Wave 4: Emotional search interface
- Wave 5: Ending status badge component
- Wave 6: Identity visibility selector UI

**Success Criteria:**
- Reactions work and feel different from likes
- Related exhibits display correctly
- Search by emotional state returns results
- Ending status is visually prominent
- Identity selector changes badge display

---

### Phase 14: Frontend Atmosphere & Audio
**Goal:** Howler.js audio engine integration, ambient soundscapes per room, museum audio atmosphere (rain, footsteps, echoes, projector), dynamic sound layering.

**Waves:**
- Wave 1: Howler.js setup + audio manager store
- Wave 2: Room ambience tracks (rain, footsteps, echoes)
- Wave 3: Interactive sound effects (projector clicks, tape hiss)
- Wave 4: Dynamic sound layering based on story intensity
- Wave 5: Volume controls + mute state persistence

**Success Criteria:**
- Audio plays on museum entry
- Room change triggers appropriate ambience
- Sound layers respond to emotional intensity
- Mute persists across page navigation
- Audio does not autoplay until user interaction

---

### Phase 15: Frontend 3D Museum Experience
**Goal:** React Three Fiber + Drei for 3D museum rooms, atmospheric particles, floating artifacts, camera controls, post-processing (bloom, fog, vignette, glitch).

**Waves:**
- Wave 1: R3F scene setup with camera controls
- Wave 2: Museum room geometry + lighting
- Wave 3: Atmospheric particles (dust, floating embers)
- Wave 4: Exhibit display in 3D space (floating artifacts)
- Wave 5: Post-processing (bloom, fog, depth, vignette)
- Wave 6: Glitch/distortion effects for traumatic exhibits
- Wave 7: Walkable museum navigation

**Success Criteria:**
- 3D museum room renders with correct lighting
- Particles float atmospherically
- Exhibits appear as 3D artifacts
- Post-processing creates cinematic feel
- Walkable controls feel immersive
- Glitch effects trigger appropriately

---

### Phase 16: Frontend Memory Decay & Dynamic Environment
**Goal:** Visual memory decay system, fading text, dust overlays, broken frames, dynamic emotional weather engine, midnight mode trigger.

**Waves:**
- Wave 1: Memory decay CSS/component system
- Wave 2: Dust overlay particle system
- Wave 3: Broken/cracked frame SVG effects
- Wave 4: Dynamic emotional weather engine
- Wave 5: Midnight mode (time-based trigger)
- Wave 6: Interactive physicality (objects react to clicks)

**Success Criteria:**
- Old exhibits show decay effects
- Dust accumulates visually
- Frames crack appropriately
- Emotional weather changes scene
- Night mode activates at system night time
- Objects have hover/click reactions

---

### Phase 17: Frontend AI & Time Capsule
**Goal:** AI reflection display, curated exhibitions carousel, time capsule creation UI, Museum Curator AI chat interface, "Recovered Artifacts" timeline.

**Waves:**
- Wave 1: AI reflection panel on exhibit detail
- Wave 2: Curated exhibitions carousel component
- Wave 3: Time capsule creation + lock UI
- Wave 4: Time capsule unlock reveal animation
- Wave 5: Museum Curator AI chat overlay
- Wave 6: "Recovered Artifacts" timeline

**Success Criteria:**
- AI reflections display elegantly
- Curated exhibitions cycle through themes
- Time capsule creation shows countdown
- Unlock animation feels emotional
- Curator AI speaks in melancholic museum guide tone
- Recovery timeline shows evolution

---

### Phase 18: Frontend Advanced Features
**Goal:** Failure Constellation Map visualization, Emotional Replay Mode (cinematic story unfolding), Hidden Exhibits discovery, Anonymous Voice Narration, Legacy Vault, Ghost of Potential / Regret Simulator.

**Waves:**
- Wave 1: Failure Constellation Map (D3/Three.js node graph)
- Wave 2: Emotional Replay Mode (stepped story reveal)
- Wave 3: Hidden Exhibits discovery UI
- Wave 4: Anonymous Voice Narration button
- Wave 5: Legacy Vault page (permanent exhibit)
- Wave 6: Ghost of Potential / alternate timeline UI
- Wave 7: Emotional Analytics dashboard (private)
- Wave 8: Burned Archive (deleted exhibits remnants)

**Success Criteria:**
- Constellation map shows connections between failures
- Replay mode reveals story in cinematic steps
- Hidden exhibits show unlock conditions
- Voice narration plays AI-generated audio
- Legacy Vault is visually permanent
- Alternate timeline generates branches
- Analytics show emotional patterns
- Burned archive shows fragmented remnants

---

### Phase 19: Integration, Testing & Deployment
**Goal:** End-to-end integration testing, performance optimization (60 FPS), accessibility audit, Vercel deployment (frontend), Railway deployment (backend), Neon database, CI/CD pipeline.

**Waves:**
- Wave 1: Frontend E2E tests (Playwright/Cypress)
- Wave 2: Backend integration tests
- Wave 3: Performance audit + optimization
- Wave 4: Accessibility compliance
- Wave 5: Vercel deployment configuration
- Wave 6: Railway deployment configuration
- Wave 7: Neon database migration + seeding
- Wave 8: CI/CD pipeline (GitHub Actions)
- Wave 9: Production smoke test

**Success Criteria:**
- All critical flows pass E2E tests
- Lighthouse score > 90 (Performance, Accessibility, SEO)
- Frontend deploys to Vercel without errors
- Backend deploys to Railway without errors
- Database migrations run automatically
- CI passes on every PR
- 60 FPS on target devices

---

### Phase 20: UI/UX Overhaul — Lamplit Archive
**Goal:** Replace the rejected dark/cinematic/EB-Garamond/ember-orange direction with Lamplit Archive — a bright editorial museum interface anchored by Fraunces serif, Geist sans, brass `#A8794B` accent, and a 3-layer 3D system (ambient shader / per-card artifacts / page set pieces). Per-room atmospheric tints. All 14 routes redesigned in Stitch first, then ported into the actual React tree.

**Waves:**
- Wave A: Design source of truth — archive prior `.stitch/`, create new Stitch project + design system, write fresh `.stitch/` metadata + DESIGN.md + SITE.md.
- Wave B: Stitch generation loop — 14 reference screens (5 Tier 1, 3 Tier 2, 6 Tier 3). HTML + PNG download to `.stitch/designs/`.
- Wave C: Foundations + primitives — rewrite `globals.css` (Lamplit Bone tokens + transitional aliases), `layout.tsx` (Fraunces + Geist + JetBrains Mono), `motion.ts` (single SPRING), `providers.tsx` (Sonner re-theme, light default). Build 11 lamplit primitives in `components/lamplit/`.
- Wave D: 3D system — single shared `<Canvas>` (root-canvas + lamplit-3d wrapper), Layer 1 ambient shader with per-room tint uniform, Layer 2 6 artifact families + category dispatcher, Layer 3 set-piece registration + landing-hero demonstrator.
- Wave E: Tier 1 page ports — `/`, `/exhibits`, `/exhibits/[id]`, `/rooms`, `/rooms/[slug]` + supporting components (nav, identity badge, reaction buttons, you-are-not-alone, reflection panel).
- Wave F: Tier 2 + Tier 3 page ports — `/exhibits/create`, `/constellation`, `/time-capsule`, `/rooms/random-walk`, `/rooms/last-attempts`, `/auth`, `/legacy`, `/curator`, `/about`, `/_not-found`.
- Wave G: Verification — `tsc --noEmit`, ESLint, `next build`, backend `tsc`. Bundle inspection.
- Wave H: Documentation — update `STATE.md`, append Phase 20 to `ROADMAP.md`, write `docs/design-system.md`.

**Success Criteria:**
- All 14 routes render under the Lamplit chrome with no references to the retired `void` / `ember` / `museum-*` colour names in their own JSX.
- Frontend `tsc`, `lint`, and `next build` all pass.
- Backend `tsc` still passes (untouched).
- Single shared `<Canvas>` mounted once at the layout level; pages register a set piece via `<SetPiece>` and the room tint via `setRoomTint()`.
- Spec at `.planning/phases/20-ui-overhaul/20-CONTEXT.md` and the design-system reference at `docs/design-system.md` are committed.

**Known follow-ups (deferred):** bundle-budget tuning to hit 220 kB gzipped; sculpting the 6 artifact families; remaining 8 page-level set pieces; Lighthouse + reduced-motion audit on real devices; updating the Playwright suite for the new selectors and copy.

---

## Phase Dependencies

```
Phase 1 (Scaffold) → All phases
Phase 2 (Schema) → Phase 4, 5, 6, 7, 8
Phase 3 (Auth) → Phase 4, 11
Phase 4 (Exhibit Backend) → Phase 11, 12
Phase 5 (Emotional Backend) → Phase 13
Phase 6 (Artifact Backend) → Phase 11
Phase 7 (AI Backend) → Phase 17
Phase 8 (Time Capsule Backend) → Phase 17
Phase 9 (Real-Time Backend) → Phase 16
Phase 10 (Frontend Foundation) → Phase 11, 12, 13, 14, 15, 16, 17, 18
Phase 11 (Frontend Exhibit) → Phase 13
Phase 12 (Frontend Rooms) → Phase 14, 15
Phase 13 (Frontend Emotional) → Phase 17
Phase 14 (Frontend Audio) → Phase 16
Phase 15 (3D Museum) → Phase 18
Phase 16 (Decay/Environment) → Phase 18
Phase 17 (AI/Time Capsule Frontend) → Phase 19
Phase 18 (Advanced Frontend) → Phase 19
Phase 19 (Integration) → Done
```

## Execution Waves

```
Wave 1: Phase 1, 2, 3 (independent)
Wave 2: Phase 4, 5, 6, 10 (depend on Wave 1)
Wave 3: Phase 7, 8, 9, 11, 12 (depend on Wave 2)
Wave 4: Phase 13, 14, 15 (depend on Wave 3)
Wave 5: Phase 16, 17 (depend on Wave 4)
Wave 6: Phase 18 (depends on Wave 5)
Wave 7: Phase 19 (depends on Wave 6)
```
