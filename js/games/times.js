import { shuffle, parseCSV } from '../utils.js';
import { playTick, playUrgent, playReveal, playCorrect } from '../core/audio.js';
import { speak } from '../core/speech.js';
import { loadGameConfig } from '../core/config.js';
import {
  QUESTION_TIME, REVEAL_TIME,
  startGame, addScore, addNoAnswer, advanceGame,
  startTimer, stopTimer, speakThenAdvance, getQuestionTime,
  getIdx, getRound, getScore,
} from '../core/engine.js';

const TIMES_X_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="18" width="34" height="8" rx="4" fill="#3d2b8a" transform="rotate(45 22 22)"/>
  <rect x="5" y="18" width="34" height="8" rx="4" fill="#3d2b8a" transform="rotate(-45 22 22)"/>
</svg>`;

const TIMES_MILESTONES = {
  10: {
    headline: 'TABLES UNLOCKED',
    sub: 'The easy ones are done',
    voice: 'Ten down! The medium tables are next. Six sevens, seven eights — the ones that get people every time!',
  },
  25: {
    headline: 'HALFWAY THERE',
    sub: 'The tricky tables await',
    voice: 'Halfway! The nines and the difficult combinations are coming. Stay sharp!',
  },
  40: {
    headline: 'THE FINAL TEN',
    sub: 'Elevens and twelves remain',
    voice: 'Final stretch! Ten questions left — the twelves table and the legends. Can you finish strong?',
  },
};

function getTimesRank(s) {
  if (s <= 9)  return { label: 'Beginner',       color: '#a0c4ff' };
  if (s <= 19) return { label: 'Practitioner',   color: '#81c784' };
  if (s <= 29) return { label: 'Times Whizz',    color: '#ffb74d' };
  if (s <= 37) return { label: 'Maths Ace',      color: '#ff7043' };
  if (s <= 42) return { label: 'Calculator',     color: '#ce93d8' };
  if (s <= 47) return { label: 'Times Champion', color: '#ff8f00' };
  return             { label: 'Grand Mathlete',  color: '#ffd600' };
}

// ===== DATA =====
async function loadQuestions() {
  const res  = await fetch('questions/times.csv');
  const text = await res.text();
  return parseCSV(text);
}

function buildRound(rows) {
  const t1 = shuffle(rows.filter(r => r.difficulty === '1'));
  const t2 = shuffle(rows.filter(r => r.difficulty === '2'));
  const t3 = shuffle(rows.filter(r => r.difficulty === '3'));
  return [...t1.slice(0, 10), ...t2.slice(0, 20), ...t3.slice(0, 10)];
}

function generateWrongs(correct, a, b, type) {
  const candidates = new Set();
  if (type === 'product') {
    const step = Math.max(a, b);
    for (let d = 1; d <= 4; d++) {
      candidates.add(correct + d * step);
      if (correct - d * step > 0) candidates.add(correct - d * step);
    }
    for (let d = 1; d <= 8; d++) {
      candidates.add(correct + d);
      if (correct - d > 0) candidates.add(correct - d);
    }
  } else {
    for (let d = 1; d <= 5; d++) {
      candidates.add(correct + d);
      if (correct - d > 0) candidates.add(correct - d);
    }
  }
  return shuffle([...candidates].filter(v => v > 0 && v !== correct)).slice(0, 3);
}

function buildQuestion(row) {
  const a       = parseInt(row.a);
  const b       = parseInt(row.b);
  const product = a * b;

  if (row.type === 'product') {
    const wrongs     = generateWrongs(product, a, b, 'product');
    const allChoices = shuffle([product, ...wrongs]);
    return {
      a, b,
      answer:     product,
      correctIdx: allChoices.indexOf(product),
      choices:    allChoices,
      type:       'product',
      display:    `${a} <span class="times-op">×</span> ${b}`,
      label:      'What is the answer?',
      reveal:     row.reveal,
    };
  } else {
    const wrongs     = generateWrongs(b, a, b, 'missing');
    const allChoices = shuffle([b, ...wrongs]);
    return {
      a, b, product,
      answer:     b,
      correctIdx: allChoices.indexOf(b),
      choices:    allChoices,
      type:       'missing',
      display:    `${a} <span class="times-op">×</span> <span class="times-blank">?</span> <span class="times-op">=</span> ${product}`,
      label:      'Find the missing number',
      reveal:     row.reveal,
    };
  }
}

// ===== RENDER =====
function showQuestion() {
  const q         = getRound()[getIdx()];
  const n         = getIdx() + 1;
  const quizStage = document.getElementById('quiz-stage');
  const labels    = ['A', 'B', 'C', 'D'];

  const scrollCorners = `
    <span class="scroll-corner tl">${TIMES_X_SVG}</span>
    <span class="scroll-corner tr">${TIMES_X_SVG}</span>
    <span class="scroll-corner bl">${TIMES_X_SVG}</span>
    <span class="scroll-corner br">${TIMES_X_SVG}</span>`;

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
              <div class="times-split-icon">${TIMES_X_SVG}</div>
              <div class="game-split-label">Times Table</div>
            </div>
            <div class="game-split-right">
              <div class="times-q-wrap">
                <div class="q-label">${q.label}</div>
                <div class="times-equation">${q.display}</div>
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

  speak(q.label + '. ' + (q.type === 'product'
    ? `${q.a} times ${q.b}`
    : `${q.a} times what equals ${q.product}`), { rate: 1.0 });

  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `The answer is ${n}! Keep those tables sharp!`,
  n => `${n}! File that one away for next time!`,
  n => `Don't worry, now you know! It was ${n}!`,
  n => `Tricky one! But the answer was ${n}!`,
  n => `${n}! Mathematics never lies!`,
];

function doReveal(selectedIdx) {
  const q       = getRound()[getIdx()];
  const correct = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const fallback   = GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](q.answer);
  const phrase     = q.reveal || fallback;
  const revealText = correct ? `Correct! ${phrase}` : phrase;
  const revealOpts = correct ? { pitch: 1.2, interrupt: true } : { interrupt: true };

  if (correct) { addScore(); playCorrect(); } else { playReveal(); }

  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.disabled = true;
    const i = Number(btn.dataset.idx);
    if (i === q.correctIdx)     btn.classList.add('correct');
    else if (i === selectedIdx) btn.classList.add('wrong');
  });

  speakThenAdvance(revealText, revealOpts, REVEAL_TIME, advanceGame);
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'times');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('times')]);

  function restart() {
    const round = buildRound(questions).map(r => buildQuestion(r));
    startGame(round, showQuestion, restart, { ...cfg, milestones: TIMES_MILESTONES, getRank: getTimesRank });
  }

  const round = buildRound(questions).map(r => buildQuestion(r));
  startGame(round, showQuestion, restart, { ...cfg, milestones: TIMES_MILESTONES, getRank: getTimesRank });
}
