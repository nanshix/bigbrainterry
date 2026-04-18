# Technical Lead Plan: Dog Breeds
*Consolidated from 5 specialist plans*

---

## Section 1 — Category Overview

**Category:** Dog Breeds  
**Category ID slug:** `breeds`  
**Icon emoji:** 🐕  
**UI tooltip:** "Identify dog breeds from photos and facts — from famous Labradors to rare Xoloitzcuintli."

**Round size:** 50 questions  
**Time per question:** 5–10 seconds (configurable; 5s recommended for fast pacing)

---

## Section 2 — Files to Create or Modify

| Path | New or Modify | What Changes |
|------|--------------|--------------|
| `questions/breeds.csv` | New | 75 rows total: tier 1 (20), tier 2 (30), tier 3 (25). Columns: `code`, `breed_name`, `difficulty`, `image_url`, `question_type`, `reveal`. Image URLs point to Wikimedia Commons or breed registry sources (external, not local files). |
| `js/games/breeds.js` | New | ~180–220 lines. CSV parsed to build round with tier-split logic. Shows image-to-breed (primary) and fact-to-breed (secondary) questions. Reuses `.name-choices` layout. No throw animation. |
| `styles/breeds.css` | New | Scoped to `[data-game="breeds"]`. Defines warm, friendly aesthetic: cream paper + warm tan binding bars. Paw print corner decorations. Breed image fade-in animation. ~200 lines CSS. |
| `manifest.csv` | Modify | Add row: `breeds,Dog Breeds,🐕,50,breeds.js,breeds.csv,breeds` |
| `index.html` | Modify | Add `<link rel="stylesheet" href="styles/breeds.css" />` in `<head>`. |
| `app.js` | Modify | Add `breeds: () => launchGame('breeds', 'questions/breeds.csv')` to `LAUNCHERS` object. |

---

## Section 3 — manifest.csv Row

```csv
breeds,Dog Breeds,🐕,50,breeds.js,breeds.csv,breeds
```

Append to the end of `manifest.csv`.

---

## Section 4 — Question Data Guideline

**CSV schema:**
```
code,breed_name,difficulty,image_url,question_type,reveal
```

- `code`: Unique breed code (e.g. `lab-ret` for Labrador Retriever)
- `breed_name`: Standardised breed name (AKC or FCI standard spelling)
- `difficulty`: 1, 2, or 3 (integer)
- `image_url`: Wikimedia Commons or open-source image URL; OR "FACT" for fact-to-breed questions
- `question_type`: "image" or "fact"
- `reveal`: Voice host phrase (under 20 words, includes fun fact about breed)

**Total question count target:** 75 questions (50 in round + 25 reserve)

**Difficulty tier breakdown:**
- **Tier 1 (easy):** 20 questions. Globally famous, universally recognised breeds. Common household pets, featured in popular media. Examples: Labrador, Golden Retriever, German Shepherd, Bulldog.
- **Tier 2 (medium):** 30 questions. Regionally significant, well-known to dog enthusiasts, distinctive features. Examples: Shiba Inu, Bernese Mountain Dog, Australian Shepherd, Akita.
- **Tier 3 (hard):** 25 questions. Rare, uncommon breeds or breeds with subtle distinguishing features. Require specialist knowledge. Examples: Azawakh, Xoloitzcuintli, Kooikerhondje, Thai Ridgeback.

**Question type distribution (target across 75):**
- Image-to-breed: 45 questions (60%)
- Fact-to-breed: 30 questions (40%)

**Data constraints from content designer:**
- **One unambiguous breed per question.** Use images from official breed registries or kennel club galleries. No ambiguity.
- **Distractor breeds from same category.** If answer is Welsh Corgi (herding), use other herding breeds as wrong options, not random large dogs.
- **Image quality:** High-resolution breed reference photos only. Grainy or artistic photos will make identification harder than intended.
- **No breed variants as separate answers.** Pembroke and Cardigan Welsh Corgis are different, but treat as single "Welsh Corgi" entry unless image clearly distinguishes.
- **Fact-to-breed should test purpose/origin, not appearance.** This creates cognitive variety from image questions.
- **Reveal phrases must include one fact viewer likely didn't know.** Not just the most famous attribute.
- **All image URLs must be verified for licensing** before launch. Wikimedia Commons only, or equivalent open-source breed registries.

---

## Section 5 — Game Module Spec (`js/games/breeds.js`)

**High-level flow (not code):**

1. **CSV Load & Parse**
   - Fetch `questions/breeds.csv` and parse into array of objects.
   - Extract tier-1, tier-2, tier-3 entries into separate pools.
   - Each object stores: code, breed_name, difficulty, image_url, question_type, reveal.
   - Verify no null/empty image_urls (fail gracefully or use placeholder).

2. **Round Builder**
   - Ramp difficulty: Q1–10 (tier 1), Q11–30 (tier 2), Q31–40 (mix tier 2 + tier 3), Q41–50 (tier 3).
   - For each question: select entry from appropriate tier pool. Pull 3 distractor breeds from same tier.
   - If `question_type` is "image", load image URL. If "fact", generate fact text from template.
   - Build choice set with 1 correct + 3 wrong breed names (not images).
   - Store each question with needed data.

3. **Question Types** (both use identical `.name-choices` layout, differ in prompt area)

   **Type A: Image-to-Breed (60%)**
   - Display breed image in prominent container (square or portrait, object-fit: contain).
   - Implicit question text: "What breed is this dog?"
   - Four breed name buttons below image.
   
   **Type B: Fact-to-Breed (40%)**
   - Display fact text: "This breed was originally developed to herd sheep in Scotland."
   - Question text: "Which breed is it?"
   - Four breed name buttons.
   
   Both use `.name-choices` layout (4 buttons with A/B/C/D badges).

4. **Reveal Logic**
   - **Correct answer:** Flash choice green, speak reveal phrase (pitch 1.2), no map highlight.
   - **Wrong answer:** Flash choice red, speak generic fallback reveal.
   - **Timeout:** Skip to reveal as if wrong.

5. **No New Animations**
   - Breed image fade-in (`.breed-appear` animation) when question loads.
   - Reuse all existing reveal, correct/wrong, timer animations from core.

6. **UI Integration**
   - Set `data-game="breeds"` on `.modal-card` in `launch()`.
   - Remove `data-game="breeds"` on close.
   - Inject paw print SVG (defined below) into corner containers.
   - Inject warm cream scroll styling and breed image container via CSS.

7. **Entry Point**
   - Function signature: `launch()` — called from `app.js` via `LAUNCHERS.breeds()`.
   - Cleanup on close: remove `data-game` attribute, stop audio.

**Paw Print SVG (inline, no file):**
```svg
<svg viewBox="0 0 44 44" fill="none" stroke="#a68670" stroke-width="1.8" xmlns="http://www.w3.org/2000/svg">
  <circle cx="22" cy="28" r="8" fill="#a68670" opacity="0.7"/>
  <circle cx="8" cy="10" r="5" fill="#a68670" opacity="0.6"/>
  <circle cx="22" cy="4" r="5" fill="#a68670" opacity="0.6"/>
  <circle cx="36" cy="10" r="5" fill="#a68670" opacity="0.6"/>
  <path d="M22,22 Q22,14 22,4" stroke="#a68670" stroke-width="1.2" opacity="0.5" fill="none"/>
</svg>
```

---

## Section 6 — CSS Guideline (`styles/breeds.css`)

**File structure:** Scoped entirely with `[data-game="breeds"]` descendant selector. Never modifies `core.css` or other game CSS.

**Custom properties (define at `:root` or within `[data-game]` scope):**
| Property | Value | Usage |
|----------|-------|-------|
| `--breeds-warm` | `#d4a574` | Accent, border, paw print SVG fill |
| `--breeds-warm-dark` | `#8b6f47` | Hover states, secondary accent |
| `--breeds-cream` | `#f9f5f0` | Scroll body base — warm cream paper |
| `--breeds-cream-mid` | `#f3ede5` | Scroll body midpoint gradient |
| `--breeds-cream-edge` | `#e8dcd0` | Scroll body edge gradient |
| `--breeds-text` | `#2c1810` | Question text — deep warm brown |
| `--breeds-text-muted` | `#6b5344` | Label text — medium brown |
| `--breeds-paw` | `#c17039` | Paw print secondary fill — warm orange-brown |

**Visual identity summary:**
Warm, friendly, contemporary pet-focused aesthetic (not medieval like Flags/Crusades). Cream paper background (not aged/golden), warm tan binding bars on scroll edges, paw print corner decorations. Overall tone: modern pet brand identity. Fraunces serif retained for consistency.

**Key animation names:**
- `breed-appear` — breed image fades in and scales up slightly as question loads (0.5s, ease-out)
- All other animations reuse existing core animations

**CSS rules to implement:**
- Scroll body: warm cream gradient base + warm tan border
- Scroll binding bars (::before and ::after): warm gradient
- Question text: deep warm brown (not sepia)
- Choice badges: warm tan background
- Name choice borders: warm-tinted
- Breed image container: prominent, fixed size, breed-appear animation
- Hover states: warm accent wash

---

## Section 7 — Voice Lines Guideline

**Tone and personality:**
Warm, enthusiastic, respectful of dog breeds. Personality differs from Flags (competitive), Crusades (dramatic), Capitals (authoritative), and Cities (aspirational). The voice host loves dogs and finds every breed interesting — from most famous to most obscure. Tier 3 questions delivered with genuine excitement, not apology. Conversational, friendly tone throughout.

**Prompt line templates:**

*Image-to-Breed (primary):*
- "What breed is this dog?"
- "Can you identify this breed?"

*Fact-to-Breed (secondary):*
- "This breed [trait/origin]. Which breed is it?"
- Examples: "This breed was originally bred to herd sheep in the Scottish Highlands" (Scottish Terrier), "Known for its distinctive curled tail and fox-like face" (Shiba Inu).

**Reveal phrase format with examples:**
- **Standard reveal:** `"[Breed name]! [Fact breed lover didn't know]."`
- **Examples:**
  - `"Labrador! Originally bred to retrieve ducks in Newfoundland. Now the world's most popular family dog!"`
  - `"Azawakh! A West African sighthound bred by nomadic tribes to hunt game across the Sahara!"`
  - `"Xoloitzcuintli! An ancient Aztec breed, completely bald, sacred to the Aztecs!"`

**Rank label names (all 7 tiers):**
1. Puppy (0–19%)
2. Dog Lover (20–39%)
3. Dog Enthusiast (40–59%)
4. Breed Expert (60–74%)
5. Kennel Judge (75–84%)
6. Breed Specialist (85–94%)
7. Master Breeder (95–100%)

**Milestone callout style (examples):**
- Q10: `"You're warming up! The famous breeds are behind you — now the interesting ones begin."` (display: "PAW PRINT")
- Q25: `"Halfway there! You're already learning breeds most people have never heard of."` (display: "BREED EXPERT")
- Q40: `"Final ten! These are the rarest breeds on earth. Prepare yourself!"` (display: "KENNEL SPECIALIST")

**TTS considerations:**
- Difficult breed names (Xoloitzcuintli, Kooikerhondje, Löwchen, Affenpinscher): test on target voice; include breed origin/context in reveal for clarity
- Include pronunciation hints implicitly (e.g. breed origin: "Xoloitzcuintli, an ancient Aztec breed")
- Image-to-breed questions: `rate: 1.05` (natural spoken cadence)
- Fact-to-breed and Tier 3 questions: `rate: 1.0` (slightly slower for breed name to register)
- Milestone lines: `rate: 0.95`, `interrupt: true`
- Opening hook: `rate: 0.93` (warm, conversational)

---

## Section 8 — Wiring

**In `index.html` `<head>`:**
```html
<link rel="stylesheet" href="styles/breeds.css" />
```
Add after other category stylesheets.

**In `app.js` (in `LAUNCHERS` object):**
```js
breeds: () => launchGame('breeds', 'questions/breeds.csv')
```
Add after existing game launchers.

---

## Section 9 — Implementation Order

1. **Create `questions/breeds.csv`** — 75 rows with all tiers, question types balanced (60% image / 40% fact), image URLs verified for licensing and quality. All reveal phrases written with surprising facts (not just confirmations). Verify single defensible answer per question.

2. **Create `js/games/breeds.js`** — Module structure, CSV parsing, tier pool separation. Build round logic with difficulty ramp. Implement fact-to-breed template text generation. Build choice logic from CSV (not dynamic distractor generation).

3. **Create `styles/breeds.css`** — All visual overrides scoped to `[data-game="breeds"]`. Define CSS custom properties. Implement breed image fade-in animation. Test paw print SVG rendering at corner positions.

4. **Update `manifest.csv`** — Add breeds row.

5. **Update `index.html`** — Add stylesheet link.

6. **Update `app.js`** — Add `breeds` launcher.

7. **Image rendering & container testing** — Verify breed images load and display correctly. Test various image aspect ratios and confirm `object-fit: contain` displays all breeds legibly.

8. **Question text & reveal QA** — Verify all 50 questions are distinct and readable as TTS. Confirm fact-to-breed template text sounds natural. Test difficult breed names on target TTS voice.

Each step is independently testable: CSV validates in spreadsheet. Module can unit-test for round building. CSS previews in browser. Integration steps are final.

---

## Section 10 — Conflicts Resolved

**Image URL hosting:** Content Designer flagged that all images must be verified for licensing before launch. Recommendation: **Use only Wikimedia Commons URLs in v1. No local image files stored in repo. All URLs must be tested to load correctly before shipping.** Create QA checklist that tests every image URL.

**Question type distribution enforcement:** GD proposed 60% image / 40% fact distribution. Content Designer recommended explicit type column in CSV. Recommendation: **Implement type enforcement in `buildRound()` to maintain 60/40 split (or closest achievable) in each round.**

---

*End of consolidated plan. Ready for implementation.*
