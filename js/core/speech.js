let _voice = null;

function initVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const prefer = ['Google UK English Female', 'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona'];
  for (const name of prefer) {
    const v = voices.find(v => v.name === name);
    if (v) { _voice = v; return; }
  }
  _voice = voices.find(v => /female/i.test(v.name)) || voices[0] || null;
}

speechSynthesis.addEventListener('voiceschanged', initVoice);
initVoice();

export function speak(text, { rate = 1, pitch = 1.1, vol = 1, interrupt = false, onend = null } = {}) {
  if (interrupt) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (_voice) u.voice = _voice;
  u.rate = rate;
  u.pitch = pitch;
  u.volume = vol;
  if (onend) u.onend = onend;
  speechSynthesis.speak(u);
}
