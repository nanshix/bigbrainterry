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

const AFL_SVG = `<svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="20" cy="25" rx="11" ry="17" fill="#b85a10" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="20" y1="9"  x2="20" y2="41" stroke="white" stroke-width="1.5"/>
  <line x1="17" y1="21" x2="23" y2="21" stroke="white" stroke-width="1.2"/>
  <line x1="16" y1="25" x2="24" y2="25" stroke="white" stroke-width="1.2"/>
  <line x1="17" y1="29" x2="23" y2="29" stroke="white" stroke-width="1.2"/>
</svg>`;

const THROW_DIRS = ['tl', 'tr', 'bl', 'br'];

// ===== DATA LOADING =====
async function loadTeams() {
  const res  = await fetch('assets/p_afl/full/');
  const html = await res.text();
  const matches = [...html.matchAll(/href="([^"]+\.(?:jpg|png|webp))"/gi)];
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
    <span class="scroll-corner tl">${AFL_SVG}</span>
    <span class="scroll-corner tr">${AFL_SVG}</span>
    <span class="scroll-corner bl">${AFL_SVG}</span>
    <span class="scroll-corner br">${AFL_SVG}</span>`;

  const leftPanel = `<div class="game-split-left">
    <div class="afl-split-icon">${AFL_SVG}</div>
    <div class="game-split-label">AFL Teams</div>
  </div>`;

  const rightPanel = q.type === 'qpat'
    ? `<div class="game-split-right">
        <div class="afl-logo-wrap">
          <img src="assets/p_afl/full/${q.file}" class="afl-logo" alt="AFL team logo" />
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
        <div class="q-header afl-qtap-header">
          <div class="q-label">Which guernsey belongs to...</div>
          <div class="q-country-name${q.answer.length > 16 ? ' flags-ctf-name--long' : ''}">${q.answer}</div>
        </div>
        <div class="afl-logo-choices">
          ${q.choices.map((f, i) => `
            <button class="afl-logo-choice" data-idx="${i}" data-throw="${THROW_DIRS[i]}">
              <img src="assets/p_afl/full/${f}" class="afl-choice-img" alt="AFL team logo" />
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
    ? 'Which AFL team is this?'
    : `Which guernsey belongs to the ${q.answer}?`;
  speak(spoken, { rate: 1.05 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `${n}! Get around them!`,
  n => `That's the ${n}! Footy knowledge right there!`,
  n => `${n}! Now you'll never forget that guernsey!`,
  n => `Tricky one! That was the ${n}!`,
  n => `${n}! File that badge away!`,
  n => `That's the ${n}! A proud footy club!`,
  n => `${n}! Every true footy fan knows that one!`,
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
const AFL_MILESTONES = {
  6: {
    headline: 'FIRST QUARTER',
    sub:      'Six teams down',
    voice:    'Six down! The less obvious guernseys are on their way. Stay sharp!',
  },
  12: {
    headline: 'THREE QUARTER TIME',
    sub:      'Two thirds through the competition',
    voice:    'Three quarter time! A dozen clubs down, six to go. How well do you really know the AFL?',
  },
  16: {
    headline: 'FINAL SIREN SOON',
    sub:      'Last two clubs standing',
    voice:    'Almost there! Two clubs left. Finish strong and make every true footy fan proud!',
  },
};

function getAflRank(s) {
  const total = getRound().length;
  const pct   = s / total;
  if (pct < 0.20) return { label: 'Couch Watcher',   color: '#a0c4ff' };
  if (pct < 0.40) return { label: 'Footy Fan',        color: '#81c784' };
  if (pct < 0.55) return { label: 'Club Member',      color: '#ffb74d' };
  if (pct < 0.70) return { label: 'Die-Hard',         color: '#ff7043' };
  if (pct < 0.83) return { label: 'Outer Wingman',    color: '#ce93d8' };
  if (pct < 0.94) return { label: 'Full Forward',     color: '#ff8f00' };
  return               { label: 'AFL Legend',         color: '#ffd600' };
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  const [allTeams, cfg] = await Promise.all([loadTeams(), loadGameConfig('afl')]);

  const roundSize = cfg.roundSize || allTeams.length;

  function restart() {
    const round = buildRound(allTeams, roundSize).map(f => buildQuestion(f, allTeams));
    startGame(round, showQuestion, restart, { ...cfg, milestones: AFL_MILESTONES, getRank: getAflRank });
  }

  const round = buildRound(allTeams, roundSize).map(f => buildQuestion(f, allTeams));
  startGame(round, showQuestion, restart, { ...cfg, milestones: AFL_MILESTONES, getRank: getAflRank });
}
