#!/usr/bin/env node
/**
 * check-translation-completeness.js — P0-3: 翻译完整性检查
 *
 * 以 en.json 为基准，逐 key 递归对比所有 locale 缺失情况。
 * 按严重度分级报告，缺失 Critical 节点直接 fail（CI 不通过）。
 *
 * 用法:
 *   node scripts/check-translation-completeness.js
 *
 * 退出码:
 *   0 — 所有 Critical key 完整（允许非 Critical 缺失）
 *   1 — Critical key 缺失（CI fail）
 */

const fs = require("fs");
const path = require("path");

// ─── config ────────────────────────────────────────────────────────────────
const MESSAGES_DIR = path.resolve(__dirname, "..", "messages");
const EN_PATH = path.join(MESSAGES_DIR, "en.json");

const MAIN_LOCALES = [
  { code: "zh-cn", name: "简体中文" },
  { code: "zh-tw", name: "繁體中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
];

/**
 * Key path patterns classified by severity.
 * The first matching pattern wins (order matters).
 * Patterns are tested against dot-joined key paths like "legal.privacy.title".
 */
const SEVERITY_RULES = [
  // ── 🔴 Critical: 缺失会爆 UI 崩溃 / 空白页 ──
  { pattern: /^legal\./, severity: "critical", label: "legal pages" },
  { pattern: /^nav\./, severity: "critical", label: "navigation" },
  { pattern: /^seo\./, severity: "critical", label: "SEO meta" },
  { pattern: /^home\.hero\./, severity: "critical", label: "hero section" },
  { pattern: /^pricing\./, severity: "critical", label: "pricing" },
  { pattern: /^footer\./, severity: "critical", label: "footer" },

  // ── 🟡 Important: 缺失影响体验但不会崩溃 ──
  { pattern: /^home\./, severity: "important", label: "home page" },
  { pattern: /^features\./, severity: "important", label: "features" },
  { pattern: /^demo\./, severity: "important", label: "demo section" },
  { pattern: /^auth\./, severity: "important", label: "auth flow" },
  { pattern: /^settings\./, severity: "important", label: "settings" },
  { pattern: /^error\./, severity: "important", label: "error pages" },
  { pattern: /^404\./, severity: "important", label: "404 page" },

  // ── ⚪ Nice-to-have: 不影响功能 ──
  { pattern: /^meta\./, severity: "info", label: "meta info" },
  { pattern: /^description$/i, severity: "info", label: "descriptions" },
  { pattern: /^longDesc$/i, severity: "info", label: "long descriptions" },
  { pattern: /./, severity: "important", label: "general" }, // default catch-all
];

// ─── helpers ───────────────────────────────────────────────────────────────

/**
 * Recursively walk a JSON object and collect all dot-path keys (leaf values).
 */
function collectKeys(obj, prefix = "") {
  const keys = [];
  if (obj === null || obj === undefined) return keys;
  if (typeof obj !== "object" || Array.isArray(obj)) {
    keys.push(prefix);
    return keys;
  }
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(...collectKeys(obj[key], fullKey));
  }
  return keys;
}

/**
 * Recursively walk a JSON object, returning { keyPath: value } for all leaf values.
 */
function collectLeafValues(obj, prefix = "") {
  const result = {};
  if (obj === null || obj === undefined) return result;
  if (typeof obj !== "object" || Array.isArray(obj)) {
    result[prefix] = obj;
    return result;
  }
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    Object.assign(result, collectLeafValues(obj[key], fullKey));
  }
  return result;
}

/**
 * Determine severity for a key path.
 */
function getSeverity(keyPath) {
  for (const rule of SEVERITY_RULES) {
    if (rule.pattern.test(keyPath)) {
      return { severity: rule.severity, label: rule.label };
    }
  }
  return { severity: "important", label: "general" };
}

/**
 * Check if a value is identical between en and locale (untranslated).
 * For string values, direct comparison. For objects/arrays, JSON compare.
 */
function isUntranslated(enValue, locValue) {
  if (typeof enValue === "string" && typeof locValue === "string") {
    return enValue === locValue;
  }
  return JSON.stringify(enValue) === JSON.stringify(locValue);
}

// ─── main ──────────────────────────────────────────────────────────────────

console.log("# Translation Completeness Check");
console.log(`  Baseline: messages/en.json\n`);

const enRaw = fs.readFileSync(EN_PATH, "utf8");
const enData = JSON.parse(enRaw);
const enKeys = new Set(collectKeys(enData));
const enValues = collectLeafValues(enData);

let anyCriticalMissing = false;
const report = [];

for (const locale of MAIN_LOCALES) {
  const filePath = path.join(MESSAGES_DIR, `${locale.code}.json`);

  if (!fs.existsSync(filePath)) {
    report.push({
      locale: locale.code,
      name: locale.name,
      status: "MISSING_FILE",
      critical: enKeys.size,
      important: 0,
      info: 0,
      untranslated: 0,
      total: enKeys.size,
    });
    anyCriticalMissing = true;
    continue;
  }

  const locRaw = fs.readFileSync(filePath, "utf8");
  const locData = JSON.parse(locRaw);
  const locKeys = new Set(collectKeys(locData));
  const locValues = collectLeafValues(locData);

  const missingKeys = [...enKeys].filter((k) => !locKeys.has(k));
  const extraKeys = [...locKeys].filter((k) => !enKeys.has(k));

  // Classify missing keys by severity
  let critical = 0,
    important = 0,
    info = 0;
  const criticalList = [],
    importantList = [],
    infoList = [];

  for (const key of missingKeys) {
    const { severity, label } = getSeverity(key);
    if (severity === "critical") {
      critical++;
      criticalList.push({ key, label });
    } else if (severity === "important") {
      important++;
      if (importantList.length < 10) importantList.push(key); // keep first 10 for display
    } else {
      info++;
      if (infoList.length < 5) infoList.push(key);
    }
  }

  // Count untranslated (value identical to en)
  let untranslatedCount = 0;
  for (const key of locKeys) {
    if (enValues.hasOwnProperty(key) && locValues.hasOwnProperty(key)) {
      if (isUntranslated(enValues[key], locValues[key])) {
        untranslatedCount++;
      }
    }
  }

  const totalMissing = critical + important + info;
  const totalEn = enKeys.size;
  const translated = totalEn - totalMissing;
  const pct = ((translated / totalEn) * 100).toFixed(1);

  report.push({
    locale: locale.code,
    name: locale.name,
    status: critical > 0 ? "CRITICAL" : important > 5 ? "WARN" : "OK",
    critical,
    important,
    info,
    untranslated: untranslatedCount,
    total: totalEn,
    pct,
    criticalList,
    importantList,
    infoList,
    extraKeys: extraKeys.length > 0 ? extraKeys.slice(0, 5) : [],
  });

  if (critical > 0) anyCriticalMissing = true;
}

// ─── output ────────────────────────────────────────────────────────────────

// Table header
console.log(
  "┌──────────┬────────────────┬─────────┬────────┬───────────┬───────────┬───────────┬─────────────┬──────────┐"
);
console.log(
  "│ Locale   │ Name           │ Status  │   Crit │  Missing  │  Untrans. │  Extra    │  Coverage   │  Score   │"
);
console.log(
  "├──────────┼────────────────┼─────────┼────────┼───────────┼───────────┼───────────┼─────────────┼──────────┤"
);

for (const r of report) {
  const statusColor =
    r.status === "CRITICAL" ? "🔴" : r.status === "WARN" ? "🟡" : "✅";
  const missingTotal = r.critical + r.important + r.info;
  const score =
    r.status === "CRITICAL"
      ? "FAIL"
      : r.untranslated > r.total * 0.3
        ? "LOW"
        : r.untranslated > r.total * 0.1
          ? "MED"
          : "HIGH";

  console.log(
    `│ ${r.locale.padEnd(8)} │ ${r.name.padEnd(14)} │ ${statusColor.padEnd(5)}   │ ${String(r.critical).padEnd(6)} │ ${String(missingTotal).padEnd(9)} │ ${String(r.untranslated).padEnd(9)} │ ${String(r.extraKeys.length).padEnd(9)} │ ${(r.pct + "%").padEnd(11)} │ ${score.padEnd(8)} │`
  );
}

console.log(
  "└──────────┴────────────────┴─────────┴────────┴───────────┴───────────┴───────────┴─────────────┴──────────┘"
);
console.log("");

// ─── detail output per locale ──────────────────────────────────────────────
for (const r of report) {
  if (r.status === "OK" && r.untranslated === 0 && r.extraKeys.length === 0)
    continue;

  console.log(`## ${r.locale} (${r.name})`);
  console.log(`  Status: ${r.status}`);
  console.log(`  Coverage: ${r.pct}% (${r.total - r.critical - r.important - r.info}/${r.total} keys)`);

  if (r.status === "MISSING_FILE") {
    console.log(
      `  ❌ File missing entirely — run: node scripts/sync-messages.ts`
    );
    console.log("");
    continue;
  }

  if (r.critical > 0) {
    console.log(`  🔴 Critical missing (${r.critical} keys):`);
    for (const item of r.criticalList) {
      console.log(`     - ${item.key}  [${item.label}]`);
    }
  }

  if (r.important > 0) {
    console.log(`  🟡 Important missing (${r.important} keys):`);
    if (r.importantList.length < r.important) {
      console.log(
        `     (showing first ${r.importantList.length} of ${r.important})`
      );
    }
    for (const key of r.importantList) {
      console.log(`     - ${key}`);
    }
  }

  if (r.info > 0) {
    console.log(`  ⚪ Info-level missing (${r.info} keys)`);
  }

  if (r.untranslated > 0) {
    const untPct = ((r.untranslated / r.total) * 100).toFixed(1);
    console.log(
      `  ⚠️  Untranslated (${r.untranslated} keys, ${untPct}%) — values match en.json exactly`
    );
    console.log(
      `     → Translators: replace English values with ${r.name} translations`
    );
  }

  if (r.extraKeys.length > 0) {
    console.log(
      `  ⚠️  Extra keys not in en.json (${r.extraKeys.length}):`
    );
    for (const key of r.extraKeys) {
      console.log(`     - ${key}`);
    }
    console.log(
      `     → These keys exist in ${r.locale}.json but not in en.json. Remove or add to en.json first.`
    );
  }

  console.log("");
}

// ─── summary ────────────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════");
if (anyCriticalMissing) {
  console.log("🔴 FAIL: Critical keys missing in one or more locales.");
  console.log("");
  console.log("  Fix options:");
  console.log("    1. Run `node scripts/sync-messages.ts` to auto-generate missing keys from en.json");
  console.log("    2. Manually add missing legal.* pages with correct translations");
  console.log("    3. Check docs/legal-i18n-prompt.md for legal translation workflow");
  process.exit(1);
} else {
  console.log("✅ PASS: All critical keys present across all locales.");
  console.log("");
  console.log("  Score Legend:");
  console.log("    HIGH — >90% translated, minimal English fallback");
  console.log("    MED  — 70-90% translated, moderate fallback");
  console.log("    LOW  — <70% translated, significant English fallback");
  console.log("");
  console.log("  Next: Review 🟡 important missing keys for best UX.");
  process.exit(0);
}