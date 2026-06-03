#!/usr/bin/env node
/**
 * Translation regression detection: compares current translation coverage
 * against a previously saved baseline. Fails if any locale's coverage dropped.
 *
 * Outputs:
 *   EXIT 0 = no regression (or running for the first time)
 *   EXIT 1 = regression detected → CI should fail
 *
 * Usage:
 *   node scripts/check-translation-regression.js          # compare vs baseline
 *   node scripts/check-translation-regression.js --save   # save current as baseline
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASELINE_PATH = path.join(__dirname, '..', '.translation-baseline.json');

function getCurrentCoverage() {
  // The completeness script already outputs locale-report.json
  const reportPath = path.join(__dirname, '..', 'locale-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error('No locale-report.json found. Run node scripts/scan-locale-prefix.js first.');
    process.exit(2);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const coverage = {};

  // locale-report.json uses { locales: { "zh-cn": {...}, "ja": {...} } }
  // Normalize to array for iteration
  const locales = Array.isArray(report.locales)
    ? report.locales
    : Object.entries(report.locales || {}).map(([code, data]) => ({ locale: code, ...data }));

  for (const loc of locales) {
    if (loc.locale === 'en') continue; // skip source of truth
    coverage[loc.locale] = {
      total: loc.totalKeys || loc.keyCount || 0,
      untranslated: loc.untranslated || 0,
      coverage: loc.coverage || loc.completeness || 0,
      score: loc.score || 'UNKNOWN',
    };
  }
  return coverage;
}

const args = process.argv.slice(2);
const saveMode = args.includes('--save') || args.includes('-s');

if (saveMode) {
  const coverage = getCurrentCoverage();
  coverage._savedAt = new Date().toISOString();

  // Also record the en.json hash to detect if source changed
  const en = fs.readFileSync(path.join(__dirname, '..', 'messages', 'en.json'), 'utf8');
  const crypto = require('crypto');
  coverage._enHash = crypto.createHash('sha256').update(en).digest('hex').slice(0, 12);

  fs.writeFileSync(BASELINE_PATH, JSON.stringify(coverage, null, 2) + '\n', 'utf8');
  console.log('✅ Baseline saved to .translation-baseline.json');
  console.log(`   en.json hash: ${coverage._enHash}`);
  for (const [loc, data] of Object.entries(coverage)) {
    if (loc.startsWith('_')) continue;
    console.log(`   ${loc}: ${data.coverage.toFixed(1)}% (${data.total - data.untranslated}/${data.total} translated)`);
  }
  process.exit(0);
}

// ─── Compare mode ───

if (!fs.existsSync(BASELINE_PATH)) {
  console.log('⚠️  No baseline found. Run first: node scripts/check-translation-regression.js --save');
  console.log('   Exiting with success (first run is opt-in only).');
  process.exit(0);
}

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
const current = getCurrentCoverage();

// Check en.json freshness: if en.json changed, note it but don't fail
const en = fs.readFileSync(path.join(__dirname, '..', 'messages', 'en.json'), 'utf8');
const crypto = require('crypto');
const currentEnHash = crypto.createHash('sha256').update(en).digest('hex').slice(0, 12);
if (baseline._enHash && baseline._enHash !== currentEnHash) {
  console.log(`⚠️  en.json has changed since baseline (${baseline._enHash} → ${currentEnHash})`);
  console.log('   Other locales may now have new untranslated keys.');
}

let regressions = 0;
for (const [loc, cur] of Object.entries(current)) {
  const bl = baseline[loc];
  if (!bl) {
    console.log(`⚠️  ${loc}: new locale, no baseline data`);
    continue;
  }

  const curUntranslated = cur.untranslated;
  const blUntranslated = bl.untranslated;
  const delta = curUntranslated - blUntranslated;

  const status = delta > 0
    ? '🔴 REGRESSION'
    : delta < 0
      ? '🟢 IMPROVED'
      : '⚪ unchanged';

  console.log(`   ${loc}: ${curUntranslated} untranslated (was ${blUntranslated}) ${status}`);

  if (delta > 0) {
    regressions++;
    console.log(`      → +${delta} keys lost translation coverage`);
  }
}

if (regressions > 0) {
  console.log(`\n❌ ${regressions} locale(s) have regressed. CI gate FAILED.`);
  console.log('   Run "node scripts/check-translation-regression.js --save" to accept after fixing.');
  process.exit(1);
}

console.log('\n✅ No translation regression detected.');