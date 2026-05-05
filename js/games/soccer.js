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

const SOCCER_SVG = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="16" fill="white" stroke="#1a1a1a" stroke-width="2"/>
  <polygon points="20,11 23,16 20,20 17,16" fill="#1a1a1a"/>
  <polygon points="29,14 29,20 24,21 22,17" fill="#1a1a1a"/>
  <polygon points="26,27 21,26 20,20 24,18" fill="#1a1a1a"/>
  <polygon points="14,27 16,22 20,20 19,26" fill="#1a1a1a"/>
  <polygon points="11,14 16,17 18,21 13,21" fill="#1a1a1a"/>
  <circle cx="20" cy="20" r="3" fill="white"/>
</svg>`;

const THROW_DIRS = ['tl', 'tr', 'bl', 'br'];

// ===== DATA LOADING =====
async function loadPlayers() {
  const res  = await fetch('assets/p_soccer/full/');
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
  return shuffle([...players]).slice(0, Math.min(roundSize, players.length));
}

function buildQuestion(file, allPlayers) {
  const type   = Math.random() < 0.5 ? 'qpat' : 'qtap';
  const answer = nameFromFile(file);
  const pool   = allPlayers.filter(f => f !== file);
  const wrongs = shuffle(pool).slice(0, 3);

  if (type === 'qpat') {
    const choices    = shuffle([answer, ...wrongs.map(nameFromFile)]);
    const correctIdx = choices.indexOf(answer);
    return { file, answer, type, choices, correctIdx };
  } else {
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
    <span class="scroll-corner tl">${SOCCER_SVG}</span>
    <span class="scroll-corner tr">${SOCCER_SVG}</span>
    <span class="scroll-corner bl">${SOCCER_SVG}</span>
    <span class="scroll-corner br">${SOCCER_SVG}</span>`;

  const leftPanel = `<div class="game-split-left">
    <div class="soccer-split-icon">${SOCCER_SVG}</div>
    <div class="game-split-label">Soccer Stars</div>
  </div>`;

  const rightPanel = q.type === 'qpat'
    ? `<div class="game-split-right">
        <div class="soccer-photo-wrap">
          <img src="assets/p_soccer/full/${q.file}" class="soccer-photo" alt="Soccer player" />
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
        <div class="q-header soccer-qtap-header">
          <div class="q-label">Which player is...</div>
          <div class="q-country-name${q.answer.length > 16 ? ' flags-ctf-name--long' : ''}">${q.answer}</div>
        </div>
        <div class="soccer-photo-choices">
          ${q.choices.map((f, i) => `
            <button class="soccer-photo-choice" data-idx="${i}" data-throw="${THROW_DIRS[i]}">
              <img src="assets/p_soccer/full/${f}" class="soccer-choice-img" alt="Soccer player" />
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
    ? 'Who is this soccer player?'
    : `Which player is ${q.answer}?`;
  speak(spoken, { rate: 1.05 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `${n}! One of the beautiful game's finest!`,
  n => `That's ${n}! A world-class talent!`,
  n => `${n}! File that face away!`,
  n => `Tricky one! That was ${n}!`,
  n => `${n}! Now you'll never forget that face!`,
  n => `That's ${n}! A name every football fan should know!`,
  n => `${n}! Absolutely world class!`,
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
const SOCCER_MILESTONES = {
  10: {
    headline: 'FIRST HALF UNDERWAY',
    sub: 'The pitch is heating up',
    voice: 'Ten down! The lesser-known stars are coming. Stay sharp!',
  },
  25: {
    headline: 'HALF TIME',
    sub: 'Back in the dressing room',
    voice: 'Half time! Twenty-five down, twenty-five to go. How well do you really know the beautiful game?',
  },
  40: {
    headline: 'FINAL WHISTLE INCOMING',
    sub: 'Ten minutes of stoppage time',
    voice: 'Ten questions left! These are the trickiest faces on the pitch. Finish strong!',
  },
};

function getSoccerRank(s) {
  if (s <= 7)  return { label: 'Sunday Kickabout', color: '#a0c4ff' };
  if (s <= 15) return { label: 'Amateur',          color: '#81c784' };
  if (s <= 24) return { label: 'Semi-Pro',         color: '#ffb74d' };
  if (s <= 32) return { label: 'Professional',     color: '#ff7043' };
  if (s <= 39) return { label: 'International',    color: '#ce93d8' };
  if (s <= 46) return { label: 'World Class',      color: '#ff8f00' };
  return             { label: 'Ballon d\'Or',      color: '#ffd600' };
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  const [allPlayers, cfg] = await Promise.all([loadPlayers(), loadGameConfig('soccer')]);

  const roundSize = cfg.roundSize || 50;

  function restart() {
    const round = buildRound(allPlayers, roundSize).map(f => buildQuestion(f, allPlayers));
    startGame(round, showQuestion, restart, { ...cfg, milestones: SOCCER_MILESTONES, getRank: getSoccerRank });
  }

  if (allPlayers.length === 0) {
    document.getElementById('quiz-stage').innerHTML =
      `<div class="game-screen" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem">
         <p style="color:white;font-size:1.1rem;text-align:center;padding:2rem;line-height:1.6">
           No player images found.<br>
           Run first: <code style="background:rgba(0,0,0,0.4);padding:0.2em 0.5em;border-radius:4px">python scripts/download_soccer.py</code>
         </p>
       </div>`;
    return;
  }

  const round = buildRound(allPlayers, roundSize).map(f => buildQuestion(f, allPlayers));
  startGame(round, showQuestion, restart, { ...cfg, milestones: SOCCER_MILESTONES, getRank: getSoccerRank });
}
