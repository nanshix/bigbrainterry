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

const ARITH_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="5" width="8" height="34" rx="4" fill="#7a4a00"/>
  <rect x="5" y="18" width="34" height="8" rx="4" fill="#7a4a00"/>
  <circle cx="32" cy="10" r="4" fill="#7a4a00"/>
  <circle cx="12" cy="34" r="4" fill="#7a4a00"/>
</svg>`;

const ARITHMETIC_MILESTONES = {
  10: {
    headline: 'OPERATIONS EXPAND',
    sub: 'Times and division are next',
    voice: "Ten down! Now multiplication and division join the mix. Stay alert!",
  },
  25: {
    headline: 'HALFWAY THERE',
    sub: 'All four operations in play',
    voice: "Halfway! All four operations are live. Add, subtract, multiply, divide!",
  },
  40: {
    headline: 'THE FINAL TEN',
    sub: 'The hardest combinations',
    voice: "Final ten! These are the toughest. Can you finish without a mistake?",
  },
};

function getArithmeticRank(s) {
  if (s <= 9)  return { label: 'Beginner',          color: '#a0c4ff' };
  if (s <= 19) return { label: 'Calculator',         color: '#ffcc80' };
  if (s <= 29) return { label: 'Maths Whizz',        color: '#ffb74d' };
  if (s <= 37) return { label: 'Operator',           color: '#ffa726' };
  if (s <= 42) return { label: 'Maths Maestro',      color: '#fb8c00' };
  if (s <= 47) return { label: 'Arithmetic Ace',     color: '#e65100' };
  return             { label: 'Grand Arithmetician', color: '#ffd600' };
}

const OP_COMPUTE = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
};

const OP_DISPLAY = { '+': '+', '-': '−', '*': '×', '/': '÷' };

const OP_SPEAK = { '+': 'plus', '-': 'minus', '*': 'times', '/': 'divided by' };

async function loadQuestions() {
  const res  = await fetch('questions/arithmetic.csv');
  const text = await res.text();
  return parseCSV(text);
}

function buildRound(rows) {
  const t1 = shuffle(rows.filter(r => r.difficulty === '1'));
  const t2 = shuffle(rows.filter(r => r.difficulty === '2'));
  const t3 = shuffle(rows.filter(r => r.difficulty === '3'));
  return [...t1.slice(0, 10), ...t2.slice(0, 20), ...t3.slice(0, 10)];
}

function generateWrongs(correct, op) {
  const candidates = new Set();
  if (op === '*' || op === '/') {
    const step = op === '*' ? Math.max(2, Math.floor(correct / 6)) : 1;
    for (let d = 1; d <= 4; d++) {
      candidates.add(correct + d * step);
      if (correct - d * step > 0) candidates.add(correct - d * step);
    }
  }
  for (let d = 1; d <= 5; d++) {
    candidates.add(correct + d);
    if (correct - d > 0) candidates.add(correct - d);
  }
  candidates.add(correct + 10);
  if (correct - 10 > 0) candidates.add(correct - 10);
  return shuffle([...candidates].filter(v => v > 0 && v !== correct)).slice(0, 3);
}

function buildQuestion(row) {
  const a      = parseInt(row.a);
  const b      = parseInt(row.b);
  const op     = row.op;
  const answer = OP_COMPUTE[op](a, b);

  const wrongs     = generateWrongs(answer, op);
  const allChoices = shuffle([answer, ...wrongs]);
  return {
    a, b, op, answer,
    correctIdx: allChoices.indexOf(answer),
    choices:    allChoices,
    display:    `${a} <span class="math-op">${OP_DISPLAY[op]}</span> ${b}`,
    label:      'What is the answer?',
    reveal:     row.reveal,
  };
}

function showQuestion() {
  const q         = getRound()[getIdx()];
  const n         = getIdx() + 1;
  const quizStage = document.getElementById('quiz-stage');
  const labels    = ['A', 'B', 'C', 'D'];

  const scrollCorners = `
    <span class="scroll-corner tl">${ARITH_SVG}</span>
    <span class="scroll-corner tr">${ARITH_SVG}</span>
    <span class="scroll-corner bl">${ARITH_SVG}</span>
    <span class="scroll-corner br">${ARITH_SVG}</span>`;

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
              <div class="math-split-icon">${ARITH_SVG}</div>
              <div class="game-split-label">Arithmetic</div>
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

  speak(`${q.a} ${OP_SPEAK[q.op]} ${q.b}`, { rate: 1.0 });

  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

const GENERIC_REVEALS = [
  n => `The answer is ${n}!`,
  n => `${n}! Keep all four operations sharp!`,
  n => `Don't worry, now you know! It was ${n}!`,
  n => `Tricky one! But the answer was ${n}!`,
  n => `${n}! Maths never lies!`,
];

function doReveal(selectedIdx) {
  const q        = getRound()[getIdx()];
  const correct  = selectedIdx === q.correctIdx;
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

export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'arithmetic');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('arithmetic')]);

  function restart() {
    const round = buildRound(questions).map(r => buildQuestion(r));
    startGame(round, showQuestion, restart, { ...cfg, milestones: ARITHMETIC_MILESTONES, getRank: getArithmeticRank });
  }

  const round = buildRound(questions).map(r => buildQuestion(r));
  startGame(round, showQuestion, restart, { ...cfg, milestones: ARITHMETIC_MILESTONES, getRank: getArithmeticRank });
}
