# Content Design Document: Crusade History
*Agent 2 of 5 — Content & Curriculum Designer*

---

## Part A — Review of Game Designer's Plan

### Mechanic Decisions That Affect Content

**1. Pure text MCQ with wrong answers hardcoded in CSV.**
In Flag Rush, distractors are drawn dynamically from the question pool. For history, the GD correctly hardcodes `wrong1/wrong2/wrong3` per row — pulling distractors dynamically from a history bank risks surfacing the correct answer as a distractor (e.g. "Saladin" appearing as a wrong answer in a question where Saladin is the right answer to a related question). This means **distractor quality is entirely the content writer's responsibility.** Each set of three distractors must be individually reviewed for plausibility, fairness, and distinctiveness.

**2. Reveal phrase in CSV (`reveal` column).**
The right call. Keeping reveal phrases in the data file is consistent with the architecture rule "data lives in CSV." However, the voice host will *speak* the reveal — so reveals must be short. A 40-word historical essay spoken over a transition will be cut off. **Hard limit: 20 words per reveal phrase.** The GD's example (*"Pope Urban II launched it all at the Council of Clermont — November 1095!"*) is 13 words — that's the target length.

**3. Difficulty = fame of fact, not complexity.**
Agreed. "Who was Saladin?" is no harder intellectually than "Who was Baybars?" — but one is known by virtually everyone and the other by almost nobody. This is the correct model.

**4. Tier split: 10/15/15/10 (same as Flag Rush).**
Sensible and proven. No changes recommended.

**5. Round size: 50 questions from a 75-question bank.**
The GD says 70–80. I'll target exactly 75 (20 tier 1, 30 tier 2, 25 tier 3) to give a well-padded bank with genuine replayability variance.

### Content Risks and Constraints

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Distractor sets are too easy (obvious outliers) | High | Use same-category distractors: wrong popes for pope questions, wrong years ±5–10 years for date questions |
| Reveal phrases too long for voice host | Medium | 20-word hard limit per reveal |
| Question wording repetition across 75 items | Medium | Enforce question type distribution (see below) |
| Two questions that feel identical ("Who led?" vs "Who commanded?") | Medium | No synonymous questions — each item must use a distinctly different framing |
| Politically/religiously sensitive framing | Low | Neutral, factual tone throughout; no editorialising about who was "right" |

### What Is Missing or Underspecified in the GD's Plan

1. **No question phrasing templates.** Without a standard, questions will feel inconsistent. This plan defines them.
2. **No question type distribution.** The GD lists 5 question types but gives no target count per type. This plan sets explicit targets.
3. **No coverage plan per Crusade.** "200 years and ~8 major crusades" is not a content plan. This plan assigns question counts per Crusade.
4. **CSV filename discrepancy.** The GD uses `crusades.csv` (plural) but `manifest.csv` has `crusade.csv` (singular). Use `crusade.csv` — matches the manifest.

### Suggestions Back to Game Designer

1. **Move `.name-choices` from `flags.css` to `core.css`.** It is no longer flag-specific — it will be used by Crusades, Cities, and every future text MCQ game. Leaving it in `flags.css` forces all new game CSS files to import it or duplicate it.
2. **Consider a `question_type` column** (person / date / event / location / order) — not used by game logic, but invaluable for QA and ensuring the 50-question round isn't 30 "who was X?" questions in a row.

---

## Part B — Content Design

### Content Scope

**In scope:**
- The 9 numbered Crusades (1096–1291) and their key events
- Key figures: calling popes, Crusader leaders, Muslim rulers and generals
- Major battles: Dorylaeum (1097), Antioch (1097–98), Jerusalem (1099), Hattin (1187), Acre (1191), Damietta (1219), Mansurah (1250)
- The four Crusader States: Kingdom of Jerusalem, County of Tripoli, Principality of Antioch, County of Edessa
- Military orders: Knights Templar, Knights Hospitaller, Teutonic Knights (founding, purpose, key facts)
- Notable secondary Crusades: Children's Crusade (1212), Albigensian Crusade (1209), Northern/Baltic Crusades (basics)
- The Fourth Crusade and sack of Constantinople (1204)
- Key treaties: Treaty of Jaffa (1192), Treaty of Jaffa (1229)

**Out of scope:**
- Byzantine internal politics unrelated to Crusade interaction
- Islamic theology or sectarian divisions
- Detailed Crusader dynastic genealogies
- Post-1300 history
- Specific castle architecture unless tied to a famous event
- Modern political interpretations of the Crusades

**Knowledge level assumed:** Secondary school (ages 12–16), consistent with UK/US history curricula. Tier 1 assumes only the most famous names and dates that appear in standard school textbooks. No specialist prior knowledge assumed.

---

### Question Bank Design

**Total bank: 75 questions**

| Tier | Definition | Count |
|------|-----------|-------|
| 1 — Easy | Famous facts: appear in school curricula everywhere; known to most adults | 20 |
| 2 — Medium | Specific events, notable battles, secondary figures, military orders | 30 |
| 3 — Hard | Lesser-known figures, minor crusades, precise dates of secondary events | 25 |

**Question type distribution (across 75 questions):**
- Person questions ("Who was…?" / "Which leader…?") — 25
- Date/year questions ("In what year…?") — 12
- Event/fact questions ("Which Crusade…?" / "What was the result of…?") — 25
- Location questions ("At which city/battle…?") — 13

**Coverage per Crusade:**
| Topic | Questions |
|-------|----------|
| First Crusade (1096–1099) | 14 |
| Second Crusade (1147–1149) | 5 |
| Third Crusade (1189–1192) | 12 |
| Fourth Crusade (1202–1204) | 8 |
| Fifth Crusade (1217–1221) | 4 |
| Sixth Crusade (1228–1229) | 4 |
| Seventh–Ninth Crusades | 5 |
| Albigensian / Baltic / Children's Crusades | 8 |
| Cross-Crusade topics (orders, states, terms) | 15 |

**Question phrasing templates (enforce consistency):**
- Person: *"Which [role] [verb-past]…?"* → "Which English king led the Third Crusade?"
- Date: *"In what year did [event]?"* → "In what year did Crusaders first capture Jerusalem?"
- Event: *"Which Crusade [description]?"* → "Which Crusade ended with the sack of Constantinople?"
- Location: *"At which [battle/city] did [event]?"* → "At which battle did Saladin destroy the Crusader army in 1187?"

---

### Sample Questions

The actual CSV needs the full schema proposed by the Game Designer. The simplified `id,name,difficulty` format from flags.csv is not sufficient — each history item requires an explicit question text, correct answer, three distractors, and a reveal phrase. Use this schema:

```
id,question,answer,wrong1,wrong2,wrong3,difficulty,reveal
```

**Note:** `id` uses the prefix `cr` for all crusade items. `answer` is always the correct answer text. `wrong1/2/3` are plausible same-category distractors.

```csv
id,question,answer,wrong1,wrong2,wrong3,difficulty,reveal
cr001,Who preached the First Crusade at the Council of Clermont in 1095?,Pope Urban II,Pope Gregory VII,Pope Innocent III,Pope Clement V,1,Pope Urban II — his 1095 speech at Clermont launched two centuries of crusading!
cr002,In what year did Crusaders first capture Jerusalem?,1099,1096,1102,1187,1,1099 — Crusaders stormed Jerusalem on 15 July after a five-week siege!
cr003,Which Muslim leader recaptured Jerusalem from the Crusaders in 1187?,Saladin,Baybars,Nur ad-Din,Al-Kamil,1,Saladin — the Sultan retook Jerusalem on 2 October 1187 after 88 years of Crusader rule!
cr004,Which English king led the Third Crusade?,Richard I,Henry II,Edward I,King John,1,Richard I — the Lionheart! He never reached Jerusalem but earned eternal fame for his campaigns!
cr005,What were the Crusader territories in the Holy Land collectively called?,Outremer,Terra Sancta,Levant,Frankia,1,Outremer — French for "beyond the sea"! The Crusaders built a new world far from home!
cr006,In what year did Crusaders sack the Christian city of Constantinople?,1204,1187,1212,1291,2,1204 — the Fourth Crusade never reached the Holy Land and sacked Constantinople instead!
cr007,What name is given to the disastrous 1212 movement of young people towards the Holy Land?,Children's Crusade,People's Crusade,Poor People's Crusade,Shepherd's Crusade,2,The Children's Crusade — a tragic movement that ended in disaster for those who joined!
cr008,The Battle of Hattin (1187) was fought near which body of water?,Sea of Galilee,Dead Sea,Mediterranean Sea,Jordan River,2,The Sea of Galilee — Saladin lured the Crusaders into waterless terrain before destroying their army!
cr009,Which military order was founded around 1119 in Jerusalem to protect pilgrims?,Knights Templar,Knights Hospitaller,Teutonic Knights,Order of Santiago,2,The Knights Templar — warrior monks who became one of the most powerful organisations in medieval Europe!
cr010,How did Frederick Barbarossa die during the Third Crusade?,Drowned in a river,Killed in battle,Died of plague,Executed by Saladin,2,He drowned crossing the Saleph River in 1190 — throwing the German crusading army into chaos!
cr011,Which Crusade targeted the Cathar heretics in southern France?,Albigensian Crusade,Aragonese Crusade,Rhineland Crusade,Hussite Crusade,3,The Albigensian Crusade — launched in 1209 it devastated southern France and wiped out the Cathars!
cr012,Which Mamluk Sultan captured Acre in 1291 and ended the Crusader presence in the Levant?,Al-Ashraf Khalil,Baybars,Saladin,Qalawun,3,Al-Ashraf Khalil — the Mamluk Sultan who ended 200 years of Crusader presence on 18 May 1291!
cr013,The Teutonic Knights primarily moved their operations to which region after the Holy Land fell?,Baltic Prussia,Iberian Peninsula,Egypt,Anatolia,3,Baltic Prussia — the Teutonic Knights carved out a powerful crusading state through the Northern Crusades!
cr014,The Fifth Crusade targeted which Egyptian city as the key to recapturing Jerusalem?,Damietta,Alexandria,Cairo,Rosetta,3,Damietta — the Crusaders took it in 1219 but were defeated at Mansurah trying to push inland!
cr015,Peter Bartholomew claimed to discover which holy relic during the Siege of Antioch in 1098?,The Holy Lance,The True Cross,The Crown of Thorns,The Ark of the Covenant,3,The Holy Lance — said to have pierced Christ's side! The discovery rallied the starving Crusaders!
```

---

### Content Quality Rules

1. **Distractor category match:** Wrong answers must come from the same category as the correct answer. Wrong popes for pope questions, wrong years for date questions, wrong battles for battle questions. Never mix categories (don't put a year as a distractor for a person question).
2. **Distractor plausibility:** All three wrong answers must be genuinely plausible to someone with partial knowledge. Trivially wrong answers destroy the game.
3. **20-word reveal limit:** Reveal phrases are spoken aloud. Count words before committing. If it's over 20 words, cut it.
4. **No synonym questions:** If two questions can be answered by the same single piece of knowledge, remove one. Each question must test a distinct fact.
5. **No anachronistic framing:** Don't describe medieval events using modern political or moral framing. State facts neutrally.
6. **No contested facts at tiers 1–2:** Save ambiguous or disputed facts for tier 3, and ensure the "accepted" answer is clearly dominant in mainstream sources.
7. **Year questions: distractors must be ±5–15 years:** Distractors of 1200 and 1400 for a correct answer of 1099 are too easy. Use 1096, 1102, and 1187 — all plausible, all Crusade-related dates.
8. **No graphic detail:** This game is suitable for ages 12+ and a general YouTube audience. Describe battles, sieges, and deaths matter-of-factly without graphic description.

---

### Content Gaps and Risks

**Accuracy risks:**
- The "Children's Crusade" — some historians dispute whether it involved children at all, or was called a crusade contemporaneously. Frame it carefully: "the movement known as the Children's Crusade."
- Dates for some events (particularly the Second Crusade's failure) are disputed by 1–2 years across sources. Use dates from the Encyclopaedia Britannica as the reference standard.
- Some figures have multiple name transliterations (Saladin / Ṣalāḥ ad-Dīn; Baybars / Baibars). Standardise to the most common English spelling throughout.

**Coverage gaps to fill before launch:**
- The Second Crusade has only 5 questions — it's often skipped in school curricula, but the fall of Edessa (1144) that triggered it is worth including.
- Military orders: the Hospitallers are underrepresented in most curricula; give them at least 2 dedicated questions.
- Female figures are absent from the Crusades narrative in most sources — if sourcing allows, Queen Melisende of Jerusalem is a legitimate, historically significant figure for 1–2 tier 2 questions.
- Cross-check all tier 3 "precise date" questions against at least two reputable academic sources (e.g. Runciman's *A History of the Crusades*, Riley-Smith's *The Crusades*) before shipping.
