import { parseCSV } from './utils.js';
import { closeQuiz } from './core/engine.js';
import { launch as launchFlags } from './games/flags.js';

// ===== MANIFEST =====
async function loadManifest() {
  const res = await fetch('questions/manifest.csv');
  const text = await res.text();
  return parseCSV(text).map(r => ({
    id:        r.id,
    name:      r.name,
    icon:      r.icon,
    locked:    r.locked === 'true',
    desc:      r.desc,
    files:     r.files,
    available: r.locked !== 'true',
  }));
}

// ===== GAME LAUNCHERS =====
const LAUNCHERS = {
  flags: launchFlags,
};

// ===== STATE =====
let categories    = [];
let selectedCat   = 'flags';
let shuffleMode   = true;

// ===== HOMEPAGE UI =====
function renderCategories() {
  const catRow = document.getElementById('cat-row');
  catRow.innerHTML = categories.map(cat => {
    const active = !shuffleMode && selectedCat === cat.id;
    const cls = ['cat-icon', cat.available ? (active ? 'active' : '') : 'locked']
      .filter(Boolean).join(' ');
    const tooltip = cat.available ? `${cat.name} — ${cat.desc}` : `${cat.name} — coming soon`;
    return `<button class="${cls}" data-cat="${cat.id}" aria-label="${tooltip}" ${!cat.available ? 'disabled' : ''}>
      <span class="cat-emoji">${cat.icon}</span>
      <span class="cat-tooltip">${tooltip}</span>
    </button>`;
  }).join('');

  catRow.classList.toggle('shuffle-on', shuffleMode);

  catRow.querySelectorAll('.cat-icon:not(.locked)').forEach(el => {
    el.addEventListener('click', () => {
      if (shuffleMode) return;
      selectedCat = el.dataset.cat;
      renderCategories();
    });
  });
}

function renderShuffle() {
  const btn = document.getElementById('shuffle-btn');
  if (btn) btn.classList.toggle('active', shuffleMode);
  renderCategories();
}

// ===== OPEN QUIZ =====
async function openQuiz() {
  const available = categories.filter(c => c.available);
  const cat = shuffleMode
    ? available[Math.floor(Math.random() * available.length)]
    : categories.find(c => c.id === selectedCat);

  if (!cat || !LAUNCHERS[cat.id]) return;

  const modal = document.getElementById('quiz-modal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  await LAUNCHERS[cat.id]();
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ===== INIT =====
async function init() {
  try {
    categories = await loadManifest();
  } catch (e) {
    console.error('Failed to load manifest:', e);
    document.getElementById('cat-row').innerHTML =
      '<span style="color:rgba(255,100,100,0.8);font-size:0.75rem;padding:0.5rem">⚠ Serve over HTTP — file:// not supported</span>';
    return;
  }

  renderCategories();

  document.getElementById('start-btn').addEventListener('click', openQuiz);
  document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
  document.getElementById('shuffle-btn').addEventListener('click', () => {
    shuffleMode = !shuffleMode;
    renderShuffle();
  });

  document.addEventListener('keydown', e => {
    const modal = document.getElementById('quiz-modal');
    if (modal.classList.contains('hidden')) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); openQuiz(); }
    } else if (e.key === 'Escape') {
      closeQuiz();
    }
  });
}

init();
