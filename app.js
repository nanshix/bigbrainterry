'use strict';

// ===== CATEGORIES =====
const CATEGORIES = [
  { id:'flags',   name:'Flag Rush',        emoji:'🏳️', desc:'50 flags · 3 difficulty tiers · 5s each', available:true },
  { id:'crusade', name:'Crusade History',  emoji:'⚔️', desc:'Medieval warfare & history',              available:false },
  { id:'cities',  name:'City Pictures',    emoji:'🌆', desc:'Identify famous cities from photos',       available:false },
];
let selectedCategory = 'flags';

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

function speak(text, { rate = 1, pitch = 1.1, vol = 1 } = {}) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (_voice) u.voice = _voice;
  u.rate = rate;
  u.pitch = pitch;
  u.volume = vol;
  speechSynthesis.speak(u);
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

// ===== DOM =====
const quizModal    = document.getElementById('quiz-modal');
const quizStage    = document.getElementById('quiz-stage');
const closeQuizBtn = document.getElementById('close-quiz');
const fullscreenBtn= document.getElementById('fullscreen-btn');
const startBtn     = document.getElementById('start-btn');
const catRow       = document.getElementById('cat-row');

// ===== CATEGORIES UI =====
function renderCategories() {
  catRow.innerHTML = CATEGORIES.map(cat => {
    const active = selectedCategory === cat.id;
    return `<span class="cat-tick${cat.available ? (active ? ' active' : '') : ' locked'}" data-cat="${cat.id}">
      <span class="tick-box">${active ? '✓' : ''}</span>
      <span>${cat.emoji} ${cat.name}${!cat.available ? ' · soon' : ''}</span>
    </span>`;
  }).join('');
  catRow.querySelectorAll('.cat-tick:not(.locked)').forEach(el => {
    el.addEventListener('click', () => {
      selectedCategory = el.dataset.cat;
      renderCategories();
    });
  });
}

// ===== FULLSCREEN =====
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    quizModal.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ===== ENTRY =====
function openQuiz() {
  quizModal.classList.remove('hidden');
  quizModal.setAttribute('aria-hidden', 'false');
  startGame();
}
function closeQuiz() {
  clearInterval(timerInterval);
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
  let n = 3;
  setCountdownDisplay(n, 'Get Ready!');
  const t = setInterval(() => {
    n--;
    if (n <= 0) {
      clearInterval(t);
      setCountdownDisplay('GO!', '');
      playMilestone();
      setTimeout(onDone, 700);
    } else {
      playTick();
      setCountdownDisplay(n, '');
    }
  }, 1000);
}
function setCountdownDisplay(num, label) {
  quizStage.innerHTML = `
    <div class="countdown-screen">
      <div class="game-bg strong"></div>
      <div class="countdown-num">${num}</div>
      ${label ? `<div class="countdown-label">${label}</div>` : ''}
    </div>`;
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q = round[currentIdx];
  const n = currentIdx + 1;
  const labels = ['A', 'B', 'C', 'D'];

  const choicesHtml = q.type === 'country-to-flag'
    ? `<div class="flag-choices">
        ${q.choices.map((c, i) => `
          <button class="flag-choice" data-idx="${i}">
            <span class="choice-badge">${labels[i]}</span>
            <img src="${flagUrl(c.code)}" alt="Flag" class="choice-flag" />
          </button>`).join('')}
      </div>`
    : `<div class="name-choices">
        ${q.choices.map((c, i) => `
          <button class="name-choice" data-idx="${i}">
            <span class="choice-badge">${labels[i]}</span>
            <span class="choice-name">${c.name}</span>
          </button>`).join('')}
      </div>`;

  const promptHtml = q.type === 'country-to-flag'
    ? `<div class="q-prompt">Which flag is <strong>${q.country.name}</strong>?</div>`
    : `<div class="mystery-wrap">
         <img src="${flagUrl(q.country.code)}" alt="Mystery flag" class="mystery-flag" />
       </div>
       <div class="q-prompt">Which country does this flag belong to?</div>`;

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
      ${promptHtml}
      ${choicesHtml}
    </div>`;

  document.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(timerInterval);
      doReveal(Number(btn.dataset.idx));
    });
  });

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

// ===== REVEAL =====
function doReveal(selectedIdx) {
  clearInterval(timerInterval);
  const q = round[currentIdx];
  const correct = selectedIdx === q.correctIdx;

  if (correct) { score++; playCorrect(); }
  else { playReveal(); }

  const btns = document.querySelectorAll('[data-idx]');
  btns.forEach(btn => {
    btn.disabled = true;
    const i = Number(btn.dataset.idx);
    if (i === q.correctIdx) btn.classList.add('correct');
    else if (i === selectedIdx) btn.classList.add('wrong');
    // On flag choices: reveal country name below flag after answer
    if (q.type === 'country-to-flag') {
      const badge = btn.querySelector('.choice-badge');
      if (badge) badge.textContent = q.choices[i].name.length > 10
        ? q.choices[i].name.slice(0, 10) + '…'
        : q.choices[i].name;
    }
  });

  setTimeout(advanceGame, REVEAL_TIME);
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
  quizStage.innerHTML = `
    <div class="milestone-screen">
      <div class="game-bg strong"></div>
      <div class="milestone-headline">${m.headline}</div>
      <div class="milestone-sub">${m.sub}</div>
    </div>`;
  setTimeout(showQuestion, 2000);
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
closeQuizBtn.addEventListener('click', closeQuiz);
startBtn.addEventListener('click', openQuiz);
fullscreenBtn.addEventListener('click', toggleFullscreen);

document.addEventListener('keydown', e => {
  if (quizModal.classList.contains('hidden')) {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); openQuiz(); }
  } else if (e.key === 'Escape') {
    closeQuiz();
  }
});
