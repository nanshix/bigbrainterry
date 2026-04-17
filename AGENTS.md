# AGENTS.md — Big Brain Terry

AI agent instructions. Read this at the start of every session.
For which other docs to read, see **FILELIST.md**.

---

## What This Project Is

A quiz game website — pure HTML/CSS/JS, no build step, no framework. Open `index.html` in a browser over HTTP (not file://). Currently one playable game: **Flag Rush** (50 flags, 3 difficulty tiers, 5s per question, voice host, parchment scroll UI, world map background).

Built for YouTube recording — autoplay-first, viewer-paced, 16:9 modal.

---

## How to Run

⚠ **Must be served over HTTP. Opening index.html directly (file://) will not work.**
ES modules and fetch() are both blocked by the browser on file://.

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

No build, no install, no lint, no tests. Refresh browser to see changes.

---

## File Structure

```
index.html                  ← entry point; loads CSS + js/app.js as module
AGENTS.md                   ← you are here
FILELIST.md                     ← doc manifest: what to read / when to update

styles/
  core.css                  ← homepage, modal shell, HUD, countdown, milestone, results,
                               shared choice components (name-choices, choice-badge, reveal states)
  flags.css                 ← flag quiz only: parchment scroll, flashcards, throw animations
  crusade.css               ← crusade quiz overrides: map tint, parchment warmth, question font size

js/
  app.js                    ← entry: loads manifest, renders homepage, wires events
  utils.js                  ← pure shared functions: shuffle(), flagUrl(), parseCSV()
  core/
    audio.js                ← Web Audio beeps (game-agnostic)
    speech.js               ← SpeechSynthesis voice host (game-agnostic)
    engine.js               ← game loop: timer, scoring, countdown, milestone, results
                               startGame() accepts optional config: { milestones, getRank }
                               milestone supports a `voice` field (spoken text separate from display)
  games/
    flags.js                ← all flag-quiz logic: data loading, question building,
                               showQuestion, doReveal, flyFlagToMap, map highlight,
                               reveal phrases
    crusade.js              ← crusade history quiz: loadQuestions, buildRound (no-consecutive-dates),
                               buildQuestion, showQuestion, doReveal, ttsPrep (year→words)

questions/
  manifest.csv              ← category registry (one row per category; # to disable)
  flags.csv                 ← flag data: code,name,difficulty
  crusade.csv               ← crusade questions: id,question,answer,wrong1-3,difficulty,type,reveal

assets/
  worldmap169.png           ← 16:9 world map background
  logo.svg
  noise.svg                 ← parchment texture

plan/                       ← design documents (see FILELIST.md for what's current)
```

---

## Architecture Rules

These are non-negotiable. See `plan/project_structure_principles.md` for full reasoning.

- **`engine.js` is game-agnostic.** It knows nothing about flags. It manages: timer, score, advance, countdown, milestone, results. Game modules call engine utilities and register callbacks.
- **Each game module is self-contained.** `games/flags.js` owns everything flag-specific. Adding a new game = new file in `games/`, new row in `manifest.csv`, register in `LAUNCHERS` in `app.js`.
- **Data lives in CSV.** Never hardcode question/country data in JS. One row = one item.
- **`manifest.csv` is the registry.** Never scan folders or hardcode category lists anywhere.
- **`core.css` vs `flags.css`:** if a style only exists because of one game mode, it belongs in that mode's CSS file.

---

## Adding a New Category (4 steps)

1. Add a row to `questions/manifest.csv`
2. Create `questions/{id}.csv` with the data
3. Create `js/games/{id}.js` with a `launch()` export
4. Register in `js/app.js` → `LAUNCHERS = { ..., {id}: launch{Id} }`
5. Add `styles/{id}.css` if needed, link in `index.html`

---

## Code Style

**JS:** ES modules (`import`/`export`). No `'use strict'` needed in modules. `const` by default, `let` only when reassignment needed. camelCase for variables/functions, SCREAMING_SNAKE_CASE for config constants, `_underscore` prefix for module-private state.

**CSS:** custom properties in `:root` for all theme values. BEM-ish class names (`.flag-choice`, `.flag-choice.correct`). No inline styles except for dynamically computed values (positions, widths from JS).

**HTML:** template literals in JS for dynamic HTML. `data-*` attributes for JS hooks. `aria-hidden` always set on show/hide.

**General:** functions short and single-purpose. No defensive error handling for things that can't fail. No unused code left behind.

---

## Key Gotchas

- ES modules require HTTP — `file://` won't work (CORS on fetch + module imports)
- SVG map overlay: `viewBox="0 0 1000 562"` with `preserveAspectRatio="none"` — 16:9 to match the container exactly, no clipping. Country coords are in this 1000×562 space.
- `flyFlagToMap()` uses `coords[1] / 562` for y (not 500 — that was the old 2:1 viewBox)
- Voice host uses `speakThenAdvance()` from engine — advances only after both speech ends AND minimum display time has elapsed, so nothing gets cut off
- `gameTimeout()` wrapper: all game-flow timeouts go through this so `closeQuiz()` can cancel them cleanly
