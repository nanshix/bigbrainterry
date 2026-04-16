import { shuffle, flagUrl, parseCSV } from '../utils.js';
import { playTick, playUrgent, playReveal, playCorrect } from '../core/audio.js';
import { speak } from '../core/speech.js';
import {
  ROUND_SIZE, QUESTION_TIME, REVEAL_TIME,
  startGame, addScore, addNoAnswer, advanceGame,
  startTimer, stopTimer, gameTimeout, speakThenAdvance,
  getIdx, getRound, getScore,
} from '../core/engine.js';

const THROW_DIRS = ['tl', 'tr', 'bl', 'br'];

const COMPASS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="#5c3a1e">
  <polygon points="32,4 36,28 32,32 28,28" opacity="0.9"/>
  <polygon points="60,32 36,36 32,32 36,28" opacity="0.7"/>
  <polygon points="32,60 28,36 32,32 36,36" opacity="0.9"/>
  <polygon points="4,32 28,28 32,32 28,36" opacity="0.7"/>
  <circle cx="32" cy="32" r="5" fill="none" stroke="#5c3a1e" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="2" opacity="0.8"/>
</svg>`;

// ===== DATA LOADING =====
async function loadCountries() {
  const res = await fetch('questions/flags.csv');
  const text = await res.text();
  return parseCSV(text).map(r => ({ name: r.name, code: r.code, d: Number(r.difficulty) }));
}

// ===== ROUND / QUESTION BUILDERS =====
function buildRound(countries) {
  const easy   = shuffle(countries.filter(c => c.d === 1));
  const medium = shuffle(countries.filter(c => c.d === 2));
  const hard   = shuffle(countries.filter(c => c.d === 3));
  return [
    ...easy.slice(0, 10),
    ...medium.slice(0, 15),
    ...shuffle([...medium.slice(15, 20), ...hard.slice(0, 10)]).slice(0, 15),
    ...hard.slice(10, 20),
  ].slice(0, ROUND_SIZE);
}

function buildQuestion(country, index, countries) {
  const type = index < 3 ? 'country-to-flag' : (index % 2 === 0 ? 'country-to-flag' : 'flag-to-country');
  const pool = countries.filter(c => c.code !== country.code && Math.abs(c.d - country.d) <= 1);
  const distractors = shuffle(pool).slice(0, 3);
  const choices = shuffle([country, ...distractors]);
  const correctIdx = choices.findIndex(c => c.code === country.code);
  return { country, type, choices, correctIdx };
}

// ===== SHOW QUESTION =====
function showQuestion() {
  const q = getRound()[getIdx()];
  const n = getIdx() + 1;
  const labels = ['A', 'B', 'C', 'D'];
  const quizStage = document.getElementById('quiz-stage');

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
        <span class="hud-score">${getScore()} pts</span>
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
      stopTimer();
      doReveal(Number(btn.dataset.idx));
    });
  });

  speak(promptText, { rate: 1.05 });
  startTimer(
    sec => sec <= 2 ? playUrgent() : playTick(),
    ()  => doReveal(-1),
  );
}

// ===== REVEAL =====
function doReveal(selectedIdx) {
  const q = getRound()[getIdx()];
  const correct = selectedIdx === q.correctIdx;
  const noAnswer = selectedIdx === -1;
  if (noAnswer) addNoAnswer();

  const revealText = correct ? 'Correct!'
    : noAnswer ? [
        "Did you get that one? Let us know in the comments!",
        "What do you think? Drop your answer below!",
        "Tricky one! Did you know that flag?",
        "How are you going at home?",
        "Comment below if you got it!",
        "That's a tough one — did it catch you out?",
      ][Math.floor(Math.random() * 6)]
    : getRevealPhrase(q.country);

  const revealOpts = correct ? { pitch: 1.2, interrupt: true } : { interrupt: true };

  if (correct) { addScore(); }
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
      gameTimeout(() => btn.classList.add(`throw-out-${throwDir || 'tl'}`), 220);
    }

    if (q.type === 'country-to-flag') {
      const badge = btn.querySelector('.choice-badge');
      if (badge) badge.textContent = q.choices[i].name.length > 10
        ? q.choices[i].name.slice(0, 10) + '…'
        : q.choices[i].name;
    }
  });

  if (correct) gameTimeout(() => highlightCountry(q.country.code), 300);
  gameTimeout(() => flyFlagToMap(q.country), 350);

  speakThenAdvance(revealText, revealOpts, REVEAL_TIME, advanceGame);
}

// ===== FLY FLAG TO MAP =====
function flyFlagToMap(country) {
  const modal = document.getElementById('quiz-frame');
  if (!modal) return;
  const coords = getCountryCoords(country.code);
  if (!coords) return;

  const modalRect = modal.getBoundingClientRect();

  const srcEl = document.querySelector('.flag-choice.correct .choice-flag')
             || document.querySelector('.mystery-flag')
             || document.querySelector('.scroll-body');
  if (!srcEl) return;

  const srcRect = srcEl.getBoundingClientRect();
  const srcX = srcRect.left - modalRect.left + srcRect.width  / 2;
  const srcY = srcRect.top  - modalRect.top  + srcRect.height / 2;
  const flagW = Math.min(srcRect.width * 0.9, 140);

  // SVG viewBox is 0-1000 x 0-562 (16:9, matches container)
  const dstX = (coords[0] / 1000) * modalRect.width;
  const dstY = (coords[1] / 562)  * modalRect.height;

  const dist = Math.hypot(dstX - srcX, dstY - srcY);
  const arcH = Math.min(dist * 0.45, modalRect.height * 0.35);
  const midX = (srcX + dstX) / 2;
  const midY = Math.min(srcY, dstY) - arcH;

  const scrollWrap = document.querySelector('.scroll-wrap');
  if (scrollWrap) scrollWrap.classList.add('scroll-fly-out');

  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute; left:0; top:0; pointer-events:none; z-index:50;
    transform-origin:center center;
    transform:translate(${srcX}px,${srcY}px) translate(-50%,-50%);
  `;
  el.innerHTML = `<img src="${flagUrl(country.code)}" data-code="${country.code}"
    style="width:${flagW}px; aspect-ratio:5/3; object-fit:${country.code === 'np' ? 'contain' : 'cover'};
    border-radius:4px; box-shadow:0 6px 20px rgba(0,0,0,0.55); display:block;" />`;
  modal.appendChild(el);

  el.animate([
    { transform: `translate(${srcX}px, ${srcY}px) translate(-50%,-50%) rotate(-8deg) scale(1)`,   opacity: 0.95 },
    { transform: `translate(${midX}px, ${midY}px) translate(-50%,-50%) rotate(10deg) scale(0.75)`, opacity: 1, offset: 0.42 },
    { transform: `translate(${dstX}px, ${dstY}px) translate(-50%,-50%) rotate(0deg) scale(0.45)`,  opacity: 0.9 },
  ], {
    duration: 1100,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
  }).onfinish = () => {
    el.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 500, delay: 700, fill: 'forwards' })
      .onfinish = () => el.remove();
  };
}

// ===== MAP HIGHLIGHT =====
function highlightCountry(code) {
  const svg = document.getElementById('map-highlight-svg');
  if (!svg) return;
  const coords = getCountryCoords(code);
  if (!coords) return;

  const id = 'flash-' + code;
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

// ===== COUNTRY COORDINATES =====
// x: 0–1000 = full longitude (-180° to +180°)
// y: 0–562 = 16:9 viewport height
function getCountryCoords(code) {
  const map = {
    us:[220,191], gb:[470,146], fr:[480,174], de:[498,157], it:[510,185],
    es:[462,188], jp:[795,185], cn:[715,197], br:[285,332], ca:[195,146],
    au:[760,382], mx:[185,236], in:[655,242], ru:[620,135], kr:[785,197],
    ng:[490,304], za:[520,427], eg:[540,230], ar:[265,399], tr:[560,197],
    se:[510,124], no:[495,118], dk:[495,135], fi:[525,118], ch:[490,169],
    nl:[482,152], be:[482,157], pl:[515,152], pt:[455,191], gr:[530,197],
    ua:[545,163], th:[715,270], vn:[735,275], id:[745,337], my:[728,312],
    ph:[768,281], sg:[730,317], nz:[887,430], sa:[590,253], ae:[608,261],
    il:[553,222], ir:[610,225], pk:[640,230], bd:[678,242], ke:[555,326],
    gh:[465,304], ma:[455,211], cu:[225,256], ie:[455,146], et:[563,309],
    at:[505,166], hu:[518,166], cz:[505,157], sk:[520,160], ro:[530,174],
    bg:[533,180], rs:[523,176], hr:[512,174], si:[505,171], ba:[515,178],
    mk:[527,183], al:[522,189], me:[518,182], lt:[527,143], lv:[527,135],
    ee:[527,127], by:[533,149], md:[538,171], az:[590,200], ge:[580,194],
    am:[578,199], kz:[635,166], uz:[640,208], tm:[628,214], af:[638,222],
    np:[672,234], lk:[668,281], mm:[710,256], kh:[725,283], la:[720,272],
    mn:[715,166], kp:[783,189], co:[248,301], ve:[265,287], cl:[252,391],
    pe:[246,337], ec:[238,315], bo:[263,357], py:[275,377], uy:[280,391],
    gt:[193,264], hn:[200,268], sv:[197,270], ni:[205,275], cr:[210,281],
    pa:[218,287], do:[248,259], ht:[243,262], jm:[233,264], tt:[270,290],
    cy:[548,214], mt:[502,197], lu:[487,161], is:[440,112], dz:[482,225],
    ly:[510,225], tn:[495,208], sd:[543,287], so:[575,309], ug:[543,320],
    zw:[535,399], mz:[548,388], ao:[510,360], cm:[500,304], sn:[442,281],
    ml:[462,270], ci:[462,301], iq:[578,221], sy:[562,214], jo:[557,228],
    lb:[555,217], kw:[590,238], qa:[598,256], bh:[597,253], om:[615,268],
    ye:[590,279], zm:[535,371], rw:[540,329], tz:[548,343], kg:[660,199],
    tj:[653,208], bt:[682,234], mv:[655,304], bn:[742,301], tl:[778,346],
    pg:[808,332], fj:[878,369], ws:[900,371], to:[895,380], vu:[860,365],
    sb:[840,343], ki:[880,304], tv:[890,343], nr:[876,320], mh:[866,301],
    fm:[828,295], pw:[790,301], ad:[475,182], mc:[488,180], sm:[506,178],
    li:[493,166], xk:[523,183], bz:[200,261], bb:[278,281], bs:[232,247],
    gd:[268,288], ag:[268,268], kn:[263,264], dm:[265,275], lc:[267,279],
    vc:[267,283], sr:[277,304], gy:[270,301], ne:[490,279], td:[510,283],
    bf:[468,287], gn:[450,292], gw:[445,290], sl:[448,298], lr:[453,301],
    tg:[473,298], bj:[475,295], cf:[518,301], ss:[545,301], er:[558,290],
    dj:[568,301], bi:[540,335], mw:[548,365], bw:[525,405], na:[510,391],
    ls:[528,418], sz:[535,414], mg:[568,382], mu:[600,391], km:[570,360],
    cv:[432,279], st:[490,317], gq:[495,312], ga:[500,320], cg:[507,332],
    cd:[525,332], mr:[447,256], gm:[440,287],
  };
  return map[code.toLowerCase()] || null;
}

// ===== REVEAL PHRASES =====
const REVEAL_PHRASES = {
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

// ===== PUBLIC ENTRY POINT =====
export async function launch() {
  const countries = await loadCountries();

  function restart() {
    const newRound = buildRound(countries).map((c, i) => buildQuestion(c, i, countries));
    startGame(newRound, showQuestion, restart);
  }

  const round = buildRound(countries).map((c, i) => buildQuestion(c, i, countries));
  startGame(round, showQuestion, restart);
}
