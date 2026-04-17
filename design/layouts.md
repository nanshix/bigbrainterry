# Layout Templates

Named layout templates for quiz games.
When creating a new game, reference a layout by name and list only your overrides.

---

## `standard`
> Used by: Flag Rush

Top-to-bottom structure:
```
[ HUD bar: Q counter | timer number | score ]
[ Timer progress bar ]
[ Scroll — full width ]
  [ Rolled top edge ]
  [ Corner decorations ×4 ]
  [ Question header: category label + question text ]
  [ Choice grid: 2×2 ]
  [ Rolled bottom edge ]
```
- Scroll fills the full available width
- No left panel
- Choice cards are horizontal (badge + content side by side)

---

## `split-scroll`
> Used by: Crusade History

Top-to-bottom structure:
```
[ HUD bar: Q counter | timer number | score ]
[ Timer progress bar ]
[ Scroll — split left / right ]
  [ Rolled top edge ]
  [ Corner decorations ×4 ]
  [ Left panel: type illustration + type label ]  |  [ Right panel ]
                                                  |  [ Category label ]
                                                  |  [ Question text ]
                                                  |  [ Choice grid: 2×2 ]
  [ Rolled bottom edge ]
```
- Scroll is split: left panel ~26% width, right panel fills the rest
- Left panel shows a thematic illustration per question type
- Choice cards are vertical (illustration on top, badge + text below)

---

## Future layout ideas (not yet built)
- `map-focus` — question overlaid on a zoomed map region, no scroll
- `image-question` — question is a photo/image, choices are text only
- `timeline` — choices arranged on a horizontal timeline axis
