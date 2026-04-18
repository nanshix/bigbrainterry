// Loads design/config.yaml (global) + design/config/<gameId>.yaml (override),
// merges them, and returns a plain JS object with camelCase keys.

function parseYaml(text) {
  const result = {};
  for (const line of text.split('\n')) {
    const clean = line.replace(/#.*$/, '').trim();
    if (!clean) continue;
    const m = clean.match(/^([\w]+):\s*(.+)$/);
    if (!m) continue;
    const val = m[2].trim();
    result[m[1]] = isNaN(val) ? val : Number(val);
  }
  return result;
}

function snakeToCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export async function loadGameConfig(gameId) {
  const [globalText, gameText] = await Promise.all([
    fetch('design/config.yaml').then(r => r.text()).catch(() => ''),
    fetch(`design/config/${gameId}.yaml`).then(r => r.text()).catch(() => ''),
  ]);

  const merged = { ...parseYaml(globalText), ...parseYaml(gameText) };

  const config = {};
  for (const [k, v] of Object.entries(merged)) {
    if (v === 'engine-default') continue;
    config[snakeToCamel(k)] = v;
  }
  return config;
}
