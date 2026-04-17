# Crusade Game — UI Elements

All 16 distinct visual elements in the question screen.

## Background
1. **World map image** — `map-img` — full-bleed 16:9 photo of the world map
2. **Crusade tint overlay** — `map-bg::after` — amber/red radial gradient over the map, evokes the Holy Land

## HUD bar
3. **Question counter** — `hud-q` — e.g. "Q 1 / 50"
4. **Timer countdown number** — `timer-counter` — large digit counting down from 12
5. **Score** — `hud-score` — e.g. "0 pts"

## Timer
6. **Timer progress bar** — `timer-fill` inside `timer-bar` — thin horizontal fill strip below the HUD, turns red at 2s

## Scroll chrome
7. **Parchment scroll body** — `scroll-body` — the main amber parchment card with noise texture and border
8. **Rolled scroll edges** — `scroll-body::before` and `::after` — cylindrical curl at top and bottom of parchment
9. **Corner crosses** — `.scroll-corner` ×4 — crusade cross SVG at each corner of the parchment, low opacity

## Left panel (inside scroll)
10. **Question-type illustration** — `crusade-illus svg` — thematic SVG: hourglass (date), knight helm (person), crossed swords (event), shield (fact), castle (place)
11. **Type label** — `crusade-illus-label` — small uppercase text below the SVG, e.g. "Historical Figure"

## Right panel (inside scroll)
12. **Category label** — `q-label` — "Crusade History", small muted text above the question
13. **Question text** — `q-country-name` — the full question sentence

## Choice cards ×4 (inside right panel)
14. **Choice illustration** — `choice-illus svg` (or `choice-year` for date type) — per-slot SVG icon or large styled year number
15. **A/B/C/D badge** — `choice-badge` — letter label identifying the choice slot
16. **Answer text** — `choice-name` — the answer option text (hidden for date type, year is shown as illustration instead)
