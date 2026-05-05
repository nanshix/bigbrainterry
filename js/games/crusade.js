import { shuffle, parseCSV, injectCrack } from '../utils.js';
import { playTick, playUrgent, playReveal, playCorrect } from '../core/audio.js';
import { speak } from '../core/speech.js';
import { loadGameConfig } from '../core/config.js';
import {
  QUESTION_TIME, REVEAL_TIME,
  startGame, addScore, addNoAnswer, advanceGame,
  startTimer, stopTimer, speakThenAdvance, getQuestionTime,
  getIdx, getRound, getScore,
} from '../core/engine.js';

const CRUSADE_CROSS_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="2"  width="8" height="40" fill="#5c3a1e"/>
  <rect x="2"  y="18" width="40" height="8"  fill="#5c3a1e"/>
  <rect x="4"  y="8"  width="6" height="2"  fill="#5c3a1e"/>
  <rect x="6"  y="6"  width="2" height="6"  fill="#5c3a1e"/>
  <rect x="34" y="8"  width="6" height="2"  fill="#5c3a1e"/>
  <rect x="36" y="6"  width="2" height="6"  fill="#5c3a1e"/>
  <rect x="4"  y="34" width="6" height="2"  fill="#5c3a1e"/>
  <rect x="6"  y="36" width="2" height="6"  fill="#5c3a1e"/>
  <rect x="34" y="34" width="6" height="2"  fill="#5c3a1e"/>
  <rect x="36" y="36" width="2" height="6"  fill="#5c3a1e"/>
</svg>`;

const TYPE_ILLUSTRATIONS = {
  date: `<svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="52" height="6" rx="2" fill="#3a1200"/>
    <rect x="4" y="70" width="52" height="6" rx="2" fill="#3a1200"/>
    <rect x="4" y="4" width="6" height="72" rx="2" fill="#3a1200"/>
    <rect x="50" y="4" width="6" height="72" rx="2" fill="#3a1200"/>
    <polygon points="10,10 50,10 35,40 25,40" fill="#c8a860"/>
    <polygon points="25,42 35,42 46,70 14,70" fill="#c8a860" opacity="0.55"/>
    <rect x="26" y="38" width="8" height="6" rx="1" fill="#3a1200"/>
    <rect x="29" y="44" width="2" height="6" fill="#c8a860" opacity="0.9"/>
  </svg>`,

  person: `<svg viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="32" y="2" width="6" height="14" rx="1" fill="#c8a860"/>
    <rect x="24" y="7" width="22" height="6" rx="1" fill="#c8a860"/>
    <path d="M13 57 L13 29 Q13 11 35 9 Q57 11 57 29 L57 57 Z" fill="#5c3a1e"/>
    <rect x="21" y="30" width="28" height="13" rx="2" fill="#ddc884"/>
    <rect x="31" y="26" width="8" height="23" rx="2" fill="#3a1200"/>
    <rect x="21" y="33" width="9" height="3" rx="1" fill="#3a1200" opacity="0.4"/>
    <rect x="40" y="33" width="9" height="3" rx="1" fill="#3a1200" opacity="0.4"/>
    <path d="M11 57 Q35 70 59 57 L59 66 Q35 78 11 66 Z" fill="#3a1200" opacity="0.65"/>
  </svg>`,

  event: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(40,40) rotate(-42) translate(-40,-40)">
      <rect x="37" y="6" width="6" height="42" rx="2" fill="#7a4f1e"/>
      <polygon points="37,6 43,6 40,2" fill="#3a1200"/>
      <rect x="26" y="38" width="28" height="6" rx="2" fill="#3a1200"/>
      <rect x="38" y="44" width="4" height="14" rx="1" fill="#5c3a1e"/>
      <ellipse cx="40" cy="61" rx="5" ry="6" fill="#3a1200"/>
    </g>
    <g transform="translate(40,40) rotate(42) translate(-40,-40)">
      <rect x="37" y="6" width="6" height="42" rx="2" fill="#7a4f1e"/>
      <polygon points="37,6 43,6 40,2" fill="#3a1200"/>
      <rect x="26" y="38" width="28" height="6" rx="2" fill="#3a1200"/>
      <rect x="38" y="44" width="4" height="14" rx="1" fill="#5c3a1e"/>
      <ellipse cx="40" cy="61" rx="5" ry="6" fill="#3a1200"/>
    </g>
    <circle cx="40" cy="38" r="5" fill="#ffd600" opacity="0.55"/>
  </svg>`,

  fact: `<svg viewBox="0 0 70 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8,6 L62,6 L62,46 Q62,66 35,74 Q8,66 8,46 Z" fill="#c8a860"/>
    <path d="M8,6 L62,6 L62,46 Q62,66 35,74 Q8,66 8,46 Z" stroke="#3a1200" stroke-width="2.5"/>
    <path d="M14,13 L56,13 L56,46 Q56,62 35,68 Q14,62 14,46 Z" stroke="#3a1200" stroke-width="1" opacity="0.3"/>
    <rect x="30" y="10" width="10" height="57" rx="1" fill="#3a1200" opacity="0.8"/>
    <rect x="12" y="28" width="46" height="10" rx="1" fill="#3a1200" opacity="0.8"/>
  </svg>`,

  place: `<svg viewBox="0 0 70 82" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="34" width="38" height="44" rx="1" fill="#5c3a1e"/>
    <rect x="16" y="22" width="8" height="16" rx="1" fill="#5c3a1e"/>
    <rect x="31" y="22" width="8" height="16" rx="1" fill="#5c3a1e"/>
    <rect x="46" y="22" width="8" height="16" rx="1" fill="#5c3a1e"/>
    <rect x="24" y="22" width="7" height="12" fill="#ddc884" opacity="0.4"/>
    <rect x="39" y="22" width="7" height="12" fill="#ddc884" opacity="0.4"/>
    <rect x="31" y="43" width="4" height="9" rx="0.5" fill="#1a0800" opacity="0.5"/>
    <rect x="28" y="47" width="10" height="3" rx="0.5" fill="#1a0800" opacity="0.5"/>
    <path d="M26,78 L26,63 Q35,57 44,63 L44,78 Z" fill="#1a0800" opacity="0.4"/>
    <rect x="33" y="2" width="4" height="22" rx="1" fill="#c8a860"/>
    <rect x="27" y="6" width="16" height="5" rx="1" fill="#c8a860"/>
  </svg>`,
};

const TYPE_LABELS = {
  date:   'Year & Date',
  person: 'Historical Figure',
  event:  'Battle & Siege',
  fact:   'Crusade Lore',
  place:  'Holy Land',
};

// Per-slot choice illustrations (A=0, B=1, C=2, D=3)
const CHOICE_ICONS = {
  person: [
    // A: Crusader cross shield (white / red)
    `<svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5,4 L51,4 L51,38 Q51,56 28,63 Q5,56 5,38 Z" fill="#f2e8d0" stroke="#3a1200" stroke-width="2.5"/><rect x="22" y="7" width="12" height="52" rx="1" fill="#8b0000" opacity="0.9"/><rect x="8" y="23" width="40" height="12" rx="1" fill="#8b0000" opacity="0.9"/></svg>`,
    // B: Blue shield, gold chevron
    `<svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5,4 L51,4 L51,38 Q51,56 28,63 Q5,56 5,38 Z" fill="#1e3a8a" stroke="#3a1200" stroke-width="2.5"/><polygon points="5,46 28,20 51,46 46,50 28,28 10,50" fill="#ffd600"/><path d="M5,4 L51,4 L51,38 Q51,56 28,63 Q5,56 5,38 Z" fill="none" stroke="#3a1200" stroke-width="2.5"/></svg>`,
    // C: Red shield, three gold bezants
    `<svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5,4 L51,4 L51,38 Q51,56 28,63 Q5,56 5,38 Z" fill="#8b0000" stroke="#3a1200" stroke-width="2.5"/><circle cx="18" cy="22" r="8" fill="#ffd600"/><circle cx="38" cy="22" r="8" fill="#ffd600"/><circle cx="28" cy="40" r="8" fill="#ffd600"/></svg>`,
    // D: Dark shield, two gold bars
    `<svg viewBox="0 0 56 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5,4 L51,4 L51,38 Q51,56 28,63 Q5,56 5,38 Z" fill="#2a1400" stroke="#3a1200" stroke-width="2.5"/><rect x="5" y="13" width="46" height="10" fill="#c8a860" opacity="0.9"/><rect x="5" y="29" width="46" height="10" fill="#c8a860" opacity="0.9"/><path d="M5,4 L51,4 L51,38 Q51,56 28,63 Q5,56 5,38 Z" fill="none" stroke="#3a1200" stroke-width="2.5"/></svg>`,
  ],
  event: [
    // A: Broadsword
    `<svg viewBox="0 0 44 74" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="22,4 25,10 25,52 22,58 19,52 19,10" fill="#9a9a9a"/><polygon points="22,4 25,8 22,5 19,8" fill="#ccc"/><rect x="9" y="50" width="26" height="5" rx="2" fill="#5c3a1e"/><rect x="19" y="55" width="6" height="14" rx="1" fill="#3a1200"/><ellipse cx="22" cy="71" rx="5" ry="4" fill="#5c3a1e"/></svg>`,
    // B: Battle axe
    `<svg viewBox="0 0 62 74" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="28" y="6" width="6" height="64" rx="2" fill="#5c3a1e"/><path d="M34,14 Q52,18 54,32 Q52,46 34,50 Z" fill="#9a9a9a"/><path d="M52,18 Q56,24 56,32 Q56,40 52,46" stroke="white" stroke-width="1.5" opacity="0.55" fill="none" stroke-linecap="round"/><path d="M28,22 L16,28 L16,36 L28,42 Z" fill="#7a7a7a"/></svg>`,
    // C: Spear / lance
    `<svg viewBox="0 0 34 76" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="24" width="4" height="50" rx="1" fill="#5c3a1e"/><polygon points="9,26 25,26 17,4" fill="#9a9a9a"/><polygon points="9,26 14,23 17,4 17,6" fill="white" opacity="0.35"/></svg>`,
    // D: Mace
    `<svg viewBox="0 0 50 74" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="22" y="38" width="6" height="34" rx="2" fill="#5c3a1e"/><circle cx="25" cy="27" r="14" fill="#8a8a8a"/><circle cx="25" cy="27" r="9" fill="#9a9a9a"/><polygon points="25,9 27,18 25,13 23,18" fill="#6a6a6a"/><polygon points="37,17 30,22 34,18 27,23" fill="#6a6a6a"/><polygon points="39,29 30,28 35,28 30,25" fill="#6a6a6a"/><polygon points="25,45 23,36 25,41 27,36" fill="#6a6a6a"/><polygon points="11,29 20,28 15,28 20,25" fill="#6a6a6a"/><polygon points="13,17 20,23 16,18 23,22" fill="#6a6a6a"/></svg>`,
  ],
  fact: [
    // A: Ornate cross
    `<svg viewBox="0 0 50 62" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="21" y="4" width="8" height="54" rx="2" fill="#5c3a1e"/><rect x="8" y="18" width="34" height="8" rx="2" fill="#5c3a1e"/><circle cx="25" cy="4" r="3.5" fill="#c8a860"/><circle cx="8" cy="22" r="3.5" fill="#c8a860"/><circle cx="42" cy="22" r="3.5" fill="#c8a860"/><circle cx="25" cy="58" r="3.5" fill="#c8a860"/></svg>`,
    // B: Crown
    `<svg viewBox="0 0 62 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6,44 L6,24 L18,36 L31,8 L44,36 L56,24 L56,44 Z" fill="#c8a860" stroke="#3a1200" stroke-width="2"/><rect x="6" y="40" width="50" height="8" rx="2" fill="#c8a860" stroke="#3a1200" stroke-width="1.5"/><circle cx="18" cy="36" r="3" fill="#8b1a1a"/><circle cx="31" cy="42" r="3" fill="#8b1a1a"/><circle cx="44" cy="36" r="3" fill="#8b1a1a"/><circle cx="31" cy="8" r="4" fill="#ffd600"/></svg>`,
    // C: Open book / tome
    `<svg viewBox="0 0 62 52" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="54" height="40" rx="3" fill="#c8a860" stroke="#3a1200" stroke-width="2"/><rect x="4" y="6" width="28" height="40" fill="#ddc884"/><rect x="30" y="6" width="2" height="40" fill="#3a1200" opacity="0.35"/><rect x="10" y="14" width="16" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="10" y="20" width="16" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="10" y="26" width="16" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="10" y="32" width="12" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="36" y="14" width="16" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="36" y="20" width="16" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="36" y="26" width="16" height="2" rx="1" fill="#3a1200" opacity="0.4"/><rect x="36" y="32" width="12" height="2" rx="1" fill="#3a1200" opacity="0.4"/></svg>`,
    // D: 8-pointed star
    `<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="28,4 32,22 50,18 36,28 50,38 32,34 28,52 24,34 6,38 20,28 6,18 24,22" fill="#c8a860" stroke="#3a1200" stroke-width="1.5"/><circle cx="28" cy="28" r="5" fill="#5c3a1e"/></svg>`,
  ],
};

function _choiceIllusHtml(type, slotIdx, text) {
  if (type === 'date') return `<div class="choice-year">${text}</div>`;
  const icons = CHOICE_ICONS[type] ?? CHOICE_ICONS.fact;
  return icons[slotIdx] ?? icons[0];
}

function _shortReveal(text) {
  const words = text.split(' ');
  if (words.length <= 10) return text;
  return words.slice(0, 10).join(' ').replace(/[,!?.]?$/, '!');
}

// ===== CUSTOM CONFIG =====

const CRUSADE_MILESTONES = {
  10: {
    headline: 'DEUS VULT',
    sub: 'The march has begun',
    voice: 'God wills it! The march has begun. The questions get harder from here.',
  },
  25: {
    headline: 'INTO THE HOLY LAND',
    sub: 'The crusade intensifies',
    voice: 'Halfway! The questions now separate the historians from the casuals. Can you hold on?',
  },
  40: {
    headline: 'FINAL MARCH ON JERUSALEM',
    sub: 'The hardest questions remain',
    voice: 'Final stretch. Ten questions left. These are for the scholars. March on!',
  },
};

function getCrusadeRank(s) {
  if (s <= 9)  return { label: 'Pilgrim',           color: '#a0c4ff' };
  if (s <= 19) return { label: 'Footsoldier',       color: '#81c784' };
  if (s <= 29) return { label: 'Sergeant',          color: '#ffb74d' };
  if (s <= 37) return { label: 'Knight',            color: '#ff7043' };
  if (s <= 42) return { label: 'Baron of Outremer', color: '#ce93d8' };
  if (s <= 47) return { label: 'Crusader',          color: '#ff8f00' };
  return             { label: 'Grand Master',       color: '#ffd600' };
}

// ===== TTS PREP =====
// Converts 4-digit medieval years to spoken form: 1099 → "ten ninety-nine"
const HI_WORDS = { 10:'ten', 11:'eleven', 12:'twelve', 13:'thirteen', 14:'fourteen' };
const ONES  = ['','one','two','three','four','five','six','seven','eight','nine',
               'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS  = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

function yearToWords(yr) {
  const n  = parseInt(yr, 10);
  const hi = Math.floor(n / 100);
  const lo = n % 100;
  const hiStr = HI_WORDS[hi] || String(hi);
  let loStr;
  if (lo === 0)       loStr = 'hundred';
  else if (lo < 10)   loStr = 'oh ' + ONES[lo];
  else if (lo < 20)   loStr = ONES[lo];
  else loStr = TENS[Math.floor(lo / 10)] + (lo % 10 ? '-' + ONES[lo % 10] : '');
  return hiStr + ' ' + loStr;
}

function ttsPrep(text) {
  return text.replace(/\b(1[0-9]{3})\b/g, (_, yr) => yearToWords(yr));
}

// ===== DATA LOADING =====
async function loadQuestions() {
  const res  = await fetch('questions/crusade.csv');
  const text = await res.text();
  return parseCSV(text).map(r => ({
    id:         r.id,
    question:   r.question,
    answer:     r.answer,
    wrong1:     r.wrong1,
    wrong2:     r.wrong2,
    wrong3:     r.wrong3,
    d:          Number(r.difficulty),
    type:       r.type,
    reveal:     r.reveal,
  }));
}

// ===== ROUND BUILDER =====
function buildRound(questions) {
  const easy   = shuffle(questions.filter(q => q.d === 1));
  const medium = shuffle(questions.filter(q => q.d === 2));
  const hard   = shuffle(questions.filter(q => q.d === 3));
  const raw = [
    ...easy.slice(0, 10),
    ...medium.slice(0, 15),
    ...shuffle([...medium.slice(15), ...hard.slice(0, 10)]).slice(0, 15),
    ...hard.slice(10, 20),
  ].slice(0, 50);
  return avoidConsecutiveDates(raw);
}

function avoidConsecutiveDates(questions) {
  const result = [...questions];
  for (let i = 1; i < result.length; i++) {
    if (result[i].type === 'date' && result[i - 1].type === 'date') {
      const swapIdx = result.findIndex((q, j) => j > i && q.type !== 'date');
      if (swapIdx !== -1) [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
    }
  }
  return result;
}

// ===== QUESTION BUILDER =====
function buildQuestion(q) {
  const choices = shuffle([
    { text: q.answer, correct: true  },
    { text: q.wrong1, correct: false },
    { text: q.wrong2, correct: false },
    { text: q.wrong3, correct: false },
  ]);
  const correctIdx = choices.findIndex(c => c.correct);
  return { ...q, choices, correctIdx };
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q      = getRound()[getIdx()];
  const n      = getIdx() + 1;
  const labels = ['A', 'B', 'C', 'D'];
  const quizStage = document.getElementById('quiz-stage');

  const scrollCorners = `
    <span class="scroll-corner tl">${CRUSADE_CROSS_SVG}</span>
    <span class="scroll-corner tr">${CRUSADE_CROSS_SVG}</span>
    <span class="scroll-corner bl">${CRUSADE_CROSS_SVG}</span>
    <span class="scroll-corner br">${CRUSADE_CROSS_SVG}</span>`;

  const choicesHtml = `<div class="name-choices">
    ${q.choices.map((c, i) => `
      <button class="name-choice" data-idx="${i}">
        <div class="choice-illus">${_choiceIllusHtml(q.type, i, c.text)}</div>
        <div class="choice-footer">
          <span class="choice-badge">${labels[i]}</span>
          ${q.type !== 'date' ? `<span class="choice-name">${c.text}</span>` : ''}
        </div>
      </button>`).join('')}
  </div>`;

  const illus     = TYPE_ILLUSTRATIONS[q.type] ?? TYPE_ILLUSTRATIONS.fact;
  const illusLabel = TYPE_LABELS[q.type]        ?? q.type;

  quizStage.innerHTML = `
    <div class="game-screen">
      <div class="game-bg"></div>
      <div class="game-hud">
        <span class="hud-q">Q ${n} / ${getRound().length}</span>
        <div class="hud-timer">
          <span id="timer-counter" class="timer-counter">${getQuestionTime()}</span>
        </div>
        <span class="hud-score">${getScore()} pts</span>
      </div>
      <div class="timer-bar"><div class="timer-fill" id="timer-fill"></div></div>
      <div class="scroll-wrap">
        <div class="scroll-body">
          ${scrollCorners}
          <div class="crusade-split">
            <div class="crusade-illus">
              ${illus}
              <span class="crusade-illus-label">${illusLabel}</span>
            </div>
            <div class="crusade-content">
              <div class="q-header">
                <div class="q-label">Crusade History</div>
                <div class="q-country-name">${q.question}</div>
              </div>
              ${choicesHtml}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      stopTimer();
      doReveal(Number(btn.dataset.idx));
    });
  });

  speak(ttsPrep(q.question), { rate: 1.0 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `A vital piece of crusading history! The answer was ${n}!`,
  n => `Don't worry, now you know! That was ${n}!`,
  n => `${n}! File that one away for your next history quiz!`,
  n => `Tricky one! But the answer was ${n}!`,
  n => `${n}, a name every Crusades scholar knows!`,
  n => `The answer is ${n}! Another piece of the crusading puzzle!`,
  n => `${n}! The history books remember it well!`,
];

function doReveal(selectedIdx) {
  const q       = getRound()[getIdx()];
  const correct = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const phrase = _shortReveal(q.reveal || GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](q.answer));
  const revealText = correct ? `Correct! ${phrase}` : phrase;
  const revealOpts = correct ? { pitch: 1.2, interrupt: true } : { interrupt: true };

  if (correct) { addScore(); playCorrect(); } else { playReveal(); }

  let wrongSeq = 0;
  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.disabled = true;
    const i = Number(btn.dataset.idx);
    if (i === q.correctIdx) {
      btn.classList.add('correct');
    } else {
      if (i === selectedIdx) btn.classList.add('wrong');
      injectCrack(btn, wrongSeq++);
    }
  });

  speakThenAdvance(revealText, revealOpts, REVEAL_TIME, advanceGame);
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'crusade');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('crusade')]);

  function restart() {
    const round = buildRound(questions).map(q => buildQuestion(q));
    startGame(round, showQuestion, restart, { ...cfg, milestones: CRUSADE_MILESTONES, getRank: getCrusadeRank });
  }

  const round = buildRound(questions).map(q => buildQuestion(q));
  startGame(round, showQuestion, restart, { ...cfg, milestones: CRUSADE_MILESTONES, getRank: getCrusadeRank });
}
