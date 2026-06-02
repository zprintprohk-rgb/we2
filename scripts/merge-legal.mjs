/**
 * 把 messages/_legal-content.json 的内容合并到 8 个 locale json 的 legal 节点
 * 策略：只补缺失的 key，不覆盖已有翻译（保护已翻译内容）
 *
 * 使用: node scripts/merge-legal.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Locate project root relative to this script — works regardless of CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MESSAGES = path.join(ROOT, 'messages');
const LOCALES = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es'];

const sourcePath = path.join(MESSAGES, '_legal-content.json');
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Source file not found: ${sourcePath}`);
  process.exit(1);
}

const legalContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

function isObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/** Deep-merge overlay into base, but only for keys missing in base (protect existing translations) */
function deepMergeMissing(base, overlay) {
  for (const [key, value] of Object.entries(overlay)) {
    if (!(key in base)) {
      base[key] = value;
    } else if (isObject(value) && isObject(base[key])) {
      deepMergeMissing(base[key], value);
    }
    // else: base already has a value (e.g. translated string or array) — keep it
  }
}

let updated = 0;
for (const locale of LOCALES) {
  const filePath = path.join(MESSAGES, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${locale}.json not found — skipping`);
    continue;
  }
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!isObject(content.legal)) {
    content.legal = {};
  }
  const before = JSON.stringify(content.legal);
  deepMergeMissing(content.legal, legalContent);
  const after = JSON.stringify(content.legal);
  if (before !== after) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    updated++;
    console.log(`✅ ${locale}.json — legal node updated`);
  } else {
    console.log(`⏭  ${locale}.json — legal node already complete`);
  }
}

console.log(`\n🎉 Done! ${updated}/${LOCALES.length} files updated.`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Run: npm run sync-messages  (verify key alignment)`);
console.log(`   2. Translate the new "legal" nodes in 7 non-English locales`);
console.log(`   3. Use the AI prompt in docs/legal-i18n-prompt.md`);
