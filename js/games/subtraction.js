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

const MINUS_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="18" width="34" height="8" rx="4" fill="#8b1a1a"/>
</svg>`;

const SUBTRACTION_MILESTONES = {
  10: {
    headline: 'BORROWING BEGINS',
    sub: 'No more easy subtractions',
    voice: "Ten down! Now we borrow tens — keep your columns straight!",
  },
  25: {
    headline: 'HALFWAY THERE',
    sub: 'Bigger numbers incoming',
    voice: "Halfway! The big subtractions are coming. Take your time and borrow carefully!",
  },
  40: {
    headline: 'THE FINAL TEN',
    sub: 'Three-digit territory',
    voice: "Final ten! These involve hundreds. Can you finish without mistakes?",
  },
};

function getSubtractionRank(s) {
  if (s <= 9)  return { label: 'Beginner',          color: '#a0c4ff' };
  if (s <= 19) return { label: 'Subtractor',         color: '#ef9a9a' };
  if (s <= 29) return { label: 'Minus Whizz',        color: '#e57373' };
  if (s <= 37) return { label: 'Borrow Champion',    color: '#ef5350' };
  if (s <= 42) return { label: 'Maths Sharpshooter', color: '#e53935' };
  if (s <= 47) return { label: 'Subtraction Ace',    color: '#c62828' };
  return             { label: 'Grand Reducer',       color: '#ffd600' };
}

async function loadQuestions() {
  const res  = await fetch('questions/subtraction.csv');
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
  const a    = parseInt(row.a);
  const b    = parseInt(row.b);
  const diff = a - b;

  if (row.type === 'diff') {
    const wrongs     = generateWrongs(diff);
    const allChoices = shuffle([diff, ...wrongs]);
    return {
      a, b, diff,
      answer:     diff,
      correctIdx: allChoices.indexOf(diff),
      choices:    allChoices,
      type:       'diff',
      display:    `${a} <span class="math-op">−</span> ${b}`,
      label:      'What is the answer?',
      reveal:     row.reveal,
    };
  } else {
    const wrongs     = generateWrongs(b);
    const allChoices = shuffle([b, ...wrongs]);
    return {
      a, b, diff,
      answer:     b,
      correctIdx: allChoices.indexOf(b),
      choices:    allChoices,
      type:       'missing',
      display:    `${a} <span class="math-op">−</span> <span class="math-blank">?</span> <span class="math-eq">=</span> ${diff}`,
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
    <span class="scroll-corner tl">${MINUS_SVG}</span>
    <span class="scroll-corner tr">${MINUS_SVG}</span>
    <span class="scroll-corner bl">${MINUS_SVG}</span>
    <span class="scroll-corner br">${MINUS_SVG}</span>`;

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
              <div class="math-split-icon">${MINUS_SVG}</div>
              <div class="game-split-label">Subtraction</div>
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

  speak(q.label + '. ' + (q.type === 'diff'
    ? `${q.a} minus ${q.b}`
    : `${q.a} minus what equals ${q.diff}`), { rate: 1.0 });

  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

const GENERIC_REVEALS = [
  n => `The answer is ${n}! Keep subtracting!`,
  n => `${n}! Remember to borrow when you need to!`,
  n => `Don't worry, now you know! It was ${n}!`,
  n => `Tricky one! But the answer was ${n}!`,
  n => `${n}! Count back carefully next time!`,
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
  document.getElementById('quiz-frame').setAttribute('data-game', 'subtraction');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('subtraction')]);

  function restart() {
    const round = buildRound(questions).map(r => buildQuestion(r));
    startGame(round, showQuestion, restart, { ...cfg, milestones: SUBTRACTION_MILESTONES, getRank: getSubtractionRank });
  }

  const round = buildRound(questions).map(r => buildQuestion(r));
  startGame(round, showQuestion, restart, { ...cfg, milestones: SUBTRACTION_MILESTONES, getRank: getSubtractionRank });
}
