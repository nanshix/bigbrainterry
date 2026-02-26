const quizGrid = document.getElementById('quiz-grid');
const quizModal = document.getElementById('quiz-modal');
const quizStage = document.getElementById('quiz-stage');
const closeQuizBtn = document.getElementById('close-quiz');
const startFeatured = document.getElementById('start-featured');

const quiz = {
  id: 'flag-rush',
  title: 'Flag Rush',
  description: 'Pick the right flag.',
  duration: 10,
  questions: []
};

const flags = [
  { name: 'Japan', type: 'circle', bg: '#ffffff', circle: '#bc002d' },
  { name: 'Bangladesh', type: 'circle', bg: '#006a4e', circle: '#f42a41' },
  { name: 'Switzerland', type: 'squareCross', bg: '#d52b1e', cross: '#ffffff' },
  { name: 'Sweden', type: 'cross', bg: '#006aa7', cross: '#fecc00' },
  { name: 'Norway', type: 'crossBorder', bg: '#ba0c2f', border: '#ffffff', cross: '#00205b' },
  { name: 'Denmark', type: 'cross', bg: '#c60c30', cross: '#ffffff' },
  { name: 'Finland', type: 'cross', bg: '#ffffff', cross: '#003580' },
  { name: 'Iceland', type: 'crossBorder', bg: '#003897', border: '#ffffff', cross: '#d72828' },
  { name: 'Germany', type: 'horizontal', colors: ['#000000', '#dd0000', '#ffce00'] },
  { name: 'Netherlands', type: 'horizontal', colors: ['#ae1c28', '#ffffff', '#21468b'] },
  { name: 'Russia', type: 'horizontal', colors: ['#ffffff', '#0033a0', '#d52b1e'] },
  { name: 'France', type: 'vertical', colors: ['#0055a4', '#ffffff', '#ef4135'] },
  { name: 'Italy', type: 'vertical', colors: ['#009246', '#ffffff', '#ce2b37'] },
  { name: 'Belgium', type: 'vertical', colors: ['#000000', '#ffd90c', '#ef3340'] },
  { name: 'Ireland', type: 'vertical', colors: ['#169b62', '#ffffff', '#ff883e'] },
  { name: 'Romania', type: 'vertical', colors: ['#002b7f', '#fcd116', '#ce1126'] },
  { name: 'Ukraine', type: 'horizontal', colors: ['#005bbb', '#ffd500'] },
  { name: 'Poland', type: 'horizontal', colors: ['#ffffff', '#dc143c'] },
  { name: 'Austria', type: 'horizontal', colors: ['#ed2939', '#ffffff', '#ed2939'] },
  { name: 'Hungary', type: 'horizontal', colors: ['#ce2939', '#ffffff', '#477050'] },
  { name: 'Bulgaria', type: 'horizontal', colors: ['#ffffff', '#00966e', '#d62612'] },
  { name: 'Lithuania', type: 'horizontal', colors: ['#fdb913', '#006a44', '#c1272d'] },
  { name: 'Estonia', type: 'horizontal', colors: ['#0072ce', '#000000', '#ffffff'] },
  { name: 'Latvia', type: 'horizontal', colors: ['#8c1c13', '#ffffff', '#8c1c13'], ratios: [0.42, 0.16, 0.42] },
  { name: 'Nigeria', type: 'vertical', colors: ['#008751', '#ffffff', '#008751'] },
  { name: 'Peru', type: 'vertical', colors: ['#d91023', '#ffffff', '#d91023'] },
  { name: 'Spain', type: 'horizontal', colors: ['#aa151b', '#f1bf00', '#aa151b'], ratios: [0.25, 0.5, 0.25] },
  { name: 'Thailand', type: 'horizontal', colors: ['#a51931', '#f4f5f8', '#2d2a4a', '#f4f5f8', '#a51931'], ratios: [0.2, 0.15, 0.3, 0.15, 0.2] },
  { name: 'Argentina', type: 'horizontal', colors: ['#74acdf', '#ffffff', '#74acdf'], circle: '#f6b40e' },
  { name: 'Czechia', type: 'triangle', colors: ['#ffffff', '#d7141a'], triangle: '#11457e' }
];

function flagSVG(flag) {
  const width = 480;
  const height = 320;
  let shapes = '';
  if (flag.type === 'horizontal') {
    const ratios = flag.ratios || new Array(flag.colors.length).fill(1 / flag.colors.length);
    let y = 0;
    ratios.forEach((ratio, idx) => {
      const h = height * ratio;
      shapes += `<rect x="0" y="${y}" width="${width}" height="${h}" fill="${flag.colors[idx]}" />`;
      y += h;
    });
  } else if (flag.type === 'vertical') {
    const ratios = flag.ratios || new Array(flag.colors.length).fill(1 / flag.colors.length);
    let x = 0;
    ratios.forEach((ratio, idx) => {
      const w = width * ratio;
      shapes += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="${flag.colors[idx]}" />`;
      x += w;
    });
  } else if (flag.type === 'circle') {
    shapes += `<rect x="0" y="0" width="${width}" height="${height}" fill="${flag.bg}" />`;
    shapes += `<circle cx="${width / 2}" cy="${height / 2}" r="${height * 0.22}" fill="${flag.circle}" />`;
  } else if (flag.type === 'cross' || flag.type === 'crossBorder') {
    shapes += `<rect x="0" y="0" width="${width}" height="${height}" fill="${flag.bg}" />`;
    const bar = width * 0.18;
    const offset = width * 0.32;
    if (flag.type === 'crossBorder') {
      const border = bar * 1.4;
      shapes += `<rect x="${offset - border / 2}" y="0" width="${border}" height="${height}" fill="${flag.border}" />`;
      shapes += `<rect x="0" y="${height / 2 - border / 2}" width="${width}" height="${border}" fill="${flag.border}" />`;
    }
    shapes += `<rect x="${offset - bar / 2}" y="0" width="${bar}" height="${height}" fill="${flag.cross}" />`;
    shapes += `<rect x="0" y="${height / 2 - bar / 2}" width="${width}" height="${bar}" fill="${flag.cross}" />`;
  } else if (flag.type === 'squareCross') {
    shapes += `<rect x="0" y="0" width="${width}" height="${height}" fill="${flag.bg}" />`;
    const bar = height * 0.25;
    shapes += `<rect x="${width / 2 - bar / 2}" y="${height * 0.2}" width="${bar}" height="${height * 0.6}" fill="${flag.cross}" />`;
    shapes += `<rect x="${width * 0.2}" y="${height / 2 - bar / 2}" width="${width * 0.6}" height="${bar}" fill="${flag.cross}" />`;
  } else if (flag.type === 'triangle') {
    shapes += `<rect x="0" y="0" width="${width}" height="${height / 2}" fill="${flag.colors[0]}" />`;
    shapes += `<rect x="0" y="${height / 2}" width="${width}" height="${height / 2}" fill="${flag.colors[1]}" />`;
    shapes += `<polygon points="0,0 ${width * 0.5},${height / 2} 0,${height}" fill="${flag.triangle}" />`;
  }

  if (flag.circle && flag.type === 'horizontal') {
    shapes += `<circle cx="${width / 2}" cy="${height / 2}" r="${height * 0.12}" fill="${flag.circle}" />`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shapes}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildQuestions() {
  const names = flags.map((flag) => flag.name);
  quiz.questions = flags.map((flag) => {
    const choices = new Set([flag.name]);
    while (choices.size < 3) {
      const pick = names[Math.floor(Math.random() * names.length)];
      choices.add(pick);
    }
    const options = Array.from(choices).map((name) => ({
      text: name,
      correct: name === flag.name
    }));
    options.sort(() => Math.random() - 0.5);
    return {
      prompt: 'Which flag?',
      image: flagSVG(flag),
      options
    };
  });
}

buildQuestions();

let currentIndex = 0;
let scoreTotal = 0;
let timerInterval = null;
let countdownInterval = null;

const leaderboardKey = `bbt-leaderboard-${quiz.id}`;
let voiceEnabled = true;

function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function resetState() {
  currentIndex = 0;
  scoreTotal = 0;
  clearInterval(timerInterval);
  clearInterval(countdownInterval);
}

function renderQuizCards() {
  quizGrid.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'quiz-card';
  card.innerHTML = `
      <h3>${quiz.title}</h3>
      <p>${quiz.questions.length} questions</p>
      <button class="btn primary">Play</button>
    `;
  card.querySelector('button').addEventListener('click', () => openQuiz());
  quizGrid.appendChild(card);
}

function openQuiz() {
  resetState();
  quizModal.classList.remove('hidden');
  quizModal.setAttribute('aria-hidden', 'false');
  startCountdown(showQuestion);
}

function closeQuiz() {
  quizModal.classList.add('hidden');
  quizModal.setAttribute('aria-hidden', 'true');
  resetState();
}

function startCountdown(onComplete) {
  let remaining = 3;
  quizStage.innerHTML = `<div class="countdown">${remaining}</div>`;
  speak(String(remaining));
  countdownInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      speak('Go');
      onComplete();
    } else {
      quizStage.innerHTML = `<div class="countdown">${remaining}</div>`;
      speak(String(remaining));
    }
  }, 1000);
}

function showQuestion() {
  const question = quiz.questions[currentIndex];
  if (!question) {
    showResults();
    return;
  }

  const optionsHtml = question.options
    .map((opt, idx) => `<button class="option-btn" data-idx="${idx}">${opt.text}</button>`)
    .join('');

  quizStage.innerHTML = `
    <div class="quiz-stage">
      <img class="flag-image" src="${question.image}" alt="Flag" />
      <div class="timer-bar"><div class="timer-fill" id="timer-fill"></div></div>
      <div class="options">${optionsHtml}</div>
    </div>
  `;

  speak('Which flag?');

  const optionButtons = [...quizStage.querySelectorAll('.option-btn')];
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleSelection(Number(btn.dataset.idx)));
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  const duration = quiz.duration;
  let remaining = duration;
  const timerFill = document.getElementById('timer-fill');
  timerFill.style.width = '100%';
  timerInterval = setInterval(() => {
    remaining -= 0.2;
    const percent = Math.max((remaining / duration) * 100, 0);
    timerFill.style.width = `${percent}%`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      nextQuestion();
    }
  }, 200);
}

function handleSelection(optionIndex) {
  clearInterval(timerInterval);
  const question = quiz.questions[currentIndex];
  const option = question.options[optionIndex];
  if (option.correct) scoreTotal += 1;
  nextQuestion();
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= quiz.questions.length) {
    showResults();
  } else {
    showQuestion();
  }
}

function showResults() {
  const leaderboard = getLeaderboard();
  quizStage.innerHTML = `
    <div class="result-card">
      <h3>Score</h3>
      <p>${scoreTotal} / ${quiz.questions.length}</p>
      <div class="name-row">
        <input id="name-input" type="text" placeholder="Name" />
        <button class="btn ghost" id="save-score">Save</button>
      </div>
      <div class="leaderboard" id="leaderboard"></div>
      <button class="btn primary" id="play-again">Play Again</button>
    </div>
  `;

  speak(`Score ${scoreTotal} out of ${quiz.questions.length}`);

  renderLeaderboard(leaderboard);

  document.getElementById('save-score').addEventListener('click', () => {
    const input = document.getElementById('name-input');
    const name = (input.value || 'Player').trim().slice(0, 12);
    saveScore(name, scoreTotal);
    renderLeaderboard(getLeaderboard());
    input.value = '';
  });

  document.getElementById('play-again').addEventListener('click', () => {
    closeQuiz();
  });
}

function getLeaderboard() {
  return JSON.parse(localStorage.getItem(leaderboardKey) || '[]');
}

function saveScore(name, score) {
  const data = getLeaderboard();
  data.push({ name, score });
  data.sort((a, b) => b.score - a.score);
  localStorage.setItem(leaderboardKey, JSON.stringify(data.slice(0, 10)));
}

function renderLeaderboard(data) {
  const board = document.getElementById('leaderboard');
  if (!board) return;
  if (!data.length) {
    board.innerHTML = '<p>No scores yet.</p>';
    return;
  }
  board.innerHTML = data
    .map(
      (entry, idx) => `
      <div class="leaderboard-item">
        <span>#${idx + 1} ${entry.name}</span>
        <span>${entry.score}</span>
      </div>
    `
    )
    .join('');
}

closeQuizBtn.addEventListener('click', closeQuiz);
startFeatured.addEventListener('click', openQuiz);

renderQuizCards();
