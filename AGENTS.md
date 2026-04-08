# AGENTS.md - Big Brain Terry

## Project Overview

A flag quiz website designed for YouTube recording content. Features 50 questions across 3 difficulty tiers with timed countdown, sound effects, and milestone screens. Originally planned as React/Vite but implemented as vanilla JavaScript for simplicity. Shows final score and rank at end of round.

### Game Purpose
- Autoplay-style quiz for recorded YouTube content
- 5-second countdown per question, 2-second answer reveal
- Difficulty progression: Q1-10 easy, Q11-25 medium, Q26-40 mixed, Q41-50 hard
- Milestone screens at Q10, Q25, Q40 to maintain viewer engagement

### Design Documents
See `plan/` folder for full context:
- `plan/plan.md` - Original requirements brief
- `plan/plan1.md` - Implementation plan (React → vanilla JS)
- `plan/gamedesigner.md` - Game design review with difficulty curve, pacing, milestone recommendations
- `plan/producer.md` - Content production review with episode structure, retention beats recommendations

The current implementation follows most recommendations from gamedesigner.md and producer.md.

## Running the Project

**Development**: Open `index.html` in a browser.

```bash
# Just open in browser - no build needed
xdg-open index.html  # Linux
open index.html      # macOS
start index.html     # Windows
```

There are no build commands, tests, or linting in this project.

## Code Style Guidelines

This codebase uses vanilla JavaScript with no frameworks. Follow these conventions:

### General Principles

- Use strict mode (`'use strict';` at top of files)
- Keep files focused - `app.js` handles all game logic
- Use modern ES6+ features (const/let, arrow functions, template literals)

### Naming Conventions

- **Variables/functions**: camelCase
  ```js
  let currentIdx = 0;
  function doReveal(selectedIdx) { ... }
  ```
- **Constants**: SCREAMING_SNAKE_CASE for config values
  ```js
  const QUESTION_TIME = 5;
  const ROUND_SIZE = 50;
  ```
- **Private variables**: Prefix with underscore
  ```js
  let _ctx = null;  // AudioContext singleton
  ```
- **DOM references**: Descriptive names matching element IDs
  ```js
  const quizModal = document.getElementById('quiz-modal');
  const timerFill = document.getElementById('timer-fill');
  ```

### Functions

- Keep functions short and focused
- Use function declarations for top-level, arrow functions for callbacks
- Order: data → config → audio → utils → game logic → DOM → init

```js
// Good: declarative, single responsibility
function playCorrect() {
  [523,659,784].forEach((f,i) => setTimeout(() => beep(f,0.18,'sine',0.28), i*90));
}
```

### Variables and Constants

- Use `const` by default, `let` only when reassignment needed
- Avoid `var` entirely
- Group related constants in objects for configuration

```js
const MILESTONES = {
  10: { headline: 'LEVEL UP', sub: 'Getting harder from here...' },
  25: { headline: 'HALFWAY!', sub: 'Final 25 — brace yourself' },
};
```

### Error Handling

- Use try/catch for operations that may fail (audio context)
- Silently fail for non-critical errors (audio playback)
- Check DOM elements exist before using them

```js
try {
  const ctx = getAudio();
  // ...
} catch (_) {}  // Audio failures are non-critical
```

### DOM Manipulation

- Cache DOM references at module level
- Use template literals for HTML generation
- Use `dataset` for data attributes
- Always set `aria-hidden` for hidden elements

```js
quizModal.classList.remove('hidden');
quizModal.setAttribute('aria-hidden', 'false');
btn.addEventListener('click', () => handleClick(Number(btn.dataset.idx)));
```

### Array/Object Patterns

- Use functional methods (map, filter, forEach) over loops where clean
- Use spread operator for shallow copies
- Use destructuring for clarity

```js
const easy = shuffle(COUNTRIES.filter(c => c.d === 1));
const choices = shuffle([country, ...distractors]);
const { headline, sub } = MILESTONES[currentIdx];
```

### CSS Conventions

- Use CSS custom properties for theming
- Keep all styles in `styles.css`
- Follow BEM-ish naming for component classes

```css
.flag-choice { ... }
.flag-choice--correct { ... }
.timer-bar { ... }
```

### Data Structures

- Country data: `{name, code, d}` (d = difficulty 1-3)
- Question: `{country, type, choices, correctIdx}`
- Use clear, consistent property names across codebase

### Imports/Dependencies

- No module system - everything is global
- External resources loaded via CDN in HTML
- Flag images from flagcdn.com

### Performance Considerations

- Cache audio context (lazy initialization)
- Use CSS transitions for animations
- Use `setInterval` at 100ms for timer (not requestAnimationFrame for simplicity)

### Testing

- No test framework exists - manual testing via browser
- If tests were added, use browser-based testing or simple node tests for utilities

## File Structure

```
/srv/x/vb/nanshix/bigbrainterry
├── index.html      # Main entry point
├── app.js          # All game logic (~400 lines)
├── styles.css      # All styling (~350 lines)
├── assets/         # Static assets (noise.svg)
├── plan/           # Design documents (see above)
├── questions/      # (planned for content pipeline)
└── README.md       # Original brief
```

## Quick Reference

| Task | Command/Action |
|------|----------------|
| Run | Open `index.html` in browser |
| Edit | Modify `app.js` or `styles.css` |
| Debug | Browser DevTools |
| No tests | - |
| No build | - |
| No lint | - |

## Adding New Features

1. Edit `app.js` for logic, `styles.css` for styling
2. Test in browser by refreshing
3. No CI/CD or automated checks needed