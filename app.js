const quizGrid = document.getElementById('quiz-grid');
const quizModal = document.getElementById('quiz-modal');
const quizStage = document.getElementById('quiz-stage');
const quizFrame = document.getElementById('quiz-frame');
const closeQuizBtn = document.getElementById('close-quiz');
const startFeatured = document.getElementById('start-featured');
const toggleVoice = document.getElementById('toggle-voice');
const toggleSfx = document.getElementById('toggle-sfx');
const toggleAuto = document.getElementById('toggle-auto');
const countdownSelect = document.getElementById('countdown-select');
const ratioSelect = document.getElementById('ratio-select');
const mirrorBtn = document.getElementById('toggle-mirror');
const fullscreenBtn = document.getElementById('toggle-fullscreen');
const recordStart = document.getElementById('record-start');
const recordStop = document.getElementById('record-stop');
const recordStatus = document.getElementById('record-status');

const funNames = [
  'Disco Kiwi',
  'Velvet Tiger',
  'Neon Sprout',
  'Soda Captain',
  'Midnight Pancake',
  'Galaxy Waffle',
  'Bouncy Comet',
  'Mango Rocket'
];

const slogans = [
  'Certified Big Brain',
  'Smooth Operator',
  'Wildcard Genius',
  'Cosmic Thinker',
  'Snack Savant',
  'Brainwave Maestro',
  'Vibe Wizard',
  'Champion of Curious'
];

const quizzes = [
  {
    id: 'flag-frenzy',
    title: 'Flag Frenzy',
    description: 'Quick flag checks with right-or-wrong scoring.',
    type: 'right-wrong',
    duration: 12,
    questions: [
      {
        prompt: 'Which flag is this? (Orange, white, green vertical stripes)',
        options: [
          { text: 'Ireland', correct: true },
          { text: 'Ivory Coast', correct: false },
          { text: 'India', correct: false }
        ]
      },
      {
        prompt: 'Which flag is this? (Red circle on white)',
        options: [
          { text: 'Japan', correct: true },
          { text: 'Bangladesh', correct: false },
          { text: 'Greenland', correct: false }
        ]
      },
      {
        prompt: 'Which flag is this? (Blue-yellow-blue horizontal stripes)',
        options: [
          { text: 'Ukraine', correct: false },
          { text: 'Palau', correct: true },
          { text: 'Sweden', correct: false }
        ]
      }
    ],
    resultMap: (score, total) => {
      if (score === total) return 'Flag Whisperer';
      if (score >= total - 1) return 'Pretty Sharp';
      return 'Warming Up';
    }
  },
  {
    id: 'city-vibes',
    title: 'City Vibes Match',
    description: 'Weighted points = which city style is you.',
    type: 'weighted',
    duration: 14,
    questions: [
      {
        prompt: 'Pick your dream Saturday morning.',
        options: [
          { text: 'Bike ride + espresso', points: 10, vibe: 'Copenhagen' },
          { text: 'Street food crawl', points: 7, vibe: 'Bangkok' },
          { text: 'Gallery + park nap', points: 5, vibe: 'Paris' },
          { text: 'Beach stroll + smoothie', points: 1, vibe: 'Sydney' }
        ]
      },
      {
        prompt: 'Pick a night-out soundtrack.',
        options: [
          { text: 'Lo-fi + neon', points: 10, vibe: 'Tokyo' },
          { text: 'Latin grooves', points: 7, vibe: 'Mexico City' },
          { text: 'Indie chill', points: 5, vibe: 'Portland' },
          { text: 'House party bangers', points: 1, vibe: 'Miami' }
        ]
      },
      {
        prompt: 'Choose a snack.',
        options: [
          { text: 'Croissant', points: 10, vibe: 'Paris' },
          { text: 'Bao buns', points: 7, vibe: 'Taipei' },
          { text: 'Gelato', points: 5, vibe: 'Rome' },
          { text: 'Tacos', points: 1, vibe: 'Austin' }
        ]
      }
    ],
    styles: [
      { min: 24, label: 'City Spark', detail: 'You are the neon pulse and the smart map.' },
      { min: 16, label: 'Midtown Chill', detail: 'Balanced, curious, and quietly iconic.' },
      { min: 0, label: 'Cozy Nomad', detail: 'Soft vibes with surprise adventures.' }
    ]
  },
  {
    id: 'party-energy',
    title: 'Party Energy',
    description: 'Two to four options, pure vibe scoring.',
    type: 'weighted',
    duration: 10,
    questions: [
      {
        prompt: 'Pick your role at the party.',
        options: [
          { text: 'DJ selector', points: 10, vibe: 'Bass Captain' },
          { text: 'Snack curator', points: 7, vibe: 'Flavor Wizard' },
          { text: 'Story teller', points: 5, vibe: 'Lore Keeper' }
        ]
      },
      {
        prompt: 'Pick a vibe light.',
        options: [
          { text: 'Warm fairy lights', points: 10, vibe: 'Cozy Core' },
          { text: 'Laser grid', points: 7, vibe: 'Neon Pulse' },
          { text: 'Candle glow', points: 5, vibe: 'Soft Classic' },
          { text: 'Color splash', points: 1, vibe: 'Bold Pop' }
        ]
      }
    ],
    styles: [
      { min: 16, label: 'Hype Maestro', detail: 'You lift the energy and own the room.' },
      { min: 8, label: 'Mood Director', detail: 'Calm, intentional, everyone trusts you.' },
      { min: 0, label: 'Laidback Icon', detail: 'Effortless charm with surprise heat.' }
    ]
  }
];

let currentQuiz = null;
let currentIndex = 0;
let selections = [];
let scoreTotal = 0;
let timerInterval = null;
let countdownInterval = null;
let recorder = null;
let recordChunks = [];
let recordStream = null;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.15, volume = 0.08) {
  if (!toggleSfx.checked) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function speak(text) {
  if (!toggleVoice.checked) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.05;
  speechSynthesis.speak(utterance);
}

function resetState() {
  currentIndex = 0;
  selections = [];
  scoreTotal = 0;
  clearInterval(timerInterval);
  clearInterval(countdownInterval);
}

function renderQuizCards() {
  quizGrid.innerHTML = '';
  quizzes.forEach((quiz) => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <h3>${quiz.title}</h3>
      <p>${quiz.description}</p>
      <div class="meta">
        <span>${quiz.questions.length} questions</span>
        <span>${quiz.type === 'right-wrong' ? 'Right / Wrong' : 'Weighted vibes'}</span>
        <span>${quiz.duration}s timer</span>
      </div>
      <button class="btn primary">Play</button>
    `;
    card.querySelector('button').addEventListener('click', () => openQuiz(quiz.id));
    quizGrid.appendChild(card);
  });
}

function openQuiz(quizId) {
  currentQuiz = quizzes.find((q) => q.id === quizId);
  if (!currentQuiz) return;
  resetState();
  applyRatio();
  quizModal.classList.remove('hidden');
  quizModal.setAttribute('aria-hidden', 'false');
  startCountdown(() => showQuestion());
}

function closeQuiz() {
  quizModal.classList.add('hidden');
  quizModal.setAttribute('aria-hidden', 'true');
  speechSynthesis.cancel();
  resetState();
}

function applyRatio() {
  quizFrame.classList.remove('wide', 'tall');
  const ratio = ratioSelect.value;
  quizFrame.classList.add(ratio === 'tall' ? 'tall' : 'wide');
}

function startCountdown(onComplete) {
  const seconds = Number(countdownSelect.value || 3);
  let remaining = seconds;
  quizStage.innerHTML = `<div class="countdown">${remaining}</div>`;
  playTone(520, 0.1);
  countdownInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      playTone(720, 0.2);
      onComplete();
    } else {
      quizStage.innerHTML = `<div class="countdown">${remaining}</div>`;
      playTone(520, 0.1);
    }
  }, 1000);
}

function showQuestion() {
  const question = currentQuiz.questions[currentIndex];
  if (!question) {
    showResults();
    return;
  }

  const optionsHtml = question.options
    .map((opt, idx) => `<button class="option-btn" data-idx="${idx}">${opt.text}</button>`)
    .join('');

  quizStage.innerHTML = `
    <div class="quiz-stage">
      <h3>${question.prompt}</h3>
      <div class="timer-bar"><div class="timer-fill" id="timer-fill"></div></div>
      <div class="options">${optionsHtml}</div>
      <div class="points-panel" id="points-panel" hidden>
        <strong>Manual points:</strong>
        <div>${question.options
          .map((opt, idx) => {
            const pts = currentQuiz.type === 'right-wrong' ? (opt.correct ? 1 : 0) : opt.points;
            return `<div>Option ${idx + 1}: ${pts} points</div>`;
          })
          .join('')}</div>
      </div>
    </div>
  `;

  speak(question.prompt);

  const optionButtons = [...quizStage.querySelectorAll('.option-btn')];
  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleSelection(Number(btn.dataset.idx)));
  });

  if (toggleAuto.checked) {
    startTimer();
  }
}

function startTimer() {
  clearInterval(timerInterval);
  const duration = currentQuiz.duration;
  let remaining = duration;
  const timerFill = document.getElementById('timer-fill');
  timerFill.style.width = '100%';
  timerInterval = setInterval(() => {
    remaining -= 0.2;
    const percent = Math.max((remaining / duration) * 100, 0);
    timerFill.style.width = `${percent}%`;
    if (remaining <= 0) {
      clearInterval(timerInterval);
      showManualPoints();
      setTimeout(() => nextQuestion(), 2000);
    }
  }, 200);
}

function showManualPoints() {
  const panel = document.getElementById('points-panel');
  if (panel) panel.hidden = false;
  selections.push(null);
}

function handleSelection(optionIndex) {
  clearInterval(timerInterval);
  const question = currentQuiz.questions[currentIndex];
  const option = question.options[optionIndex];
  selections.push(optionIndex);

  if (currentQuiz.type === 'right-wrong') {
    scoreTotal += option.correct ? 1 : 0;
  } else {
    scoreTotal += option.points;
  }

  playTone(660, 0.12);
  nextQuestion();
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= currentQuiz.questions.length) {
    showResults();
  } else {
    showQuestion();
  }
}

function showResults() {
  const anySelections = selections.some((val) => val !== null && val !== undefined);
  const totalQuestions = currentQuiz.questions.length;

  let title = 'Game Over';
  let detail = '';
  if (currentQuiz.type === 'right-wrong') {
    title = currentQuiz.resultMap(scoreTotal, totalQuestions);
    detail = `Score: ${scoreTotal} / ${totalQuestions}`;
  } else {
    const style = currentQuiz.styles.find((entry) => scoreTotal >= entry.min) || currentQuiz.styles.at(-1);
    title = style.label;
    detail = `Total points: ${scoreTotal}. ${style.detail}`;
  }

  const slogan = slogans[Math.floor(Math.random() * slogans.length)];
  const manualNote = !anySelections
    ? '<p><strong>Manual tally mode:</strong> No selections were made. Use the points listed per question to score together.</p>'
    : '';

  quizStage.innerHTML = `
    <div class="result-card">
      <h3>${title}</h3>
      <p>${detail}</p>
      <p>${slogan}</p>
      ${manualNote}
      ${anySelections ? '<div id="name-entry"></div>' : ''}
      <button class="btn primary" id="play-again">Play another quiz</button>
      <div id="leaderboard" class="leaderboard"></div>
    </div>
  `;

  speak(`${title}. ${detail}`);

  if (anySelections) {
    promptForName();
  }

  document.getElementById('play-again').addEventListener('click', () => {
    closeQuiz();
  });

  if (anySelections) {
    renderLeaderboard();
  }
}

function promptForName() {
  const container = document.getElementById('name-entry');
  let remaining = 7;
  container.innerHTML = `
    <label><strong>Enter your name</strong> (auto-picks in <span id="name-timer">${remaining}</span>s)</label>
    <input id="name-input" type="text" placeholder="Your nickname" />
    <button class="btn ghost" id="submit-name">Save to leaderboard</button>
  `;

  const timerEl = document.getElementById('name-timer');
  const input = document.getElementById('name-input');

  const timer = setInterval(() => {
    remaining -= 1;
    timerEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timer);
      if (!input.value.trim()) {
        input.value = funNames[Math.floor(Math.random() * funNames.length)];
      }
      saveName(input.value.trim());
    }
  }, 1000);

  document.getElementById('submit-name').addEventListener('click', () => {
    clearInterval(timer);
    const name = input.value.trim() || funNames[Math.floor(Math.random() * funNames.length)];
    saveName(name);
  });
}

function saveName(name) {
  const entry = {
    name,
    score: scoreTotal,
    time: new Date().toISOString()
  };
  const key = `bbt-leaderboard-${currentQuiz.id}`;
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  current.push(entry);
  current.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(current.slice(0, 10)));
  renderLeaderboard();
}

function renderLeaderboard() {
  const key = `bbt-leaderboard-${currentQuiz.id}`;
  const data = JSON.parse(localStorage.getItem(key) || '[]');
  const board = document.getElementById('leaderboard');
  if (!board) return;
  board.innerHTML = '<h4>Leaderboard</h4>' +
    (data.length
      ? data.map((entry, idx) => `
        <div class="leaderboard-item">
          <span>#${idx + 1} ${entry.name}</span>
          <span>${entry.score}</span>
        </div>
      `).join('')
      : '<p>No scores yet. Be the first!</p>');
}

mirrorBtn.addEventListener('click', () => {
  document.body.classList.toggle('mirror');
});

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

ratioSelect.addEventListener('change', applyRatio);
closeQuizBtn.addEventListener('click', closeQuiz);
startFeatured.addEventListener('click', () => openQuiz(quizzes[0].id));

recordStart.addEventListener('click', async () => {
  try {
    recordStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    const options = { mimeType: 'video/webm;codecs=vp9' };
    recorder = new MediaRecorder(recordStream, options);
    recordChunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordChunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `big-brain-terry-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      recordStatus.textContent = 'Recording saved (WebM).';
      recordStop.disabled = true;
      recordStart.disabled = false;
    };
    recorder.start();
    recordStatus.textContent = 'Recording...';
    recordStart.disabled = true;
    recordStop.disabled = false;
  } catch (err) {
    recordStatus.textContent = 'Recording failed. Check permissions.';
  }
});

recordStop.addEventListener('click', () => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
  if (recordStream) {
    recordStream.getTracks().forEach((track) => track.stop());
  }
});

renderQuizCards();
