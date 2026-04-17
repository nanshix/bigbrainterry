# Element Catalog

Master list of every UI element in the quiz game system.
Each element has an ID you can reference by name in game specs and task instructions.

---

## Background layer

| ID | Name | Description |
|----|------|-------------|
| `bg-map` | World map image | Full-bleed 16:9 world map photo behind everything |
| `bg-tint` | Theme tint overlay | Radial gradient over the map to set game colour mood |
| `bg-glow` | Game background glow | Animated ambient radial gradients, bleeds around the scroll |

---

## HUD

| ID | Name | Description |
|----|------|-------------|
| `hud-bar` | HUD container | The bar housing the three HUD elements below |
| `hud-q` | Question counter | "Q 1 / 50" — current question vs total |
| `hud-timer` | Timer number | Large countdown digit, e.g. "12" |
| `hud-score` | Score | Running score, e.g. "0 pts" |

---

## Timer

| ID | Name | Description |
|----|------|-------------|
| `timer-bar` | Timer progress bar | Thin horizontal fill strip below HUD; turns red at urgency threshold |

---

## Scroll chrome

| ID | Name | Description |
|----|------|-------------|
| `scroll-body` | Parchment scroll | The main parchment card: background texture, border, shadow |
| `scroll-edge-top` | Top rolled edge | Cylindrical curl at the top of the parchment (pseudo-element) |
| `scroll-edge-bottom` | Bottom rolled edge | Cylindrical curl at the bottom of the parchment (pseudo-element) |
| `scroll-corners` | Corner decorations | Decorative SVG icons at the 4 corners of the parchment |

---

## Left panel (split-scroll layout only)

| ID | Name | Description |
|----|------|-------------|
| `panel-illus` | Question-type illustration | Thematic SVG per question type (hourglass / helm / swords / shield / castle) |
| `panel-label` | Type label | Small uppercase text below the illustration, e.g. "Historical Figure" |

---

## Question area (right panel or full-scroll)

| ID | Name | Description |
|----|------|-------------|
| `q-label` | Category label | Game/category name, small muted text above the question, e.g. "Crusade History" |
| `q-text` | Question text | The full question sentence |

---

## Choice cards (×4)

| ID | Name | Description |
|----|------|-------------|
| `choice-illus` | Choice illustration | Per-slot SVG icon or large year number (date type); top portion of card |
| `choice-badge` | A/B/C/D badge | Letter label identifying the choice slot |
| `choice-text` | Answer text | The answer option text; bottom of card |

---

## Reveal states (applied to choice cards on answer)

| ID | Name | Description |
|----|------|-------------|
| `state-correct` | Correct highlight | Applied to the correct answer card after reveal |
| `state-wrong` | Wrong highlight | Applied to the player's wrong choice after reveal |
