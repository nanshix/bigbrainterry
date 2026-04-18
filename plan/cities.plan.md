# Technical Lead Plan: World Cities
*Consolidated from 5 specialist plans*

---

## Section 1 — Category Overview

**Category:** World Cities  
**Category ID slug:** `cities`  
**Icon emoji:** 🌍  
**UI tooltip:** "Name the world's most famous cities from landmarks, nicknames, and history — then spot them on the map."

**Round size:** 50 questions  
**Time per question:** 10 seconds (standard)

---

## Section 2 — Files to Create or Modify

| Path | New or Modify | What Changes |
|------|--------------|--------------|
| `questions/cities.csv` | New | 75 rows total: tier 1 (20), tier 2 (30), tier 3 (25). Columns: `id`, `question`, `answer`, `wrong1`, `wrong2`, `wrong3`, `difficulty`, `reveal`, `cx`, `cy`, `type`. Explicit question text stored in CSV (unlike flags.js). |
| `js/games/cities.js` | New | ~180–220 lines. Text MCQ layout. CSV parsed to build round with same-tier distractors. Implements `highlightCity(cx, cy)` to render city dot pulse on map. Type column enforces question rotation. |
| `styles/cities.css` | New | Scoped to `[data-game="cities"]`. Defines clean travel-document aesthetic: white-grey paper + navy binding bars (not medieval parchment). Navy colour palette. City dot sonar ping animation (SVG circles). |
| `manifest.csv` | Modify | Update description from "Identify famous cities from photos" to reflect text-only MVP format. Update row if `cities` entry exists; if not, add new row: `cities,World Cities,🌍,50,cities.js,cities.csv,cities` |
| `index.html` | Modify | Add `<link rel="stylesheet" href="styles/cities.css" />` in `<head>`. |
| `app.js` | Modify | Add `cities: () => launchGame('cities', 'questions/cities.csv')` to `LAUNCHERS` object. |

**Note on shared CSS debt:** `.name-choices` and `.name-choice` currently in `flags.css`. Must be moved to `core.css` before Cities build (shared by Capitals and Crusades). Acceptable as part of this build if not yet done.

---

## Section 3 — manifest.csv Row

```csv
cities,World Cities,🌍,50,cities.js,cities.csv,cities
```

Append or update existing `cities` row (manifest already has a cities entry that describes images; update it to reflect v1 text-only format).

---

## Section 4 — Question Data Guideline

**CSV schema:**
```
id,question,answer,wrong1,wrong2,wrong3,difficulty,reveal,cx,cy,type
```

- `id`: Unique question ID (prefix `cit`, e.g. `cit001`). Used as key for reveal phrases in `cities.js`.
- `question`: Full question text as spoken by TTS (e.g. "The Eiffel Tower stands in which city?")
- `answer`: Correct city name (used as correct choice in MCQ)
- `wrong1`, `wrong2`, `wrong3`: Distractor city names (same region, same/similar tier, single defensible answer per question)
- `difficulty`: 1, 2, or 3 (integer)
- `reveal`: Voice host phrase (under 20 words, no em-dashes, direction-agnostic, ideally includes a fact viewer did not know)
- `cx`, `cy`: SVG world map coordinates in 1000×562 space (used for `highlightCity()` dot placement); must be QA'd visually before launch
- `type`: Question type tag (landmark, nickname, capital, event). Used to enforce rotation in `buildRound()` — no two same-type questions consecutive.

**Total question count target:** 75 questions (50 in round + 25 reserve)

**Difficulty tier breakdown:**
- **Tier 1 (easy):** 20 questions. World-famous cities; landmarks/nicknames known globally; instantly recognisable to general audience. Examples: Paris/Eiffel Tower, Rome/Colosseum, New York/Statue of Liberty.
- **Tier 2 (medium):** 30 questions. Regionally significant cities; well-known within their continent; famous facts for geography learners. Examples: Barcelona/Sagrada Familia, Kuala Lumpur/Petronas Towers, Cape Town/Table Mountain.
- **Tier 3 (hard):** 25 questions. Obscure capitals; landmarks known mainly to specialists; unusual facts. Examples: Thimphu/Bhutan (no traffic lights), Ashgabat/marble records, Ouagadougou/meaning.

**Question type distribution (target across 75):**
- Landmark → city: 30 questions
- Nickname → city: 12 questions
- Capital identification: 18 questions
- Event/history → city: 15 questions

**Data constraints from content designer:**
- **One defensible answer per question.** No ambiguous clues where two cities fit equally (ban canal questions — both Venice and Amsterdam work).
- **Same-region distractors only.** European cities as distractors for Paris, not Asian or American ones.
- **Distractor tier alignment.** Distractors roughly same fame tier as correct answer — don't use tier-3 obscure capital as distractor in tier-1 question.
- **Capital/city distinction.** If question asks for capital, all four options must be capitals.
- **cx/cy coordinates must be QA'd visually** against actual SVG map before launch — approximate values are starting points only.
- **No questions where landmark is more famous than city.** Avoid answers that are small towns (e.g. don't ask about Machu Picchu unless Cusco as a city is being tested, not just the landmark).
- **Nickname questions need global recognition** — only use internationally known nicknames (City of Light, Big Apple, Eternal City).

**Distractors:** Pulled from same-tier pool but manually curated to ensure geographic coherence and single correct answer. This differs from flags.js dynamic distractor generation — Cities questions are more complex and require human editorial judgment per row.

---

## Section 5 — Game Module Spec (`js/games/cities.js`)

**High-level flow (not code):**

1. **CSV Load & Parse**
   - Fetch `questions/cities.csv` and parse into array of objects.
   - Extract tier-1, tier-2, tier-3 entries into separate pools.
   - Each object stores: id, question text, answer, wrong answers, difficulty, reveal, cx, cy, type.

2. **Round Builder**
   - Ramp difficulty: Q1–10 (tier 1), Q11–25 (tier 2 + some tier 1), Q26–40 (mix tier 2 + tier 3), Q41–50 (tier 3).
   - For each question: select one entry from appropriate tier pool. Enforce type rotation — track previous question type and skip same type if possible.
   - Build choice set with 1 correct answer + 3 wrong answers from CSV (not dynamically generated).
   - Store each question with all needed data.

3. **Question Types** (all use same `.name-choices` layout, differ in phrasing)

   **Type A: Landmark → City**
   - "The Eiffel Tower stands in which city?" → 4 city names.
   
   **Type B: Nickname → City**
   - "Which city is known as the Big Apple?" → 4 city names.
   
   **Type C: Capital Identification**
   - "What is the capital of Bhutan?" → 4 city names (all capitals).
   
   **Type D: Event/History → City**
   - "Which city hosted the 2008 Summer Olympic Games?" → 4 city names.

   All types use identical scroll/button layout. Only question text changes.

4. **Reveal Logic**
   - **Correct answer:** Flash choice green, speak reveal phrase (pitch 1.2), call `highlightCity(cx, cy)` to render city dot pulse on map.
   - **Wrong answer:** Flash choice red, speak generic fallback reveal (if no specific reveal for this ID).
   - **Timeout:** Skip to reveal as if wrong.

5. **City Highlight Animation**
   - `highlightCity(cx, cy)` function:
     - Creates two `<circle>` elements in `#map-highlight-svg` (SVG must exist in `index.html`).
     - One circle is `.city-dot-core` (white, static, fades out over 1.8s).
     - One circle is `.city-dot-flash` (blue, sonar ping — radius expands from 4 to 28, opacity fades).
     - Both removed after 2s via `setTimeout()`.
   - CSS animations defined in `cities.css`:
     - `@keyframes city-ping` — core circle expands and fades
     - `@keyframes city-core-fade` — static centre dot holds then fades

6. **UI Integration**
   - Set `data-game="cities"` on `.modal-card` in `launch()`.
   - Remove `data-game="cities"` on close.
   - Inject globe SVG (defined below) into corner containers (same position/opacity as compass rose in flags.js).
   - Inject navy binding bars and clean paper background via CSS.

7. **TTS Cleanup Helper (optional but recommended)**
   - Some city names (e.g. "Nuku'alofa") may need apostrophes removed for TTS clarity.
   - Small `ttsClean(text)` helper can strip problematic characters before passing to `speak()`.
   - Display text shows original; speak text uses cleaned version.

8. **Entry Point**
   - Function signature: `launch()` — called from `app.js` via `LAUNCHERS.cities()`.
   - Cleanup on close: remove `data-game` attribute, clear highlights, stop audio.

**Globe SVG (inline, no file):**
```svg
<svg viewBox="0 0 44 44" fill="none" stroke="#1a3a5c" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
  <circle cx="22" cy="22" r="16"/>
  <line x1="6" y1="22" x2="38" y2="22"/>
  <ellipse cx="22" cy="22" rx="7" ry="16"/>
  <path d="M9,14 Q22,10 35,14" fill="none"/>
  <path d="M9,30 Q22,34 35,30" fill="none"/>
</svg>
```

---

## Section 6 — CSS Guideline (`styles/cities.css`)

**File structure:** Scoped entirely with `[data-game="cities"]` descendant selector. Never modifies `core.css`, `flags.css`, or `crusades.css`.

**Custom properties (define at `:root` or within `[data-game]` scope):**
| Property | Value | Usage |
|----------|-------|-------|
| `--cities-navy` | `#1a3a5c` | Border, corner SVG stroke, badge backgrounds, binding bar |
| `--cities-blue` | `#2471a3` | Secondary accent, hover states |
| `--cities-paper` | `#f4f6f8` | Scroll body base — clean white-grey paper (travel document aesthetic) |
| `--cities-paper-mid` | `#e8ecf0` | Scroll body midpoint gradient |
| `--cities-paper-edge` | `#d0d8e4` | Scroll body edge gradient |
| `--cities-text` | `#0d1b2a` | Question and choice text — near black |
| `--cities-text-muted` | `#2c4a6a` | Label text — navy-tinted |
| `--cities-dot-flash` | `rgba(36, 113, 163, 0.85)` | City dot pulse colour (blue) |

**Visual identity summary:**
Clean travel-document / passport aesthetic, not medieval parchment. White-grey paper background (cooler than Flag Rush amber, cleaner than Crusades' aged parchment). Navy binding bars on scroll edges evoke modern passport binding. Cool blue overlay on world map (opposite of Crusades' warm amber). Navy colour palette signals "modern geographic document." Globe corner decoration (symmetric, no rotation needed). Typography: Fraunces serif (works well for travel/geography theme). Overall tone: aspirational, warm, cosmopolitan.

**Key animation names:**
- `city-ping` (map dot pulse): Sonar/radar ping — circle expands from r: 4 to r: 28, opacity fades from 0.9 to 0
- `city-core-fade` (static centre dot): Hold at r: 4 for 60%, then fade out
- No country-fill animation (cities are points, not paths)

**CSS rules to implement:**
- Map background tint: radial gradient overlay, cool blue-navy with transparency
- Scroll body: white-grey gradient base + navy border
- Scroll binding bars (::before and ::after): navy-blue linear gradient with subtle highlights
- Question text: near-black, no sepia tone
- Choice badges: navy background
- Name choice borders: navy-tinted, hover state adds subtle blue wash
- City dot SVG circles: apply animation classes
- Text-shadow on question: use white highlight (not sepia) for clean aesthetic

---

## Section 7 — Voice Lines Guideline

**Tone and personality:**
Warm, curious, celebratory — a well-travelled friend who loves geography and wants you to learn something wonderful. Most positive register of the series. Even wrong-answer reveals feel like gifts ("now you know!") rather than corrections. Tier 1 is affirming. Tier 2 is conversational. Tier 3 is delivered with excitement for obscure knowledge, not apology.

**Prompt line templates:**

*Landmark → City (30 questions):*
- "The Eiffel Tower stands in which city?"
- "Which city is home to the Colosseum?"
- "The Opera House is the defining landmark of which city?"

*Nickname → City (12 questions):*
- "Which city is known as the Big Apple?"
- "The City of Light — which great city carries this title?"
- "Which city goes by the name the Eternal City?"

*Capital Identification (18 questions):*
- "What is the capital of Bhutan?"
- "Which city serves as the capital of Myanmar?"
- "Name the capital city of Burkina Faso."

*Event/History → City (15 questions):*
- "Which city hosted the 2008 Summer Olympic Games?" (speak as "two thousand and eight")
- "Anne Frank hid in a secret annex in which European city?"
- "Which city was founded by the Romans as Londinium nearly two thousand years ago?"

**Reveal phrase format with examples:**
- **Standard reveal:** `"[City name]! [Surprising fact or context]."`
- **Landmark reveal:** `"[City name]! The [Landmark] was [interesting fact]."`
- **Nickname reveal:** `"[City name]! Known as the [Nickname] because [reason]."`
- **Examples:**
  - `"Paris! The Eiffel Tower was supposed to be torn down in nineteen-oh-nine but its radio antenna saved it!"`
  - `"Rome! The Colosseum could hold eighty thousand spectators and originally had a retractable awning!"`
  - `"Ouagadougou! In the Mossi language it means 'you are welcome here' — capital of Burkina Faso!"`

**Rank label names (all 7 tiers):**
1. Day Tripper (0–19%)
2. Backpacker (20–39%)
3. Frequent Flyer (40–59%)
4. Explorer (60–74%)
5. Globetrotter (75–84%)
6. Cartographer (85–94%)
7. Citizen of the World (95–100%)

**Milestone callout style (examples):**
- Q10: `"Passport stamped! You've cleared the famous ones. Now we're going off the tourist trail."` (display: "PASSPORT STAMPED")
- Q25: `"Halfway around the globe! The cities are getting less familiar from here."` (display: "AROUND THE WORLD")
- Q40: `"Final destination. These last ten cities are only known to the true geography obsessives."` (display: "FINAL DESTINATION")

**TTS considerations:**
- Years are spoken words ("nineteen-oh-nine", "two thousand and eight", not "1909" or "2008").
- No em-dashes in speech strings (use comma for pause).
- Problematic city names (Ouagadougou, Naypyidaw, Thimphu, Ulaanbaatar, Nuku'alofa): test on target voice; strip apostrophes for TTS.
- Landmark/nickname questions: `rate: 1.05` (fast, natural spoken cadence).
- Tier 3 capital questions: `rate: 1.0` (slightly slower, lets unfamiliar name register).
- Milestone lines: `rate: 0.95`, `interrupt: true`.
- Opening hook: `rate: 0.93` (conversational, warm pacing).

---

## Section 8 — Wiring

**In `index.html` `<head>`:**
```html
<link rel="stylesheet" href="styles/cities.css" />
```
Add after other category stylesheets (e.g. after `capitals.css` if it exists).

**In `app.js` (in `LAUNCHERS` object):**
```js
cities: () => launchGame('cities', 'questions/cities.csv')
```
Add after existing game launchers.

---

## Section 9 — Implementation Order

1. **Create `questions/cities.csv`** — 75 rows with all tiers, type rotation balanced, question text verified for TTS, reveals written to include surprising facts (not just confirmations). Verify single defensible answer per question. All cx/cy coordinates placeholder; will be QA'd in step 8.

2. **Create `js/games/cities.js`** — Module structure, CSV parsing, tier pool separation. Build round logic with difficulty ramp. Implement type rotation (no two same-type questions consecutive). Build choice logic (use explicit wrong answers from CSV, not dynamic generation).

3. **Implement `highlightCity(cx, cy)` function** — Creates two SVG circles, applies animations, removes after 2s. Test SVG element creation and animation timing.

4. **Create `styles/cities.css`** — All visual overrides scoped to `[data-game="cities"]`. Define CSS custom properties. Implement city dot animations (city-ping, city-core-fade keyframes). Test animation visibility at YouTube compression (1080p, 8Mbps).

5. **Update `manifest.csv`** — Add or update cities row with correct description.

6. **Update `index.html`** — Add stylesheet link.

7. **Update `app.js`** — Add `cities` launcher.

8. **Question text QA & coordinate verification** — Verify all 50 questions in a test round are distinct, readable as TTS, and sound natural. Render map with all city dots and visually verify cx/cy coordinates are accurate (dots on land, not ocean; no dots in obviously wrong locations). Update CSV with verified coordinates.

Each step is independently testable: CSV validates in spreadsheet. Module can unit-test for round building and type rotation. Animations preview in browser. Integration steps are final.

---

## Section 10 — Conflicts Resolved

**Image variant deferral:** YouTube Strategist flagged risk that text-only v1 may look identical to Capitals at thumbnail scale. Game Designer correctly prioritizes text-only MVP for faster shipping. **Recommendation: Ensure Capitals launches first and is visually distinct (green + parchment scroll). Cities' navy + clean paper will then read as clearly different category. If Capitals hasn't launched yet, consider fast-tracking image variant to Cities (landmark photos in .mystery-wrap slot) to ensure visual distinction from Capitals.**

**Question type enforcement:** Content Designer, YouTube Strategist, and Voice Writer all recommended adding `type` column to CSV and enforcing type rotation in `buildRound()` (no two consecutive questions of same type). **Recommendation: Implement type rotation in v1 — it improves pacing and watch-time and costs minimal engineering. Cap consecutive same-type at 1 (alternate types where possible).**

**City dot visibility at compression:** Visual Designer recommended testing sonar ping animation at YouTube export quality (1080p, compressed) to ensure it survives bitrate reduction. **Recommendation: Increase animation radius max from `r: 28` to `r: 36` and opacity floor to `0.08` for better visibility post-compression. Test before launch.**

**TTS city name cleanup:** Voice Writer suggested optional helper for problematic names (Nuku'alofa apostrophe). **Recommendation: Implement small `ttsClean(text)` utility in cities.js that strips apostrophes and other special characters from city names before passing to `speak()`. Display text uses original; audio uses cleaned version.**

---

*End of consolidated plan. Ready for implementation.*
