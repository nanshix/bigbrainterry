'use strict';

// ===== CATEGORIES =====
const CATEGORIES = [
  { id:'flags',   name:'Flag Rush',        emoji:'🏳️', desc:'50 flags · 3 difficulty tiers · 5s each', available:true },
  { id:'crusade', name:'Crusade History',  emoji:'⚔️', desc:'Medieval warfare & history',              available:false },
  { id:'cities',  name:'City Pictures',    emoji:'🌆', desc:'Identify famous cities from photos',       available:false },
];
let selectedCategory = 'flags';
let shuffleMode = true;

// ===== COUNTRY DATA =====
const COUNTRIES = [
  // d=1 easy (well-known globally)
  {name:'United States',code:'us',d:1},{name:'United Kingdom',code:'gb',d:1},
  {name:'France',code:'fr',d:1},{name:'Germany',code:'de',d:1},
  {name:'Italy',code:'it',d:1},{name:'Spain',code:'es',d:1},
  {name:'Japan',code:'jp',d:1},{name:'China',code:'cn',d:1},
  {name:'Brazil',code:'br',d:1},{name:'Canada',code:'ca',d:1},
  {name:'Australia',code:'au',d:1},{name:'Mexico',code:'mx',d:1},
  {name:'India',code:'in',d:1},{name:'Russia',code:'ru',d:1},
  {name:'South Korea',code:'kr',d:1},{name:'Nigeria',code:'ng',d:1},
  {name:'South Africa',code:'za',d:1},{name:'Egypt',code:'eg',d:1},
  {name:'Argentina',code:'ar',d:1},{name:'Turkey',code:'tr',d:1},
  {name:'Sweden',code:'se',d:1},{name:'Norway',code:'no',d:1},
  {name:'Denmark',code:'dk',d:1},{name:'Finland',code:'fi',d:1},
  {name:'Switzerland',code:'ch',d:1},{name:'Netherlands',code:'nl',d:1},
  {name:'Belgium',code:'be',d:1},{name:'Poland',code:'pl',d:1},
  {name:'Portugal',code:'pt',d:1},{name:'Greece',code:'gr',d:1},
  {name:'Ukraine',code:'ua',d:1},{name:'Thailand',code:'th',d:1},
  {name:'Vietnam',code:'vn',d:1},{name:'Indonesia',code:'id',d:1},
  {name:'Malaysia',code:'my',d:1},{name:'Philippines',code:'ph',d:1},
  {name:'Singapore',code:'sg',d:1},{name:'New Zealand',code:'nz',d:1},
  {name:'Saudi Arabia',code:'sa',d:1},{name:'UAE',code:'ae',d:1},
  {name:'Israel',code:'il',d:1},{name:'Iran',code:'ir',d:1},
  {name:'Pakistan',code:'pk',d:1},{name:'Bangladesh',code:'bd',d:1},
  {name:'Kenya',code:'ke',d:1},{name:'Ghana',code:'gh',d:1},
  {name:'Morocco',code:'ma',d:1},{name:'Cuba',code:'cu',d:1},
  {name:'Ireland',code:'ie',d:1},{name:'Ethiopia',code:'et',d:1},

  // d=2 medium
  {name:'Austria',code:'at',d:2},{name:'Hungary',code:'hu',d:2},
  {name:'Czech Republic',code:'cz',d:2},{name:'Slovakia',code:'sk',d:2},
  {name:'Romania',code:'ro',d:2},{name:'Bulgaria',code:'bg',d:2},
  {name:'Serbia',code:'rs',d:2},{name:'Croatia',code:'hr',d:2},
  {name:'Slovenia',code:'si',d:2},{name:'Bosnia',code:'ba',d:2},
  {name:'North Macedonia',code:'mk',d:2},{name:'Albania',code:'al',d:2},
  {name:'Montenegro',code:'me',d:2},{name:'Lithuania',code:'lt',d:2},
  {name:'Latvia',code:'lv',d:2},{name:'Estonia',code:'ee',d:2},
  {name:'Belarus',code:'by',d:2},{name:'Moldova',code:'md',d:2},
  {name:'Azerbaijan',code:'az',d:2},{name:'Georgia',code:'ge',d:2},
  {name:'Armenia',code:'am',d:2},{name:'Kazakhstan',code:'kz',d:2},
  {name:'Uzbekistan',code:'uz',d:2},{name:'Turkmenistan',code:'tm',d:2},
  {name:'Afghanistan',code:'af',d:2},{name:'Nepal',code:'np',d:2},
  {name:'Sri Lanka',code:'lk',d:2},{name:'Myanmar',code:'mm',d:2},
  {name:'Cambodia',code:'kh',d:2},{name:'Laos',code:'la',d:2},
  {name:'Mongolia',code:'mn',d:2},{name:'North Korea',code:'kp',d:2},
  {name:'Colombia',code:'co',d:2},{name:'Venezuela',code:'ve',d:2},
  {name:'Chile',code:'cl',d:2},{name:'Peru',code:'pe',d:2},
  {name:'Ecuador',code:'ec',d:2},{name:'Bolivia',code:'bo',d:2},
  {name:'Paraguay',code:'py',d:2},{name:'Uruguay',code:'uy',d:2},
  {name:'Guatemala',code:'gt',d:2},{name:'Honduras',code:'hn',d:2},
  {name:'El Salvador',code:'sv',d:2},{name:'Nicaragua',code:'ni',d:2},
  {name:'Costa Rica',code:'cr',d:2},{name:'Panama',code:'pa',d:2},
  {name:'Dominican Republic',code:'do',d:2},{name:'Haiti',code:'ht',d:2},
  {name:'Jamaica',code:'jm',d:2},{name:'Trinidad',code:'tt',d:2},
  {name:'Cyprus',code:'cy',d:2},{name:'Malta',code:'mt',d:2},
  {name:'Luxembourg',code:'lu',d:2},{name:'Iceland',code:'is',d:2},
  {name:'Algeria',code:'dz',d:2},{name:'Libya',code:'ly',d:2},
  {name:'Tunisia',code:'tn',d:2},{name:'Sudan',code:'sd',d:2},
  {name:'Somalia',code:'so',d:2},{name:'Uganda',code:'ug',d:2},
  {name:'Zimbabwe',code:'zw',d:2},{name:'Mozambique',code:'mz',d:2},
  {name:'Angola',code:'ao',d:2},{name:'Cameroon',code:'cm',d:2},
  {name:'Senegal',code:'sn',d:2},{name:'Mali',code:'ml',d:2},
  {name:'Ivory Coast',code:'ci',d:2},{name:'Iraq',code:'iq',d:2},
  {name:'Syria',code:'sy',d:2},{name:'Jordan',code:'jo',d:2},
  {name:'Lebanon',code:'lb',d:2},{name:'Kuwait',code:'kw',d:2},
  {name:'Qatar',code:'qa',d:2},{name:'Bahrain',code:'bh',d:2},
  {name:'Oman',code:'om',d:2},{name:'Yemen',code:'ye',d:2},
  {name:'Zambia',code:'zm',d:2},{name:'Rwanda',code:'rw',d:2},
  {name:'Tanzania',code:'tz',d:2},

  // d=3 hard
  {name:'Kyrgyzstan',code:'kg',d:3},{name:'Tajikistan',code:'tj',d:3},
  {name:'Bhutan',code:'bt',d:3},{name:'Maldives',code:'mv',d:3},
  {name:'Brunei',code:'bn',d:3},{name:'Timor-Leste',code:'tl',d:3},
  {name:'Papua New Guinea',code:'pg',d:3},{name:'Fiji',code:'fj',d:3},
  {name:'Samoa',code:'ws',d:3},{name:'Tonga',code:'to',d:3},
  {name:'Vanuatu',code:'vu',d:3},{name:'Solomon Islands',code:'sb',d:3},
  {name:'Kiribati',code:'ki',d:3},{name:'Tuvalu',code:'tv',d:3},
  {name:'Nauru',code:'nr',d:3},{name:'Marshall Islands',code:'mh',d:3},
  {name:'Micronesia',code:'fm',d:3},{name:'Palau',code:'pw',d:3},
  {name:'Andorra',code:'ad',d:3},{name:'Monaco',code:'mc',d:3},
  {name:'San Marino',code:'sm',d:3},{name:'Liechtenstein',code:'li',d:3},
  {name:'Kosovo',code:'xk',d:3},{name:'Belize',code:'bz',d:3},
  {name:'Barbados',code:'bb',d:3},{name:'Bahamas',code:'bs',d:3},
  {name:'Grenada',code:'gd',d:3},{name:'Antigua & Barbuda',code:'ag',d:3},
  {name:'St Kitts & Nevis',code:'kn',d:3},{name:'Dominica',code:'dm',d:3},
  {name:'St Lucia',code:'lc',d:3},{name:'St Vincent',code:'vc',d:3},
  {name:'Suriname',code:'sr',d:3},{name:'Guyana',code:'gy',d:3},
  {name:'Niger',code:'ne',d:3},{name:'Chad',code:'td',d:3},
  {name:'Burkina Faso',code:'bf',d:3},{name:'Guinea',code:'gn',d:3},
  {name:'Guinea-Bissau',code:'gw',d:3},{name:'Sierra Leone',code:'sl',d:3},
  {name:'Liberia',code:'lr',d:3},{name:'Togo',code:'tg',d:3},
  {name:'Benin',code:'bj',d:3},{name:'Central African Rep.',code:'cf',d:3},
  {name:'South Sudan',code:'ss',d:3},{name:'Eritrea',code:'er',d:3},
  {name:'Djibouti',code:'dj',d:3},{name:'Burundi',code:'bi',d:3},
  {name:'Malawi',code:'mw',d:3},{name:'Botswana',code:'bw',d:3},
  {name:'Namibia',code:'na',d:3},{name:'Lesotho',code:'ls',d:3},
  {name:'Eswatini',code:'sz',d:3},{name:'Madagascar',code:'mg',d:3},
  {name:'Mauritius',code:'mu',d:3},{name:'Comoros',code:'km',d:3},
  {name:'Cape Verde',code:'cv',d:3},{name:'Sao Tome',code:'st',d:3},
  {name:'Equatorial Guinea',code:'gq',d:3},{name:'Gabon',code:'ga',d:3},
  {name:'Congo',code:'cg',d:3},{name:'DR Congo',code:'cd',d:3},
  {name:'Mauritania',code:'mr',d:3},{name:'Gambia',code:'gm',d:3},
];

// ===== CONFIG =====
const QUESTION_TIME = 5;
const REVEAL_TIME = 2000;
const ROUND_SIZE = 50;

const MILESTONES = {
  10: { headline: 'LEVEL UP', sub: 'Getting harder from here...' },
  25: { headline: 'HALFWAY!', sub: 'Final 25 — brace yourself' },
  40: { headline: 'FINAL STRETCH', sub: 'Last 10 questions. Go!' },
};

// ===== AUDIO =====
let _ctx = null;
function getAudio() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}
function beep(freq, dur, type = 'sine', vol = 0.25) {
  try {
    const ctx = getAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch (_) {}
}
function playTick()       { beep(700, 0.07, 'square', 0.12); }
function playUrgent()     { beep(1000, 0.07, 'square', 0.18); }
function playReveal()     { [440,554,659].forEach((f,i) => setTimeout(() => beep(f,0.15,'sine',0.2), i*80)); }
function playCorrect()    { [523,659,784].forEach((f,i) => setTimeout(() => beep(f,0.18,'sine',0.28), i*90)); }
function playMilestone()  { [523,659,784,1047].forEach((f,i) => setTimeout(() => beep(f,0.18,'sine',0.3), i*100)); }
function playGameOver()   { [784,659,523,440].forEach((f,i) => setTimeout(() => beep(f,0.22,'sine',0.28), i*140)); }

// ===== VOICE HOST =====
let _voice = null;

function initVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const prefer = [
    'Google UK English Female',
    'Samantha',
    'Karen',
    'Moira',
    'Tessa',
    'Fiona',
  ];
  for (const name of prefer) {
    const v = voices.find(v => v.name === name);
    if (v) { _voice = v; return; }
  }
  _voice = voices.find(v => /female/i.test(v.name)) || voices[0] || null;
}
speechSynthesis.addEventListener('voiceschanged', initVoice);
initVoice();

function speak(text, { rate = 1, pitch = 1.1, vol = 1, interrupt = false, onend = null } = {}) {
  if (interrupt) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (_voice) u.voice = _voice;
  u.rate = rate;
  u.pitch = pitch;
  u.volume = vol;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}

// Advance only after BOTH minMs have elapsed AND speech has finished
function speakThenAdvance(text, opts, minMs, callback) {
  let speechDone = false;
  let timerDone = false;
  function maybeGo() {
    if (speechDone && timerDone) callback();
  }
  speak(text, { ...opts, onend: () => { speechDone = true; maybeGo(); } });
  gameTimeout(() => { timerDone = true; maybeGo(); }, minMs);
}

// ===== UTILS =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function flagUrl(code) {
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}

// ===== BUILD ROUND =====
// Q1-10: easy | Q11-25: medium | Q26-40: medium-hard | Q41-50: hard
function buildRound() {
  const easy   = shuffle(COUNTRIES.filter(c => c.d === 1));
  const medium = shuffle(COUNTRIES.filter(c => c.d === 2));
  const hard   = shuffle(COUNTRIES.filter(c => c.d === 3));
  return [
    ...easy.slice(0, 10),
    ...medium.slice(0, 15),
    ...shuffle([...medium.slice(15, 20), ...hard.slice(0, 10)]).slice(0, 15),
    ...hard.slice(10, 20),
  ].slice(0, ROUND_SIZE);
}

function buildQuestion(country, index) {
  // Alternate question types; first few questions are always "name this flag" for easy entry
  const type = index < 3 ? 'country-to-flag' : (index % 2 === 0 ? 'country-to-flag' : 'flag-to-country');
  // Distractors from same difficulty ±1 to keep it fair
  const pool = COUNTRIES.filter(c => c.code !== country.code && Math.abs(c.d - country.d) <= 1);
  const distractors = shuffle(pool).slice(0, 3);
  const choices = shuffle([country, ...distractors]);
  const correctIdx = choices.findIndex(c => c.code === country.code);
  return { country, type, choices, correctIdx };
}

// ===== GAME STATE =====
let round = [];
let currentIdx = 0;
let score = 0;
let timerInterval = null;
let timeLeft = QUESTION_TIME;
let lastTickSec = QUESTION_TIME;
let pendingTimeouts = [];

// ===== DOM =====
const quizModal    = document.getElementById('quiz-modal');
const quizStage    = document.getElementById('quiz-stage');
const fullscreenBtn= document.getElementById('fullscreen-btn');
const startBtn     = document.getElementById('start-btn');
const catRow       = document.getElementById('cat-row');

// ===== CATEGORIES UI =====
function renderCategories() {
  catRow.innerHTML = CATEGORIES.map(cat => {
    const active = !shuffleMode && selectedCategory === cat.id;
    const cls = ['cat-icon',
      cat.available ? (active ? 'active' : '') : 'locked'
    ].filter(Boolean).join(' ');
    const tooltip = cat.available
      ? `${cat.name} — ${cat.desc}`
      : `${cat.name} — coming soon`;
    return `<button class="${cls}" data-cat="${cat.id}" aria-label="${tooltip}" ${!cat.available ? 'disabled' : ''}>
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-tooltip">${tooltip}</span>
    </button>`;
  }).join('');

  catRow.classList.toggle('shuffle-on', shuffleMode);

  catRow.querySelectorAll('.cat-icon:not(.locked)').forEach(el => {
    el.addEventListener('click', () => {
      if (shuffleMode) return;
      selectedCategory = el.dataset.cat;
      renderCategories();
    });
  });
}

function renderShuffle() {
  const btn = document.getElementById('shuffle-btn');
  if (btn) btn.classList.toggle('active', shuffleMode);
  renderCategories();
}

// ===== FULLSCREEN (home screen only) =====
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ===== ENTRY =====
function openQuiz() {
  if (shuffleMode) {
    const available = CATEGORIES.filter(c => c.available);
    selectedCategory = available[Math.floor(Math.random() * available.length)].id;
  }
  quizModal.classList.remove('hidden');
  quizModal.setAttribute('aria-hidden', 'false');
  startGame();
}
function gameTimeout(fn, ms) {
  const id = setTimeout(fn, ms);
  pendingTimeouts.push(id);
  return id;
}

function closeQuiz() {
  clearInterval(timerInterval);
  pendingTimeouts.forEach(clearTimeout);
  pendingTimeouts = [];
  speechSynthesis.cancel();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  quizModal.classList.add('hidden');
  quizModal.setAttribute('aria-hidden', 'true');
}

function startGame() {
  currentIdx = 0;
  score = 0;
  const pool = buildRound();
  round = pool.map((country, i) => buildQuestion(country, i));
  doCountdown(() => showQuestion());
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

// ===== COMPASS ROSE SVG (inline, for scroll corners) =====
const COMPASS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="#5c3a1e">
  <polygon points="32,4 36,28 32,32 28,28" opacity="0.9"/>
  <polygon points="60,32 36,36 32,32 36,28" opacity="0.7"/>
  <polygon points="32,60 28,36 32,32 36,36" opacity="0.9"/>
  <polygon points="4,32 28,28 32,32 28,36" opacity="0.7"/>
  <circle cx="32" cy="32" r="5" fill="none" stroke="#5c3a1e" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="2" opacity="0.8"/>
</svg>`;

// Throw directions mapped to corner positions
const THROW_DIRS = ['tl','tr','bl','br'];

// ===== SHOW QUESTION =====
function showQuestion() {
  const q = round[currentIdx];
  const n = currentIdx + 1;
  const labels = ['A', 'B', 'C', 'D'];

  const choicesHtml = q.type === 'country-to-flag'
    ? `<div class="flag-choices">
        ${q.choices.map((c, i) => `
          <button class="flag-choice" data-idx="${i}" data-throw="${THROW_DIRS[i]}">
            <span class="choice-badge">${labels[i]}</span>
            <img src="${flagUrl(c.code)}" alt="Flag" class="choice-flag" data-code="${c.code}" />
          </button>`).join('')}
      </div>`
    : `<div class="name-choices">
        ${q.choices.map((c, i) => `
          <button class="name-choice" data-idx="${i}">
            <span class="choice-badge">${labels[i]}</span>
            <span class="choice-name">${c.name}</span>
          </button>`).join('')}
      </div>`;

  const promptText = q.type === 'country-to-flag'
    ? `Which flag is ${q.country.name}?`
    : `Which country does this flag belong to?`;

  const scrollCorners = `
    <span class="scroll-corner tl">${COMPASS_SVG}</span>
    <span class="scroll-corner tr">${COMPASS_SVG}</span>
    <span class="scroll-corner bl">${COMPASS_SVG}</span>
    <span class="scroll-corner br">${COMPASS_SVG}</span>`;

  const promptHtml = q.type === 'country-to-flag'
    ? `<div class="q-header">
         <div class="q-label">Which flag is</div>
         <div class="q-country-name">${q.country.name}</div>
       </div>`
    : `<div class="q-header q-header--flag">
         <div class="q-label">Which country does this flag belong to?</div>
         <div class="mystery-wrap">
           <img src="${flagUrl(q.country.code)}" alt="Mystery flag" class="mystery-flag" data-code="${q.country.code}" />
         </div>
       </div>`;

  quizStage.innerHTML = `
    <div class="game-screen">
      <div class="game-bg"></div>
      <div class="game-hud">
        <span class="hud-q">Q ${n} / ${ROUND_SIZE}</span>
        <div class="hud-timer">
          <span id="timer-counter" class="timer-counter">${QUESTION_TIME}</span>
        </div>
        <span class="hud-score">${score} pts</span>
      </div>
      <div class="timer-bar"><div class="timer-fill" id="timer-fill"></div></div>
      <div class="scroll-wrap">
        <div class="scroll-body">
          ${scrollCorners}
          ${promptHtml}
          ${choicesHtml}
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(timerInterval);
      doReveal(Number(btn.dataset.idx));
    });
  });

  speak(promptText, { rate: 1.05 });
  startTimer();
}

// ===== TIMER =====
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = QUESTION_TIME;
  lastTickSec = QUESTION_TIME;

  timerInterval = setInterval(() => {
    timeLeft = Math.max(timeLeft - 0.1, 0);

    const fill = document.getElementById('timer-fill');
    const counter = document.getElementById('timer-counter');
    if (fill) {
      fill.style.width = (timeLeft / QUESTION_TIME * 100) + '%';
      fill.classList.toggle('urgent', timeLeft <= 2);
    }
    if (counter) counter.textContent = Math.ceil(timeLeft);

    const sec = Math.ceil(timeLeft);
    if (sec < lastTickSec) {
      lastTickSec = sec;
      if (sec > 0) sec <= 2 ? playUrgent() : playTick();
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      doReveal(-1);
    }
  }, 100);
}

// ===== REVEAL PHRASES =====
const REVEAL_PHRASES = {
  // A
  us: "Home of the brave, land of the free! That's the United States!",
  gb: "God save the King! That's the United Kingdom!",
  fr: "Home of the Eiffel Tower! That's France!",
  de: "Land of poets and thinkers! That's Germany!",
  it: "Pizza, pasta, la dolce vita! That's Italy!",
  es: "Ole! Home of flamenco! That's Spain!",
  jp: "Land of the Rising Sun! That's Japan!",
  cn: "Home of the Great Dragon! That's China!",
  br: "Carnival time! That's Brazil!",
  ca: "Oh Canada! That's right, that's Canada!",
  au: "G'day mate! That's Australia!",
  mx: "Viva Mexico!",
  in: "Land of a billion stories! That's India!",
  ru: "From the tundra to the taiga! That's Russia!",
  kr: "Land of the Morning Calm! That's South Korea!",
  ng: "Giant of Africa! That's Nigeria!",
  za: "The Rainbow Nation! That's South Africa!",
  eg: "Land of the Pharaohs! That's Egypt!",
  ar: "Tango anyone? That's Argentina!",
  tr: "Where East meets West! That's Turkey!",
  se: "Land of ABBA and IKEA! That's Sweden!",
  no: "Land of the Midnight Sun! That's Norway!",
  dk: "Home of the happiest people! That's Denmark!",
  fi: "Sauna capital of the world! That's Finland!",
  ch: "Mountains, chocolate, and cheese! That's Switzerland!",
  nl: "Tulips and windmills! That's the Netherlands!",
  be: "Chocolate and waffles! That's Belgium!",
  pl: "The White Eagle soars! That's Poland!",
  pt: "Explorers of the seven seas! That's Portugal!",
  gr: "Birthplace of democracy! That's Greece!",
  ua: "Golden wheat and blue skies! That's Ukraine!",
  th: "Land of Smiles! That's Thailand!",
  vn: "Land of the Ascending Dragon! That's Vietnam!",
  id: "Seventeen thousand islands! That's Indonesia!",
  my: "Truly Asia! That's Malaysia!",
  ph: "Pearl of the Orient! That's the Philippines!",
  sg: "The Lion City! That's Singapore!",
  nz: "Land of the Long White Cloud! That's New Zealand!",
  sa: "Kingdom of the desert! That's Saudi Arabia!",
  ae: "City of gold in the sands! That's the UAE!",
  il: "Land of milk and honey! That's Israel!",
  ir: "Ancient Persia lives on! That's Iran!",
  pk: "Star and crescent! That's Pakistan!",
  bd: "Rising sun of Bengal! That's Bangladesh!",
  ke: "Safari country! That's Kenya!",
  gh: "Black Star of Africa! That's Ghana!",
  ma: "Gateway to Africa! That's Morocco!",
  cu: "Sugar, salsa, and revolution! That's Cuba!",
  ie: "Forty shades of green! That's Ireland!",
  et: "One of the oldest civilisations! That's Ethiopia!",
  // Medium
  at: "Home of Mozart and Beethoven! That's Austria!",
  hu: "Land of paprika and thermal baths! That's Hungary!",
  cz: "City of a hundred spires! That's Czech Republic!",
  sk: "Castles in the Carpathians! That's Slovakia!",
  ro: "Land of Dracula's castle! That's Romania!",
  bg: "Land of roses! That's Bulgaria!",
  rs: "Land of rivers and mountains! That's Serbia!",
  hr: "Pearl of the Adriatic! That's Croatia!",
  lt: "Land of amber! That's Lithuania!",
  lv: "Land of song! That's Latvia!",
  ee: "The Digital Republic! That's Estonia!",
  by: "Land of storks and potatoes! That's Belarus!",
  az: "Land of fire! That's Azerbaijan!",
  ge: "Ancient land of wine! That's Georgia!",
  am: "First Christian nation in the world! That's Armenia!",
  kz: "Vast steppe and eagle hunters! That's Kazakhstan!",
  uz: "Silk Road treasure! That's Uzbekistan!",
  af: "Crossroads of civilisations! That's Afghanistan!",
  np: "Home of Everest! That's Nepal!",
  lk: "Teardrop of India! That's Sri Lanka!",
  mm: "Land of golden pagodas! That's Myanmar!",
  kh: "Home of Angkor Wat! That's Cambodia!",
  mn: "Land of Genghis Khan! That's Mongolia!",
  kp: "The Hermit Kingdom! That's North Korea!",
  co: "Land of magical realism! That's Colombia!",
  ve: "Land of Angel Falls! That's Venezuela!",
  cl: "Longest country in the world! That's Chile!",
  pe: "Home of Machu Picchu! That's Peru!",
  ec: "Named after the equator! That's Ecuador!",
  bo: "Land of salt flats! That's Bolivia!",
  uy: "Little Switzerland of South America! That's Uruguay!",
  gt: "Land of eternal spring! That's Guatemala!",
  cr: "Pura vida! That's Costa Rica!",
  pa: "Where two oceans meet! That's Panama!",
  do: "First European settlement in the Americas! That's the Dominican Republic!",
  jm: "One love! That's Jamaica!",
  cy: "Island of love and Aphrodite! That's Cyprus!",
  is: "Land of fire and ice! That's Iceland!",
  dz: "Largest country in Africa! That's Algeria!",
  so: "Horn of Africa! That's Somalia!",
  iq: "Cradle of civilisation! That's Iraq!",
  sy: "Ancient city of Damascus! That's Syria!",
  jo: "Rose-red city, half as old as time! That's Jordan!",
  qa: "Falcon in the desert! That's Qatar!",
  ye: "Arabia Felix, the happy land! That's Yemen!",
  // Hard
  bt: "Kingdom of happiness! That's Bhutan! The dragon flag!",
  mv: "Paradise of a thousand islands! That's Maldives!",
  bn: "The Abode of Peace! That's Brunei!",
  pg: "Land of the unexpected! That's Papua New Guinea!",
  fj: "Where the world begins each morning! That's Fiji!",
  ad: "Tiny country, big mountains! That's Andorra!",
  mc: "Glamour on the Riviera! That's Monaco!",
  sm: "Oldest republic in the world! That's San Marino!",
  li: "Rhine valley gem! That's Liechtenstein!",
  bz: "Jaguar country! That's Belize!",
  sr: "The wild Amazonian heart! That's Suriname!",
  mg: "The great red island! That's Madagascar!",
  cv: "Islands of music and saudade! That's Cape Verde!",
  cd: "Heart of the Congo! That's DR Congo!",
  mr: "Desert meets ocean! That's Mauritania!",
};

const GENERIC_REVEALS = [
  n => `Ooh, that one was sneaky! The answer is ${n}!`,
  n => `Don't worry, now you know! That flag belongs to ${n}!`,
  n => `${n} takes it! File that one away!`,
  n => `Tricky! That was ${n}!`,
  n => `The flag of ${n}! Now you'll never forget it!`,
  n => `That's ${n}! A tough one!`,
];

function getRevealPhrase(country) {
  return REVEAL_PHRASES[country.code.toLowerCase()]
    || GENERIC_REVEALS[Math.floor(Math.random() * GENERIC_REVEALS.length)](country.name);
}

// ===== REVEAL =====
function doReveal(selectedIdx) {
  clearInterval(timerInterval);
  const q = round[currentIdx];
  const correct = selectedIdx === q.correctIdx;

  const revealText = correct ? 'Correct!' : getRevealPhrase(q.country);
  const revealOpts = correct ? { pitch: 1.2, interrupt: true } : { interrupt: true };
  if (correct) playCorrect(); else playReveal();

  const btns = document.querySelectorAll('[data-idx]');
  btns.forEach(btn => {
    btn.disabled = true;
    const i = Number(btn.dataset.idx);
    const throwDir = btn.dataset.throw;

    if (i === q.correctIdx) {
      btn.classList.add('correct');
      if (q.type === 'country-to-flag') btn.classList.add('correct-keep');
    } else if (i === selectedIdx) {
      btn.classList.add('wrong');
    }

    if (q.type === 'country-to-flag' && i !== q.correctIdx) {
      gameTimeout(() => {
        btn.classList.add(`throw-out-${throwDir || 'tl'}`);
      }, 220);
    }

    if (q.type === 'country-to-flag') {
      const badge = btn.querySelector('.choice-badge');
      if (badge) badge.textContent = q.choices[i].name.length > 10
        ? q.choices[i].name.slice(0, 10) + '…'
        : q.choices[i].name;
    }
  });

  if (correct) gameTimeout(() => highlightCountry(q.country.code), 300);

  // Flag flies to map on every reveal so player always sees where the country is
  gameTimeout(() => flyFlagToMap(q.country), 350);

  // Advance only after speech finishes AND minimum display time has passed
  speakThenAdvance(revealText, revealOpts, REVEAL_TIME, advanceGame);
}

// ===== FLY FLAG TO MAP =====
function flyFlagToMap(country) {
  const modal = document.getElementById('quiz-frame');
  if (!modal) return;
  const coords = getCountryCoords(country.code);
  if (!coords) return;

  const modalRect = modal.getBoundingClientRect();

  // Source: correct flag card, or mystery flag, or scroll centre as fallback
  const srcEl = document.querySelector('.flag-choice.correct .choice-flag')
             || document.querySelector('.mystery-flag')
             || document.querySelector('.scroll-body');
  if (!srcEl) return;

  const srcRect = srcEl.getBoundingClientRect();
  const srcX = srcRect.left - modalRect.left + srcRect.width  / 2;
  const srcY = srcRect.top  - modalRect.top  + srcRect.height / 2;
  const flagW = Math.min(srcRect.width * 0.8, 72);

  // Destination on map
  const dstX = (coords[0] / 1000) * modalRect.width;
  const dstY = (coords[1] / 500)  * modalRect.height;

  // Arc peak — rise proportional to distance, capped
  const dist = Math.hypot(dstX - srcX, dstY - srcY);
  const arcH = Math.min(dist * 0.45, modalRect.height * 0.35);
  const midX = (srcX + dstX) / 2;
  const midY = Math.min(srcY, dstY) - arcH;

  // Roll the scroll away so the map is visible when the flag lands
  const scrollWrap = document.querySelector('.scroll-wrap');
  if (scrollWrap) {
    scrollWrap.classList.add('scroll-fly-out');
  }

  // Build element
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute; left:0; top:0; pointer-events:none; z-index:50;
    transform-origin:center center;
    transform:translate(${srcX}px,${srcY}px) translate(-50%,-50%);
  `;
  el.innerHTML = `<img src="${flagUrl(country.code)}" data-code="${country.code}"
    style="width:${flagW}px; aspect-ratio:5/3; object-fit:${country.code==='np'?'contain':'cover'};
    border-radius:4px; box-shadow:0 6px 20px rgba(0,0,0,0.55); display:block;" />`;
  modal.appendChild(el);

  // Three-keyframe arc using Web Animations API
  el.animate([
    {
      transform: `translate(${srcX}px, ${srcY}px) translate(-50%,-50%) rotate(-8deg) scale(1)`,
      opacity: 0.95
    },
    {
      transform: `translate(${midX}px, ${midY}px) translate(-50%,-50%) rotate(10deg) scale(0.75)`,
      opacity: 1,
      offset: 0.42
    },
    {
      transform: `translate(${dstX}px, ${dstY}px) translate(-50%,-50%) rotate(0deg) scale(0.22)`,
      opacity: 0.9
    }
  ], {
    duration: 1100,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  }).onfinish = () => {
    // Planted: linger briefly then fade out
    el.animate([{ opacity: 0.9 }, { opacity: 0 }], {
      duration: 500, delay: 700, fill: 'forwards'
    }).onfinish = () => el.remove();
  };
}

// ===== COUNTRY MAP HIGHLIGHT =====
function highlightCountry(code) {
  const svg = document.getElementById('map-highlight-svg');
  if (!svg) return;
  // We use a simple marker circle since we don't have a full country SVG paths overlay.
  // A pulsing ring effect over the approximate country location.
  // Country coordinate lookup (approximate map positions in 0-1000 x 0-500 space)
  const coords = getCountryCoords(code);
  if (!coords) return;

  const id = 'flash-' + code;
  // Remove any previous
  const prev = svg.getElementById(id);
  if (prev) prev.remove();

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.id = id;
  g.innerHTML = `
    <circle cx="${coords[0]}" cy="${coords[1]}" r="14" fill="#ffd600" opacity="0" class="country-flash"/>
    <circle cx="${coords[0]}" cy="${coords[1]}" r="18" fill="none" stroke="#ffd600" stroke-width="2" opacity="0" class="country-flash" style="animation-delay:0.1s"/>
  `;
  svg.appendChild(g);
  setTimeout(() => { if (g.parentNode) g.remove(); }, 2000);
}

// Approximate country center coordinates in a 1000×500 equirectangular projection
function getCountryCoords(code) {
  const map = {
    us:[220,170], gb:[470,130], fr:[480,155], de:[498,140], it:[510,165],
    es:[462,167], jp:[795,165], cn:[715,175], br:[285,295], ca:[195,130],
    au:[760,340], mx:[185,210], in:[655,215], ru:[620,120], kr:[785,175],
    ng:[490,270], za:[520,380], eg:[540,205], ar:[265,355], tr:[560,175],
    se:[510,110], no:[495,105], dk:[495,120], fi:[525,105], ch:[490,150],
    nl:[482,135], be:[482,140], pl:[515,135], pt:[455,170], gr:[530,175],
    ua:[545,145], th:[715,240], vn:[735,245], id:[745,300], my:[728,278],
    ph:[768,250], sg:[730,282], nz:[840,390], sa:[590,225], ae:[608,232],
    il:[553,198], ir:[610,200], pk:[640,205], bd:[678,215], ke:[555,290],
    gh:[465,270], ma:[455,188], cu:[225,228], ie:[455,130], et:[563,275],
    at:[505,148], hu:[518,148], cz:[505,140], sk:[520,142], ro:[530,155],
    bg:[533,160], rs:[523,157], hr:[512,155], si:[505,152], ba:[515,158],
    mk:[527,163], al:[522,168], me:[518,162], lt:[527,127], lv:[527,120],
    ee:[527,113], by:[533,133], md:[538,152], az:[590,178], ge:[580,173],
    am:[578,177], kz:[635,148], uz:[640,185], tm:[628,190], af:[638,198],
    np:[672,208], lk:[668,250], mm:[710,228], kh:[725,252], la:[720,242],
    mn:[715,148], kp:[783,168], co:[248,268], ve:[265,255], cl:[252,348],
    pe:[246,300], ec:[238,280], bo:[263,318], py:[275,335], uy:[280,348],
    gt:[193,235], hn:[200,238], sv:[197,240], ni:[205,245], cr:[210,250],
    pa:[218,255], do:[248,230], ht:[243,233], jm:[233,235], tt:[270,258],
    cy:[548,190], mt:[502,175], lu:[487,143], is:[440,100], dz:[482,200],
    ly:[510,200], tn:[495,185], sd:[543,255], so:[575,275], ug:[543,285],
    zw:[535,355], mz:[548,345], ao:[510,320], cm:[500,270], sn:[442,250],
    ml:[462,240], ci:[462,268], iq:[578,197], sy:[562,190], jo:[557,203],
    lb:[555,193], kw:[590,212], qa:[598,228], bh:[597,225], om:[615,238],
    ye:[590,248], zm:[535,330], rw:[540,293], tz:[548,305], kg:[660,177],
    tj:[653,185], bt:[682,208], mv:[655,270], bn:[742,268], tl:[778,308],
    pg:[808,295], fj:[878,328], ws:[900,330], to:[895,338], vu:[860,325],
    sb:[840,305], ki:[880,270], tv:[890,305], nr:[876,285], mh:[866,268],
    fm:[828,262], pw:[790,268], ad:[475,162], mc:[488,160], sm:[506,158],
    li:[493,148], xk:[523,163], bz:[200,232], bb:[278,250], bs:[232,220],
    gd:[268,256], ag:[268,238], kn:[263,235], dm:[265,245], lc:[267,248],
    vc:[267,252], sr:[277,270], gy:[270,268], ne:[490,248], td:[510,252],
    bf:[468,255], gn:[450,260], gw:[445,258], sl:[448,265], lr:[453,268],
    tg:[473,265], bj:[475,262], cf:[518,268], ss:[545,268], er:[558,258],
    dj:[568,268], bi:[540,298], mw:[548,325], bw:[525,360], na:[510,348],
    ls:[528,372], sz:[535,368], mg:[568,340], mu:[600,348], km:[570,320],
    cv:[432,248], st:[490,282], gq:[495,278], ga:[500,285], cg:[507,295],
    cd:[525,295], mr:[447,228], gm:[440,255],
  };
  return map[code.toLowerCase()] || null;
}

// ===== ADVANCE =====
function advanceGame() {
  currentIdx++;
  if (currentIdx >= ROUND_SIZE) { showResults(); return; }
  const milestone = MILESTONES[currentIdx];
  if (milestone) showMilestone(milestone);
  else showQuestion();
}

function showMilestone(m) {
  playMilestone();
  speak(m.headline + '. ' + m.sub, { rate: 0.95 });
  quizStage.innerHTML = `
    <div class="milestone-screen">
      <div class="game-bg strong"></div>
      <div class="milestone-headline">${m.headline}</div>
      <div class="milestone-sub">${m.sub}</div>
    </div>`;
  gameTimeout(showQuestion, 2000);
}

// ===== RESULTS =====
function getRank(s) {
  if (s <= 15) return { label: 'Geography Rookie',   color: '#64b5f6' };
  if (s <= 30) return { label: 'Flag Explorer',      color: '#81c784' };
  if (s <= 42) return { label: 'Flag Expert',         color: '#ffb74d' };
  if (s <= 48) return { label: 'Master Vexillologist',color: '#ff7043' };
  return           { label: 'BIG BRAIN CERTIFIED',   color: '#ffd600' };
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
  document.getElementById('play-again').addEventListener('click', startGame);
}

// ===== INIT =====
renderCategories();
startBtn.addEventListener('click', openQuiz);
fullscreenBtn.addEventListener('click', toggleFullscreen);
document.getElementById('shuffle-btn').addEventListener('click', () => {
  shuffleMode = !shuffleMode;
  renderShuffle();
});

document.addEventListener('keydown', e => {
  if (quizModal.classList.contains('hidden')) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); openQuiz(); }
  } else if (e.key === 'Escape') {
    closeQuiz();
  }
});
