2. dog-breeds, the picture link for many questions are invalid — pending QA of breeds.csv image URLs

---
 - [done] answer characters "ABCD" — now a big circle badge (2.2rem, border-radius 50%)
 8. [done] capitals choice text too small — bumped to clamp(1.3rem, 3.5vw, 2.4rem)
9. [done] capitals question format — now shows country flag in the question area (ct direction); choices are text-only capital/country names. No more flag+text cards.
3. [done] dog-breeds reveal animation — correct breed image now zooms + green glow ring; correct text pops, wrong text shakes

---
- [done] i set default round_size to 7, but when i start the game, it is still Q0/50, i m expecting Q0/7 — engine now slices round to config.roundSize; set roundSize in each game's startGame config to take effect
- [done] i can see u have the random dice button turn on by default, i want it to be disabled by default
 - [done] pictures take time to load — breeds now preloads the next question's image while you answer the current one. For other games (flag images are local, should be fast).
---
 - should i pre download some background picture for you? or i d better leave it to you
 - should we have background picture ready as asset saved locally, or using online link

My preference: save locally as assets. Online links can break or be slow. For world map you already have worldmap169.png locally — same approach for any new backgrounds.
---
**What is the current font?**
Two fonts: `Space Grotesk` (UI chrome — badges, labels, buttons) and `Fraunces` (display text — answer names, scores, timer counter, country names). Both loaded from Google Fonts.

**What is the current size, for 1. flags options? 2. flags questions?**
- Flags answer options (the choice name text): `clamp(1.5rem, 4.5vw, 3rem)` — Fraunces 900 weight
- Flags question: two directions — "Which flag is [country]?" shows the country name at the same `clamp(1.5rem, 4.5vw, 3rem)`; "Which country is this flag?" shows a large flag image (no text size to quote)
- The ABCD badge: just bumped to `1rem` (was `0.6rem`)

**Is the question-answer format standardized or is it case by case for each category?**
The scroll card, HUD bar, and timer bar are shared via core.css — same across all games. The question header layout inside the scroll varies: flags has a flag image or country name; crusade has a split left/right panel with type illustration; capitals/cities/breeds use the standard text header. Answer choices are always a 2×2 grid, but flags uses image cards while others use text name cards.
