/**
 * 消息自动修复脚本
 * 自动将 en.json 缺失的 key 填充到其他语言文件
 * 新填充的值标记为 "[locale] 原文" 以提示需要翻译
 * 运行: npx tsx scripts/fix-messages.ts
 */

import fs from 'fs';
import path from 'path';

const locales = ['en', 'zh-cn', 'zh-tw', 'de', 'fr', 'es', 'ja', 'ko'];
const messagesDir = path.join(process.cwd(), 'messages');

function getNestedValue(obj: Record<string, unknown>, pathStr: string): unknown {
  return pathStr.split('.').reduce((o: unknown, k: string) => {
    if (o === null || o === undefined) return undefined;
    return (o as Record<string, unknown>)[k];
  }, obj);
}

function setNestedValue(obj: Record<string, unknown>, pathStr: string, value: unknown): void {
  const keys = pathStr.split('.');
  const last = keys.pop()!;
  const target = keys.reduce((o: Record<string, unknown>, k: string) => {
    if (!o[k] || typeof o[k] !== 'object') o[k] = {};
    return o[k] as Record<string, unknown>;
  }, obj);
  target[last] = value;
}

function main() {
  const enPath = path.join(messagesDir, 'en.json');
  const enContent: Record<string, unknown> = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

  // 递归获取所有叶子节点路径和值
  function getLeaves(obj: Record<string, unknown>, prefix = ''): Map<string, string> {
    const leaves = new Map<string, string>();
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [k, v] of getLeaves(value as Record<string, unknown>, fullKey)) {
          leaves.set(k, v);
        }
      } else {
        leaves.set(fullKey, String(value));
      }
    }
    return leaves;
  }

  const enLeaves = getLeaves(enContent);

  for (const locale of locales) {
    if (locale === 'en') continue;

    const filePath = path.join(messagesDir, `${locale}.json`);
    const content: Record<string, unknown> = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      : {};

    let modified = false;

    for (const [key, value] of enLeaves) {
      if (getNestedValue(content, key) === undefined) {
        // 标记为待翻译：显示 [locale] 原文
        setNestedValue(content, key, `[${locale}] ${value}`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
      console.log(`✅ Auto-filled missing keys in ${locale}.json`);
    }
  }

  console.log('\n✅ Done! Files updated with placeholder values. Translate them manually.');
}

main();