# My Museum of Failures — Requirements

## REQ-IDs Legend
- v1: Required for MVP
- v2: Post-MVP enhancement
- OOS: Out of scope (future)

---

## 1. Authentication & Identity

| ID | Requirement | Priority |
|---|---|---|
| REQ-001 | Email/password registration and login | v1 |
| REQ-002 | Google OAuth login | v1 |
| REQ-003 | Anonymous posting (no account required) | v1 |
| REQ-004 | Pseudonym account creation | v1 |
| REQ-005 | Real identity account | v1 |
| REQ-006 | Session management (JWT/cookies) | v1 |
| REQ-007 | Profile management | v2 |
| REQ-008 | Account deletion with burned archive | v2 |

## 2. Exhibit System

| ID | Requirement | Priority |
|---|---|---|
| REQ-010 | Create exhibit with title, story, category | v1 |
| REQ-011 | Emotional metadata (pain level, regret, recovery) | v1 |
| REQ-012 | Visibility mode selector (anonymous/pseudonym/real) | v1 |
| REQ-013 | Exhibit categories taxonomy | v1 |
| REQ-014 | Artifact upload (images, audio, PDFs, code) | v1 |
| REQ-015 | "What I thought would happen" vs "What actually happened" | v1 |
| REQ-016 | Lesson learned section | v1 |
| REQ-017 | Current status / recovery status | v1 |
| REQ-018 | Retry attempt tracking | v1 |
| REQ-019 | Emotional tags system | v1 |
| REQ-020 | Exhibit ID generation | v1 |
| REQ-021 | Edit exhibit | v2 |
| REQ-022 | Delete exhibit (with burned archive remnants) | v2 |
| REQ-023 | "What I Learned" highlighted section | v1 |

## 3. Museum Room System

| ID | Requirement | Priority |
|---|---|---|
| REQ-030 | Themed virtual rooms (Hall of Broken Dreams, Startup Cemetery, etc.) | v1 |
| REQ-031 | Room-specific atmosphere (lighting, ambience, textures) | v1 |
| REQ-032 | Room navigation/exploration | v1 |
| REQ-033 | Random museum walk | v2 |
| REQ-034 | Hidden rooms | v2 |
| REQ-035 | "The Last Attempt" dedicated section | v2 |

## 4. Emotional Reaction System

| ID | Requirement | Priority |
|---|---|---|
| REQ-040 | Reaction options: "I relate", "I survived this too", "Still recovering", "This hurt", "You were brave", "I understand" | v1 |
| REQ-041 | No likes, no follower metrics | v1 |
| REQ-042 | Reaction counts per exhibit | v1 |
| REQ-043 | "You Are Not Alone" similar posts | v2 |
| REQ-044 | Silence rooms (no reactions allowed) | v2 |

## 5. Emotional Metadata & Analytics

| ID | Requirement | Priority |
|---|---|---|
| REQ-050 | Pain level slider (1-10) | v1 |
| REQ-051 | Regret level | v1 |
| REQ-052 | Recovery progress indicator | v1 |
| REQ-053 | "Still hurts?" toggle | v1 |
| REQ-054 | "Would you retry?" toggle | v1 |
| REQ-055 | Ending status selector (Destroyed me, Changed me, etc.) | v1 |
| REQ-056 | Emotional analytics dashboard (private) | v2 |

## 6. Artifact System

| ID | Requirement | Priority |
|---|---|---|
| REQ-060 | Upload images, screenshots, rejection emails | v1 |
| REQ-061 | Upload audio files | v1 |
| REQ-062 | Upload PDFs and documents | v2 |
| REQ-063 | Upload code snippets (syntax highlighted) | v2 |
| REQ-064 | Cloudflare R2 storage integration | v1 |
| REQ-065 | Artifact visual degradation over time | v2 |

## 7. AI Reflection System

| ID | Requirement | Priority |
|---|---|---|
| REQ-070 | AI emotional summarization | v2 |
| REQ-071 | AI pattern recognition | v2 |
| REQ-072 | AI reflective observations | v2 |
| REQ-073 | AI cognitive reframing | v2 |
| REQ-074 | AI-curated exhibitions | v2 |
| REQ-075 | Museum Curator AI (melancholic guide) | v2 |

## 8. Time Capsule System

| ID | Requirement | Priority |
|---|---|---|
| REQ-080 | Write letters to future self | v2 |
| REQ-081 | Lock reflections with future unlock date | v2 |
| REQ-082 | Revisit old failures with status updates | v2 |
| REQ-083 | "Recovered Artifacts" — revisit years later | v2 |

## 9. Immersive Atmosphere

| ID | Requirement | Priority |
|---|---|---|
| REQ-090 | Ambient sound system (rain, footsteps, echoes) | v1 |
| REQ-091 | Cinematic lighting design | v1 |
| REQ-092 | Dust particles / atmospheric effects | v1 |
| REQ-093 | Cracked glass, burnt edges, torn paper aesthetics | v1 |
| REQ-094 | Projector flicker effects | v1 |
| REQ-095 | Museum navigation feel (not scrolling) | v1 |
| REQ-096 | Dynamic emotional environment | v2 |

## 10. Memory Decay System

| ID | Requirement | Priority |
|---|---|---|
| REQ-100 | Old exhibits visually decay over time | v2 |
| REQ-101 | Fading text, dust accumulation | v2 |
| REQ-102 | Corrupted photo visuals | v2 |
| REQ-103 | Broken exhibit frames | v2 |

## 11. Dynamic Environment System

| ID | Requirement | Priority |
|---|---|---|
| REQ-110 | Environment changes based on story intensity | v2 |
| REQ-111 | Rain ambience for heartbreak stories | v2 |
| REQ-112 | Dim lighting for burnout stories | v2 |
| REQ-113 | Warmer lighting for recovery stories | v2 |
| REQ-114 | Night mode / Midnight mode | v2 |
| REQ-115 | Emotional Weather Engine | v2 |

## 12. Exploration & Discovery

| ID | Requirement | Priority |
|---|---|---|
| REQ-120 | Browse exhibits by category | v1 |
| REQ-121 | Emotional search (search by feeling) | v2 |
| REQ-122 | Failure Constellation Map | v2 |
| REQ-123 | "Unread Confessions" — fresh posts | v2 |
| REQ-124 | Hidden exhibits (unlock criteria) | v2 |
| REQ-125 | One Sentence Confessions | v2 |

## 13. Interactive Visuals

| ID | Requirement | Priority |
|---|---|---|
| REQ-130 | 3D museum rooms (React Three Fiber) | v2 |
| REQ-131 | Walkable 3D museum | v2 |
| REQ-132 | Interactive exhibit cards (cracked glass, etc.) | v1 |
| REQ-133 | Interactive physicality (objects react) | v2 |
| REQ-134 | Emotional Replay Mode (cinematic storytelling) | v2 |
| REQ-135 | Anonymous Voice Narration (AI-generated) | v2 |
| REQ-136 | Regret Simulator / alternate timeline | v2 |

## 14. Social Features

| ID | Requirement | Priority |
|---|---|---|
| REQ-140 | Anonymous/safe community | v1 |
| REQ-141 | "You Are Not Alone" connections | v2 |
| REQ-142 | Legacy Vault (one permanent exhibit) | v2 |

## 15. Frontend Foundation

| ID | Requirement | Priority |
|---|---|---|
| REQ-150 | Next.js App Router setup | v1 |
| REQ-151 | TypeScript strict mode | v1 |
| REQ-152 | TailwindCSS design tokens | v1 |
| REQ-153 | shadcn/ui primitives | v1 |
| REQ-154 | Framer Motion animation system | v1 |
| REQ-155 | Zustand state management | v1 |
| REQ-156 | TanStack Query data fetching | v1 |
| REQ-157 | Howler.js audio engine | v1 |
| REQ-158 | React Three Fiber scene setup | v2 |

## 16. Backend Foundation

| ID | Requirement | Priority |
|---|---|---|
| REQ-160 | NestJS modular architecture | v1 |
| REQ-161 | tRPC API endpoints | v1 |
| REQ-162 | Prisma schema + PostgreSQL | v1 |
| REQ-163 | Socket.IO real-time | v2 |
| REQ-164 | Cloudflare R2 file storage | v1 |
| REQ-165 | Better Auth integration | v1 |

## Complete Feature Checklist (from vision document)

- [x] Failure Timeline (first attempt → collapse → recovery → retry → current)
- [x] Museum Rooms (Career Graveyard, Startup Cemetery, Hall of Broken Dreams, etc.)
- [x] Emotional Metadata (pain level, regret, recovery)
- [x] Artifact System (screenshots, rejection mails, photos, code, notes)
- [x] Anonymous Voice Narration (AI)
- [x] "What I Learned" section
- [x] Before vs Reality two-panel
- [x] Failure Heatmap (age, categories, countries, intensity)
- [x] Time Capsule (future promises, letters to future self)
- [x] Retry Tracking (Retried, Recovered, Pivoted, Still failing, Gave up)
- [x] "You Are Not Alone" similar posts
- [x] Museum Audio Atmosphere (rain, footsteps, echoes, projector, tape recorder)
- [x] Interactive Exhibit Cards (cracked glass, burnt edges, torn paper)
- [x] Random Museum Walk
- [x] "Unread Confessions"
- [x] Emotional Reaction System (I relate, I survived, Still recovering, etc.)
- [x] AI Reflection Mode (emotional summary, patterns, reframing)
- [x] Ending Status (Destroyed me, Changed me, Still defining me, etc.)
- [x] Memory Decay System (fading ink, dust, corrupted photos, broken frames)
- [x] Hidden Exhibits (unlock criteria)
- [x] Emotional Weather Engine (atmosphere changes based on stories)
- [x] Walkable 3D Museum (React Three Fiber)
- [x] "The Last Attempt" section
- [x] Failure Constellation Map
- [x] Emotional Replay Mode (cinematic unfolding)
- [x] AI-Curated Exhibitions
- [x] Silence Rooms (no comments)
- [x] One Sentence Confessions
- [x] Emotional Search (search by feeling)
- [x] Ghost of Potential (alternate timeline)
- [x] Regret Simulator (branching narrative)
- [x] Museum Curator AI (melancholic guide)
- [x] "Unfinished Exhibits" (intentionally incomplete)
- [x] Burned Archive (deleted = partially burned remnants)
- [x] Midnight Mode (darker at night)
- [x] Emotional Analytics (private patterns)
- [x] Legacy Vault (one permanent exhibit)
- [x] "Recovered Artifacts" (years-later updates)
- [x] Interactive Physicality (cracked glass, flickering lights, heartbeat sounds)
