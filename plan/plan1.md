# Quiz Website Implementation Plan

## Goal
Create a React-based quiz website for YouTube-style recorded content. The quiz should be visually exciting, viewer-friendly, and mostly self-running. It should also include a full content pipeline that prepares country data, flag images, and generated quiz questions.

## Current State
- The repository currently contains only the original product brief in `C:\x\copilotcli\quiz\plan.md`.
- There is no application scaffold, no game code, no question data, no downloaded flag assets, and no generation scripts.
- This is a greenfield project, so implementation can proceed from a clean slate.

## Locked Decisions
These decisions are now fixed so the next implementation pass can proceed without more questions.

### Product and Gameplay
- Platform: browser-based website.
- Primary mode: viewer-focused autoplay quiz for recorded content.
- Round length: 50 questions per round.
- Question pace: 5-second countdown, then 2-second answer reveal.
- Interaction model: automatic progression by default, with minimal manual input during a round.
- Question format:
  - Prompt is text.
  - Answers are image choices.
  - Default answer count is 4 choices labeled `A`, `B`, `C`, `D`.
- Initial question types:
  - `Which country is this flag?`
  - `Which flag is <country>?`
- Question bank size target:
  - Build around roughly 200 countries/assets.
  - Generate a bank larger than 50 questions so each round can be randomized.

### Visual and Audio Direction
- Visual style: bright TV game-show look.
- Screen density: minimal and easy to read on video.
- Default HUD during play:
  - question number
  - timer
  - prompt
  - 4 image choices
- Reveal behavior:
  - highlight the correct answer clearly
  - add a brief blink/pulse effect during the 2-second reveal window
- Audio style:
  - countdown tick
  - reveal sting
  - correct-answer chime

### Technical Decisions
- Frontend stack: `React` with `Vite`.
- Language: `TypeScript`.
- Styling approach: component-scoped CSS plus a small global theme layer.
- Runtime question format: structured `JSON` for the app.
- Export format for the original brief requirement: also generate a line-based `questions.txt`.

## Planned File and Folder Structure
- `src\`
  - `components\` for quiz UI pieces
  - `screens\` for intro, gameplay, and results views
  - `state\` for round/game flow
  - `data\` for loading generated question files
  - `audio\` for sound hooks and playback helpers
- `questions\`
  - `country.csv`
  - `flags\`
  - `questions.json`
  - `questions.txt`
- `scripts\`
  - script to create/load country list
  - script to download flag assets
  - script to generate quiz questions

## Implementation Approach
1. Scaffold the project with `Vite + React + TypeScript` and set up a clean folder structure for UI, state, audio, scripts, and generated data.
2. Define a strict question schema that supports:
   - prompt text
   - 4 image choices
   - correct answer index
   - source country metadata
   - question type
3. Create the content pipeline:
   - create `questions\country.csv` with around 200 country names
   - download one flag image per country into `questions\flags\`
   - generate structured question records into `questions\questions.json`
   - generate a line-based export into `questions\questions.txt`
4. Build the quiz flow:
   - opening/start screen
   - autoplay question loop
   - 5-second countdown
   - automatic reveal state for 2 seconds
   - transition to the next question
   - final round summary screen
5. Add presentation polish:
   - bright game-show styling
   - animated timer urgency near the end
   - reveal pulse/blink effect
   - classic game-show sound cues
6. Validate end-to-end:
   - app starts correctly
   - generated content loads correctly
   - a full 50-question round runs without manual intervention

## Todos
1. Choose and initialize the `Vite + React + TypeScript` project scaffold.
2. Define the question schema and generated file formats.
3. Create the `questions` folder structure and country source file.
4. Implement the flag download script and store assets in `questions\flags\`.
5. Implement the question generator for both flag-to-country and country-to-flag prompts.
6. Build the autoplay quiz screens and round state flow.
7. Add timer, reveal animations, and game-show audio cues.
8. Run the project commands and verify the game and content pipeline together.

## Notes
- The implementation should prefer a permissive and reusable flag-data source.
- The app should optimize for clean recording output, not competitive multiplayer complexity.
- Manual answer selection can be added later, but it is not part of the first pass.
- This plan is intentionally implementation-ready so future work can start directly from it without further product questions.

