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

const PAW_SVG = `<svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="22" cy="28" r="8" fill="#a68670" opacity="0.7"/>
  <circle cx="8"  cy="10" r="5" fill="#a68670" opacity="0.6"/>
  <circle cx="22" cy="4"  r="5" fill="#a68670" opacity="0.6"/>
  <circle cx="36" cy="10" r="5" fill="#a68670" opacity="0.6"/>
</svg>`;

// ===== CUSTOM CONFIG =====

const BREEDS_MILESTONES = {
  10: {
    headline: 'PAW PRINT',
    sub: 'The famous breeds are behind you — now the interesting ones begin',
    voice: "You're warming up! The famous breeds are behind you. Now the interesting ones begin.",
  },
  25: {
    headline: 'BREED EXPERT',
    sub: "You're learning breeds most people have never heard of",
    voice: "Halfway there! You're already identifying breeds most people have never heard of.",
  },
  40: {
    headline: 'KENNEL SPECIALIST',
    sub: 'Final ten — the rarest breeds on Earth',
    voice: 'Final ten! These are the rarest breeds on Earth. Prepare yourself!',
  },
};

function getBreedsRank(s) {
  if (s <= 9)  return { label: 'Puppy',            color: '#a0c4ff' };
  if (s <= 19) return { label: 'Dog Lover',        color: '#81c784' };
  if (s <= 29) return { label: 'Dog Enthusiast',   color: '#ffb74d' };
  if (s <= 37) return { label: 'Breed Expert',     color: '#ff7043' };
  if (s <= 42) return { label: 'Kennel Judge',     color: '#ce93d8' };
  if (s <= 47) return { label: 'Breed Specialist', color: '#ff8f00' };
  return             { label: 'Master Breeder',    color: '#ffd600' };
}

function _shortReveal(text) {
  const words = text.split(' ');
  if (words.length <= 10) return text;
  return words.slice(0, 10).join(' ').replace(/[,!?.]?$/, '!');
}

// ===== DATA LOADING =====
async function loadQuestions() {
  const res  = await fetch('questions/breeds.csv');
  const text = await res.text();
  return parseCSV(text).map(r => ({
    code:       r.code,
    breed_name: r.breed_name,
    d:          Number(r.difficulty),
    image_url:  r.image_url,
    type:       r.question_type,
    fact:       r.fact,
    reveal:     r.reveal,
  }));
}

// ===== ROUND BUILDER =====
// Enforces ~60/40 image/fact ratio across the 50-question round
function buildRound(questions) {
  const t1img  = shuffle(questions.filter(q => q.d === 1 && q.type === 'image'));
  const t1fact = shuffle(questions.filter(q => q.d === 1 && q.type === 'fact'));
  const t2img  = shuffle(questions.filter(q => q.d === 2 && q.type === 'image'));
  const t2fact = shuffle(questions.filter(q => q.d === 2 && q.type === 'fact'));
  const t3img  = shuffle(questions.filter(q => q.d === 3 && q.type === 'image'));
  const t3fact = shuffle(questions.filter(q => q.d === 3 && q.type === 'fact'));

  // Build each tier section maintaining ~60/40 image/fact split
  const tier1 = shuffle([...t1img.slice(0, 7),  ...t1fact.slice(0, 3)]).slice(0, 10);
  const tier2 = shuffle([...t2img.slice(0, 9),  ...t2fact.slice(0, 6)]).slice(0, 15);
  const tier3 = shuffle([...t3img.slice(0, 9),  ...t3fact.slice(0, 6)]).slice(0, 15);
  const tier3b = shuffle([...t3img.slice(9),    ...t3fact.slice(6)]).slice(0, 10);

  return [...tier1, ...tier2, ...tier3, ...tier3b].slice(0, 50);
}

// ===== QUESTION BUILDER =====
// Distractors generated dynamically from same-tier pool (breed names only)
function buildQuestion(entry, all) {
  const pool       = shuffle(all.filter(x => x.code !== entry.code && x.d === entry.d));
  const distractors = pool.slice(0, 3).map(x => x.breed_name);
  const choices    = shuffle([entry.breed_name, ...distractors]);
  return { ...entry, choices, correctIdx: choices.indexOf(entry.breed_name) };
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q      = getRound()[getIdx()];
  const n      = getIdx() + 1;
  const labels = ['A', 'B', 'C', 'D'];
  const quizStage = document.getElementById('quiz-stage');

  const scrollCorners = `
    <span class="scroll-corner tl">${PAW_SVG}</span>
    <span class="scroll-corner tr">${PAW_SVG}</span>
    <span class="scroll-corner bl">${PAW_SVG}</span>
    <span class="scroll-corner br">${PAW_SVG}</span>`;

  const leftPanel = `<div class="game-split-left">
    <div class="breeds-split-paw">${PAW_SVG}</div>
    <div class="game-split-label">Dog Breeds</div>
  </div>`;

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
            ${leftPanel}
            <div class="game-split-right">
              ${q.type === 'image'
                ? `<div class="breeds-img-wrap">
                     <img src="${q.image_url}" class="breed-img breed-appear" alt="Dog breed" />
                   </div>`
                : `<div class="q-header">
                     <div class="q-label">Which breed is this?</div>
                     <div class="q-country-name">${q.fact}</div>
                   </div>`}
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

  // Preload next question's image while player is answering this one
  const nextQ = getRound()[getIdx() + 1];
  if (nextQ?.image_url) { const _img = new Image(); _img.src = nextQ.image_url; }

  const spoken = q.type === 'image'
    ? 'What breed is this dog?'
    : q.fact;
  speak(spoken, { rate: q.type === 'image' ? 1.05 : 1.0 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
const GENERIC_REVEALS = [
  n => `${n}! A wonderful breed with a fascinating history!`,
  n => `That's the ${n}! File that one away!`,
  n => `${n}! Now you'll recognise them anywhere!`,
  n => `Tricky one! That was the ${n}!`,
];

function doReveal(selectedIdx) {
  const q       = getRound()[getIdx()];
  const correct = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const fallback   = GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](q.breed_name);
  const phrase     = _shortReveal(q.reveal || fallback);
  const revealText = correct ? `Correct! ${phrase}` : phrase;
  const revealOpts = correct ? { pitch: 1.2, interrupt: true } : { interrupt: true };

  if (correct) { addScore(); playCorrect(); } else { playReveal(); }

  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.disabled = true;
    const i = Number(btn.dataset.idx);
    if (i === q.correctIdx)     btn.classList.add('correct');
    else if (i === selectedIdx) btn.classList.add('wrong');
  });

  if (q.type === 'image') {
    const img = document.querySelector('.breed-img');
    if (img) img.classList.add('breed-correct');
  }

  speakThenAdvance(revealText, revealOpts, REVEAL_TIME, advanceGame);
}

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  document.getElementById('quiz-frame').setAttribute('data-game', 'breeds');

  const [questions, cfg] = await Promise.all([loadQuestions(), loadGameConfig('breeds')]);

  function restart() {
    const round = buildRound(questions).map(q => buildQuestion(q, questions));
    startGame(round, showQuestion, restart, { ...cfg, milestones: BREEDS_MILESTONES, getRank: getBreedsRank });
  }

  const round = buildRound(questions).map(q => buildQuestion(q, questions));
  startGame(round, showQuestion, restart, { ...cfg, milestones: BREEDS_MILESTONES, getRank: getBreedsRank });
}
