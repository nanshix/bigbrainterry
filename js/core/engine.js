import { speak } from './speech.js';
import { playTick, playMilestone, playGameOver } from './audio.js';

export const ROUND_SIZE    = 50;
export const QUESTION_TIME = 5;
export const REVEAL_TIME   = 2000;

export const MILESTONES = {
  10: { headline: 'LEVEL UP',       sub: 'Getting harder from here...' },
  25: { headline: 'HALFWAY!',       sub: 'Final 25 — brace yourself' },
  40: { headline: 'FINAL STRETCH',  sub: 'Last 10 questions. Go!' },
};

let score        = 0;
let currentIdx   = 0;
let round        = [];
let timerInterval = null;
let timeLeft     = QUESTION_TIME;
let lastTickSec  = QUESTION_TIME;
let pendingTimeouts = [];
let _onShowQuestion = null;
let _onRestart = null;

const quizModal = document.getElementById('quiz-modal');
const quizStage = document.getElementById('quiz-stage');

export function getScore()    { return score; }
export function getIdx()      { return currentIdx; }
export function getRound()    { return round; }

export function gameTimeout(fn, ms) {
  const id = setTimeout(fn, ms);
  pendingTimeouts.push(id);
  return id;
}

// Advances only after BOTH speech ends AND minMs elapsed
export function speakThenAdvance(text, opts, minMs, callback) {
  let speechDone = false;
  let timerDone  = false;
  function maybeGo() { if (speechDone && timerDone) callback(); }
  speak(text, { ...opts, onend: () => { speechDone = true; maybeGo(); } });
  gameTimeout(() => { timerDone = true; maybeGo(); }, minMs);
}

// onRestart: called by "Play Again" — should rebuild a fresh round and call startGame again
export function startGame(roundData, onShowQuestion, onRestart) {
  _onShowQuestion = onShowQuestion;
  _onRestart = onRestart || null;
  score = 0; currentIdx = 0; round = roundData;
  doCountdown(() => _onShowQuestion());
}

export function addScore() {
  score++;
  const s = document.querySelector('.hud-score');
  if (s) s.textContent = score + ' pts';
}

export function startTimer(onTick, onTimeout) {
  clearInterval(timerInterval);
  timeLeft    = QUESTION_TIME;
  lastTickSec = QUESTION_TIME;

  timerInterval = setInterval(() => {
    timeLeft = Math.max(timeLeft - 0.1, 0);

    const fill    = document.getElementById('timer-fill');
    const counter = document.getElementById('timer-counter');
    if (fill) {
      fill.style.width = (timeLeft / QUESTION_TIME * 100) + '%';
      fill.classList.toggle('urgent', timeLeft <= 2);
    }
    if (counter) counter.textContent = Math.ceil(timeLeft);

    const sec = Math.ceil(timeLeft);
    if (sec < lastTickSec) {
      lastTickSec = sec;
      if (sec > 0) onTick(sec);
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 100);
}

export function stopTimer() {
  clearInterval(timerInterval);
}

export function advanceGame() {
  currentIdx++;
  if (currentIdx >= ROUND_SIZE) { showResults(); return; }
  const milestone = MILESTONES[currentIdx];
  if (milestone) showMilestone(milestone);
  else _onShowQuestion();
}

export function closeQuiz() {
  stopTimer();
  pendingTimeouts.forEach(clearTimeout);
  pendingTimeouts = [];
  speechSynthesis.cancel();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  quizModal.classList.add('hidden');
  quizModal.setAttribute('aria-hidden', 'true');
}

// ===== COUNTDOWN =====
function doCountdown(onDone) {
  let n = 5;
  function step() {
    if (n > 0) {
      setCountdownDisplay(n, n === 5 ? 'Get Ready!' : '');
      playTick();
      const text = n === 5 ? 'Get ready' : String(n);
      speakThenAdvance(text, { interrupt: true }, 1000, () => { n--; step(); });
    } else {
      setCountdownDisplay('GO!', '');
      playMilestone();
      speakThenAdvance('Go!', { rate: 1.1, pitch: 1.2, interrupt: true }, 700, onDone);
    }
  }
  step();
}

function setCountdownDisplay(num, label) {
  const isGo = num === 'GO!';
  quizStage.innerHTML = `
    <div class="countdown-screen">
      <div class="countdown-ring-wrap">
        <svg class="countdown-ring" viewBox="0 0 120 120">
          <circle class="ring-track" cx="60" cy="60" r="52"/>
          <circle class="ring-fill ${isGo ? 'ring-go' : ''}" cx="60" cy="60" r="52"
            style="animation-duration: ${isGo ? '0.4s' : '1s'}"/>
        </svg>
        <div class="countdown-num ${isGo ? 'go' : ''}">${num}</div>
      </div>
      ${label ? `<div class="countdown-label">${label}</div>` : ''}
    </div>`;
}

// ===== MILESTONE =====
function showMilestone(m) {
  playMilestone();
  speak(m.headline + '. ' + m.sub, { rate: 0.95 });
  quizStage.innerHTML = `
    <div class="milestone-screen">
      <div class="game-bg strong"></div>
      <div class="milestone-headline">${m.headline}</div>
      <div class="milestone-sub">${m.sub}</div>
    </div>`;
  gameTimeout(_onShowQuestion, 2000);
}

// ===== RESULTS =====
function getRank(s) {
  if (s <= 15) return { label: 'Geography Rookie',      color: '#64b5f6' };
  if (s <= 30) return { label: 'Flag Explorer',         color: '#81c784' };
  if (s <= 42) return { label: 'Flag Expert',           color: '#ffb74d' };
  if (s <= 48) return { label: 'Master Vexillologist',  color: '#ff7043' };
  return           { label: 'BIG BRAIN CERTIFIED',      color: '#ffd600' };
}

function showResults() {
  playGameOver();
  const rank = getRank(score);
  speak(`Round complete! You scored ${score} out of ${ROUND_SIZE}. ${rank.label}!`, { rate: 0.95, interrupt: true });
  quizStage.innerHTML = `
    <div class="result-screen">
      <div class="game-bg strong"></div>
      <div class="result-title">Round Complete!</div>
      <div class="result-score">${score}<span class="result-total"> / ${ROUND_SIZE}</span></div>
      <div class="result-rank" style="color:${rank.color}">${rank.label}</div>
      <button class="btn primary result-btn" id="play-again">Play Again</button>
    </div>`;
  document.getElementById('play-again').addEventListener('click', () => {
    if (_onRestart) _onRestart();
  });
}
