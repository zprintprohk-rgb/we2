/**
 * 消息同步检查脚本
 * 检查所有语言文件是否包含与 en.json 完全相同的 key 结构
 * 运行: npx tsx scripts/sync-messages.ts
 */

import fs from 'fs';
import path from 'path';

const locales = ['en', 'zh-cn', 'zh-tw', 'de', 'fr', 'es', 'ja', 'ko'];
const messagesDir = path.join(process.cwd(), 'messages');

function getKeys(obj: unknown, prefix = ''): string[] {
  const keys: string[] = [];
  if (obj === null || obj === undefined) return keys;

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function main() {
  const enPath = path.join(messagesDir, 'en.json');
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const enKeys = getKeys(enContent).sort();

  let hasError = false;

  for (const locale of locales) {
    if (locale === 'en') continue;

    const filePath = path.join(messagesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing file: messages/${locale}.json`);
      hasError = true;
      continue;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const keys = getKeys(content).sort();

    const missing = enKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !enKeys.includes(k));

    if (missing.length > 0) {
      console.error(`\n❌ ${locale} missing keys:`);
      missing.forEach((k) => console.error(`   - ${k}`));
      hasError = true;
    }

    if (extra.length > 0) {
      console.warn(`\n⚠️ ${locale} extra keys (not in en):`);
      extra.forEach((k) => console.warn(`   - ${k}`));
    }
  }

  if (hasError) {
    console.error('\n❌ Message sync check FAILED. Run `npm run fix-messages` to auto-fill missing keys.');
    process.exit(1);
  } else {
    console.log('✅ All message files are in sync!');
  }
}

main();