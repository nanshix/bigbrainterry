# Voice Host Script — Big Brain Terry

Female voice via Web Speech API (`SpeechSynthesisUtterance`).
Voice preference order: Google UK English Female → Samantha → Karen → Moira → Tessa → Fiona → any female → first available.

## Lines by Moment

| Moment | Interrupts? | Voice says |
|--------|-------------|-----------|
| Countdown start | no (queues) | "Get ready!" |
| Countdown tick 3 | no (queues) | "3" |
| Countdown tick 2 | no (queues) | "2" |
| Countdown tick 1 | no (queues) | "1" |
| GO | no (queues) | "Go!" _(rate 1.1, pitch 1.2)_ |
| Question appears | yes — cuts countdown tail | Question prompt, e.g. "Which flag is France?" or "Which country does this flag belong to?" _(rate 1.05)_ |
| Correct answer | yes | "Correct!" _(pitch 1.2)_ |
| Wrong / timeout | yes | "The answer was [country name]" |
| Milestone Q10 | yes | "Level up. Getting harder from here." _(rate 0.95)_ |
| Milestone Q25 | yes | "Halfway! Final 25 — brace yourself." _(rate 0.95)_ |
| Milestone Q40 | yes | "Final stretch. Last 10 questions. Go!" _(rate 0.95)_ |
| Results | yes | "Round complete! You scored [N] out of 50. [Rank]!" _(rate 0.95)_ |
| Modal closed | — (cancel all) | _(silence)_ |

## Rank Labels (used in results line)

| Score | Rank said aloud |
|-------|----------------|
| 0–15  | Geography Rookie |
| 16–30 | Flag Explorer |
| 31–42 | Flag Expert |
| 43–48 | Master Vexillologist |
| 49–50 | Big Brain Certified |

## Behaviour Notes

- Lines marked **queues** play back-to-back without cutting each other (countdown flows naturally).
- Lines marked **interrupts** call `speechSynthesis.cancel()` first — they cut whatever is currently playing.
- Closing the modal always cancels all speech immediately.
