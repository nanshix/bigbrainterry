import { shuffle, parseCSV } from '../utils.js';
import { playTick, playUrgent, playReveal, playCorrect } from '../core/audio.js';
import { speak } from '../core/speech.js';
import { loadGameConfig } from '../core/config.js';
import {
  REVEAL_TIME,
  startGame, addScore, addNoAnswer, advanceGame,
  startTimer, stopTimer, speakThenAdvance, getQuestionTime,
  getIdx, getRound, getScore,
} from '../core/engine.js';

const GLOBE_SVG = `<svg viewBox="0 0 44 44" fill="none" stroke="#1a3a5c" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
  <circle cx="22" cy="22" r="16"/>
  <line x1="6" y1="22" x2="38" y2="22"/>
  <ellipse cx="22" cy="22" rx="7" ry="16"/>
  <path d="M9,14 Q22,10 35,14" fill="none"/>
  <path d="M9,30 Q22,34 35,30" fill="none"/>
</svg>`;

const CITY_SVG = `<svg viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="35,4 39,16 31,16" fill="#1a3a5c"/>
  <rect x="31" y="16" width="8" height="34" fill="#1a3a5c"/>
  <rect x="33" y="22" width="4" height="5" fill="#7ab8d8" opacity="0.65"/>
  <rect x="33" y="31" width="4" height="5" fill="#7ab8d8" opacity="0.65"/>
  <rect x="15" y="30" width="14" height="20" fill="#1a3a5c" opacity="0.8"/>
  <rect x="17" y="33" width="4" height="4" fill="#7ab8d8" opacity="0.5"/>
  <rect x="23" y="33" width="4" height="4" fill="#7ab8d8" opacity="0.5"/>
  <rect x="43" y="24" width="14" height="26" fill="#1a3a5c" opacity="0.8"/>
  <rect x="45" y="27" width="4" height="4" fill="#7ab8d8" opacity="0.5"/>
  <rect x="51" y="27" width="4" height="4" fill="#7ab8d8" opacity="0.5"/>
  <rect x="8" y="40" width="10" height="10" fill="#1a3a5c" opacity="0.5"/>
  <rect x="60" y="36" width="8" height="14" fill="#1a3a5c" opacity="0.5"/>
  <rect x="4" y="50" width="62" height="4" rx="1" fill="#1a3a5c" opacity="0.25"/>
</svg>`;

// ===== CUSTOM CONFIG =====

const CITIES_MILESTONES = {
  10: {
    headline: 'PASSPORT STAMPED',
    sub: "You've cleared the famous ones. Off the tourist trail now.",
    voice: "Passport stamped! You've cleared the famous ones. Now we're going off the tourist trail.",
  },
  25: {
    headline: 'AROUND THE WORLD',
    sub: 'The cities are getting less familiar from here',
    voice: 'Halfway around the globe! The cities are getting less familiar from here.',
  },
  40: {
    headline: 'FINAL DESTINATION',
    sub: 'Last 10 — only the true geography obsessives know these',
    voice: 'Final destination. These last ten cities are only known to the true geography obsessives.',
  },
};

function getCitiesRank(s) {
  if (s <= 9)  return { label: 'Day Tripper',        color: '#a0c4ff' };
  if (s <= 19) return { label: 'Backpacker',         color: '#81c784' };
  if (s <= 29) return { label: 'Frequent Flyer',     color: '#ffb74d' };
  if (s <= 37) return { label: 'Explorer',           color: '#ff7043' };
  if (s <= 42) return { label: 'Globetrotter',       color: '#ce93d8' };
  if (s <= 47) return { label: 'Cartographer',       color: '#ff8f00' };
  return             { label: 'Citizen of the World', color: '#ffd600' };
}

// ===== TTS CLEANUP =====
// Strip apostrophes from city names before speaking (e.g. Nuku'alofa)
function ttsClean(text) {
  return text.replace(/'/g, '');
}

function _shortReveal(text) {
  const words = text.split(' ');
  if (words.length <= 10) return text;
  return words.slice(0, 10).join(' ').replace(/[,!?.]?$/, '!');
}

// ===== DATA LOADING =====
async function loadQuestions() {
  const res  = await fetch('questions/cities.csv');
  const text = await res.text();
  return parseCSV(text).map(r => ({
    id:       r.id,
    question: r.question,
    answer:   r.answer,
    wrong1:   r.wrong1,
    wrong2:   r.wrong2,
    wrong3:   r.wrong3,
    d:        Number(r.difficulty),
    reveal:   r.reveal,
    cx:       Number(r.cx),
    cy:       Number(r.cy),
    type:     r.type,
  }));
}

// ===== ROUND BUILDER =====
function buildRound(questions) {
  const t1 = shuffle(questions.filter(q => q.d === 1));
  const t2 = shuffle(questions.filter(q => q.d === 2));
  const t3 = shuffle(questions.filter(q => q.d === 3));
  const raw = [
    ...t1.slice(0, 10),
    ...shuffle([...t1.slice(10), ...t2.slice(0, 10)]).slice(0, 15),
    ...shuffle([...t2.slice(10), ...t3.slice(0, 10)]).slice(0, 15),
    ...t3.slice(10, 20),
  ].slice(0, 50);
  return avoidConsecutiveTypes(raw);
}

function avoidConsecutiveTypes(questions) {
  const result = [...questions];
  for (let i = 1; i < result.length; i++) {
    if (result[i].type === result[i - 1].type) {
      const swapIdx = result.findIndex((q, j) => j > i && q.type !== result[i].type);
      if (swapIdx !== -1) [result[i], result[swapIdx]] = [result[swapIdx], result[i]];
    }
  }
  return result;
}

// ===== QUESTION BUILDER =====
// Uses explicit distractors from CSV — no dynamic generation
function buildQuestion(q) {
  const choices   = shuffle([q.answer, q.wrong1, q.wrong2, q.wrong3]);
  const correctIdx = choices.indexOf(q.answer);
  return { ...q, choices, correctIdx };
}

// ===== CITY HIGHLIGHT =====
function highlightCity(cx, cy) {
  const svg = document.getElementById('map-highlight-svg');
  if (!svg) return;
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="4" class="city-dot-core"/>
    <circle cx="${cx}" cy="${cy}" r="4" class="city-dot-flash"/>
  `;
  svg.appendChild(g);
  setTimeout(() => { if (g.parentNode) g.remove(); }, 2200);
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q      = getRound()[getIdx()];
  const n      = getIdx() + 1;
  const labels = ['A', 'B', 'C', 'D'];
  const quizStage = document.getElementById('quiz-stage');

  const scrollCorners = `
    <span class="scroll-corner tl">${GLOBE_SVG}</span>
    <span class="scroll-corner tr">${GLOBE_SVG}</span>
    <span class="scroll-corner bl">${GLOBE_SVG}</span>
    <span class="scroll-corner br">${GLOBE_SVG}</span>`;

  const choicesHtml = `<div class="name-choices">
    ${q.choices.map((c, i) => `
      <button class="name-choice" data-idx="${i}">
        <span class="choice-badge">${labels[i]}</span>
        <span class="choice-name">${c}</span>
      </button>`).join('')}
  </div>`;

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
          <div class="game-split">
            <div class="game-split-left">
              <div class="cities-split-illus">${CITY_SVG}</div>
              <div class="game-split-label">World Cities</div>
            </div>
            <div class="game-split-right">
              <div class="q-header">
                <div class="q-label">Name the city</div>
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

  speak(ttsClean(q.question), { rate: 1.0 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  a => `${a}! File that one away for your next geography quiz!`,
  a => `The answer is ${a}! Now you know!`,
  a => `${a}! A great city with a great story!`,
  a => `Tricky one! It was ${a}!`,
];

function doReveal(selectedIdx) {
  const q       = getRound()[getIdx()];
  const correct = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const fallback   = GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](q.answer);
  const phrase     = _shortReveal(q.reveal || fallback);
  const revealText = correct ? `Correct! ${phrase}` : phrase;
  const revealOpts = correct ? { pitch: 1.2, interrupt: true } : { interrupt: true };

  if (correct) { addScore(); playCorrect(); } else { playReveal(); }

  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.disabled = true;
    const i = Number(btn.dataset.idx);
    if (i === q.correctIdx)     btn.classList.add('correct');
    else if (i === selectedIdx) btn.classList.add('wrong');
  });

  if (correct) highlightCity(q.cx, q.cy);

  speakThenAdvance(ttsClean(revealText), revealOpts, REVEAL_TIME, advanceGame);
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'cities');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('cities')]);

  function restart() {
    const round = buildRound(questions).map(q => buildQuestion(q));
    startGame(round, showQuestion, restart, { ...cfg, milestones: CITIES_MILESTONES, getRank: getCitiesRank });
  }

  const round = buildRound(questions).map(q => buildQuestion(q));
  startGame(round, showQuestion, restart, { ...cfg, milestones: CITIES_MILESTONES, getRank: getCitiesRank });
}
