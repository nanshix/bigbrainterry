# Visual Design Plan: Crusade History
*Agent 3 of 5 — Visual & Theme Designer*

---

## Part A — Review of Previous Plans

### Visual Implications of Game Designer Decisions

**1. "No new CSS needed — link flags.css directly."**
Partially correct but incomplete. `flags.css` contains `.name-choices` and `.name-choice`, which are genuinely game-agnostic and should be moved to `core.css`. More importantly, "no new CSS" means Crusade History will look *identical* to Flag Rush — same corner decorations, same parchment tint, same everything. This is a missed opportunity. The parchment scroll already reads as medieval; a small amount of category-specific CSS can make it feel intentionally Crusade-themed rather than incidentally reused.

**2. Parchment scroll reuse.**
Confirmed correct. The warm aged parchment (`#f4e4c1` → `#d4b97a`, border `#7a4f1e`) is exactly right for medieval history. No structural changes needed. The visual identity work is in the *details* — corner motifs, map tint, rank titles.

**3. Compass rose corners declared "aesthetically perfect."**
They work, but a heraldic cross is *better*. The compass rose connotes exploration and navigation; a crusader cross connotes the specific subject matter. The change is a single SVG swap — same position, same size, same opacity.

**4. `.name-choices` in flags.css.**
Flag as architectural debt. Once Crusades and Cities both use this layout, it should live in `core.css`. Recommend raising with the Game Designer before implementation.

**5. No mention of milestone or results screen theming.**
Both the GD and CD plans are silent on milestone headline text and rank flavour for this category. Defined below.

### Visual Concerns and Gaps

| Concern | Severity | Notes |
|---------|----------|-------|
| No visual differentiation from Flag Rush | Medium | Corner motif swap + map tint is sufficient; low effort |
| `.name-choices` in wrong CSS file | Medium | Architectural issue; raise with GD before build |
| Results rank labels are generic | Low | Easy to add; no code required, just data |
| No guidance on milestone sub-text flavour | Low | Defined below |

### Suggestions Back to Earlier Agents

1. **GD:** Move `.name-choices` / `.name-choice` from `flags.css` to `core.css` before building Crusades. Every text-MCQ category will need it.
2. **GD:** Apply a `data-game="crusade"` attribute to `.modal-card` when the crusade module launches. This lets `crusade.css` scope all overrides to a single descendant selector without touching shared styles.
3. **CD:** The reveal phrase *"the Crusaders stormed Jerusalem on 15 July after a five-week siege!"* will be spoken in one breath. Works at 20 words. No visual issue — just confirming pacing alignment.

---

## Part B — Visual Design Brief

### Background

**What replaces the world map?**
Nothing — the existing `assets/worldmap169.png` is kept. The Holy Land, Mediterranean, and Europe are all visible and relevant. The visual change is a semi-transparent amber/red overlay applied via CSS, which gives the map an illuminated-manuscript-on-vellum quality.

**Implementation:** Add `.map-bg--crusade::after` pseudo-element via `crusade.css`:
```css
[data-game="crusade"] .map-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 55% 45%,
    rgba(160, 70, 10, 0.22) 0%,
    rgba(100, 40, 0, 0.14) 60%,
    transparent 100%);
  pointer-events: none;
  z-index: 1;
}
```
This warms and darkens the map toward the Holy Land coordinates without obscuring it.

**Colour palette:**

| Custom property | Value | Usage |
|----------------|-------|-------|
| `--crusade-cross-fill` | `#5c3a1e` | Heraldic cross SVG fill |
| `--crusade-map-tint` | `rgba(160,70,10,0.22)` | Map overlay |
| `--crusade-scroll-border` | `#7a4f1e` | Same as flags (no change) |
| `--crusade-scroll-base` | `#f0deb4` | Slightly more golden than flags parchment |

The existing `--gs-accent` gold, `--gs-correct` green, and `--gs-wrong` red all remain. No HUD palette changes.

---

### Question Area

**Container:** `.scroll-wrap` / `.scroll-body` — retained without structural change.

**Colour adjustment:** The parchment base is nudged very slightly — `#f0deb4` instead of the flags `#f4e4c1`. Barely perceptible, but it reads a touch more amber/golden when seen on the warmed map, subtly different from Flag Rush.

```css
[data-game="crusade"] .scroll-body {
  background:
    url('../assets/noise.svg'),
    radial-gradient(ellipse at 20% 15%, rgba(180,130,60,0.22) 0%, transparent 45%),
    radial-gradient(ellipse at 80% 85%, rgba(140,90,30,0.18) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 50%, rgba(240,222,180,1) 0%, #ddc884 60%, #c8a860 100%);
}
```

**Border and shadow:** Keep `#7a4f1e` border and existing box-shadow. Already looks like a medieval document.

**Rolled edges:** Keep existing `::before` and `::after` pseudo-elements unchanged.

---

### Typography

No font changes. Fraunces serif is the correct choice for medieval history — heavy, authoritative, slightly antiquated. Keep all existing sizes and weights.

**Colour adjustments only:**

```css
[data-game="crusade"] .q-country-name,
[data-game="crusade"] .choice-name {
  color: #2a0e00;  /* slightly deeper than flags #3a1200 — more solemn */
  text-shadow: 0 1px 0 rgba(255,220,130,0.5), 0 2px 8px rgba(80,30,0,0.22);
}
[data-game="crusade"] .q-label {
  color: #6b3a10;
  letter-spacing: 0.06em;  /* slightly more spread — feels like a manuscript rubric */
}
```

---

### Animations

**Question appears:**
Existing `scroll-fly-out` / `scroll-wrap` transition is kept. No changes. The scroll-in effect already reads as a manuscript being unrolled.

**Correct answer:**
Existing `.name-choice.correct` green border and background. Optional enhancement (v2): a brief gold cross shimmer over the scroll — not needed for v1.

**Wrong answer:**
Existing `.name-choice.wrong` red styling.

**Reveal transition:**
No changes. The engine's existing `speakThenAdvance` timing and `scroll-fly-out` transition handle this cleanly.

**No `flyFlagToMap()` equivalent.** The reveal is text-only. The dramatic payoff is in the voice host line and the correct-answer highlight. This is sufficient for history questions — confirmed by all three agents.

---

### Decorative Elements

**Corner decoration: Heraldic Cross**

Replace compass rose SVGs with a crusader cross (cross potent — the Jerusalem Cross with four smaller crosses in the quadrants). Same sizing (`clamp(28px, 4vw, 44px)`), same opacity (`0.22`), same absolute positioning.

Inline SVG — no file needed:

```svg
<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Main cross arms -->
  <rect x="18" y="2"  width="8" height="40" fill="#5c3a1e"/>
  <rect x="2"  y="18" width="40" height="8"  fill="#5c3a1e"/>
  <!-- Four small corner crosses (cross potent) -->
  <rect x="4"  y="8"  width="6" height="2"  fill="#5c3a1e"/>
  <rect x="6"  y="6"  width="2" height="6"  fill="#5c3a1e"/>
  <rect x="34" y="8"  width="6" height="2"  fill="#5c3a1e"/>
  <rect x="36" y="6"  width="2" height="6"  fill="#5c3a1e"/>
  <rect x="4"  y="34" width="6" height="2"  fill="#5c3a1e"/>
  <rect x="6"  y="36" width="2" height="6"  fill="#5c3a1e"/>
  <rect x="34" y="34" width="6" height="2"  fill="#5c3a1e"/>
  <rect x="36" y="36" width="2" height="6"  fill="#5c3a1e"/>
</svg>
```

The four crosses rotate identically in all corners (the crusader cross is symmetric, so no `transform: rotate()` needed per corner — unlike the compass rose, which was directional).

**No other decorative elements needed for v1.** The parchment texture, rolled edges, and dark border carry the medieval atmosphere.

---

### Milestone / Results Screen

**Milestone headline text** (spoken by voice host and displayed):

| Trigger | Headline | Sub-text |
|---------|----------|---------|
| Q10 (milestone 1) | **DEUS VULT** | The march has begun |
| Q25 (milestone 2) | **INTO THE HOLY LAND** | The crusade intensifies |
| Q40 (milestone 3) | **FINAL MARCH ON JERUSALEM** | The hardest questions remain |

These replace the generic engine milestone labels for this category. Implemented in `crusades.js` by passing custom `MILESTONES` config to the engine.

**Results screen rank titles** (replace generic score rank):

| Score % | Rank | Flavour |
|---------|------|---------|
| 0–19% | Pilgrim | You made it to the gates |
| 20–39% | Footsoldier | You fought, but the Holy Land proved distant |
| 40–59% | Sergeant | A seasoned soldier of the cross |
| 60–74% | Knight | Your sword arm is strong |
| 75–84% | Baron of Outremer | A lord in the Crusader states |
| 85–94% | Crusader | Jerusalem bows to your knowledge |
| 95–100% | Grand Master | The Templars would follow you anywhere |

---

### CSS Architecture

**New file: `styles/crusade.css`**

Scoped entirely with `[data-game="crusade"]` descendant selector. Never touches `core.css` or `flags.css`.

```css
/* Crusade History — visual identity overrides */

[data-game="crusade"] .map-bg::after { /* amber map tint */ }
[data-game="crusade"] .scroll-body { /* slightly warmer parchment gradient */ }
[data-game="crusade"] .q-country-name,
[data-game="crusade"] .choice-name { /* deeper text color */ }
[data-game="crusade"] .q-label { /* wider letter-spacing */ }
/* Corner SVG class is set from JS — .scroll-corner content is an SVG element,
   so the crusade module injects heraldic cross SVG strings instead of compass roses */
```

**What stays in `core.css`:** Everything. No changes to shared styles.

**Required before build:** `.name-choices` and `.name-choice` moved from `flags.css` to `core.css`.

**New CSS custom properties (in `crusade.css` `:root` or scoped block):**

```css
[data-game="crusade"] {
  --crusade-cross-fill: #5c3a1e;
  --crusade-map-tint: rgba(160, 70, 10, 0.22);
}
```

---

### Asset Needs

| Asset | Source | Notes |
|-------|--------|-------|
| Heraldic cross corner SVG | Inline (defined above) | No file; injected as HTML string in crusades.js |
| Map amber tint | Pure CSS pseudo-element | No new image |
| Parchment texture | Existing `assets/noise.svg` | Reused unchanged |
| World map | Existing `assets/worldmap169.png` | Reused unchanged |

**Total new assets required: zero.** All visual differentiation is achieved in CSS and inline SVG.
