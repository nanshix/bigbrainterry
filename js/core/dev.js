// Dev backdoor — only injected on localhost
// Buttons: ? (log bug), 👍 (merit +1), 👎 (merit -1)

import { getRound, getIdx } from './engine.js';

const API = 'http://localhost:3000';

function currentQuestion() {
  const round = getRound();
  if (!round) return null;
  return round[getIdx()] ?? null;
}

function flyEmoji(emoji) {
  const el = document.createElement('div');
  el.className = 'dev-fly-emoji';
  el.textContent = emoji;
  document.getElementById('quiz-frame').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

async function postApi(endpoint, body) {
  try {
    const r = await fetch(`${API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.ok;
  } catch {
    return false;
  }
}

function getGameId() {
  const frame = document.getElementById('quiz-frame');
  return frame?.getAttribute('data-game') ?? 'unknown';
}

function getQuestionId() {
  const q = currentQuestion();
  if (!q) return 'unknown';
  return q.code ?? q.id ?? q.breed_name ?? q.capital ?? q.city ?? 'unknown';
}

export function initDevTools() {
  if (location.hostname !== 'localhost') return;

  const existing = document.getElementById('dev-hud');
  if (existing) existing.remove();

  const hud = document.createElement('div');
  hud.id = 'dev-hud';
  hud.innerHTML = `
    <button class="dev-btn" id="dev-bug"  title="Log bug">?</button>
    <button class="dev-btn" id="dev-up"   title="Merit +1">👍</button>
    <button class="dev-btn" id="dev-down" title="Merit -1">👎</button>
  `;
  document.getElementById('quiz-frame').appendChild(hud);

  document.getElementById('dev-bug').addEventListener('click', async () => {
    const note = prompt('Bug note (optional):') ?? '';
    const ok = await postApi('/api/bug', {
      gameId:     getGameId(),
      questionId: getQuestionId(),
      note,
    });
    flyEmoji(ok ? '🐛' : '❌');
  });

  document.getElementById('dev-up').addEventListener('click', async () => {
    const ok = await postApi('/api/merit', {
      gameId:     getGameId(),
      questionId: getQuestionId(),
      delta: 1,
    });
    flyEmoji(ok ? '👍' : '❌');
  });

  document.getElementById('dev-down').addEventListener('click', async () => {
    const ok = await postApi('/api/merit', {
      gameId:     getGameId(),
      questionId: getQuestionId(),
      delta: -1,
    });
    flyEmoji(ok ? '👎' : '❌');
  });
}
