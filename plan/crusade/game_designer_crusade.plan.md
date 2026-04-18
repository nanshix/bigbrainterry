# Game Design Document: Crusade History

## 1. Category Assessment

**Is it a good fit for this game format?**

Yes — an excellent fit, and arguably the best thematic match in the entire project. The parchment scroll UI that was custom-built for Flag Rush looks *exactly* like a medieval manuscript. Running a Crusades quiz inside it feels intentional rather than recycled. The dramatic stakes of the Crusades (siege of Jerusalem, Saladin vs Richard, the Children's Crusade) make for strong voice-host moments. Secondary school level keeps it accessible to a broad YouTube audience while still making people sweat.

The self-running autoplay format works well here. History trivia produces the same "oh of course!" satisfying reveal that flags do — the answer clicks even when you got it wrong.

**Question types that work:**
- **Person-to-role**: "Who led the First Crusade?" → 4 name choices (text)
- **Event-to-date**: "In what year did Crusaders first capture Jerusalem?" → 4 year choices (text)
- **Fact-to-figure**: "Who commanded the Muslim forces at the Battle of Hattin?" → 4 names (text)
- **Location-to-event**: "At which battle was the Crusader Kingdom effectively destroyed?" → 4 battle names
- **Pope-to-crusade**: "Which Pope called for the Third Crusade?" → 4 name choices

All question types are pure text MCQ — no images required. The existing `.name-choices` UI in `flags.css` handles this with zero modification.

**What does NOT work well:**
- Image-based questions (no reliable free image API equivalent to flagcdn.com for historical figures)
- Map-pin type questions (medieval maps are not standardised enough for a clean UI)

**Round size:** 50 questions. Same as Flag Rush. The Crusades span 200 years and ~8 major crusades, giving plenty of material. A curated bank of 70-80 questions supports shuffled replayability.

---

## 2. Difficulty Tier Design

**How difficulty is defined:**
Difficulty is determined by *fame of the fact*, not inherent complexity. A question about Saladin (tier 1) is no more intellectually demanding than one about the Count of Champagne (tier 3) — but the former is known by almost everyone; the latter by almost nobody. This matches how flags.csv uses difficulty: recognisability, not complexity.

| Tier | Definition | Examples |
|------|-----------|---------|
| 1 (easy) | Famous figures, iconic dates, well-known events — appear in school curricula everywhere | Pope Urban II, Saladin, Richard I, Jerusalem 1099, 1187, 1291 |
| 2 (medium) | Specific Crusades, notable battles, secondary figures, key treaties | Battle of Hattin, Frederick Barbarossa, the Children's Crusade, the sack of Constantinople |
| 3 (hard) | Lesser-known figures, specific treaty terms, Baltic Crusades, precise dates of minor events | Teutonic Knights' specific campaigns, Albigensian Crusade details, Baybars, specific years of sieges |

**50-question difficulty ramp:**
- Q1–10: Tier 1 (10 questions) — build confidence, voice host reacts warmly
- Q11–25: Tier 2 (15 questions) — mid-game grind, milestone at Q10 kicks off this phase
- Q26–40: Mix tier 2 (8) + tier 3 (7) — shuffled, milestone at Q25 signals escalation
- Q41–50: Tier 3 only (10 questions) — "Final Stretch" milestone at Q40 delivers the pressure

This matches the exact same `buildRound()` logic used in flags.js — copy the tier-split pattern directly.

---

## 3. Question Type Mechanics

### Primary Format: Text MCQ

**What the player sees on screen:**
The existing `scroll-wrap > scroll-body` parchment UI. The `.q-label` div shows the question text. The `.name-choices` div shows four text buttons labelled A/B/C/D.

```
┌─────────────────────────────────┐
│  [scroll corners with compass]  │
│                                 │
│  WHO PREACHED THE FIRST         │
│  CRUSADE IN 1095?               │
│                                 │
│  [A] Pope Urban II              │
│  [B] Pope Gregory VII           │
│  [C] Pope Innocent III          │
│  [D] Pope Clement V             │
└─────────────────────────────────┘
```

**What are the 4 choices?**
- 1 correct answer
- 3 distractors drawn from the same difficulty tier (same pattern as `buildQuestion()` in flags.js)
- For person questions: 3 other historical figures of similar fame
- For date questions: 3 plausible nearby years (e.g. 1096, 1097, 1101 vs correct 1099)
- For event questions: 3 real but wrong events

**The reveal:**
Same `doReveal()` flow as flags. Correct → green highlight, wrong → red, correct answer always shown. Voice host speaks a reveal phrase with a historical hook:
- Correct: *"Correct! Pope Urban II launched it all at the Council of Clermont — November 1095!"*
- Wrong/timeout: *"That was Pope Urban II — it all began with his speech at Clermont in 1095!"*

Reveal phrase stored in CSV (`reveal` column) or in a JS map keyed by question ID. **Recommendation: put it in the CSV** — keeps data in data files, consistent with architecture rules.

**Does this need new UI components?**
No. The `.name-choices` layout is already built and styled. The question display only needs the `q-header` variant that shows a text question (not a flag image) — this is a trivial one-liner in the game module's `showQuestion()`.

The scroll corner compass SVGs are aesthetically perfect for a medieval theme — no visual changes needed.

---

## 4. Reuse vs New Build

### What is fully reusable (zero changes):
- `engine.js` — entire game loop, timer, scoring, milestones, results, countdown
- `core/audio.js` and `core/speech.js` — beeps and voice host
- `.scroll-wrap / .scroll-body` HTML structure and CSS
- `.name-choices` and `.name-choice` button CSS
- `.game-screen / .game-hud / .timer-bar` CSS
- `buildRound()` logic pattern (copy the tier-split array construction)
- `doReveal()` structure (correct/wrong/timeout logic, `speakThenAdvance`)
- `app.js` — just add one entry to `LAUNCHERS`

### What needs to be built:
| Item | Effort | Notes |
|------|--------|-------|
| `questions/crusades.csv` | Medium | ~70 rows: id, question, answer, wrong1, wrong2, wrong3, difficulty, reveal. Data research/writing is the main effort. |
| `js/games/crusades.js` | Low | New game module. Mostly identical structure to flags.js minus flyFlagToMap and getCountryCoords. ~150 lines. |
| Row in `questions/manifest.csv` | Trivial | One line. |
| Entry in `app.js LAUNCHERS` | Trivial | One line. |
| New CSS (`styles/crusades.css`) | None needed | All needed styles already exist in `core.css` and `flags.css` (`.name-choices` is game-agnostic). Link `flags.css` or extract `.name-choices` to `core.css` if it isn't already. |

### What to skip vs Flag Rush:
- `flyFlagToMap()` — no equivalent needed. The reveal is satisfying without it for history questions.
- `highlightCountry()` — not applicable.
- `THROW_DIRS` / throw animation — the throw-out is a flag-choice visual; text choices don't use it (already handled by the `country-to-flag` check in flags.js).

---

## 5. Priority Recommendation

**Build Crusade History first.**

Reasons:
1. **Zero new UI.** The parchment scroll, `.name-choices`, HUD, timer — all exist. This is the shortest path from zero to a second playable game.
2. **Thematic synergy.** The parchment scroll UI was designed for flags but reads as medieval manuscript. Running a Crusades quiz inside it is an aesthetic win that costs nothing.
3. **Strong YouTube hook.** "How much do you know about the Crusades?" is a headline that works. The dramatic material (siege of Jerusalem, Saladin's reconquest, the sack of Constantinople) gives the voice host great lines.
4. **Validates the engine for text-only categories.** Building Crusades first proves that the game engine cleanly supports a non-image category, which unblocks Capital Cities, World Cities, and any future trivia category.
5. **Data effort is finite.** The Crusades are a well-documented, bounded historical period. ~70 quality questions can be written from standard reference sources. There's no ongoing data maintenance problem.

**CSV schema for `questions/crusades.csv`:**
```
id,question,answer,wrong1,wrong2,wrong3,difficulty,reveal
cr001,Who preached the First Crusade in 1095?,Pope Urban II,Pope Gregory VII,Pope Innocent III,Pope Clement V,1,Pope Urban II launched it all at the Council of Clermont — November 1095!
cr002,In what year did Crusaders first capture Jerusalem?,1099,1096,1102,1187,1,1099 — the Crusaders stormed Jerusalem on July 15th after a five-week siege!
...
```

**JS module entry point:**
```js
export async function launch() {
  const questions = await loadQuestions();  // fetch + parseCSV('questions/crusades.csv')
  function restart() {
    const round = buildRound(questions).map((q, i) => buildQuestion(q, i, questions));
    startGame(round, showQuestion, restart);
  }
  const round = buildRound(questions).map((q, i) => buildQuestion(q, i, questions));
  startGame(round, showQuestion, restart);
}
```
