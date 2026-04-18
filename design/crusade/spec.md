# Crusade History — Game Spec

Reference sheet for this game's layout, element, and config choices.
Use this when requesting changes: "keep the spec, change X" or "override element Y".

---

## Layout
`split-scroll` — see `design/layouts.md`

---

## Elements in use
All standard elements, plus the left-panel elements.
See `design/crusade/ui_elements.md` for the full detailed reference.

| Element ID | Included | Customisation |
|------------|----------|---------------|
| `bg-map` | ✅ | Standard world map |
| `bg-tint` | ✅ | Amber/red radial glow centred on the Holy Land (55% 45%) |
| `bg-glow` | ✅ | Standard |
| `hud-bar` | ✅ | Standard position (top of game screen) |
| `hud-q` | ✅ | Standard |
| `hud-timer` | ✅ | Standard |
| `hud-score` | ✅ | Standard |
| `timer-bar` | ✅ | Standard; urgency at 2s |
| `scroll-body` | ✅ | More golden/amber than Flag Rush; noise texture overlay |
| `scroll-edge-top` | ✅ | Standard rolled edge |
| `scroll-edge-bottom` | ✅ | Standard rolled edge |
| `scroll-corners` | ✅ | Crusade cross SVG (replaces compass rose) |
| `panel-illus` | ✅ | Per question type: hourglass / knight helm / crossed swords / heraldic shield / castle tower |
| `panel-label` | ✅ | Type name: "Year & Date" / "Historical Figure" / "Battle & Siege" / "Crusade Lore" / "Holy Land" |
| `q-label` | ✅ | Text: "Crusade History" |
| `q-text` | ✅ | Font scaled down (long sentence questions); Fraunces serif |
| `choice-illus` | ✅ | Per slot (A/B/C/D): heraldic shields (person) / weapons (event) / symbols (fact) / large year (date) |
| `choice-badge` | ✅ | Standard A/B/C/D |
| `choice-text` | ✅ | Hidden for `date` type (year shown as illustration instead) |
| `state-correct` | ✅ | Illustration glows green; text turns green. No box/border highlight. |
| `state-wrong` | ✅ | Illustration fades out (opacity 0.25); text dims red. No box/border highlight. |

---

## Config
```
questionTime : 12        (seconds — long text questions need reading time)
milestones   : CRUSADE_MILESTONES  (at scores 10, 25, 40)
getRank      : getCrusadeRank      (Pilgrim → Footsoldier → Sergeant → Knight → Baron → Crusader → Grand Master)
```

---

## Layer reference
See `design/crusade/ui_layers.md`
