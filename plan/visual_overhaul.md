# Visual Overhaul Plan — Big Brain Terry

## Requirements
1. **World map background** — `assets/worldmap169.png` fills the entire game modal canvas. Map lines desaturated/slightly opacity-reduced so they don't compete with game elements.
2. **Parchment scroll** — Central quiz area rendered as an unrolled ancient parchment scroll. Aged paper texture, dark edges (vignette), tiny corner illustrations (compass rose, flourish) via CSS/SVG. All question content lives inside the scroll.
3. **Flag flashcard throw-in** — When `country-to-flag` question shows, each of the 4 flag cards flies in from off-screen with a throw animation (staggered, from different screen edges), like tossed by someone off-frame.
4. **Flag dismiss animation** — When an answer is chosen: the 3 wrong flags fly OUT of the screen (slide off to edges). The correct flag stays (or zooms in to confirm).
5. **Country highlight on map** — After a correct answer, briefly pulse/highlight the answered country's location on the SVG world map overlay. (Approach: use a simplified SVG overlay with country path IDs matching ISO codes. On correct answer, add a highlight class to the matching path.)

## Architecture Analysis

### Current structure
- `index.html` — modal shell with `#quiz-stage` as content target
- `app.js` — all game logic, writes innerHTML to `#quiz-stage`
- `styles.css` — all styles

### What changes where

#### `index.html`
- Add world map `<img>` inside `.modal-card` as a background layer (behind `#quiz-stage`)
- Add SVG overlay layer for country highlighting (positioned absolute, same size)

#### `styles.css`
- `.modal-card` — add world map bg layer styles
- New `.scroll-wrap` — the parchment scroll container inside game-screen
- New `.scroll-body` — inner content area with paper texture via CSS (radial gradients + noise)  
- New flag throw-in keyframes: `@keyframes throw-in-tl`, `throw-in-tr`, `throw-in-bl`, `throw-in-br`
- New flag throw-out keyframes: `throw-out-left`, `throw-out-right`, `throw-out-top`, `throw-out-bottom`
- Country highlight pulse animation for SVG path

#### `app.js`
- `showQuestion()` — wrap content in `.scroll-wrap > .scroll-body`, add `data-throw-dir` to each flag card
- `doReveal()` — add throw-out classes to 3 wrong flags, keep correct flag
- New `highlightCountry(code)` — adds highlight class to SVG path `#country-{code}`, removes after 1.5s
- Call `highlightCountry` on correct answer after reveal delay

## SVG Country Highlight Approach
- Use a lightweight world SVG overlay (Natural Earth simplified, ~200KB)
- Country `<path>` elements have `id="xx"` (ISO 3166-1 alpha-2)
- On correct: `svgEl.querySelector('#' + code)?.classList.add('country-flash')`
- `.country-flash` — fill: gold, opacity pulse, 1.5s then remove

## Scroll Design
- Background: `#f4e4c1` warm parchment base
- Texture: CSS layered radial-gradients for aged spots + `assets/noise.svg` as overlay
- Border: dark brown `#5c3a1e` with slightly irregular box-shadow for aged look
- Top/bottom rolled edges: CSS pseudo-elements with gradient (cylindrical shadow)
- Corner decorations: inline SVG compass rose (tiny, ~32px, faded sepia)
- HUD (score, timer) stays OUTSIDE scroll, in map space above

## Throw Animation Details
Each flag card gets a direction: `A=top-left, B=top-right, C=bottom-left, D=bottom-right`
- Throw-in: start `translate(-120%, -120%) rotate(-15deg) scale(0.7)`, end `translate(0,0) rotate(0) scale(1)`, duration 400ms, easing `cubic-bezier(0.175, 0.885, 0.32, 1.275)`
- Stagger: 0ms, 80ms, 160ms, 240ms
- Throw-out: reverse direction, duration 300ms, ease-in

## Implementation Order
1. World map background layer in modal (CSS only)
2. Parchment scroll wrapper (CSS + HTML restructure in showQuestion/showMilestone/etc.)
3. Flag throw-in animations
4. Flag throw-out on answer
5. Country SVG highlight

## Compatibility Notes
- All innerHTML injection in app.js continues to work — scroll wrapper is added inside showQuestion()
- HUD stays outside scroll (above it) so timer remains visible
- Mobile portrait: scroll takes more width, less height
- No new dependencies — SVG world map loaded inline or as separate file
