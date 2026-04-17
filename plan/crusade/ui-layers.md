# Crusade Game — UI Layers

Z-order from bottom to top, as rendered.

| z-index | Layer | What's on it |
|---------|-------|-------------|
| 0 | **Map background** | World map image + crusade tint overlay |
| 0 | **Game background glow** | `game-bg` — subtle animated radial gradients (gold/blue/red), adds depth behind the scroll |
| 1 | **Timer bar** | Thin progress strip, sits just below the HUD |
| 2 | **Scroll wrap + scroll body** | The entire parchment card (body, rolled edges, texture) |
| 2 | **Scroll content** | Left panel (type SVG + label) and right panel (question + choice cards) |
| 3 | **HUD bar** | Q counter, timer number, score — floats above everything with blur backdrop |
| 4 | **Scroll corner crosses** | Decorative crosses, absolutely positioned inside the scroll body |

## Notes
- The HUD (`z-index: 3`) sits above the scroll so it's always readable.
- The scroll (`z-index: 2`) sits above the map background.
- The game background glow (`z-index: 0`) is behind the scroll but above the map — it bleeds around the scroll edges as ambient light.
- The tint overlay is a pseudo-element on `map-bg` with its own internal stacking but effectively sits at z=0.
