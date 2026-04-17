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
let noAnswerCount = 0;
let timerInterval = null;
let timeLeft     = QUESTION_TIME;
let lastTickSec  = QUESTION_TIME;
let pendingTimeouts = [];
let _onShowQuestion = null;
let _onRestart = null;
let _config = {};

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

// Advances only after BOTH speech ends AND minMs elapsed.
// Safety fallback: if onend never fires (common on mobile), proceed after minMs + 4s.
export function speakThenAdvance(text, opts, minMs, callback) {
  let done = false;
  function proceed() { if (done) return; done = true; callback(); }
  let speechDone = false;
  let timerDone  = false;
  function maybeGo() { if (speechDone && timerDone) proceed(); }
  speak(text, { ...opts, onend: () => { speechDone = true; maybeGo(); } });
  gameTimeout(() => { timerDone = true; maybeGo(); }, minMs);
  gameTimeout(() => { speechDone = true; maybeGo(); }, minMs + 4000);
}

// onRestart: called by "Play Again" — should rebuild a fresh round and call startGame again
// config: optional { milestones, getRank } to override defaults per game
export function startGame(roundData, onShowQuestion, onRestart, config = {}) {
  _onShowQuestion = onShowQuestion;
  _onRestart = onRestart || null;
  _config = config;
  score = 0; currentIdx = 0; noAnswerCount = 0; round = roundData;
  doCountdown(() => _onShowQuestion());
}

export function addNoAnswer() { noAnswerCount++; }

export function addScore() {
  score++;
  const s = document.querySelector('.hud-score');
  if (s) s.textContent = score + ' pts';
}

export function getQuestionTime() { return _config.questionTime ?? QUESTION_TIME; }

export function startTimer(onTick, onTimeout) {
  clearInterval(timerInterval);
  const qTime  = getQuestionTime();
  timeLeft    = qTime;
  lastTickSec = qTime;

  timerInterval = setInterval(() => {
    timeLeft = Math.max(timeLeft - 0.1, 0);

    const fill    = document.getElementById('timer-fill');
    const counter = document.getElementById('timer-counter');
    if (fill) {
      fill.style.width = (timeLeft / qTime * 100) + '%';
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
  const milestoneMap = _config.milestones || MILESTONES;
  const milestone = milestoneMap[currentIdx];
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
  document.getElementById('quiz-frame').removeAttribute('data-game');
  _config = {};
}

// ===== COUNTDOWN =====
function doCountdown(onDone) {
  let n = 5;
  function step() {
    if (n > 0) {
      setCountdownDisplay(n, n === 5 ? 'Get Ready!' : '');
      playTick();
      // Fire-and-forget — timer drives the pace, speech plays alongside.
      // "Get ready" gets 1600ms (two words), numbers get 1200ms (single word).
      const text = n === 5 ? 'Get ready' : String(n);
      const wait = n === 5 ? 1600 : 1200;
      speak(text, { interrupt: true });
      gameTimeout(() => { n--; step(); }, wait);
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
  speak(m.voice || (m.headline + '. ' + m.sub), { rate: 0.95 });
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
  const isRecording = noAnswerCount >= ROUND_SIZE * 0.7;
  const rankFn = _config.getRank || getRank;
  const rank = rankFn(score);

  if (isRecording) {
    speak(`How did you go at home? Drop your score in the comments!`, { rate: 0.95, interrupt: true });
    quizStage.innerHTML = `
      <div class="result-screen">
        <div class="game-bg strong"></div>
        <div class="result-title">How did YOU go?</div>
        <div class="result-score" style="font-size:clamp(1.8rem,5vw,3.2rem);letter-spacing:0.02em">Drop your score<br>in the comments!</div>
        <div class="result-rank" style="color:var(--gs-accent)">👇 Comment below 👇</div>
        <button class="btn primary result-btn" id="play-again">Play Again</button>
      </div>`;
  } else {
    speak(`Round complete! You scored ${score} out of ${ROUND_SIZE}. ${rank.label}!`, { rate: 0.95, interrupt: true });
    quizStage.innerHTML = `
      <div class="result-screen">
        <div class="game-bg strong"></div>
        <div class="result-title">Round Complete!</div>
        <div class="result-score">${score}<span class="result-total"> / ${ROUND_SIZE}</span></div>
        <div class="result-rank" style="color:${rank.color}">${rank.label}</div>
        <button class="btn primary result-btn" id="play-again">Play Again</button>
      </div>`;
  }
  document.getElementById('play-again').addEventListener('click', () => {
    if (_onRestart) _onRestart();
  });
}
