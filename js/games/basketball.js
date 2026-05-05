import { shuffle, injectCrack } from '../utils.js';
import { playTick, playUrgent, playReveal, playCorrect } from '../core/audio.js';
import { speak } from '../core/speech.js';
import { loadGameConfig } from '../core/config.js';
import {
  REVEAL_TIME,
  startGame, addScore, addNoAnswer, advanceGame,
  startTimer, stopTimer, speakThenAdvance,
  getIdx, getRound, getScore, getQuestionTime,
} from '../core/engine.js';

const BBALL_SVG = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="16" fill="#c8581a" stroke="#5c2a00" stroke-width="2"/>
  <path d="M4,20 Q12,13 20,20 Q28,27 36,20" stroke="#5c2a00" stroke-width="1.5" fill="none"/>
  <path d="M20,4 Q13,12 20,20 Q27,28 20,36" stroke="#5c2a00" stroke-width="1.5" fill="none"/>
  <path d="M8.5,10 Q14,14 14,20 Q14,26 8.5,30" stroke="#5c2a00" stroke-width="1" fill="none"/>
  <path d="M31.5,10 Q26,14 26,20 Q26,26 31.5,30" stroke="#5c2a00" stroke-width="1" fill="none"/>
</svg>`;

const THROW_DIRS = ['tl', 'tr', 'bl', 'br'];

// ===== DATA LOADING =====
async function loadPlayers() {
  const res  = await fetch('assets/p_basketball/full/');
  const html = await res.text();
  const matches = [...html.matchAll(/href="([^"]+\.jpg)"/gi)];
  return matches.map(m => m[1]);
}

function nameFromFile(filename) {
  const base  = filename.replace(/\.[^.]+$/, '');
  const parts = base.split('-');
  if (/^\d{4}$/.test(parts[parts.length - 1])) parts.pop();
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// ===== ROUND / QUESTION BUILDERS =====
function buildRound(players, roundSize) {
  return shuffle([...players]).slice(0, roundSize);
}

function buildQuestion(file, allPlayers) {
  const type   = Math.random() < 0.5 ? 'qpat' : 'qtap';
  const answer = nameFromFile(file);
  const pool   = allPlayers.filter(f => f !== file);
  const wrongs = shuffle(pool).slice(0, 3);

  if (type === 'qpat') {
    // photo shown, pick the name
    const choices    = shuffle([answer, ...wrongs.map(nameFromFile)]);
    const correctIdx = choices.indexOf(answer);
    return { file, answer, type, choices, correctIdx };
  } else {
    // name shown, pick the photo
    const choiceFiles = shuffle([file, ...wrongs]);
    const correctIdx  = choiceFiles.indexOf(file);
    return { file, answer, type, choices: choiceFiles, correctIdx };
  }
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q      = getRound()[getIdx()];
  const n      = getIdx() + 1;
  const labels = ['A', 'B', 'C', 'D'];
  const quizStage = document.getElementById('quiz-stage');

  const scrollCorners = `
    <span class="scroll-corner tl">${BBALL_SVG}</span>
    <span class="scroll-corner tr">${BBALL_SVG}</span>
    <span class="scroll-corner bl">${BBALL_SVG}</span>
    <span class="scroll-corner br">${BBALL_SVG}</span>`;

  const leftPanel = `<div class="game-split-left">
    <div class="bball-split-icon">${BBALL_SVG}</div>
    <div class="game-split-label">Basketball Stars</div>
  </div>`;

  const rightPanel = q.type === 'qpat'
    ? `<div class="game-split-right">
        <div class="bball-photo-wrap">
          <img src="assets/p_basketball/full/${q.file}" class="bball-photo" alt="Basketball player" />
        </div>
        <div class="name-choices">
          ${q.choices.map((name, i) => `
            <button class="name-choice" data-idx="${i}">
              <span class="choice-badge">${labels[i]}</span>
              <span class="choice-name">${name}</span>
            </button>`).join('')}
        </div>
      </div>`
    : `<div class="game-split-right">
        <div class="q-header bball-qtap-header">
          <div class="q-label">Which player is...</div>
          <div class="q-country-name${q.answer.length > 16 ? ' flags-ctf-name--long' : ''}">${q.answer}</div>
        </div>
        <div class="bball-photo-choices">
          ${q.choices.map((f, i) => `
            <button class="bball-photo-choice" data-idx="${i}" data-throw="${THROW_DIRS[i]}">
              <img src="assets/p_basketball/full/${f}" class="bball-choice-img" alt="Basketball player" />
              <span class="choice-badge">${labels[i]}</span>
            </button>`).join('')}
        </div>
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
            ${rightPanel}
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

  const spoken = q.type === 'qpat'
    ? 'Who is this basketball player?'
    : `Which player is ${q.answer}?`;
  speak(spoken, { rate: 1.05 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `${n}! One of the all-time greats!`,
  n => `That's ${n}! A legend of the hardwood!`,
  n => `${n}! File that one away!`,
  n => `Tricky one! That was ${n}!`,
  n => `${n}! Now you'll never forget that face!`,
  n => `That's ${n}! A name every basketball fan should know!`,
];

function doReveal(selectedIdx) {
  const q        = getRound()[getIdx()];
  const correct  = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const phrase     = GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](q.answer);
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

// ===== MILESTONES & RANK =====
const BBALL_MILESTONES = {
  10: {
    headline: 'FIRST QUARTER',
    sub: 'Ball is moving',
    voice: 'First quarter done! The legends get harder from here.',
  },
  25: {
    headline: 'HALFTIME',
    sub: 'Stay with it',
    voice: 'Halftime! Twenty-five down, twenty-five to go. These players are getting tougher to name!',
  },
  40: {
    headline: 'FOURTH QUARTER',
    sub: 'Final ten',
    voice: 'Fourth quarter! Ten questions left. These are the true legends. Can you name them all?',
  },
};

function getBasketballRank(s) {
  if (s <= 5)  return { label: 'Benchwarmer',   color: '#a0c4ff' };
  if (s <= 10) return { label: 'Role Player',   color: '#81c784' };
  if (s <= 16) return { label: 'Starter',       color: '#ffb74d' };
  if (s <= 21) return { label: 'All-Star',      color: '#ff7043' };
  if (s <= 25) return { label: 'All-NBA',       color: '#ce93d8' };
  if (s <= 28) return { label: 'Hall of Famer', color: '#ff8f00' };
  return             { label: 'G.O.A.T.',       color: '#ffd600' };
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  const [allPlayers, cfg] = await Promise.all([loadPlayers(), loadGameConfig('basketball')]);

  const roundSize = cfg.roundSize || 50;

  function restart() {
    const round = buildRound(allPlayers, roundSize).map(f => buildQuestion(f, allPlayers));
    startGame(round, showQuestion, restart, { ...cfg, milestones: BBALL_MILESTONES, getRank: getBasketballRank });
  }

  const round = buildRound(allPlayers, roundSize).map(f => buildQuestion(f, allPlayers));
  startGame(round, showQuestion, restart, { ...cfg, milestones: BBALL_MILESTONES, getRank: getBasketballRank });
}
