# Technical Lead Plan: World Capitals
*Consolidated from 5 specialist plans*

---

## Section 1 — Category Overview

**Category:** World Capitals  
**Category ID slug:** `capitals`  
**Icon emoji:** 👑  
**UI tooltip:** "Name the capital cities of the world — and watch out for the famous traps like Sydney for Australia."

**Round size:** 50 questions  
**Time per question:** 10 seconds (standard)

---

## Section 2 — Files to Create or Modify

| Path | New or Modify | What Changes |
|------|--------------|--------------|
| `questions/capitals.csv` | New | 75 rows total: tier 1 (20), tier 2 (30), tier 3 (25). Columns: `code`, `country`, `capital`, `difficulty`, `reveal`. ISO country codes match `flags.csv` for coordinate reuse. |
| `js/games/capitals.js` | New | ~120 lines. Question layout: country name + 4 text choice buttons. Imports `highlightCountry()` from `flags.js` or calls it directly. Rounds built with tier-split logic. Distractors generated dynamically from same-tier pool. |
| `styles/capitals.css` | New | Scoped to `[data-game="capitals"]`. Defines atlas cream + forest green visual identity. CSS custom properties for colours. Crown SVG injected via capitals.js. |
| `manifest.csv` | Modify | Add one row: `capitals,World Capitals,👑,50,capitals.js,capitals.csv,capitals` |
| `index.html` | Modify | Add `<link rel="stylesheet" href="styles/capitals.css" />` in `<head>`. |
| `app.js` | Modify | Add `capitals: () => launchGame('capitals', 'questions/capitals.csv')` to `LAUNCHERS` object. |

**Note on shared CSS debt:** `.name-choices` and `.name-choice` currently in `flags.css`. These must be moved to `core.css` before build — shared by Capitals, Cities, and Crusades. Acceptable as part of this build if not yet done.

---

## Section 3 — manifest.csv Row

```csv
capitals,World Capitals,👑,50,capitals.js,capitals.csv,capitals
```

Append to the end of `manifest.csv` (no blank line before, one newline after).

---

## Section 4 — Question Data Guideline

**CSV schema:**
```
code,country,capital,difficulty,reveal
```

- `code`: ISO 3166-1 alpha-2 country code (matches `flags.csv` — required for `getCountryCoords()` reuse)
- `country`: Country display name for country→capital questions
- `capital`: Capital city name (used in country→capital as correct answer, capital→country as prompt)
- `difficulty`: 1, 2, or 3 (integer)
- `reveal`: Voice host phrase (direction-agnostic, under 20 words, no em-dashes)

**Total question count target:** 75 questions (50 in round + 25 reserve)

**Difficulty tier breakdown:**
- **Tier 1 (easy):** 20 questions. G20 nations and universally recognised countries. Examples: France/Paris, Japan/Tokyo, Australia/Canberra.
- **Tier 2 (medium):** 30 questions. Regionally significant nations, trap capitals, geography-student knowledge. Examples: Romania/Bucharest, Pakistan/Islamabad, Kazakhstan/Astana.
- **Tier 3 (hard):** 25 questions. Small/obscure nations, unusual capital names. Examples: Tuvalu/Funafuti, Liechtenstein/Vaduz, Nauru/Yaren.

**Data constraints from content designer:**
- Every country code must exist in `flags.csv` (enables coordinate reuse).
- Multi-capital countries (South Africa, Bolivia, Netherlands) use canonical policy: Pretoria, Sucre, Amsterdam.
- Trap capitals (Canberra, Wellington, Ottawa, Brasília, Islamabad, Abuja, Bern, Naypyidaw, Astana) must appear in tiers 1–2 with reveals that name the trap explicitly.
- Reveal phrases must work in both question directions (country→capital and capital→country).
- No trick questions. Straightforward geography.
- Tier boundaries must be clean — no "medium-famous" capitals rounded down to tier 1 to pad easy section.

**Distractors:** Generated dynamically from same-tier pool by `capitals.js`. No hardcoded wrong answers in CSV.

---

## Section 5 — Game Module Spec (`js/games/capitals.js`)

**High-level flow (not code):**

1. **CSV Load & Parse**
   - Fetch `questions/capitals.csv` and parse into array of objects.
   - Extract all tier-1, tier-2, tier-3 entries into separate pools.
   - Verify all `code` values exist in `flags.csv` country code list. (Fail gracefully if not.)

2. **Round Builder**
   - Ramp difficulty across 50 questions. Pattern: Q1–10 (tier 1), Q11–25 (tier 2 + some tier 1), Q26–40 (mix tier 2 + tier 3), Q41–50 (tier 3).
   - For each question: select one entry, randomly choose direction (70% country→capital, 30% capital→country), generate 3 distractors from same-tier pool (exclude correct answer).
   - Store each question object with: `code`, `country`, `capital`, `difficulty`, `direction` (ct or cc), `correct_answer`, `choices[]`, `reveal`.

3. **Question Types**

   **Type A: Country → Capital (70%)**
   - Player sees: `.q-label` = "WHAT IS THE CAPITAL OF", `.q-country-name` = country name (large), four `.name-choice` buttons with capital city names.
   - Correct answer and three distractor capitals (other tier-pool entries or major non-capital cities in correct country).
   
   **Type B: Capital → Country (30%, prioritise trap capitals)**
   - Player sees: `.q-label` = "WHICH COUNTRY HAS", `.q-country-name` = capital name (large), four `.name-choice` buttons with country names.
   - Correct answer country and three distractor countries (same-tier nations or neighbouring countries).

4. **Reveal Logic**
   - **Correct answer:** Flash choice green, speak reveal phrase (pitch 1.2), call `highlightCountry(code)` to fill country on map with atlas-green overlay.
   - **Wrong answer:** Flash choice red, speak generic fallback reveal (or no reveal).
   - **Timeout:** Skip to reveal as if wrong.

5. **Map Highlight**
   - Call `getCountryCoords()` from `flags.js` (or extract to shared utils if already done).
   - The country centroid is used — known limitation for very large countries (Russia, Canada, Australia centroid is far from capital city). Document in code comment.
   - CSS override in `capitals.css` changes highlight fill colour from flag-quiz red to atlas green (`var(--capitals-country-tint)`).

6. **UI Integration**
   - Set `data-game="capitals"` on `.modal-card` in `launch()`.
   - Remove `data-game="capitals"` in close handler.
   - Inject crown SVG (defined below) into corner containers (same position/opacity as compass rose in flags.js).
   - Inject atlas-cream scroll background and atlas binding bars.

7. **Entry Point**
   - Function signature: `launch()` — called from `app.js` via `LAUNCHERS.capitals()`.
   - Cleanup on close: remove `data-game` attribute, clear highlights, stop audio.

**Crown SVG (inline, no file):**
```svg
<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="7" y="28" width="30" height="7" rx="1" fill="#1c4426"/>
  <polygon points="7,28 10,14 14,22" fill="#1c4426"/>
  <polygon points="14,22 17,28 11,28" fill="#1c4426"/>
  <polygon points="14,22 22,10 30,22" fill="#1c4426"/>
  <polygon points="30,22 27,28 33,28" fill="#1c4426"/>
  <polygon points="30,22 34,14 37,28" fill="#1c4426"/>
  <circle cx="22" cy="32" r="2.5" fill="#1c4426"/>
</svg>
```

---

## Section 6 — CSS Guideline (`styles/capitals.css`)

**File structure:** Scoped entirely with `[data-game="capitals"]` descendant selector. Never modifies `core.css` or `flags.css`.

**Custom properties (define at `:root` or within `[data-game]` scope):**
| Property | Value | Usage |
|----------|-------|-------|
| `--capitals-green` | `#1c4426` | Borders, crown SVG, badge backgrounds, binding bar |
| `--capitals-green-mid` | `#2d6a4f` | Accents, hover states, highlight fill |
| `--capitals-paper` | `#f5f1e4` | Scroll body base — atlas cream (ivory with faint green warmth) |
| `--capitals-paper-mid` | `#ede8d0` | Scroll body midpoint gradient |
| `--capitals-paper-edge` | `#ddd5b8` | Scroll body edge gradient |
| `--capitals-text` | `#0e1a0f` | Question and choice text — near black with green tint |
| `--capitals-text-muted` | `#2c4a30` | Label text — muted atlas green |
| `--capitals-country-tint` | `rgba(28, 68, 38, 0.65)` | Country highlight fill on reveal (map) |

**Visual identity summary:**
Deep forest-green overlay on world map (atlas reference aesthetic). Scroll background is atlas cream — warmer than Cities' passport grey, cooler than Flag Rush's amber parchment. Think aged map paper from a geographic survey. Forest-green binding bars on scroll edges evoke cloth-bound reference atlas. Crown corner decoration (symmetric, no rotation needed). Typography: Fraunces serif (authoritative, reference tone). Colour palette is "serious geography" — immediately distinct from history (Crusades: amber) and travel (Cities: blue).

**Key animation names:**
- `country-flash` (map highlight fill): Override to `var(--capitals-country-tint)` (atlas green instead of flag-quiz red)
- Scroll transitions: Existing patterns, no new animations

**CSS rules to implement:**
- Map background tint: radial gradient overlay, forest green with transparency
- Scroll body: atlas cream base gradient + green border
- Scroll binding bars (::before and ::after): forest-green linear gradient with subtle highlights
- Question text: near-black with green undertone
- Choice badges: forest-green background
- Name choice borders: forest-green tint, hover state adds subtle green wash
- Country highlight SVG path: atlas-green fill

---

## Section 7 — Voice Lines Guideline

**Tone and personality:**
Authoritative, knowing, with a spark of mischief on trap reveals. The voice host knows the traps are coming; the viewer suspects it. Trap reveals are "gotcha" moments — not mean-spirited, but genuinely gleeful. Tier 1 is affirming and builds confidence. Tier 2 introduces the traps with a conspiratorial energy. Tier 3 is delivered with curiosity and warmth, not apology — "Can you believe a capital city has fewer than four hundred people?"

**Prompt line templates:**

*Country → Capital (70%):*
- "What is the capital of [Country]?"
- "Which city serves as the capital of [Country]?"
- "Name the capital city of [Country]."

*Capital → Country (30%, use for trap capitals):*
- "Which country has [Capital] as its capital?"
- "[Capital] is the capital of which country?"
- "Which nation's capital city is [Capital]?"

**Reveal phrase format with examples:**
- **Standard reveal:** `"[Capital]! [Fact about capital or country]. [Optional context]"` — under 20 words.
- **Trap reveal:** `"[Capital]! Not [wrong answer]! [Reason or fact]."` — always names the trap explicitly.
- **Examples:**
  - `"Paris! The City of Light has been France's capital for over a thousand years!"`
  - `"Canberra! Not Sydney! Australia's capital was purpose-built in nineteen thirteen as a compromise!"`
  - `"Naypyidaw! Not Yangon! Myanmar built a new capital in complete secrecy and revealed it in two thousand and six!"`

**Rank label names (all 5 tiers):**
1. Tourist (0–19%)
2. Exchange Student (20–39%)
3. Geography Grad (40–59%)
4. Diplomat (60–74%)
5. Ambassador (75–84%)
6. Secretary-General (85–94%)
7. Geographer Royal (95–100%)

**Milestone callout style (example):**
- Q10: `"Easy ones done. Now the traps begin. Stay sharp."` (display: "HEAD OF STATE")
- Q25: `"Halfway! You've survived the famous traps. Now for the ones that are just genuinely hard."` (display: "DIPLOMATIC CORPS")
- Q40: `"Last ten. These are the capitals that geography specialists argue about. Good luck."` (display: "FINAL DISPATCH")

**TTS considerations:**
- Years are spoken words ("nineteen thirteen", not "1913").
- No em-dashes in speech strings (use comma for pause).
- Difficult names (Ulaanbaatar, Ngerulmud, Eswatini, Mbabane, Naypyidaw): test on target voice engine.
- Trap reveals use `rate: 1.0` to slow down slightly, letting capital name register before player chooses.
- Country→capital questions: `rate: 1.05` (fast, clean format).
- Milestone lines: `rate: 0.95`, `interrupt: true`.

---

## Section 8 — Wiring

**In `index.html` `<head>`:**
```html
<link rel="stylesheet" href="styles/capitals.css" />
```
Add after other category stylesheets (e.g. after `flags.css`).

**In `app.js` (in `LAUNCHERS` object):**
```js
capitals: () => launchGame('capitals', 'questions/capitals.csv')
```
Add after existing game launchers (e.g. after `flags`).

---

## Section 9 — Implementation Order

1. **Create `questions/capitals.csv`** — 75 rows with all tiers, trap capitals marked, reveal phrases validated for direction-agnosticism and word count. Verify all country codes exist in `flags.csv`.

2. **Create `js/games/capitals.js`** — Module structure, CSV parsing, tier pool separation. Build round logic with difficulty ramp. Implement distractor generation.

3. **Create `styles/capitals.css`** — All visual overrides scoped to `[data-game="capitals"]`. Define CSS custom properties. Inject crown SVG logic into module (or as part of step 5).

4. **Update `manifest.csv`** — Add capitals row.

5. **Update `index.html`** — Add stylesheet link.

6. **Update `app.js`** — Add `capitals` launcher.

7. **Question types implementation** — Implement country→capital and capital→country layouts in `capitals.js`. Ensure `.q-label` and `.q-country-name` display correctly. Test choice button rendering.

8. **Reveal logic & map highlight** — Implement correct/wrong reveal states, country highlight via `highlightCountry()`, voice host reveal phrases. Test map highlight colour override in CSS.

Each step is independently testable: CSV can be validated in a spreadsheet. Module can be unit-tested for round building. CSS can be previewed with mock HTML. Manifest and app.js are final integration steps.

---

## Section 10 — Conflicts Resolved

**Question direction encoding:** CD recommended adding `question_type` column (`ct` for country→capital, `cc` for capital→country). YouTube Strategist and Voice Writer both agreed: trap capitals land hardest in specific directions (capital→country for famous traps, country→capital for obscure tier 3). Without direction encoding, same player might see same country twice in different modes within a round. **Recommendation: If CSV schema can accommodate it, add `question_type` column. If not, implement 70/30 random split in `buildRound()` and cap consecutive same-direction questions at 4.** Either approach works; fixed direction per entry is slightly stronger for YouTube moments.

**Large country centroid quirk:** Russia, Canada, Australia have geographic centroids far from actual capitals (Siberia, northern Ontario, outback). All specialists acknowledged this. **Accepted as v1 limitation, not a blocker.** Visual Designer noted it, Voice Writer suggests delivery confidence (e.g. voice says "Moscow!" loudly to redirect attention from map) can compensate. Document in code comment in `capitals.js` with note in launch checklist.

**`.name-choices` CSS debt:** Currently in `flags.css`. Needed by Capitals, Cities, Crusades. **Should be moved to `core.css` before any of the three categories are built.** If not yet done, acceptable to do as part of Capitals build.

---

*End of consolidated plan. Ready for implementation.*
