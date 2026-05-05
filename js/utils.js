export function injectCrack(btn, seq = 0) {
  const div = document.createElement('div');
  div.className = 'crack-overlay';
  div.style.setProperty('--cd', `${seq * 55}ms`);
  div.innerHTML = `<svg viewBox="0 0 100 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="60" fill="white" class="crack-flash-rect"/>
  <g stroke="white" fill="none" stroke-linecap="round" stroke-linejoin="round" class="crack-lines-g">
    <path d="M42,28 L20,6 L8,0"     stroke-width="1.8" stroke-opacity="0.95"/>
    <path d="M42,28 L35,4 L30,0"    stroke-width="1.3" stroke-opacity="0.85"/>
    <path d="M42,28 L58,8 L78,0"    stroke-width="1.7" stroke-opacity="0.95"/>
    <path d="M42,28 L70,20 L100,16" stroke-width="1.5" stroke-opacity="0.9"/>
    <path d="M42,28 L72,44 L100,52" stroke-width="1.6" stroke-opacity="0.95"/>
    <path d="M42,28 L50,56 L46,60"  stroke-width="1.3" stroke-opacity="0.85"/>
    <path d="M42,28 L22,50 L6,60"   stroke-width="1.6" stroke-opacity="0.95"/>
    <path d="M42,28 L10,32 L0,30"   stroke-width="1.5" stroke-opacity="0.9"/>
    <path d="M58,8 L68,4"           stroke-width="1.0" stroke-opacity="0.75"/>
    <path d="M72,44 L80,56 L94,60"  stroke-width="1.0" stroke-opacity="0.75"/>
    <path d="M22,50 L14,56"         stroke-width="0.9" stroke-opacity="0.7"/>
    <circle cx="42" cy="28" r="2.8" fill="white" fill-opacity="0.98" stroke="none"/>
  </g>
</svg>`;
  btn.appendChild(div);
  setTimeout(() => btn.classList.add('crack-shatter'), 300 + seq * 55);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function flagUrl(code) {
  return `assets/flags/${code.toLowerCase()}.png`;
}

// Minimal CSV parser: skips comment lines (#), handles quoted fields
export function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim() && !l.trimStart().startsWith('#'));
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? '').trim()]));
  });
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}
