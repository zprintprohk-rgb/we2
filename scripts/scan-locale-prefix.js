#!/usr/bin/env node
/**
 * Scan messages/*.json for two kinds of i18n bugs:
 *   1) keys whose NAME contains a [locale] prefix (e.g. "nav.[zh-tw]foo": "...").
 *      A locale belongs in the URL, not the translation key name.
 *   2) structural drift: keys present in `en.json` (the source of truth) that
 *      are missing from another locale, and vice-versa.
 *
 * This script is read-only — it never modifies the JSON files. After the
 * report, we decide which keys to rename/remove and which to translate.
 *
 * Usage:  node scripts/scan-locale-prefix.js
 */

const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const SOURCE = 'en';
const TARGETS = ['zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'es', 'fr'];

// Flatten a nested object into { "a.b.c": value } so we can compare keys
// across locales without worrying about object identity.
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
  // Strip UTF-8 BOM if present (PowerShell `Set-Content` on Windows often
  // adds one, which breaks `JSON.parse` on Node 18+).
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(text);
}

const LOCALE_TAG_RE = /\[[a-z]{2}(?:[-_][a-zA-Z0-9]{2,4})?\]/;

const sourceFlat = flatten(load(SOURCE));
console.log(`# Source of truth: messages/${SOURCE}.json (${Object.keys(sourceFlat).length} keys)\n`);

let totalPrefixBugs = 0;
let totalMissing = 0;
let totalOrphan = 0;

for (const locale of TARGETS) {
  let flat;
  try {
    flat = flatten(load(locale));
  } catch (e) {
    console.log(`## ${locale}: PARSE ERROR — ${e.message}\n`);
    continue;
  }

  const prefixBugs = Object.entries(flat).filter(([k]) => LOCALE_TAG_RE.test(k));
  const missing = Object.keys(sourceFlat).filter((k) => !(k in flat));
  const orphan = Object.keys(flat).filter((k) => !(k in sourceFlat));

  console.log(`## ${locale}  (${Object.keys(flat).length} keys)`);
  console.log(`   prefix-in-key bugs : ${prefixBugs.length}`);
  console.log(`   missing vs en      : ${missing.length}`);
  console.log(`   orphan vs en       : ${orphan.length}`);

  if (prefixBugs.length) {
    console.log(`   --- prefix-in-key samples ---`);
    prefixBugs.slice(0, 15).forEach(([k, v]) => {
      const sample = JSON.stringify(v).slice(0, 70);
      console.log(`     • ${k}  =  ${sample}`);
    });
    if (prefixBugs.length > 15) console.log(`     ... and ${prefixBugs.length - 15} more`);
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

  totalPrefixBugs += prefixBugs.length;
  totalMissing += missing.length;
  totalOrphan += orphan.length;
}

console.log(`# Totals`);
console.log(`   prefix-in-key bugs : ${totalPrefixBugs}`);
console.log(`   missing keys       : ${totalMissing}`);
console.log(`   orphan keys        : ${totalOrphan}`);

if (totalPrefixBugs === 0 && totalMissing === 0) {
  console.log(`\n✅ No issues found across ${TARGETS.length} locales.`);
  process.exit(0);
}
if (totalPrefixBugs > 0) {
  console.log(`\n⚠️  ${totalPrefixBugs} key(s) have a [locale] in their NAME — the locale should`);
  console.log(`   live in the URL, not the key. Suggested next step:`);
  console.log(`   1. Pick a new, locale-agnostic name for each`);
  console.log(`   2. Update t('...') callers in src/ to use the new name`);
  console.log(`   3. Delete the old key from every messages/<locale>.json`);
  process.exit(1);
}
process.exit(0);
