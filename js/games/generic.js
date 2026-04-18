// Generic game engine — plays any CSV with columns:
//   id, question, answer, wrong1, wrong2, wrong3, difficulty, reveal
// difficulty 1/2/3 triggers tiered buildRound (10/20/10);
// omit or set all to 1 to just shuffle all rows.

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

const GENERIC_MILESTONES = {
  10: {
    headline: 'LEVEL UP',
    sub: 'Getting harder from here',
    voice: 'Ten down! The medium questions are next. Stay sharp!',
  },
  25: {
    headline: 'HALFWAY THERE',
    sub: 'Final 25 — keep going',
    voice: 'Halfway! The hardest questions are coming. You can do this!',
  },
  40: {
    headline: 'THE FINAL TEN',
    sub: 'Almost there',
    voice: 'Final ten! Can you finish strong?',
  },
};

function getGenericRank(s) {
  if (s <= 9)  return { label: 'Beginner',       color: '#a0c4ff' };
  if (s <= 19) return { label: 'Learner',         color: '#81c784' };
  if (s <= 29) return { label: 'Practitioner',    color: '#ffb74d' };
  if (s <= 37) return { label: 'Expert',          color: '#ff7043' };
  if (s <= 42) return { label: 'Champion',        color: '#ce93d8' };
  if (s <= 47) return { label: 'Master',          color: '#ff8f00' };
  return             { label: 'Grand Champion',   color: '#ffd600' };
}

async function loadQuestions(gameId) {
  const res  = await fetch(`questions/${gameId}.csv`);
  const text = await res.text();
  return parseCSV(text);
}

function buildRound(rows) {
  const hasTiers = rows.some(r => r.difficulty === '2' || r.difficulty === '3');
  if (!hasTiers) {
    return shuffle(rows).slice(0, 40);
  }
  const t1 = shuffle(rows.filter(r => r.difficulty === '1'));
  const t2 = shuffle(rows.filter(r => r.difficulty === '2'));
  const t3 = shuffle(rows.filter(r => r.difficulty === '3'));
  return [...t1.slice(0, 10), ...t2.slice(0, 20), ...t3.slice(0, 10)];
}

function buildQuestion(row) {
  const choices = shuffle([row.answer, row.wrong1, row.wrong2, row.wrong3]);
  return {
    question:   row.question,
    answer:     row.answer,
    correctIdx: choices.indexOf(row.answer),
    choices,
    reveal:     row.reveal,
  };
}

function showQuestion(gameIcon) {
  const q         = getRound()[getIdx()];
  const n         = getIdx() + 1;
  const quizStage = document.getElementById('quiz-stage');
  const labels    = ['A', 'B', 'C', 'D'];

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
          <div class="game-split">
            <div class="game-split-left">
              <div class="gen-split-icon">${gameIcon}</div>
            </div>
            <div class="game-split-right">
              <div class="gen-q-wrap">
                <div class="q-label">What is the answer?</div>
                <div class="gen-question">${q.question}</div>
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

  speak(q.question, { rate: 1.0 });

  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

const FALLBACK_REVEALS = [
  a => `The answer is ${a}!`,
  a => `${a}! Remember that one!`,
  a => `Don't worry — now you know! It was ${a}!`,
  a => `Tricky one! But the answer was ${a}!`,
];

function doReveal(selectedIdx) {
  const q        = getRound()[getIdx()];
  const correct  = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const fallback   = FALLBACK_REVEALS[Math.floor(Math.random() * FALLBACK_REVEALS.length)](q.answer);
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

export async function launch(gameId, gameName, gameIcon) {
  document.getElementById('quiz-frame').setAttribute('data-game', 'generic');

  const [questions, cfg] = await Promise.all([
    loadQuestions(gameId),
    loadGameConfig(gameId),
  ]);

  const show = () => showQuestion(gameIcon);

  function restart() {
    const round = buildRound(questions).map(r => buildQuestion(r));
    startGame(round, show, restart, {
      ...cfg,
      milestones: GENERIC_MILESTONES,
      getRank: getGenericRank,
    });
  }

  const round = buildRound(questions).map(r => buildQuestion(r));
  startGame(round, show, restart, {
    ...cfg,
    milestones: GENERIC_MILESTONES,
    getRank: getGenericRank,
  });
}
