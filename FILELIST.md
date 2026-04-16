# FILELIST.md — Documentation Manifest

What exists, what it covers, when to read it, when to update it.
Both the developer and AI agent should check this when the project changes direction.

---

## Active — Read These

| File | Purpose | Read when | Update when |
|------|---------|-----------|-------------|
| `CLAUDE.md` | Bootstrap — tells AI what to read first | Auto-loaded by Claude Code | Never (keep it minimal) |
| `AGENTS.md` | AI agent instructions: structure, how to run, architecture rules, code style, gotchas | Every session start | File structure changes, new conventions, new gotchas discovered |
| `FILELIST.md` | This file — doc registry | A new doc is created or a discussion changes project direction | Any doc is added, removed, or goes stale |
| `questions/manifest.csv` | Category registry: what games exist, locked/unlocked, data file paths | Adding/removing a category | Any category change |
| `plan/project_structure_principles.md` | High-level file/data org principles (applies to all projects) | Starting a new project or restructuring | Principles evolve from new experience |

---

## Reference — Read When Relevant

| File | Purpose | Read when |
|------|---------|-----------|
| `plan/gamedesigner.md` | Game design review: difficulty curve, pacing, milestone placement | Changing game rules, difficulty balance, or question counts |
| `plan/producer.md` | Content production review: episode structure, viewer retention | Planning recording sessions or adding new episode formats |
| `plan/visual_overhaul.md` | Visual design decisions: parchment scroll, map background, flashcard UI | Touching the game modal's visual design |
| `plan/voice_host.md` | Voice host design: personality, phrasing, reveal line style | Adding or changing voice lines |

---

## Archived — Don't Edit

| File | Why archived |
|------|-------------|
| `plan/plan.md` | Original brief — superseded by what was actually built |
| `plan/plan1.md` | Early implementation plan (React → vanilla JS decision) — historical only |

---

## Update Triggers

When any of these happen, check this manifest and update affected docs:

| Event | Docs to update |
|-------|---------------|
| New category added | `AGENTS.md` (structure), `questions/manifest.csv` |
| File structure changes | `AGENTS.md`, `plan/project_structure_principles.md` |
| New game mechanic added | `plan/gamedesigner.md`, `AGENTS.md` (if it introduces gotchas) |
| New code convention established | `AGENTS.md` |
| Voice/personality changes | `plan/voice_host.md` |
| Visual redesign | `plan/visual_overhaul.md` |
| Principles refined from a new project | `plan/project_structure_principles.md` |
| A new doc is created | `FILELIST.md` (this file) |

---

## QA Protocol

**After every change — Claude does a code read-through:**
- Check changed files for broken imports, wrong paths, logic errors
- Do not say "done" without doing this

**After any change — you do a browser check:**
- Page loads without console errors
- Clicking play starts the countdown

**After structural changes (refactor, new files, module splits) — full browser test:**
- Homepage loads, category strip renders
- Countdown, voice, questions all flow correctly
- Correct answer, wrong answer, timeout — all three
- Milestone screen, ESC closes cleanly, play again works
- Zero console errors throughout

Claude cannot open a browser. All visual/audio/interaction testing is done by you.
