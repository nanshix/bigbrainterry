# Project Structure Principles
## For multi-mode, data-driven web games (no build step)

---

## The Core Rules

### 1. Data lives in CSV, never in JS
Every question, country, entry — one row, one item. Delete a row, the item is gone. No JSON brackets to balance, no trailing commas to hunt.

CSV is readable by humans, Python, spreadsheets, and the browser. It's the universal format.

**Column names are the schema.** Open any CSV cold and you understand it immediately.

### 2. The manifest is the single source of truth
One file lists everything that exists in the project:

```
questions/manifest.csv
```

```csv
id,name,icon,locked,desc,files
flags,Flag Rush,🌍,false,"50 flags - 3 tiers - 5s each",flags.csv
crusade,Crusade History,⚔️,true,Medieval warfare & history,crusade/questions.csv
cities,City Pictures,🌆,true,Identify famous cities from photos,cities/questions.csv
```

- Python reads this one file and knows everything that exists
- The game reads this to build the homepage UI
- `locked=true` → shows as "coming soon" (visible, unplayable)
- `# comment` → completely invisible (dev toggle, nothing deleted)

**Never scan folders. Never hardcode category lists in JS. The manifest is the registry.**

### 3. CSS splits by concern, not by page
```
styles/
  core.css      ← layout, shell, shared UI (modal, HUD, countdown, results)
  flags.css     ← flag-quiz specific (parchment, flashcards, throw animations)
  crusade.css   ← crusade specific (future)
```

Rule: if a style only exists because of one game mode, it belongs in that mode's CSS. If removing a game mode leaves the style unused, it's not in core.

### 4. JS splits by responsibility
```
js/
  app.js          ← entry point only: boots UI, loads manifest, wires events
  utils.js        ← pure functions with no side effects (shuffle, parse, format)
  core/
    audio.js      ← Web Audio (game-agnostic)
    speech.js     ← SpeechSynthesis (game-agnostic)
    engine.js     ← game loop: timer, scoring, countdown, milestone, results
  games/
    flags.js      ← everything flag-specific
    crusade.js    ← everything crusade-specific (future)
```

Rule: `engine.js` knows nothing about flags, crusades, or cities. It only knows: timer, score, advance, milestone, results. Game modules know everything about their own mode and call engine utilities.

### 5. Each game module is self-contained
A game module owns:
- Data loading (fetch its own CSV)
- Question building (turn raw data into question objects)
- Question rendering (inject HTML into the stage)
- Reveal logic (handle correct/wrong, visual effects)
- Any mode-specific animations

It registers with the engine via `startGame(round, showQuestion, onRestart)`. The engine calls back into the module; the module never drives the engine.

### 6. The manifest comment convention
CSV has no official comment syntax. Use `#` at the start of a row:

```csv
#crusade,Crusade History,⚔️,true,...
```

Both Python and JS filter it with one line:
```python
rows = [r for r in csv.reader(f) if not r[0].startswith('#')]
```
```js
lines.filter(l => !l.trimStart().startsWith('#'))
```

Two disable mechanisms, two different meanings:
- `locked=true` → exists, visible, unplayable ("coming soon")
- `#` comment → doesn't exist yet, completely hidden

### 7. No build step
ES modules (`<script type="module">`) work natively over HTTP in all modern browsers. No webpack, no bundler, no compile step. Files are what they are.

This keeps the project approachable: open a file, edit it, reload. Python can read everything directly.

---

## Adding a New Category (checklist)

1. Add a row to `questions/manifest.csv`
2. Create `questions/{id}/` folder with a CSV file
3. Create `js/games/{id}.js` with a `launch()` export
4. Register it in `js/app.js` → `const LAUNCHERS = { flags: launchFlags, {id}: launch{Id} }`
5. Add `styles/{id}.css` if it needs its own styles, link it in `index.html`

That's it. Nothing else changes.

---

## Data Schema Conventions

Each category defines its own CSV schema. Column names are self-documenting. The engine doesn't care about the schema — only the game module reads its own data.

**Flags:**
```csv
code,name,difficulty
us,United States,1
```

**Generic trivia:**
```csv
id,question,answer,wrong1,wrong2,wrong3,difficulty
1,"Who called the First Crusade?","Pope Urban II","Gregory VII","Saladin","Richard I",easy
```

**Rule:** if a field value contains a comma, wrap it in double quotes. Everything else: raw values, no quoting needed.

---

## File Naming
- `core.css` / `core.js` — shared, no feature dependency
- `{feature}.css` / `{feature}.js` — belongs to one mode, named after it
- `manifest.csv` — always at the root of the data folder
- `countries.csv`, `questions.csv` — named for what the rows represent, not the game
