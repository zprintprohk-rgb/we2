// 一次性污染修复脚本
const fs = require('fs');
const path = require('path');
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const POLLUTED = ['zh-tw', 'ja', 'ko', 'es', 'fr'];

function walk(node, fn) {
  if (typeof node === 'string') return fn(node);
  if (Array.isArray(node)) return node.map(v => walk(v, fn));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v, fn);
    return out;
  }
  return node;
}

let total = 0;
const rpt = [];
for (const loc of POLLUTED) {
  const f = path.join(MESSAGES_DIR, loc + '.json');
  const orig = JSON.parse(fs.readFileSync(f, 'utf8'));
  // 匹配 "[xx]" 或 "[xx-xx]" 开头的污染
  const re = new RegExp('^\\[' + loc.replace('-', '\\-') + '\\]\\s*', 'i');
  let count = 0;
  const fixed = walk(orig, (s) => {
    if (re.test(s)) { count++; return s.replace(re, ''); }
    return s;
  });
  if (count === 0) { rpt.push(`${loc}: OK (0 pollution)`); continue; }
  fs.writeFileSync(f + '.bak', JSON.stringify(orig, null, 2) + '\n');
  fs.writeFileSync(f, JSON.stringify(fixed, null, 2) + '\n');
  total += count;
  rpt.push(`${loc}: FIXED ${count}`);
}
console.log('=== Pollution Fix Report ===');
rpt.forEach(l => console.log('  ' + l));
console.log('=== Total: ' + total + ' pollution(s) fixed ===');
