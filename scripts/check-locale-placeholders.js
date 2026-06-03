#!/usr/bin/env node
/**
 * P0-4: Placeholder / ICU Consistency Check
 *
 * Compares all leaf-string values across locales against en.json to
 * detect placeholder mismatches.  A "placeholder" is any `{name}`
 * token used by the app's interpolation layer (e.g. `{year}`,
 * `{discount}`, `{maxSize}`).
 *
 * Detection categories:
 *   🔴 MISSING_PLACEHOLDER — en has it, locale doesn't → runtime `undefined`
 *   🔴 EXTRA_PLACEHOLDER   — locale has it, en doesn't → runtime error
 *   🔴 RENAMED_PLACEHOLDER — same count but different names → wrong data bound
 *   🟡 UNTRANSLATED_VALUE  — value is identical to en (English fallback)
 *   ⚪ UNBALANCED_BRACES   — odd number of `{`/`}` chars → possible typo
 *
 * Usage:
 *   node scripts/check-locale-placeholders.js
 *   node scripts/check-locale-placeholders.js --verbose
 *
 * Exit code: 1 if any 🔴 category has ≥1 error, 0 otherwise.
 */

const fs = require("fs");
const path = require("path");

// ─── config ────────────────────────────────────────────────────────────────
const MESSAGES_DIR = path.resolve(__dirname, "..", "messages");
const SOURCE = "en";
const TARGETS = ["zh-cn", "zh-tw", "ja", "ko", "de", "es", "fr"];
const VERBOSE = process.argv.includes("--verbose");

// ICU plural keywords that should NOT be flagged when different
const ICU_CATEGORIES = new Set([
  "zero", "one", "two", "few", "many", "other",
  "=0", "=1", "=2",
]);

// ─── helpers ───────────────────────────────────────────────────────────────

/** Load + parse a JSON file. */
function loadJSON(locale) {
  const fp = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(fp, "utf8");
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(text);
}

/** Recursively flatten → { "a.b.c": "string value" }, skipping non-strings. */
function flattenStrings(obj, prefix) {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flattenStrings(v, full));
    } else if (typeof v === "string") {
      out[full] = v;
    }
  }
  return out;
}

/**
 * Extract placeholder names from a string.
 * Returns { names: string[], balanced: boolean }.
 *
 * Matches:
 *   {name}
 *   {name, plural, one {x} other {y}}
 *   {count, number, percent}
 *
 * Does NOT capture the inner ICU sub-templates — only the top-level key.
 */
function extractPlaceholders(str) {
  const names = [];
  let balanced = true;
  let depth = 0;

  // Walk character-by-character to track brace balance
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") {
      if (depth === 0) {
        // Start of a placeholder — find the name
        const rest = str.slice(i + 1);
        // Name is the first comma-or-}-delimited token
        const m = rest.match(/^([a-zA-Z_]\w*)\s*[,}]/);
        if (m) names.push(m[1]);
      }
      depth++;
    }
    if (str[i] === "}") {
      depth--;
      if (depth < 0) balanced = false;
    }
  }
  if (depth !== 0) balanced = false;

  return { names, balanced };
}

/**
 * Check if a value is identical to the en source (untranslated).
 */
function isUntranslated(enVal, locVal) {
  return enVal === locVal;
}

/**
 * Compare two placeholder name arrays.
 * Returns { ok, category, detail }.
 */
function comparePlaceholders(enNames, locNames) {
  const enSet = new Set(enNames);
  const locSet = new Set(locNames);

  const missing = [...enSet].filter((n) => !locSet.has(n));
  const extra = [...locSet].filter((n) => !enSet.has(n));

  if (missing.length === 0 && extra.length === 0) {
    return { ok: true, category: null, detail: null };
  }

  if (missing.length > 0 && extra.length === 0) {
    return { ok: false, category: "MISSING_PLACEHOLDER", detail: `missing: ${missing.join(", ")}` };
  }

  if (missing.length === 0 && extra.length > 0) {
    return { ok: false, category: "EXTRA_PLACEHOLDER", detail: `extra: ${extra.join(", ")}` };
  }

  // Both missing and extra → renamed
  return {
    ok: false,
    category: "RENAMED_PLACEHOLDER",
    detail: `en has [${missing.join(", ")}], locale has [${extra.join(", ")}]`,
  };
}

// ─── main ──────────────────────────────────────────────────────────────────

console.log("# Placeholder Consistency Check");
console.log(`  Baseline: messages/${SOURCE}.json`);
console.log("  Format: simple {name} placeholders\n");

const enData = loadJSON(SOURCE);
const enStrings = flattenStrings(enData, "");

let totalErrors = 0;
let totalWarnings = 0;
let totalInfo = 0;

const errorSummary = []; // { locale, key, category, detail }

for (const locale of TARGETS) {
  let locData;
  try {
    locData = loadJSON(locale);
  } catch (e) {
    console.log(`## ${locale}: PARSE ERROR — ${e.message}\n`);
    totalErrors++;
    continue;
  }

  const locStrings = flattenStrings(locData, "");
  let locErrors = 0;
  let locWarnings = 0;
  let locInfo = 0;

  // Check every key that exists in both en and locale
  for (const [key, enVal] of Object.entries(enStrings)) {
    const locVal = locStrings[key];

    // ── key missing entirely (handled by check-translation-completeness) ──
    if (locVal === undefined) continue;

    // ── placeholder extraction ──
    const enPH = extractPlaceholders(enVal);
    const locPH = extractPlaceholders(locVal);

    // ── 🔴 unbalanced braces ──
    if (!enPH.balanced) {
      console.log(`  🔴 [${locale}] UNBALANCED_BRACES in en.json: ${key}`);
      console.log(`     en:    ${enVal}`);
      locErrors++;
      errorSummary.push({ locale, key, category: "UNBALANCED_BRACES_EN", detail: enVal.slice(0, 80) });
    }
    if (!locPH.balanced) {
      console.log(`  🔴 [${locale}] UNBALANCED_BRACES: ${key}`);
      console.log(`     en:    ${enVal}`);
      console.log(`     ${locale}: ${locVal}`);
      locErrors++;
      errorSummary.push({ locale, key, category: "UNBALANCED_BRACES", detail: locVal.slice(0, 80) });
      continue; // skip further checks for unbalanced strings
    }

    // ── 🔴 placeholder comparison (only if en has placeholders) ──
    if (enPH.names.length > 0) {
      const cmp = comparePlaceholders(enPH.names, locPH.names);
      if (!cmp.ok) {
        console.log(`  🔴 [${locale}] ${cmp.category}: ${key}`);
        console.log(`     en:    ${enVal}`);
        console.log(`     ${locale}: ${locVal}`);
        console.log(`     → ${cmp.detail}`);
        locErrors++;
        errorSummary.push({ locale, key, category: cmp.category, detail: cmp.detail });
      }
    } else if (locPH.names.length > 0) {
      // en has no placeholders, but locale does → EXTRA
      console.log(`  🔴 [${locale}] EXTRA_PLACEHOLDER: ${key}`);
      console.log(`     en:    ${enVal}`);
      console.log(`     ${locale}: ${locVal}`);
      console.log(`     → extra: ${locPH.names.join(", ")}`);
      locErrors++;
      errorSummary.push({
        locale,
        key,
        category: "EXTRA_PLACEHOLDER",
        detail: `extra: ${locPH.names.join(", ")}`,
      });
    }

    // ── 🟡 untranslated value ──
    if (isUntranslated(enVal, locVal) && !VERBOSE) {
      // Only report in verbose mode — completeness check already tracks this
      locInfo++;
    }
  }

  // ── ✅ locale summary ──
  const status = locErrors > 0 ? "🔴 FAIL" : "✅ PASS";
  console.log(
    `## ${locale.padEnd(6)} ${status}  (errors: ${locErrors}, warnings: ${locWarnings}, untranslated: ${locInfo})`
  );
  console.log();

  totalErrors += locErrors;
  totalWarnings += locWarnings;
  totalInfo += locInfo;
}

// ─── final summary ────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════");
console.log(`  🔴 Errors:       ${totalErrors}`);
console.log(`  🟡 Warnings:     ${totalWarnings}`);
console.log(`  ⚪ Untranslated: ${totalInfo}`);
console.log("");

if (totalErrors > 0) {
  console.log("🔴 FAIL: Placeholder mismatches detected.");
  console.log("");
  console.log("  Fix guide:");
  console.log("    MISSING_PLACEHOLDER → Add the placeholder to the translation");
  console.log("      Example: en has `{year}`, locale has `2026` → add `{year}` back");
  console.log("");
  console.log("    EXTRA_PLACEHOLDER → Remove the placeholder from the translation");
  console.log("      Example: en has no placeholder, locale has `{foo}` → remove `{foo}`");
  console.log("");
  console.log("    RENAMED_PLACEHOLDER → Use the same name as en.json");
  console.log('      en:  `Saved {fileName}`');
  console.log('      BAD:  `儲存成功（{檔名}）`  ← translated the placeholder name');
  console.log('      OK:   `已儲存 {fileName}`  ← kept the placeholder name');
  console.log("");
  console.log("    UNBALANCED_BRACES → Fix the typo (missing `{` or `}`)");
  process.exit(1);
}

console.log("✅ PASS: All placeholders consistent across locales.");
process.exit(0);