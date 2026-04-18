import { shuffle, parseCSV, flagUrl } from '../utils.js';
import { playTick, playUrgent, playReveal, playCorrect } from '../core/audio.js';
import { speak } from '../core/speech.js';
import { highlightCountry } from './flags.js';
import { loadGameConfig } from '../core/config.js';
import {
  REVEAL_TIME,
  startGame, addScore, addNoAnswer, advanceGame,
  startTimer, stopTimer, speakThenAdvance, getQuestionTime,
  getIdx, getRound, getScore,
} from '../core/engine.js';

const CROWN_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="7" y="28" width="30" height="7" rx="1" fill="#1c4426"/>
  <polygon points="7,28 10,14 14,22" fill="#1c4426"/>
  <polygon points="14,22 17,28 11,28" fill="#1c4426"/>
  <polygon points="14,22 22,10 30,22" fill="#1c4426"/>
  <polygon points="30,22 27,28 33,28" fill="#1c4426"/>
  <polygon points="30,22 34,14 37,28" fill="#1c4426"/>
  <circle cx="22" cy="32" r="2.5" fill="#1c4426"/>
</svg>`;

// ===== CUSTOM CONFIG =====

const CAPITALS_MILESTONES = {
  10: {
    headline: 'HEAD OF STATE',
    sub: 'Easy ones done. Now the traps begin.',
    voice: 'Easy ones done. Now the traps begin. Stay sharp.',
  },
  25: {
    headline: 'DIPLOMATIC CORPS',
    sub: "You've survived the famous traps",
    voice: "Halfway! You've survived the famous traps. Now for the ones that are just genuinely hard.",
  },
  40: {
    headline: 'FINAL DISPATCH',
    sub: 'Last 10 — the specialists argue about these',
    voice: 'Last ten. These are the capitals that geography specialists argue about. Good luck.',
  },
};

function getCapitalsRank(s) {
  if (s <= 9)  return { label: 'Tourist',           color: '#a0c4ff' };
  if (s <= 19) return { label: 'Exchange Student',  color: '#81c784' };
  if (s <= 29) return { label: 'Geography Grad',    color: '#ffb74d' };
  if (s <= 37) return { label: 'Diplomat',          color: '#ff7043' };
  if (s <= 42) return { label: 'Ambassador',        color: '#ce93d8' };
  if (s <= 47) return { label: 'Secretary-General', color: '#ff8f00' };
  return             { label: 'Geographer Royal',   color: '#ffd600' };
}

// ===== DATA LOADING =====
async function loadQuestions() {
  const res  = await fetch('questions/capitals.csv');
  const text = await res.text();
  return parseCSV(text).map(r => ({
    code:    r.code,
    country: r.country,
    capital: r.capital,
    d:       Number(r.difficulty),
    reveal:  r.reveal,
  }));
}

// ===== ROUND BUILDER =====
function buildRound(questions) {
  const t1 = shuffle(questions.filter(q => q.d === 1));
  const t2 = shuffle(questions.filter(q => q.d === 2));
  const t3 = shuffle(questions.filter(q => q.d === 3));
  return [
    ...t1.slice(0, 10),
    ...shuffle([...t1.slice(10), ...t2.slice(0, 10)]).slice(0, 15),
    ...shuffle([...t2.slice(10), ...t3.slice(0, 10)]).slice(0, 15),
    ...t3.slice(10, 20),
  ].slice(0, 50);
}

// ===== QUESTION BUILDER =====
// dir: 'ct' = country→capital (70%), 'cc' = capital→country (30%)
// choices are full entry objects so every card has a flag (code)
function buildQuestion(entry, all) {
  const dir         = Math.random() < 0.7 ? 'ct' : 'cc';
  const pool        = shuffle(all.filter(x => x.code !== entry.code && x.d === entry.d));
  const distractors = pool.slice(0, 3);
  const choices     = shuffle([entry, ...distractors]);
  return { ...entry, dir, choices, correctIdx: choices.findIndex(c => c.code === entry.code) };
}

function _shortReveal(text) {
  const words = text.split(' ');
  if (words.length <= 10) return text;
  return words.slice(0, 10).join(' ').replace(/[,!?.]?$/, '!');
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q      = getRound()[getIdx()];
  const n      = getIdx() + 1;
  const labels = ['A', 'B', 'C', 'D'];
  const quizStage = document.getElementById('quiz-stage');

  const scrollCorners = `
    <span class="scroll-corner tl">${CROWN_SVG}</span>
    <span class="scroll-corner tr">${CROWN_SVG}</span>
    <span class="scroll-corner bl">${CROWN_SVG}</span>
    <span class="scroll-corner br">${CROWN_SVG}</span>`;

  const isCtC   = q.dir === 'ct';
  const qLabel  = isCtC ? 'What is the capital of' : 'Which country has this capital';
  const qName   = isCtC ? q.country : q.capital;
  const spoken  = isCtC
    ? `What is the capital of ${q.country}?`
    : `Which country has ${q.capital} as its capital?`;

  const choicesHtml = `<div class="name-choices">
    ${q.choices.map((c, i) => `
      <button class="name-choice" data-idx="${i}">
        <span class="choice-badge">${labels[i]}</span>
        <span class="choice-name">${isCtC ? c.capital : c.country}</span>
      </button>`).join('')}
  </div>`;

  const leftPanel = isCtC
    ? `<div class="game-split-left cap-split-flag-panel">
         <img src="${flagUrl(q.code)}" class="cap-split-flag${q.code === 'np' ? ' cap-flag-np' : ''}" alt="" />
       </div>`
    : `<div class="game-split-left">
         <div class="cap-split-capital-name">${q.capital}</div>
         <div class="game-split-label">Capital City</div>
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
            ${leftPanel}
            <div class="game-split-right">
              <div class="q-header">
                <div class="q-label">${qLabel}</div>
                <div class="q-country-name">${qName}</div>
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

  speak(spoken, { rate: 1.05 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  (a, c) => `The answer is ${a}! The capital of ${c}!`,
  (a, c) => `${a}! That's the one! Capital of ${c}!`,
  (a, c) => `Tricky one! It's ${a}, capital of ${c}!`,
  (a, c) => `${a}! File that one away for your next geography quiz!`,
  (a, c) => `The capital of ${c} is ${a}! Now you know!`,
];

function doReveal(selectedIdx) {
  const q       = getRound()[getIdx()];
  const correct = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const fallback   = GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](q.capital, q.country);
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

  if (correct) highlightCountry(q.code);

  speakThenAdvance(revealText, revealOpts, REVEAL_TIME, advanceGame);
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'capitals');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('capitals')]);

  function restart() {
    const round = buildRound(questions).map(q => buildQuestion(q, questions));
    startGame(round, showQuestion, restart, { ...cfg, milestones: CAPITALS_MILESTONES, getRank: getCapitalsRank });
  }

  const round = buildRound(questions).map(q => buildQuestion(q, questions));
  startGame(round, showQuestion, restart, { ...cfg, milestones: CAPITALS_MILESTONES, getRank: getCapitalsRank });
}
