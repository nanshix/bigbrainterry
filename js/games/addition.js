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

const PLUS_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="5" width="8" height="34" rx="4" fill="#1a6b3a"/>
  <rect x="5" y="18" width="34" height="8" rx="4" fill="#1a6b3a"/>
</svg>`;

const ADDITION_MILESTONES = {
  10: {
    headline: 'NO CARRYING YET',
    sub: 'The carrying rounds begin now',
    voice: "Ten down! Now the carrying begins — keep your columns straight!",
  },
  25: {
    headline: 'HALFWAY THERE',
    sub: 'Bigger sums ahead',
    voice: "Halfway! The big sums are coming. Stay sharp and carry carefully!",
  },
  40: {
    headline: 'THE FINAL TEN',
    sub: 'Three-digit territory',
    voice: "Final ten! These sums break one hundred. Can you finish strong?",
  },
};

function getAdditionRank(s) {
  if (s <= 9)  return { label: 'Beginner',        color: '#a0c4ff' };
  if (s <= 19) return { label: 'Adder',            color: '#81c784' };
  if (s <= 29) return { label: 'Sum Whizz',        color: '#4db6ac' };
  if (s <= 37) return { label: 'Maths Star',       color: '#26a69a' };
  if (s <= 42) return { label: 'Carry Champion',   color: '#00897b' };
  if (s <= 47) return { label: 'Addition Ace',     color: '#00695c' };
  return             { label: 'Grand Totaller',    color: '#ffd600' };
}

async function loadQuestions() {
  const res  = await fetch('questions/addition.csv');
  const text = await res.text();
  return parseCSV(text);
}

function buildRound(rows) {
  const t1 = shuffle(rows.filter(r => r.difficulty === '1'));
  const t2 = shuffle(rows.filter(r => r.difficulty === '2'));
  const t3 = shuffle(rows.filter(r => r.difficulty === '3'));
  return [...t1.slice(0, 10), ...t2.slice(0, 20), ...t3.slice(0, 10)];
}

function generateWrongs(correct) {
  const candidates = new Set();
  for (let d = 1; d <= 5; d++) {
    candidates.add(correct + d);
    if (correct - d > 0) candidates.add(correct - d);
  }
  candidates.add(correct + 10);
  if (correct - 10 > 0) candidates.add(correct - 10);
  return shuffle([...candidates].filter(v => v > 0 && v !== correct)).slice(0, 3);
}

function buildQuestion(row) {
  const a   = parseInt(row.a);
  const b   = parseInt(row.b);
  const sum = a + b;

  if (row.type === 'sum') {
    const wrongs     = generateWrongs(sum);
    const allChoices = shuffle([sum, ...wrongs]);
    return {
      a, b, sum,
      answer:     sum,
      correctIdx: allChoices.indexOf(sum),
      choices:    allChoices,
      type:       'sum',
      display:    `${a} <span class="math-op">+</span> ${b}`,
      label:      'What is the answer?',
      reveal:     row.reveal,
    };
  } else {
    const wrongs     = generateWrongs(b);
    const allChoices = shuffle([b, ...wrongs]);
    return {
      a, b, sum,
      answer:     b,
      correctIdx: allChoices.indexOf(b),
      choices:    allChoices,
      type:       'missing',
      display:    `${a} <span class="math-op">+</span> <span class="math-blank">?</span> <span class="math-eq">=</span> ${sum}`,
      label:      'Find the missing number',
      reveal:     row.reveal,
    };
  }
}

function showQuestion() {
  const q         = getRound()[getIdx()];
  const n         = getIdx() + 1;
  const quizStage = document.getElementById('quiz-stage');
  const labels    = ['A', 'B', 'C', 'D'];

  const scrollCorners = `
    <span class="scroll-corner tl">${PLUS_SVG}</span>
    <span class="scroll-corner tr">${PLUS_SVG}</span>
    <span class="scroll-corner bl">${PLUS_SVG}</span>
    <span class="scroll-corner br">${PLUS_SVG}</span>`;

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
              <div class="math-split-icon">${PLUS_SVG}</div>
              <div class="game-split-label">Addition</div>
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

  speak(q.label + '. ' + (q.type === 'sum'
    ? `${q.a} plus ${q.b}`
    : `${q.a} plus what equals ${q.sum}`), { rate: 1.0 });

  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

const GENERIC_REVEALS = [
  n => `The answer is ${n}! Keep adding!`,
  n => `${n}! File that one away!`,
  n => `Don't worry, now you know! It was ${n}!`,
  n => `Tricky one! But the answer was ${n}!`,
  n => `${n}! Always carry the one!`,
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

export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'addition');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('addition')]);

  function restart() {
    const round = buildRound(questions).map(r => buildQuestion(r));
    startGame(round, showQuestion, restart, { ...cfg, milestones: ADDITION_MILESTONES, getRank: getAdditionRank });
  }

  const round = buildRound(questions).map(r => buildQuestion(r));
  startGame(round, showQuestion, restart, { ...cfg, milestones: ADDITION_MILESTONES, getRank: getAdditionRank });
}
