# Enpale MVP — Implementation Plan

## Context

**Enpale** = **EN**gagement + **PA**ssion + **LE**arning. A kids educational platform (ages 6–13) for middle-class families who want their children actively learning instead of doom-scrolling.

The product is a **village of personalized AI-generated games** the kid collects, plays, and levels up — modeled on DragonVale's compulsion loop. Each game is an **Enpa**: a unique creature/collectible the AI hatched from the kid's specific interests. Common interest combinations produce common Enpas; rare combinations and earned achievements produce rare/legendary Enpas the kid can show off.

**The loop:**
1. Kid arrives at their **village** (home screen) — sees their existing Enpas plus any eggs still incubating
2. Taps "+New Enpa" → 3-model AI pipeline: interest discovery → game design → code generation
3. While the new Enpa incubates as a glowing egg in the village, kid can play their existing Enpas
4. Egg hatches → new Enpa appears in the village with a rarity glow (common → legendary)
5. Playing an Enpa earns XP and triggers checkpoints → Enpa levels up (visual evolution + boosted rarity)
6. Rare/legendary Enpas appear on the leaderboard

**MVP goal:** Fully live, end-to-end working demo for investors that shows the full village loop — not just one-shot game generation. Persistence is device-local (localStorage) for MVP, with a DB schema designed up front so a backend sync layer can be added cleanly later.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | Python 3.12 + FastAPI |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Client state | Zustand (UI/session state only, ephemeral) |
| Persistence | `localStorage` for MVP via `idb-keyval` (kid profile, Enpa collection, XP, checkpoints) |
| Routing | React Router v6 |
| Game delivery | Self-contained HTML in sandboxed `<iframe>` via Blob URL |
| Iframe ↔ parent | `window.postMessage` for checkpoint events |

**No backend DB for MVP** — but the persistence layer is split into a `repository` interface (`EnpaRepository`, `KidProfileRepository`) backed by localStorage today, so swapping in a SQLite/Postgres + REST sync layer later requires no UI changes.

---

## Directory Structure

```
Enpale/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI factory, CORS, lifespan
│   │   ├── config.py                # pydantic-settings, reads .env
│   │   ├── models/
│   │   │   ├── interest_profile.py
│   │   │   ├── game_design.py
│   │   │   └── generated_game.py
│   │   ├── routers/
│   │   │   ├── interest.py          # /api/v1/interest/*
│   │   │   ├── design.py            # /api/v1/design/generate
│   │   │   └── game.py              # /api/v1/game/generate (SSE)
│   │   ├── services/
│   │   │   ├── claude_client.py     # Anthropic SDK wrapper
│   │   │   ├── interest_service.py  # Model 1
│   │   │   ├── design_service.py    # Model 2 — core IP
│   │   │   └── game_service.py      # Model 3 + in-memory LRU store
│   │   ├── prompts/
│   │   │   ├── interest_prompts.py
│   │   │   ├── design_prompts.py
│   │   │   └── game_prompts.py
│   │   └── middleware/
│   │       └── rate_limit.py        # 10 generations/IP/hour
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/topic-cards/          # SVG/PNG card images (or emoji+CSS)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── WelcomePage.tsx      # First-run only: name + age entry → creates KidProfile
│   │   │   ├── VillagePage.tsx      # HOME — Enpa collection grid, eggs, +New, leaderboard tab
│   │   │   ├── TopicSelectPage.tsx  # Pick interests for a NEW Enpa
│   │   │   ├── ChatPage.tsx         # Sparky interview
│   │   │   ├── IncubationPage.tsx   # Pipeline orchestration + egg view (replaces Design+Generating)
│   │   │   ├── EnpaDetailPage.tsx   # Tap an Enpa → see info, checkpoints, level, [Play]
│   │   │   ├── GamePage.tsx         # iframe play surface, listens for checkpoint postMessages
│   │   │   └── LeaderboardPage.tsx  # Rare/legendary Enpas showcase
│   │   ├── components/
│   │   │   ├── TopicCard.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── EggHatch.tsx         # Reusable egg with crack/shake/burst CSS animations
│   │   │   ├── EnpaCard.tsx         # Grid tile: rarity glow, level badge, name, status
│   │   │   ├── RarityGlow.tsx       # Wrapper that applies the rarity-tier visual treatment
│   │   │   ├── XPBar.tsx
│   │   │   ├── CheckpointList.tsx
│   │   │   └── GameFrame.tsx
│   │   ├── hooks/
│   │   │   ├── useInterestChat.ts
│   │   │   ├── useGameStream.ts     # fetch-based SSE consumer
│   │   │   ├── useIncubation.ts     # Phase state machine for the egg
│   │   │   ├── useEnpaCollection.ts # Reads/writes Enpas via repository
│   │   │   └── useCheckpointListener.ts  # window.addEventListener('message') → award XP
│   │   ├── repository/
│   │   │   ├── types.ts             # EnpaRepository / KidProfileRepository interfaces
│   │   │   ├── localStorageRepo.ts  # Current implementation (idb-keyval under the hood)
│   │   │   └── index.ts             # Single export — swap point for future API repo
│   │   ├── domain/
│   │   │   ├── rarity.ts            # Tier mapping + glow style + score → tier function
│   │   │   ├── leveling.ts          # XP curve, level-up rules, checkpoint → XP mapping
│   │   │   └── eggColor.ts          # Interest-keyword → palette mapping
│   │   ├── store/sessionStore.ts    # Zustand: ephemeral pipeline state (chat, incubation phase)
│   │   ├── api/client.ts
│   │   └── types/index.ts           # TS mirrors of Pydantic models + Enpa/KidProfile
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── docker-compose.yml
└── README.md
```

---

## Core Concept: The Enpa

An **Enpa** is a single AI-generated educational game treated as a collectible creature. Each Enpa has a lifecycle, a rarity, a level, and a personality (its theme + tagline + visual color). The kid's village is their collection of Enpas.

### Lifecycle states
- `incubating` — egg is in the village, generation pipeline is running
- `hatched` — game is playable, level 1
- `leveled` — at least one checkpoint completed, has earned XP

### Rarity tiers (5 total)
| Tier | Score range | Visual treatment |
|---|---|---|
| Common | 0–20 | Soft gray glow |
| Uncommon | 21–40 | Green glow |
| Rare | 41–60 | Blue glow + sparkles |
| Epic | 61–80 | Purple glow + animated sparkles |
| Legendary | 81–100 | Animated rainbow glow + particle aura |

### Where rarity comes from
**Base rarity** (set when GDD is generated) — Model 2 Stage 3 outputs a `combo_rarity_score` (0–60) reflecting how unusual the interest combination is. "Dinosaurs + math" is common; "origami + bioluminescence" is rare.

**Earned rarity boost** (added by client over time) — completing checkpoints adds points: each checkpoint = +5, all checkpoints in an Enpa = +15 bonus, reaching level 3 = +20. Final rarity = `min(100, combo_rarity_score + earned_boost)`.

### Levels & checkpoints
Each Enpa has **3 checkpoints** (defined in the GDD by Model 2). The game JS code calls `window.parent.postMessage({type:'ENPA_CHECKPOINT', checkpointId})` when a checkpoint is reached. The React app awards XP and persists to localStorage.

| Level | Trigger | Effect |
|---|---|---|
| 1 | Hatch | Default Enpa state |
| 2 | 1 checkpoint | XP bar fills, small sparkle animation in the village |
| 3 | All 3 checkpoints | "Level Up!" celebration, rarity boost, evolution effect on EnpaCard |

For MVP, leveling is a visual/rarity reward — the game itself isn't regenerated at higher levels (that's a phase-2 enhancement: regenerate the Enpa with `technical_complexity` increased).

---

## API Endpoints (`/api/v1`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/interest/topics` | Receive selected card IDs → return `session_id` + opening chat message |
| POST | `/interest/chat` | Single chat turn (full history sent by client each call) |
| POST | `/interest/finalize` | Synthesize chat → `InterestProfile` JSON |
| POST | `/design/generate` | `InterestProfile` → `GameDesignDocument` (3-stage chain, includes `combo_rarity_score` + `checkpoints[]`) |
| POST | `/game/generate` | `GameDesignDocument` → SSE stream of HTML chunks (game JS contains checkpoint `postMessage` calls) |
| GET | `/game/{game_id}` | Retrieve cached `GeneratedGame` (in-memory LRU, max 50, eviction-tolerant since client also stores HTML) |

**Backend stays stateless.** All village/Enpa/XP/level data lives in `localStorage` on the kid's device. The backend only knows about pipeline calls. When the village's `EnpaRepository` switches to API-backed in phase 2, new endpoints (`GET/POST /enpas`, `POST /enpas/:id/checkpoint`, `GET /leaderboard`) will be added — designed but not built for MVP.

---

## Data Models

Three backend Pydantic models (server-side AI pipeline I/O) plus two client-only TS models (village state).

### `InterestProfile`
```
session_id, kid_name, age, age_group (enum: early_elementary/late_elementary/middle_school)
primary_interest           # specific: "rockets that escape gravity" not "space"
secondary_interests[]      # up to 3
excitement_keywords[]      # verbatim words the kid used enthusiastically
preferred_game_style       # "building", "action", "puzzle", "exploring"
attention_span_signal      # "short" | "medium" | "long"
chat_summary               # 2-3 sentences written for an AI game designer
notable_quotes[]           # memorable verbatim phrases
```

### `GameDesignDocument`
```
session_id, game_title, tagline, genre, age_group
estimated_play_time_minutes, difficulty_label
primary_learning_objective  # { concept, subject_area, grade_level_standard, how_embedded }
secondary_learning_objectives[]  # up to 2
core_premise               # plain-English developer brief
win_condition, fail_condition, scoring_system
game_mechanics[]           # { name, description, educational_connection, interaction_type }
feedback_loops[]           # { trigger, feedback_type, message_if_correct/incorrect, educational_reinforcement }
visual_theme, character_or_avatar, narrative_framing
canvas_required (bool), technical_complexity, mobile_input_note, accessibility_notes

# NEW for village system:
combo_rarity_score (int 0–60)        # how unusual the interest combination is
combo_rarity_reasoning (str)         # 1-line explanation for kid: "Origami + Mars = super rare!"
egg_color_palette                    # { primary, secondary, accent } hex codes themed to interest
checkpoints[]                        # exactly 3 items: { id, name, kid_facing_description, trigger_hint_for_game_code }
```

### `GeneratedGame`
```
game_id, session_id, game_title
html_content               # complete self-contained HTML file with checkpoint postMessage calls
learning_summary           # parent-facing explanation
concepts_covered[]         # bullet list for "What you'll learn" card
age_group, estimated_play_time_minutes
html_byte_size, generation_tokens_used, created_at
html_validated (bool), contains_external_resources (bool)
checkpoint_calls_validated (bool)    # post-process check: all 3 checkpoint IDs appear in postMessage calls
```

---

### Client-only models (TypeScript, persisted in localStorage)

### `KidProfile`
```ts
{
  id: string,                 // uuid
  name: string,
  age: number,
  ageGroup: 'early_elementary' | 'late_elementary' | 'middle_school',
  totalXP: number,
  enpasHatched: number,
  legendaryCount: number,
  createdAt: ISO8601
}
```

### `Enpa`
```ts
{
  enpaId: string,             // uuid
  sessionId: string,          // links back to backend session
  status: 'incubating' | 'hatched' | 'leveled',
  level: 1 | 2 | 3,
  xp: number,
  // Identity
  title: string,
  tagline: string,
  eggColor: { primary, secondary, accent },
  // Rarity
  comboRarityScore: number,   // from GDD, 0–60
  earnedBoost: number,        // accrued client-side
  rarityTier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',  // computed
  // Snapshot for re-display without re-fetch
  conceptsCovered: string[],
  learningSummary: string,
  // Checkpoints
  checkpoints: Array<{ id, name, description, completed: boolean, completedAt?: ISO8601 }>,
  // Game payload
  htmlContent: string,        // stored in IndexedDB via idb-keyval (not in main localStorage to avoid 5MB cap)
  // Timestamps
  createdAt: ISO8601,
  hatchedAt?: ISO8601,
  lastPlayedAt?: ISO8601
}
```

**Storage split:** `KidProfile` and Enpa metadata (everything except `htmlContent`) lives in `localStorage` for fast sync access. Each Enpa's `htmlContent` lives in IndexedDB keyed by `enpaId` to avoid the ~5MB localStorage limit (5 Enpas × ~50KB HTML would already be tight if combined with other state).

---

## The Three-Model Pipeline

### Model 1 — Interest Discovery

**Approach:** Visual card selection (24 topics, TikTok-style onboarding) + AI chat interview (3–5 turns) → structured `InterestProfile`.

**"Sparky" system prompt key rules:**
- Max 2 sentences per response, one question at a time
- Never say "educational", "learning", or "curriculum"
- When 3–5 turns yield enough signal, end message with `[READY_TO_BUILD]`
- Chat history sent by client each turn (stateless server)

**Settings:** `temperature=0.8`, `max_tokens=150` per chat turn; `temperature=0.1` for finalization extraction.

**Finalization call:** Single non-streaming call — "extract structured JSON from this conversation" using `extract_json()` utility (strips markdown fences before parsing).

---

### Model 2 — Gamification Designer (Core IP)

A **3-stage sequential prompt chain**. All three stages run server-side before the endpoint returns.

**Stage 1 — Educational Concept Selection** (`temperature=0.6`):
- Input: `InterestProfile`
- Reason: What STEM/life concepts live inside this interest? What is age-appropriate? What can be *felt and manipulated* (not memorized)?
- Output JSON: `{ primary_concept, secondary_concepts[], rejected_concepts[] }`

**Stage 2 — Game Mechanic Design** (`temperature=0.6`):
- Input: `InterestProfile` + Stage 1 output
- Follows a named reasoning chain:
  - **Step A** — Core loop: What is the single most fun repeatable action that exercises the primary concept?
  - **Step B** — Thematic skin: How do the kid's exact excitement keywords become the visual/narrative wrapper?
  - **Step C** — Feedback architecture: Design one cause-and-effect feedback moment per concept
  - **Step D** — Difficulty progression: 3 levels that require deeper understanding, not faster reflexes
  - **Step E** — Win/fail: Winning feels great; failing teaches rather than punishes
- Output: Full `GameDesignDocument` JSON

**Stage 2.5 — Checkpoint Authoring** (folded into Stage 2 prompt):
- Define exactly 3 checkpoints, ordered easy → medium → hard
- Each checkpoint must be **observable from the game's JS state** (e.g., score threshold, level reached, specific action performed N times) so the generated game code can detect it
- Each checkpoint includes a `trigger_hint_for_game_code` — a precise instruction Model 3 will use when generating the game ("when `orbits_completed >= 1`, emit checkpoint_1")

**Stage 3 — Validation Pass + Rarity Scoring** (`temperature=0.1`):
- Self-critique: Is learning embodied in gameplay (not quiz-style)? Is complexity age-appropriate? Is `canvas_required` correct? Are play time estimates realistic? Are any mechanics too hard to code in vanilla JS? Are the 3 checkpoints actually detectable in code?
- **Rarity scoring:** Score the interest combination on a 0–60 scale based on commonality. Examples baked into the prompt:
  - Common (0–15): "dinosaurs", "space", "soccer", "Minecraft", single-topic
  - Uncommon (16–30): two-topic combos like "space + animals"
  - Rare (31–45): unusual combos like "origami + chemistry"
  - Very rare (46–60): highly specific niche pairings like "bioluminescent deep-sea creatures + cryptography"
- Output: corrected GDD JSON including `combo_rarity_score`, `combo_rarity_reasoning`, `egg_color_palette`, `checkpoints[]`

**Anti-quiz rule:** Stage 2 prompt explicitly contrasts "good" (player adjusts thrust to experience Newton's 3rd law) vs "bad" (quiz: "What is Newton's 3rd law?"). Stage 3 flags `type-answer`-only mechanic sets as quiz-disguised-as-game and redesigns.

---

### Model 3 — Game Code Generator

**Output:** Complete self-contained `<!DOCTYPE html>` file — inline CSS, inline JS, no external resources.

**Absolute rules embedded in system prompt:**
1. Output starts with `<!DOCTYPE html>`, ends with `</html>`, no markdown fences
2. No CDN links, no `fetch()`, no external images — must work offline in sandboxed iframe
3. Mouse AND touch listeners on all interactive elements
4. Min 16px fonts, 44×44px tap targets, high contrast
5. Visible score/progress indicator
6. Max 2000 lines
7. End JS with `// ENPALE_GAME_COMPLETE: {game_title}` as completion marker
8. **Checkpoint emission (mandatory):** For each of the 3 checkpoints in the GDD, the JS code MUST call `window.parent.postMessage({type:'ENPA_CHECKPOINT', checkpointId:'<id>'}, '*')` exactly once when the trigger condition is met. The system prompt receives the GDD's `trigger_hint_for_game_code` for each checkpoint and must wire detection into game state. A helper function `emitCheckpoint(id)` should be defined once and called from the appropriate state transitions.

**Settings:** `temperature=0.2`, `max_tokens=8192`, **streaming enabled** (SSE).

**Post-processing in `game_service.py`:**
- Detect external `src`/`href` → strip and set `contains_external_resources=True`; retry once with reinforced constraint
- Wrap all `<script>` blocks in `try { ... } catch(e) { document.body.innerHTML = 'Game error: '+e.message }` for graceful failure
- Validate `<!DOCTYPE html>` + `</html>` + completion marker present; if marker absent (hit token limit) → retry with `technical_complexity` downgraded
- **Checkpoint validation:** regex-search for each checkpoint ID inside a `postMessage` call. If any of the 3 IDs is missing, set `checkpoint_calls_validated=False` and retry once with reinforced instruction that quotes the missing ID. If still missing after retry, ship anyway but flag for client-side degraded mode (kid still gets the game; that checkpoint just can't fire).

---

## Frontend UX Flow

```
First-run only:
WelcomePage       → kid enters name + age → KidProfile saved to localStorage
                    → navigate to VillagePage

Steady-state home:
VillagePage       → Grid of EnpaCards (hatched + incubating eggs)
                    → Header: kid name, total XP, Enpas hatched, legendary count
                    → Tabs: "My Village" | "Leaderboard"
                    → Floating "+ Hatch a New Enpa" button → TopicSelectPage
                    → Tap an Enpa → EnpaDetailPage
                    → Tap an incubating egg → IncubationPage (resume animation)

New Enpa flow:
TopicSelectPage   → 24 cards, pick 1–4
                    → POST /interest/topics → session_id + opening message
ChatPage          → 3–6 turns with Sparky → [READY_TO_BUILD]
                    → POST /interest/finalize → InterestProfile
                    → Create Enpa record (status='incubating') in localStorage
                    → navigate to IncubationPage
IncubationPage    → Egg incubation animation (~75–90s)
                    → POST /design/generate → GDD with rarity + checkpoints
                    → Update Enpa record with title, rarity, checkpoints
                    → POST /game/generate (SSE) → htmlContent
                    → Save HTML to IndexedDB, mark Enpa status='hatched', set hatchedAt
                    → Hatch animation → navigate to EnpaDetailPage with hatching=true

Play flow:
EnpaDetailPage    → Shows Enpa portrait, rarity tier, level, XP bar, checkpoint list
                    → "What you'll learn" card (parent-facing)
                    → Big "Play" button → GamePage
GamePage          → Loads htmlContent from IndexedDB into iframe (Blob URL)
                    → Listens for ENPA_CHECKPOINT postMessages
                    → On checkpoint: animate XP gain, update Enpa, persist
                    → On level-up: full-screen celebration overlay
                    → "Back to Village" → VillagePage

Leaderboard:
LeaderboardPage   → Local-only for MVP — kid's own Enpas sorted by rarity tier
                    → Legendary section at top with rainbow-glow display
                    → "Coming soon: see other kids' rare Enpas" teaser
```

---

## Incubation Experience (Key Engagement Feature)

Inspired by DragonVale's egg incubation mechanic. Instead of a spinner, the kid watches a glowing egg slowly crack and hatch while their personalized game is being built inside it.

### Concept
The egg is the game. The idea is: your game is alive inside this egg — it's growing, it's almost ready, it was made just for you. When it hatches, that's your game.

### Egg Phases (tied to real backend progress)

| Phase | Backend Event | Visual | Copy |
|---|---|---|---|
| 1 — Sealed | POST /design/generate starts | Glowing, pulsing egg, no cracks | "Your game egg is warming up..." |
| 2 — First crack | GDD Stage 1 complete (concept selected) | One small crack appears, light leaks out | "We figured out what you'll learn!" |
| 3 — Hatching | GDD Stage 2 complete (game designed) | 3 cracks, glow intensifies, game title appears | "{game_title} is taking shape!" |
| 4 — Cracking open | Model 3 SSE progress ~50% | Egg shaking, multiple cracks, stars/sparks | "Almost ready... your game is being coded!" |
| 5 — Hatching! | `complete` SSE event | Egg shatters with particle burst, game tagline revealed | "Your game is ready, {kid_name}!" |

### Implementation

**Single `IncubationPage.tsx`** orchestrates the full pipeline and persists progress to localStorage at every step (so the kid can navigate away and come back to a still-incubating egg without losing state):

1. On mount: read or create the in-flight `Enpa` record (status=`incubating`)
2. Immediately render the egg (Phase 1)
3. Call `POST /design/generate` in background — no UI blocking
4. On GDD response received → write `combo_rarity_score`, `egg_color_palette`, `title`, `tagline`, `checkpoints[]` into the Enpa record → advance egg to Phase 2, then 3 (1s delay for drama)
5. Immediately start `POST /game/generate` SSE stream
6. Map SSE `progress` events → egg Phase 4 (shaking animation)
7. On `complete` SSE event → write `htmlContent` to IndexedDB, mark Enpa `status='hatched'`, `hatchedAt=now` → trigger Phase 5 hatch animation (CSS keyframe burst)
8. After hatch animation (~2s) → navigate to `EnpaDetailPage` with `hatching=true` route state

**Resilience:** If the kid closes the browser mid-incubation, on next load the village will show the egg as `incubating` but pipeline-stalled. Tapping it re-enters `IncubationPage`, which checks: if no GDD yet → restart from `/design/generate`; if GDD but no HTML → restart from `/game/generate`. The pipeline is idempotent at this granularity for MVP.

**Background incubation (stretch goal for MVP):** While an egg is incubating, the kid can navigate back to the village and play other Enpas. The pipeline calls continue in a background hook (`useBackgroundPipeline`) registered at the app root. If achievable in time budget, this is a major UX win — DragonVale users wait days for eggs; ours waits 90s but feels even more alive if they can multitask.

**Egg visual** — pure CSS + SVG, no external assets:
- Egg shape: CSS `border-radius` trick or inline SVG path
- Cracks: SVG `<path>` elements that appear via CSS `opacity` transitions
- Glow: CSS `box-shadow` pulse animation (`@keyframes pulse`)
- Shaking: CSS `@keyframes shake` (translate X ±4px)
- Hatch burst: CSS `@keyframes explode` scaling + opacity out on egg; particles as absolutely-positioned divs animating outward
- Color: themed to the kid's primary interest (mapped from `InterestProfile.primary_interest` → a color palette: space=deep blue/gold, dinosaurs=green/amber, ocean=teal, etc.)

**Fun facts ticker** — while the egg incubates, rotate through 3–4 short teaser messages every 8 seconds:
- "Did you know? {excitement_keyword from their profile} is the perfect thing to build a game around."
- "Inside this egg: {tagline} (shown only after GDD is ready)"
- "Your game is being coded line by line, just for you."
- "No two Enpale games are ever the same."

**`useIncubation` hook** manages the phase state machine and exposes `{ phase, eggColor, gameTitleReveal, taglineReveal }` to the page component.

### Component: `EnpaDetailPage` Hatch Reveal

When navigating from `IncubationPage` → `EnpaDetailPage`, the egg does not disappear — it continues its hatch animation on the detail page and the Enpa "portrait" (a stylized creature avatar built from the `egg_color_palette` + rarity glow) fades in underneath as the shell pieces fall away.

Technically: pass `hatching=true` as route state; the page starts with egg overlay at `z-index: 10`, runs a 2-second CSS keyframe where shell pieces scale up + rotate + fade out, then the rarity glow ramps up around the Enpa portrait. A "Legendary!" / "Rare!" / etc. tier banner slides in last for non-common tiers.

---

## Village Home Screen

The `VillagePage` is the heart of the product. It must feel alive even before the kid plays anything.

### Layout (mobile-first)
```
┌──────────────────────────────────────┐
│  Hi, Alex!         🏆 2 Legendary    │
│  Total XP: 340     🥚 1 incubating   │
├──────────────────────────────────────┤
│  [ My Village ]    [ Leaderboard ]   │
├──────────────────────────────────────┤
│                                      │
│   ┌────┐  ┌────┐  ┌────┐             │
│   │ 🥚 │  │Enpa│  │Enpa│             │
│   │incu│  │ L2 │  │ L3 │             │
│   └────┘  └────┘  └────┘             │
│                                      │
│   ┌────┐  ┌────┐                     │
│   │Enpa│  │Enpa│                     │
│   │ L1 │  │ L1 │                     │
│   └────┘  └────┘                     │
│                                      │
│        ┌──────────────────┐          │
│        │ + Hatch new Enpa │          │
│        └──────────────────┘          │
└──────────────────────────────────────┘
```

### `EnpaCard` visual states
- **Incubating:** Pulsing egg in palette colors, no name, status copy ("Hatching..." or progress %)
- **Hatched, Common:** Soft gray glow, name, level badge "L1", small XP bar
- **Hatched, Uncommon/Rare:** Colored glow per tier, sparkle icon
- **Hatched, Epic:** Animated shimmer overlay
- **Hatched, Legendary:** Continuously animated rainbow border, particle aura, slight idle "breathing" scale animation

### `LeaderboardPage` (MVP scope)
Local-only — sorts the kid's own Enpas by `rarityScore` descending. Top 3 get a "podium" treatment. The legendary tier section has a "Hall of Fame" header. A teaser at the bottom: "Coming soon — see the rarest Enpas hatched by other kids around the world!" — sets up phase 2 social.

---

## Persistence Layer (localStorage now, DB later)

### Repository interface (`frontend/src/repository/types.ts`)
```ts
interface KidProfileRepository {
  get(): Promise<KidProfile | null>
  save(profile: KidProfile): Promise<void>
  update(patch: Partial<KidProfile>): Promise<KidProfile>
}

interface EnpaRepository {
  list(): Promise<Enpa[]>
  get(enpaId: string): Promise<Enpa | null>
  create(enpa: Enpa): Promise<void>
  update(enpaId: string, patch: Partial<Enpa>): Promise<Enpa>
  saveHtml(enpaId: string, html: string): Promise<void>     // → IndexedDB
  loadHtml(enpaId: string): Promise<string | null>          // → IndexedDB
  delete(enpaId: string): Promise<void>
}
```

### MVP implementation: `localStorageRepo.ts`
- `KidProfile` → `localStorage['enpale.kid_profile']` as JSON
- `Enpa[]` metadata → `localStorage['enpale.enpas']` as JSON array (no html_content)
- Each Enpa's HTML → IndexedDB key `enpale.enpa_html.<enpaId>` via `idb-keyval`
- All writes go through the repo; the repo emits events on a window EventTarget so `useEnpaCollection` can re-render

### Phase-2 swap path
A `apiRepo.ts` will implement the same interfaces, calling `GET/POST /api/v1/enpas/*`. The single export in `repository/index.ts` switches based on `import.meta.env.VITE_PERSISTENCE` (`'local'` vs `'api'`). No UI code changes.

---

## Leveling & Checkpoint System

### Postmessage contract (iframe → parent)
The generated game JS calls:
```js
window.parent.postMessage({
  type: 'ENPA_CHECKPOINT',
  checkpointId: 'checkpoint_2',
  enpaId: '<game_id>'  // Model 3 substitutes this from the GDD
}, '*');
```

### Listener (`useCheckpointListener.ts`)
- Registers at `GamePage` mount, removes on unmount
- Validates: `event.source` matches the iframe's `contentWindow`; message type is exactly `ENPA_CHECKPOINT`; `checkpointId` matches one of the Enpa's defined checkpoint IDs; checkpoint not already completed
- On valid event:
  1. Mark checkpoint completed with timestamp
  2. Award XP via `domain/leveling.ts` (10 XP per checkpoint, 30 bonus for all-3)
  3. Recompute level (level 2 at 10+ XP, level 3 at 30+ XP)
  4. Recompute rarity boost: +5 per checkpoint, +15 all-3, +20 at level 3 → final rarity tier
  5. Persist via `EnpaRepository.update()`
  6. Trigger UI animation overlay ("Checkpoint! +10 XP" / "Level Up!" / "Rarity boosted!")

### Anti-cheat (light)
For MVP we trust the iframe's checkpoint events (this is single-player, no leaderboard impact yet). Phase 2: backend signs checkpoints when leaderboard goes social, so iframe-side cheating doesn't pollute global rankings.

---

## SSE Streaming (Game Generation)

**Why `fetch` + `ReadableStream` not `EventSource`:** Native `EventSource` is GET-only; we need to POST the GDD.

**Backend:** `StreamingResponse` with `media_type="text/event-stream"` and header `X-Accel-Buffering: no` (disables nginx proxy buffering).

**SSE event types:**
- `status` — phase updates ("Planning your game...", "Writing your game...")
- `progress` — token counts for progress bar
- `chunk` — HTML fragment (buffered every ~50 tokens)
- `complete` — game_id + total tokens
- `error` — detail string

**Frontend:** `useGameStream` hook reads stream, reassembles `html_chunk` events, detects `ENPALE_GAME_COMPLETE` marker, creates `Blob URL` for iframe.

---

## Security

- iframe: `sandbox="allow-scripts"` only — no `allow-same-origin` (blocks parent frame access, cookies, storage). `postMessage` still works across this boundary, which is what we want.
- Game HTML served as `Blob URL` — unique blob: origin, no shared credentials
- CSP header on FastAPI: `default-src 'self'; frame-src blob:;`
- Post-process: regex scan for `document.cookie`, `eval(`, dynamic `Function()` constructor → strip. **Allow** `window.parent.postMessage` because we need it for checkpoints — but verify only the `ENPA_CHECKPOINT` message shape is used (no arbitrary postMessage payloads).
- Kid chat input: strip `<`, `>`, `{`, `}` before sending to API; wrap in `<kid_message>` XML tags to prevent prompt injection
- Rate limiter: 10 game generations per IP per hour
- Checkpoint listener whitelist: only accept messages whose `event.source === iframeRef.current.contentWindow` and `event.data.type === 'ENPA_CHECKPOINT'` and `checkpointId ∈ enpa.checkpoints[].id`. Anything else → ignore silently.

---

## Key Utility: `extract_json()`

All three services use this to handle Claude occasionally wrapping JSON in markdown fences:

```python
def extract_json(raw: str) -> dict:
    raw = re.sub(r'^```(?:json)?\s*', '', raw.strip(), flags=re.MULTILINE)
    raw = re.sub(r'```\s*$', '', raw.strip(), flags=re.MULTILINE)
    return json.loads(raw.strip())
```

On `JSONDecodeError`: retry the API call once with "Return ONLY raw JSON. No markdown, no explanation."

---

## Development Order

| Phase | Focus | Days |
|---|---|---|
| 0 | Scaffold: FastAPI + React + Anthropic SDK smoke test | 1–2 |
| 1 | Repository layer + KidProfile + WelcomePage + Zustand wiring | 3–4 |
| 2 | Model 1: Topic cards + Sparky chat + InterestProfile | 5–7 |
| 3 | Model 2: 3-stage chain incl. rarity scoring + checkpoint authoring (most prompt iteration) | 8–11 |
| 4 | Model 3: SSE streaming + post-processing + checkpoint emission validation | 12–15 |
| 5 | Incubation UX: EggHatch, useIncubation, phase state machine, CSS animations, hatch reveal | 16–17 |
| 6 | Village home: VillagePage, EnpaCard, RarityGlow, eggColor mapping, +Hatch button | 18–20 |
| 7 | EnpaDetailPage + GamePage iframe + checkpoint listener + XP/level system | 21–22 |
| 8 | LeaderboardPage + level-up celebration + rarity boost animations | 23–24 |
| 9 | E2E integration, multi-Enpa testing, mid-incubation resilience, rate limiter, mobile QA | 25–26 |
| 10 | Docker Compose, smoke test, investor demo polish | 27 |

---

## Critical Files (highest-impact, most iteration needed)

**Backend (AI prompt engineering — the IP):**
- `backend/app/prompts/design_prompts.py` — 3-stage chain incl. rarity scoring + checkpoint authoring
- `backend/app/prompts/game_prompts.py` — Mandatory checkpoint `postMessage` instruction
- `backend/app/services/design_service.py` — Orchestrates the chain
- `backend/app/services/game_service.py` — Streaming + post-processing + checkpoint validation
- `backend/app/routers/game.py` — SSE endpoint

**Frontend (village + persistence — the product loop):**
- `frontend/src/repository/localStorageRepo.ts` — Persistence; everything depends on it
- `frontend/src/repository/types.ts` — Repository interfaces (the swap point for phase 2)
- `frontend/src/domain/rarity.ts` — Score → tier mapping + glow CSS classes
- `frontend/src/domain/leveling.ts` — XP curve, checkpoint → XP, level thresholds
- `frontend/src/pages/VillagePage.tsx` — Home screen (most-visited screen)
- `frontend/src/pages/IncubationPage.tsx` — Egg animation + pipeline orchestration + persistence
- `frontend/src/pages/EnpaDetailPage.tsx` — Hatch reveal + checkpoint progress display
- `frontend/src/pages/GamePage.tsx` — iframe + checkpoint listener
- `frontend/src/components/EnpaCard.tsx` — Tile with rarity glow + level + status
- `frontend/src/components/EggHatch.tsx` — Reusable egg with crack/shake/burst animations
- `frontend/src/components/RarityGlow.tsx` — Per-tier visual treatment wrapper
- `frontend/src/hooks/useIncubation.ts` — Phase state machine
- `frontend/src/hooks/useCheckpointListener.ts` — postMessage handler + XP awarding
- `frontend/src/hooks/useGameStream.ts` — fetch-based SSE consumer

---

## Verification (End-to-End Test)

### First-time flow
1. Start both servers (`uvicorn` + `vite dev`)
2. Navigate to `localhost:5173` (incognito, fresh localStorage)
3. WelcomePage appears → enter "Alex", age 9 → KidProfile saved
4. VillagePage appears empty with "+ Hatch a New Enpa" CTA
5. Tap CTA → TopicSelectPage → pick "Space" + "Origami" (intentionally rare combo)
6. Chat 4 turns with Sparky about paper rockets
7. IncubationPage opens, egg glows in space-themed colors
8. After ~30s GDD arrives → egg shows 1 crack, title "Paper Rocket Mars Mission" appears, ticker shows "Origami + Mars = super rare!"
9. After ~45s game completes → hatch animation → EnpaDetailPage shows Enpa with **Rare** (blue) glow
10. Tap "Play" → game loads in iframe, has visible score/progress
11. Hit checkpoint 1 in the game → "Checkpoint! +10 XP" overlay appears, XP bar updates

### Persistence + multi-Enpa
12. Hit back to VillagePage → Enpa appears in grid with L2 badge (after first checkpoint)
13. Reload the page → KidProfile + Enpa survive, HTML still loads from IndexedDB
14. Hatch a second Enpa with common topics ("Soccer", "Pizza") → verify it lands as **Common** (gray)
15. Mid-incubation, navigate back to VillagePage → egg shows incubating; tap it → resume IncubationPage from current pipeline phase

### Leveling + rarity boost
16. Play first Enpa to all 3 checkpoints → "Level Up!" celebration → Enpa now L3, rarity glow visibly stronger
17. Verify rarity tier upgraded (e.g., Rare → Epic) due to earned boost

### Leaderboard
18. Open Leaderboard tab → first Enpa at top with epic glow, second below in common section

### Edge cases
- Generation error mid-stream → IncubationPage shows retry option; egg state preserved
- Browser closed during incubation → reopening shows egg pinging, tap re-enters IncubationPage and pipeline resumes
- Hit rate limit → friendly "Sparky needs a break" message, suggests playing existing Enpas
