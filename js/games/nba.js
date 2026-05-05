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

const NBA_SVG = `<svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="28" height="36" rx="3" fill="#c8581a"/>
  <rect x="6" y="4" width="28" height="36" rx="3" stroke="#1a3a8a" stroke-width="2.5"/>
  <ellipse cx="20" cy="22" rx="10" ry="13" fill="none" stroke="white" stroke-width="1.5"/>
  <line x1="6" y1="22" x2="34" y2="22" stroke="white" stroke-width="1.5"/>
  <circle cx="20" cy="44" r="4" fill="#1a3a8a"/>
  <line x1="20" y1="40" x2="20" y2="33" stroke="#1a3a8a" stroke-width="2"/>
</svg>`;

const THROW_DIRS = ['tl', 'tr', 'bl', 'br'];

// ===== DATA LOADING =====
async function loadTeams() {
  const res  = await fetch('assets/p_nba/full/');
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
function buildRound(teams, roundSize) {
  return shuffle([...teams]).slice(0, Math.min(roundSize, teams.length));
}

function buildQuestion(file, allTeams) {
  const type   = Math.random() < 0.5 ? 'qpat' : 'qtap';
  const answer = nameFromFile(file);
  const pool   = allTeams.filter(f => f !== file);
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
    <span class="scroll-corner tl">${NBA_SVG}</span>
    <span class="scroll-corner tr">${NBA_SVG}</span>
    <span class="scroll-corner bl">${NBA_SVG}</span>
    <span class="scroll-corner br">${NBA_SVG}</span>`;

  const leftPanel = `<div class="game-split-left">
    <div class="nba-split-icon">${NBA_SVG}</div>
    <div class="game-split-label">NBA Teams</div>
  </div>`;

  const rightPanel = q.type === 'qpat'
    ? `<div class="game-split-right">
        <div class="nba-logo-wrap">
          <img src="assets/p_nba/full/${q.file}" class="nba-logo" alt="NBA team logo" />
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
        <div class="q-header nba-qtap-header">
          <div class="q-label">Which logo belongs to...</div>
          <div class="q-country-name${q.answer.length > 16 ? ' flags-ctf-name--long' : ''}">${q.answer}</div>
        </div>
        <div class="nba-logo-choices">
          ${q.choices.map((f, i) => `
            <button class="nba-logo-choice" data-idx="${i}" data-throw="${THROW_DIRS[i]}">
              <img src="assets/p_nba/full/${f}" class="nba-choice-img" alt="NBA team logo" />
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
    ? 'Which NBA team is this?'
    : `Which logo belongs to the ${q.answer}?`;
  speak(spoken, { rate: 1.05 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `${n}! One of the thirty franchises!`,
  n => `That's the ${n}! Know your teams!`,
  n => `${n}! File that logo away!`,
  n => `Tricky one! That was the ${n}!`,
  n => `${n}! Now you'll never forget that logo!`,
  n => `That's the ${n}! A name every basketball fan should know!`,
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
const NBA_MILESTONES = {
  10: {
    headline: 'FIRST QUARTER',
    sub: 'Know your logos',
    voice: 'Ten down! The lesser-known franchises are coming up. Stay sharp!',
  },
  15: {
    headline: 'HALFTIME',
    sub: 'Halfway through the league',
    voice: 'Halftime! Fifteen teams down, fifteen to go. How well do you really know the NBA?',
  },
  25: {
    headline: 'FOURTH QUARTER',
    sub: 'Final five',
    voice: 'Fourth quarter! Five logos left. These are the trickiest ones. Finish strong!',
  },
};

function getNbaRank(s) {
  const total = getRound().length;
  const pct   = s / total;
  if (pct < 0.20) return { label: 'Casual Fan',     color: '#a0c4ff' };
  if (pct < 0.40) return { label: 'Season Ticket',  color: '#81c784' };
  if (pct < 0.55) return { label: 'Superfan',       color: '#ffb74d' };
  if (pct < 0.70) return { label: 'ESPN Analyst',   color: '#ff7043' };
  if (pct < 0.83) return { label: 'Scout',          color: '#ce93d8' };
  if (pct < 0.94) return { label: 'GM Material',    color: '#ff8f00' };
  return               { label: 'Commissioner',     color: '#ffd600' };
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  const [allTeams, cfg] = await Promise.all([loadTeams(), loadGameConfig('nba')]);

  const roundSize = cfg.roundSize || 50;

  function restart() {
    const round = buildRound(allTeams, roundSize).map(f => buildQuestion(f, allTeams));
    startGame(round, showQuestion, restart, { ...cfg, milestones: NBA_MILESTONES, getRank: getNbaRank });
  }

  const round = buildRound(allTeams, roundSize).map(f => buildQuestion(f, allTeams));
  startGame(round, showQuestion, restart, { ...cfg, milestones: NBA_MILESTONES, getRank: getNbaRank });
}
