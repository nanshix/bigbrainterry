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

// Call this synchronously during a user gesture (before any awaits) to unlock the AudioContext.
export function initAudio() {
  const ctx = getAudio();
  if (ctx.state === 'suspended') ctx.resume();
}

export function playTick()      { beep(700,  0.07, 'square', 0.12); }
export function playUrgent()    { beep(1000, 0.07, 'square', 0.18); }
export function playReveal()    { [440,554,659].forEach((f,i)   => setTimeout(() => beep(f, 0.15, 'sine', 0.2),  i * 80)); }
export function playCorrect()   { [523,659,784].forEach((f,i)   => setTimeout(() => beep(f, 0.18, 'sine', 0.28), i * 90)); }
export function playMilestone() { [523,659,784,1047].forEach((f,i) => setTimeout(() => beep(f, 0.18, 'sine', 0.3),  i * 100)); }
export function playGameOver()  { [784,659,523,440].forEach((f,i) => setTimeout(() => beep(f, 0.22, 'sine', 0.28), i * 140)); }
