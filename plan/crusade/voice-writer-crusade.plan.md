# Voice Script: Crusade History
*Agent 5 of 5 — Voice & Audio Script Writer*

---

## Part A — Review of Previous Plans

### Pacing and Reveal Timing

The 10/15/15/10 tier split is excellent for voice pacing. The voice host naturally escalates from warm and confirmatory (tier 1) to tense and dramatic (tier 3) without any mechanical adjustment. The three milestone triggers land at exactly the right moments: Q10 ends the confidence-building run, Q25 signals the push into harder territory, Q40 delivers genuine pressure.

**One structural concern:** the Content Designer's question type distribution puts 12 date questions in the bank. Date questions without a visual anchor are the highest-risk pacing drag in TTS quiz content. A string of three "In what year did X?" questions spoken aloud in sequence feels monotonous even when the content varies. Recommend enforcing in `buildRound()` that no two date questions appear consecutively.

### TTS-Specific Issues

**Critical: "DEUS VULT" must NOT be spoken aloud.** Most TTS engines will mispronounce Latin badly. "DAY-us VULT", "DEE-us VULT", or worse. The visual display text is DEUS VULT. The voice line must say "God wills it!" — the English translation. Same impact, zero mispronunciation risk.

**Years must be spelled out.** TTS reads "1099" as "one thousand and ninety-nine" which sounds wrong and slow. Spell as "ten ninety-nine", "eleven eighty-seven", "twelve-oh-four" etc. All reveal phrases below already do this.

**"Al-Ashraf Khalil" (cr012)** — most TTS engines will mangle this Arabic name. The reveal phrase for cr012 uses his title and his action to carry the moment rather than relying on the name pronunciation.

**"Outremer" (cr005)** — TTS reads this acceptably ("oo-treh-MAIR"). Include the English translation in the reveal to aid comprehension.

**"Albigensian" (cr011)** — TTS typically reads as "al-bih-JEN-see-an". Acceptable. Flag for testing.

### YouTube Hook and Challenge Line (Audio Assessment)

The YouTube Strategist's opening hook is excellent spoken audio:
> *"The year is ten ninety-nine. The siege has lasted five weeks. Crusaders are starving, dying of thirst — and the Holy City is within sight. What happens next? Let's find out how much you really know about the Crusades."*

One TTS fix: replace the em-dash with a comma or period. Otherwise this is exactly right — short clauses, building rhythm, visceral imagery. Deliver at rate 0.95, no pitch variation.

The challenge line *"Fifty questions. From Pope Urban the Second to the fall of Acre. How far can you march?"* works as spoken audio. Natural rhythm, no pronunciation traps. Replace Roman numeral "II" with "the Second" in the speech string.

### Emotional Tone Variance

The YouTube Strategist is right that reveal phrases need emotional variety. The script below tags each reveal with a tone marker for planning purposes: **T** (triumphant), **S** (solemn), **P** (playful), **E** (educational surprise). Aim for the full round to contain: ≥8 triumphant, ≥4 solemn, ≥4 educational surprise, ≥2 playful. The generic fallbacks should be playful/light to balance the more serious per-item reveals.

### Suggestions Back to Earlier Agents

1. **Game Designer:** Enforce no two date questions consecutively in `buildRound()`. A `type` column in the CSV makes this simple to implement.
2. **Visual Designer:** The DEUS VULT milestone display text is exactly right. Confirm the voice line in the game module uses "God wills it!" not the Latin text.
3. **Content Designer:** Two small phrasing fixes needed for TTS in sample questions: (a) all years in question text should be written as spoken words in the `question` CSV column ("ten ninety-nine" not "1099"), or handled by a TTS-prep function in the game module. Option B is cleaner — add a `ttsPrep(text)` utility that replaces four-digit years with their spoken forms.

---

## Part B — Voice Script

### 1. Question Prompt Lines

For Crusade History the voice speaks the `question` field from the CSV directly (same pattern as the flag-to-country variant in flags.js). The question text IS the prompt. The templates below define how question phrasing should be written in the CSV to sound natural when read aloud by TTS.

**Person questions (25 of 75 questions):**
- `"Who preached the First Crusade at the Council of Clermont in ten ninety-five?"`
- `"Which English king led the Third Crusade?"`
- `"Which pope called the Fourth Crusade?"`
- `"Who commanded the Muslim forces at the Battle of Hattin?"`

**Date questions (12 of 75 questions):**
- `"In what year did Crusaders first capture Jerusalem?"`
- `"In what year did Saladin recapture Jerusalem?"`
- `"Which year saw the Fourth Crusade sack Constantinople?"`
- `"In what year did the last Crusader city of Acre finally fall?"`

**Event and fact questions (25 of 75 questions):**
- `"Which Crusade ended with the sack of Constantinople?"`
- `"What name is given to the disastrous twelve twelve movement of young people toward the Holy Land?"`
- `"What were the Crusader territories in the Holy Land collectively called?"`
- `"Which military order was founded around eleven nineteen to protect pilgrims in Jerusalem?"`

**Location questions (13 of 75 questions):**
- `"At which battle did Saladin destroy the Crusader army in eleven eighty-seven?"`
- `"The Fifth Crusade targeted which Egyptian city as the key to recapturing Jerusalem?"`
- `"Near which body of water was the Battle of Hattin fought?"`
- `"To which region did the Teutonic Knights relocate after the fall of the Holy Land?"`

---

### 2. Reveal Phrases

Format matches `flags.js` `REVEAL_PHRASES`. Key is the question ID from `crusade.csv`. All years are spelled as spoken. No em-dashes, no semicolons. 20-word limit enforced. Tone tag in comment.

```js
const REVEAL_PHRASES = {
  // Tier 1 — easy
  cr001: "Pope Urban the Second! His speech at Clermont in ten ninety-five launched two hundred years of crusading!", // T
  cr002: "Ten ninety-nine! Crusaders stormed Jerusalem on July the fifteenth after a five-week siege. History changed forever!", // T
  cr003: "Saladin! The great Sultan retook Jerusalem on October the second, eleven eighty-seven, ending eighty-eight years of Crusader rule!", // S
  cr004: "Richard the First, the Lionheart! He never reached Jerusalem, but earned eternal legend for his campaigns in the Holy Land!", // T
  cr005: "Outremer, French for beyond the sea! The Crusaders built a whole new world far from home!", // E

  // Tier 2 — medium
  cr006: "Twelve-oh-four! The Fourth Crusade never reached the Holy Land. It sacked the Christian city of Constantinople instead!", // S
  cr007: "The Children's Crusade of twelve twelve! A tragic movement that ended in disaster for almost everyone who joined!", // S
  cr008: "The Sea of Galilee! Saladin cut off the Crusaders' water supply before destroying their army at Hattin!", // E
  cr009: "The Knights Templar! Founded around eleven nineteen as warrior monks, they became one of medieval Europe's most powerful forces!", // T
  cr010: "Frederick Barbarossa drowned crossing the Saleph River in eleven ninety! His death threw the German crusading army into chaos!", // S

  // Tier 3 — hard
  cr011: "The Albigensian Crusade! Launched in twelve-oh-nine, it devastated southern France and effectively wiped out the Cathar movement!", // S
  cr012: "The Mamluk Sultan took Acre on the eighteenth of May, twelve ninety-one, ending two hundred years of Crusader presence!", // S
  cr013: "Baltic Prussia! The Teutonic Knights moved north after the Holy Land fell, carving out a crusading state through the Northern Crusades!", // E
  cr014: "Damietta! The Fifth Crusade took it in twelve nineteen but lost everything pushing toward Cairo at the Battle of Mansurah!", // E
  cr015: "The Holy Lance! Found buried at Antioch in ten ninety-eight, its discovery rallied the starving Crusaders back from the brink!", // T

  // Additional questions (tier 1 extras)
  cr016: "Godfrey of Bouillon! He was chosen as the first ruler of Jerusalem after the city fell in ten ninety-nine!", // T
  cr017: "The County of Edessa! Founded in ten ninety-eight by Baldwin of Boulogne, it was the very first Crusader state!", // E
  cr018: "The Treaty of Jaffa, eleven ninety-two! Richard the First and Saladin agreed a truce allowing Christian pilgrims to visit Jerusalem!", // E
  cr019: "The Siege of Antioch! It lasted eight brutal months, from October ten ninety-seven to June ten ninety-eight!", // S
  cr020: "Bohemond of Taranto! He held Antioch and declared himself its prince, breaking his vow to return it to Byzantium!", // P

  // Additional questions (tier 2 extras)
  cr021: "Conrad of Montferrat! The King-elect of Jerusalem was assassinated by the Assassins just days before his own coronation!", // S
  cr022: "The Siege of Acre lasted two years, from eleven eighty-nine to eleven ninety-one, before Richard the First broke it!", // T
  cr023: "Pope Innocent the Third! He called the Fourth Crusade in eleven ninety-nine but lost control of where it went!", // E
  cr024: "The Knights Hospitaller began as a hospital for sick pilgrims in Jerusalem before transforming into a military order!", // E
  cr025: "Richard the First captured Cyprus in eleven ninety-one on his way to the Holy Land, almost as a side quest!", // P
  cr026: "The Second Crusade failed to take Damascus in eleven forty-eight after just four days of siege. A spectacular collapse!", // S
  cr027: "The fall of Edessa to Zengi in eleven forty-four! That single event triggered the entire Second Crusade!", // E
  cr028: "Frederick the Second negotiated Jerusalem back from the Sultan in twelve twenty-nine without firing a single arrow!", // T
  cr029: "The Battle of Mansurah, twelve fifty! King Louis the Ninth of France was captured by the Egyptians and held for ransom!", // S
  cr030: "Saladin united Egypt and Syria before turning on the Crusaders! His empire stretched from Cairo to Aleppo!", // E

  // Additional questions (tier 3 extras)
  cr031: "Baybars, the Mamluk Sultan! After twelve sixty he systematically dismantled every remaining Crusader fortress, one by one!", // T
  cr032: "The Principality of Antioch survived until twelve sixty-eight, making it the longest-lasting of the four Crusader states!", // E
  cr033: "Pope Clement the Fifth dissolved the Knights Templar in thirteen twelve, ending two centuries of their crusading power!", // S
  cr034: "The People's Crusade set out in ten ninety-six ahead of the main army, and was destroyed by the Turks almost immediately!", // S
  cr035: "Queen Melisende of Jerusalem! She ruled as regent and then co-ruler for over twenty years, one of the Crusades' great leaders!", // T
};
```

---

### 3. Generic Fallback Lines

Used when no specific reveal phrase exists for a question ID. Themed for medieval/Crusades context.

```js
const GENERIC_REVEALS = [
  n => `A vital piece of crusading history! The answer was ${n}!`,
  n => `Don't worry, now you know! That was ${n}!`,
  n => `${n}! File that one away for your next history quiz!`,
  n => `Tricky one! But the answer was ${n}!`,
  n => `${n}, a name every Crusades scholar knows!`,
  n => `The answer is ${n}! Another piece of the crusading puzzle!`,
  n => `${n}! The history books remember it well!`,
];
```

---

### 4. Milestone Lines

These are the exact strings passed to `speak()` in the game module. Display text (uppercase headline) is separate from the voice line. Do not speak the Latin display text.

| Trigger | Display text | Voice line (speak this) |
|---------|-------------|------------------------|
| Q10 | **DEUS VULT** | `"God wills it! The march has begun. The questions get harder from here."` |
| Q25 | **INTO THE HOLY LAND** | `"Halfway! The questions now separate the historians from the casuals. Can you hold on?"` |
| Q40 | **FINAL MARCH ON JERUSALEM** | `"Final stretch. Ten questions left. These are for the scholars. March on!"` |

**Speech parameters for milestone lines:** `{ rate: 0.95, interrupt: true }`

The Q10 "God wills it!" should be delivered with a slight pause before the second sentence — use a comma in the string, which most TTS engines render as a natural pause.

---

### 5. Results / Rank Labels

**Score-to-rank mapping (out of 50):**

| Score | % | Rank | Voice says |
|-------|---|------|-----------|
| 0–9 | 0–19% | Pilgrim | `"Pilgrim!"` |
| 10–19 | 20–39% | Footsoldier | `"Footsoldier!"` |
| 20–29 | 40–59% | Sergeant | `"Sergeant!"` |
| 30–37 | 60–74% | Knight | `"Knight!"` |
| 38–42 | 75–84% | Baron of Outremer | `"Baron of Outremer!"` |
| 43–47 | 85–94% | Crusader | `"Crusader!"` |
| 48–50 | 95–100% | Grand Master | `"Grand Master!"` |

**Results voice line template:**
```
"Round complete! You scored [N] out of fifty. Your rank is [Rank]!"
```

Example: `"Round complete! You scored thirty-seven out of fifty. Your rank is Knight!"`

**Note:** The score number must be spoken as words, not digits. Use a `numToWords()` helper or a lookup table for 0–50 in the game module.

**Recording-mode (YouTube audience) variant:**
```
"Pause the video now! How did you do? Let us know in the comments below. The final score is [N] out of fifty. [Rank]!"
```

This variant is triggered when a `recording` flag is set at launch. It adds the audience-address line before the score, giving YouTube viewers a natural pause point.

---

### 6. Personality & Delivery Notes

**Overall tone: dramatic and scholarly, not lighthearted.**
Crusade History sits closer to a BBC documentary than a pub quiz. The voice host should feel like a knowledgeable guide through a dark and consequential period of history. Warmth is welcome; jokes are not.

**Contrast with Flag Rush:** Flag Rush is playful and celebratory throughout. Crusades should shift register. Tier 1 reveals can still be triumphant ("Richard the Lionheart!") but tier 2 and 3 should carry weight — sieges, betrayals, deaths, the fall of a civilization. The solemn reveals (cr003, cr006, cr007, cr010, cr012) should be delivered at rate 0.95, not the default 1.05.

**Correct-answer pitch adjustment:** Keep the `{ pitch: 1.2 }` on "Correct!" — it works for all content. What varies is the reveal phrase tone after it.

**Pacing between questions:** The engine's existing `speakThenAdvance` timing is sufficient. No custom delays needed for Crusades. History reveals tend to be slightly longer in syllable count than flag reveals; the 20-word cap keeps them within the REVEAL_TIME window.

**The opening hook (spoken before countdown):**
> *"The year is ten ninety-nine. The siege has lasted five weeks. Crusaders are starving, dying of thirst, and the Holy City is within sight. What happens next? Let's find out how much you really know about the Crusades."*

Speech parameters: `{ rate: 0.92, interrupt: false }`. Slow, deliberate, cinematic. Then the countdown begins.

**The challenge line (displayed on the start screen, also spoken):**
> *"Fifty questions. From Pope Urban the Second to the fall of Acre. How far can you march?"*

Speech parameters: `{ rate: 0.95 }`.
