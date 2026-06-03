#!/usr/bin/env node
/**
 * Scan messages/*.json for three kinds of i18n bugs:
 *   1) keys whose NAME contains a [locale] prefix (e.g. "nav.[zh-tw]foo": "...").
 *      A locale belongs in the URL, not the translation key name.
 *   2) structural drift: keys present in `en.json` (the source of truth) that
 *      are missing from another locale, and vice-versa.
 *   3) VALUE pollution: keys whose VALUE starts with a [locale] prefix
 *      (e.g. "title": "[zh-tw] Your Pet").  Reports the exact line number
 *      using jsonc-parser's CST.
 *
 * This script is read-only — it never modifies the JSON files.
 *
 * Usage:  node scripts/scan-locale-prefix.js
 */

const fs = require('fs');
const path = require('path');
// No external dependencies — pure Node.js (zero install for CI)

// Accept optional directory argument for CI (e.g. `node scan-locale-prefix.js "$PWD/messages"`)
const userDir = process.argv[2] && !process.argv[2].startsWith("-") ? process.argv[2] : null;
const MESSAGES_DIR = userDir ? path.resolve(userDir) : path.join(__dirname, '..', 'messages');
const SOURCE = 'en';
const TARGETS = ['zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'es', 'fr'];

// Flatten a nested object into { "a.b.c": value } so we can compare keys
function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

function load(name) {
  const file = path.join(MESSAGES_DIR, `${name}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(text);
}

// Matches "[xx]" or "[xx-XX]" at start of a key name
const LOCALE_TAG_RE = /\[[a-z]{2}(?:[-_][a-zA-Z0-9]{2,4})?\]/;

// Matches a value that STARTS with a [locale] prefix (with optional whitespace).
const VALUE_POLLUTION_RE = /^\s*\[[a-z]{2}(?:[-_][a-zA-Z0-9]{2,4})?\]\s+/;

// ---------------------------------------------------------------------------
// VALUE pollution scan with LINE NUMBERS (zero external deps)
// ---------------------------------------------------------------------------

/**
 * Scan a JSON file line-by-line for values that match VALUE_POLLUTION_RE.
 * Tracks the current key path by watching "key": nesting depth.
 * Reports { line, key, value } for each polluted value.
 */
function scanValuePollution(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  // Stack tracking: at depth N, what is the most recent key?
  const keyStack = [];
  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = i + 1;
    // Remove leading/trailing whitespace for pattern matching
    const trimmed = raw.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('//')) continue;

    // Track braces depth
    for (const ch of raw) {
      if (ch === '{' || ch === '[') depth++;
      if (ch === '}' || ch === ']') {
        depth--;
        // Pop keys that belong to the exiting depth
        while (keyStack.length > 0 && keyStack[keyStack.length - 1].depth >= depth) {
          keyStack.pop();
        }
      }
    }

    // Match JSON key-value pairs with string values
    // Pattern: "key": "value" (handles escaping inside value)
    const m = trimmed.match(/^"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/);
    if (!m) continue;

    const rawKey = m[1].replace(/\\"/g, '"');
    const rawValue = m[2].replace(/\\"/g, '"');

    // Remove any stale keys at deeper depths from the stack
    while (keyStack.length > 0 && keyStack[keyStack.length - 1].depth >= depth) {
      keyStack.pop();
    }
    keyStack.push({ key: rawKey, depth });

    // Build full dotted path from stack
    const fullKey = keyStack.map((e) => e.key).join('.');

    if (VALUE_POLLUTION_RE.test(rawValue)) {
      errors.push({ key: fullKey, value: rawValue, line });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main scan logic
// ---------------------------------------------------------------------------

const sourceFlat = flatten(load(SOURCE));
console.log(`# Source of truth: messages/${SOURCE}.json (${Object.keys(sourceFlat).length} keys)\n`);

let totalKeyPrefixBugs = 0;
let totalMissing = 0;
let totalOrphan = 0;
let totalValuePollution = 0;

// Machine-readable report for V5 dashboard consumption
const report = {
  timestamp: new Date().toISOString(),
  source: SOURCE,
  sourceKeyCount: Object.keys(sourceFlat).length,
  locales: {},
};

for (const locale of TARGETS) {
  let flat;
  try {
    flat = flatten(load(locale));
  } catch (e) {
    console.log(`## ${locale}: PARSE ERROR — ${e.message}\n`);
    report.locales[locale] = { syntax: 'PARSE_ERROR', error: e.message };
    continue;
  }

  // --- Check 1: key-name prefix pollution ---
  const keyPrefixBugs = Object.entries(flat).filter(([k]) => LOCALE_TAG_RE.test(k));

  // --- Check 2: missing / orphan keys vs en ---
  const missing = Object.keys(sourceFlat).filter((k) => !(k in flat));
  const orphan = Object.keys(flat).filter((k) => !(k in sourceFlat));

  // --- Check 3: VALUE pollution (with line numbers via jsonc-parser) ---
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const valuePollution = scanValuePollution(filePath);

  console.log(`## ${locale}  (${Object.keys(flat).length} keys)`);
  console.log(`   key-name prefix bugs : ${keyPrefixBugs.length}`);
  console.log(`   value prefix bugs    : ${valuePollution.length}`);
  console.log(`   missing vs en        : ${missing.length}`);
  console.log(`   orphan vs en         : ${orphan.length}`);

  if (keyPrefixBugs.length) {
    console.log(`   --- key-name prefix samples ---`);
    keyPrefixBugs.slice(0, 15).forEach(([k, v]) => {
      const sample = JSON.stringify(v).slice(0, 70);
      console.log(`     • ${k}  =  ${sample}`);
    });
    if (keyPrefixBugs.length > 15) console.log(`     ... and ${keyPrefixBugs.length - 15} more`);
  }
  if (valuePollution.length) {
    console.log(`   --- value prefix samples (with line numbers) ---`);
    valuePollution.slice(0, 15).forEach(({ key, value, line }) => {
      console.log(`     🚨 [Line ${line}] ${key}: ${JSON.stringify(value)}`);
    });
    if (valuePollution.length > 15) console.log(`     ... and ${valuePollution.length - 15} more`);
  }
  if (missing.length && missing.length <= 20) {
    console.log(`   --- missing vs en ---`);
    missing.forEach((k) => console.log(`     ✗ ${k}`));
  } else if (missing.length > 20) {
    console.log(`   --- missing vs en (first 15) ---`);
    missing.slice(0, 15).forEach((k) => console.log(`     ✗ ${k}`));
    console.log(`     ... and ${missing.length - 15} more`);
  }
  if (orphan.length && orphan.length <= 10) {
    console.log(`   --- orphan (not in en) ---`);
    orphan.forEach((k) => console.log(`     ? ${k}`));
  } else if (orphan.length > 10) {
    console.log(`   --- orphan (first 10) ---`);
    orphan.slice(0, 10).forEach((k) => console.log(`     ? ${k}`));
    console.log(`     ... and ${orphan.length - 10} more`);
  }
  console.log();

  totalKeyPrefixBugs += keyPrefixBugs.length;
  totalMissing += missing.length;
  totalOrphan += orphan.length;
  totalValuePollution += valuePollution.length;

  // Machine-readable per-locale score
  const keyCount = Object.keys(flat).length;
  const completeness = keyCount > 0 ? keyCount / Object.keys(sourceFlat).length : 0;
  const hasIssues = keyPrefixBugs.length > 0 || valuePollution.length > 0 || missing.length > 0 || orphan.length > 0;
  report.locales[locale] = {
    syntax: 'ok',
    keyCount,
    sourceKeyCount: Object.keys(sourceFlat).length,
    completeness: Math.round(completeness * 1000) / 1000,
    keyPrefixBugs: keyPrefixBugs.length,
    valuePollution: valuePollution.length,
    missing: missing.length,
    orphan: orphan.length,
    score: hasIssues ? 'MEDIUM' : 'HIGH',
    dirtyKeys: valuePollution.slice(0, 50).map((e) => ({ line: e.line, key: e.key, value: e.value })),
  };
}

// Write machine-readable report for V5 dashboard
const reportPath = path.join(__dirname, '..', 'locale-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n📊 Machine-readable report written to: locale-report.json`);

console.log(`# Totals`);
console.log(`   key-name prefix bugs : ${totalKeyPrefixBugs}`);
console.log(`   value prefix bugs    : ${totalValuePollution}`);
console.log(`   missing keys         : ${totalMissing}`);
console.log(`   orphan keys          : ${totalOrphan}`);

let exitCode = 0;

if (totalKeyPrefixBugs > 0) {
  console.log(`\n⚠️  ${totalKeyPrefixBugs} key(s) have a [locale] in their NAME — the locale should`);
  console.log(`   live in the URL, not the key.`);
  exitCode = 1;
}
if (totalValuePollution > 0) {
  console.log(`\n⚠️  ${totalValuePollution} value(s) have a [locale] prefix in their VALUE —`);
  console.log(`   the translator copied the English text and tagged it without translating.`);
  console.log(`   Run: node scripts/fix-locale-pollution.js`);
  exitCode = 1;
}
if (totalMissing > 0) {
  console.log(`\n⚠️  ${totalMissing} key(s) are missing from one or more locales vs en.json.`);
  exitCode = 1;
}
if (exitCode === 0) {
  console.log(`\n✅ No issues found across ${TARGETS.length} locales.`);
}

process.exit(exitCode);