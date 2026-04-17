# Game Config Parameters

All parameters that can be set per game via the `config` object passed to `startGame()`.
Omitting a parameter uses the default.

---

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `questionTime` | number (seconds) | `5` | How long the player has to answer each question |
| `milestones` | object | engine defaults | Score thresholds that trigger a milestone screen; each entry has `headline`, `sub`, `voice` |
| `getRank` | function | engine default | Maps final score → `{ label, color }` for the results screen |

---

## Notes

- `questionTime` should reflect question complexity. Short visual questions (flags) → 5s. Long text questions (history) → 10–15s.
- `milestones` keys are score values (not question indices). Example: `{ 10: { headline: 'DEUS VULT', sub: '...', voice: '...' } }`.
- `getRank` receives the raw score (0–50) and returns a label and a hex colour for display.

---

## Parameters planned but not yet implemented

| Parameter | Description |
|-----------|-------------|
| `revealTime` | Minimum ms to hold the reveal screen before advancing (currently hardcoded: 2000ms) |
| `roundSize` | Number of questions per round (currently hardcoded: 50) |
| `urgencyThreshold` | Seconds remaining when timer bar turns red (currently hardcoded: 2s) |
