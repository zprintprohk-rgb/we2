#!/usr/bin/env node
/**
 * Fix VALUE pollution in locale message files — V2 with backup + diff preview.
 *
 * Problem: 5 locale files (zh-tw, ja, ko, es, fr) had values with
 * [locale] prefixes like "[zh-tw] Hunger" instead of correct translations.
 *
 * Modes:
 *   --mode preview   Write a unified diff to locale-fix-preview.diff (default)
 *   --mode apply     Replace polluted values AND create *.bak.<ts> backups
 *   --mode rollback  Restore from the latest *.bak.* backups
 *
 * Usage:
 *   node scripts/fix-locale-pollution.js --mode preview
 *   node scripts/fix-locale-pollution.js --mode apply
 *   node scripts/fix-locale-pollution.js --mode rollback
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── config ────────────────────────────────────────────────────────────────
const MESSAGES_DIR = path.join(__dirname, "..", "messages");
const SOURCE = "en";
const POLLUTED = ["zh-tw", "ja", "ko", "es", "fr"];

// Matches a value that STARTS with a [locale] prefix
const VALUE_POLLUTION_RE = /^\s*\[[a-z]{2}(?:[-_][a-zA-Z0-9]{2,4})?\]\s+/;

// ─── CLI parser ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const modeIdx = argv.indexOf("--mode");
  const mode = modeIdx >= 0 ? (argv[modeIdx + 1] || "preview") : "preview";
  if (!["preview", "apply", "rollback"].includes(mode)) {
    console.error(`Unknown mode: ${mode}. Use preview | apply | rollback.`);
    process.exit(2);
  }
  return { mode };
}

// ─── helpers ───────────────────────────────────────────────────────────────
function loadJSON(name) {
  const file = path.join(MESSAGES_DIR, `${name}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(text);
}

function saveJSON(name, data) {
  const file = path.join(MESSAGES_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/**
 * Deep-crawl the target object. For every leaf value that matches
 * VALUE_POLLUTION_RE, replace it with the corresponding value from
 * the source object. Returns { fixed: number, details: ChangeRecord[], data }.
 */
function fixPollution(source, target) {
  let fixed = 0;
  /** @type {{ keyPath: string, oldVal: string, newVal: string }[]} */
  const details = [];

  function walk(src, tgt, keyPath) {
    if (tgt === null || tgt === undefined) return tgt;
    if (Array.isArray(tgt)) {
      return tgt.map((item, i) => {
        const sp = src && Array.isArray(src) ? src[i] : undefined;
        return walk(sp, item, `${keyPath}[${i}]`);
      });
    }
    if (typeof tgt === "object") {
      const result = {};
      for (const k of Object.keys(tgt)) {
        const sp = src && typeof src === "object" && !Array.isArray(src) ? src[k] : undefined;
        result[k] = walk(sp, tgt[k], keyPath ? `${keyPath}.${k}` : k);
      }
      return result;
    }
    // Leaf value (string, number, boolean)
    if (typeof tgt === "string" && VALUE_POLLUTION_RE.test(tgt)) {
      const clean = typeof src === "string" ? src : tgt.replace(VALUE_POLLUTION_RE, "");
      details.push({ keyPath, oldVal: tgt, newVal: clean });
      fixed++;
      return clean;
    }
    return tgt;
  }

  const newTarget = walk(source, target, "");
  return { fixed, details, data: newTarget };
}

// ─── modes ─────────────────────────────────────────────────────────────────

function modePreview() {
  const enData = loadJSON(SOURCE);
  const diffs = [];
  let totalChanges = 0;

  for (const locale of POLLUTED) {
    try {
      const targetData = loadJSON(locale);
      const { fixed, details, data } = fixPollution(enData, targetData);

      if (fixed > 0) {
        // Write temp fixed file for diff
        const tmpPath = path.join(MESSAGES_DIR, `.${SOURCE}.tmp.${locale}.json`);
        saveJSON(`.${SOURCE}.tmp.${locale}`, data);
        const origPath = path.join(MESSAGES_DIR, `${locale}.json`);

        // Generate unified diff via git (falls back to plain diff if no git)
        try {
          const diffOutput = execSync(
            `git diff --no-index -- "${origPath}" "${tmpPath}"`,
            { encoding: "utf8", stdio: "pipe", timeout: 10000 }
          );
          diffs.push(`\n## ${locale}.json (${fixed} changes)\n${diffOutput}`);
        } catch (e) {
          // git diff exits 1 when there are differences (expected)
          diffs.push(`\n## ${locale}.json (${fixed} changes)\n${e.stdout || e.stderr || ""}`);
        }

        fs.unlinkSync(tmpPath);
        totalChanges += fixed;
      }
    } catch (e) {
      diffs.push(`\n## ${locale}.json: ERROR — ${e.message}`);
    }
  }

  const diffFile = path.join(MESSAGES_DIR, "..", "locale-fix-preview.diff");
  const content =
    `# Locale Pollution Fix Preview — ${new Date().toISOString()}\n` +
    `# Total changes: ${totalChanges} across ${POLLUTED.length} files\n` +
    `#\n` +
    `# To apply:   node scripts/fix-locale-pollution.js --mode apply\n` +
    `# To discard:  rm locale-fix-preview.diff\n` +
    diffs.join("");

  fs.writeFileSync(diffFile, content, "utf8");
  console.log(`Preview: ${totalChanges} changes written to locale-fix-preview.diff`);
  console.log(`Run: node scripts/fix-locale-pollution.js --mode apply`);
}

function modeApply() {
  const enData = loadJSON(SOURCE);
  const ts = Date.now();
  let totalFixed = 0;
  const touched = [];

  for (const locale of POLLUTED) {
    try {
      const targetData = loadJSON(locale);
      const { fixed, details, data } = fixPollution(enData, targetData);

      if (fixed > 0) {
        // 1) Backup → messages/<locale>.json.bak.<ts>
        const origPath = path.join(MESSAGES_DIR, `${locale}.json`);
        const bakPath = path.join(MESSAGES_DIR, `${locale}.json.bak.${ts}`);
        fs.copyFileSync(origPath, bakPath);

        // 2) Apply fix
        saveJSON(locale, data);

        console.log(`✅ ${locale}: ${fixed} value(s) fixed`);
        details.forEach((d) => console.log(`  ${d.keyPath}: "${d.oldVal}" → "${d.newVal}"`));
        console.log();
        touched.push(locale);
        totalFixed += fixed;
      }
    } catch (e) {
      console.error(`❌ ${locale}: ERROR — ${e.message}\n`);
    }
  }

  console.log(`\nTotal values fixed: ${totalFixed}`);
  console.log(`Backups: messages/*.json.bak.${ts}`);
  console.log(`Rollback: node scripts/fix-locale-pollution.js --mode rollback`);
  console.log(`Verify:   node scripts/scan-locale-prefix.js`);
}

function modeRollback() {
  // Find the latest backup timestamp across all files
  const files = fs.readdirSync(MESSAGES_DIR);
  const bakPattern = /^([a-z]{2}(?:-[a-z]{2})?\.json)\.bak\.(\d+)$/;
  const byTimestamp = {};
  for (const f of files) {
    const m = bakPattern.exec(f);
    if (!m) continue;
    const orig = m[1];
    const ts = Number(m[2]);
    if (!byTimestamp[ts]) byTimestamp[ts] = [];
    byTimestamp[ts].push(orig);
  }

  const timestamps = Object.keys(byTimestamp).map(Number).sort((a, b) => b - a);
  if (timestamps.length === 0) {
    console.log("No backups found. Nothing to roll back.");
    process.exit(0);
  }

  const latestTs = timestamps[0];
  console.log(`Rolling back to backup timestamp: ${new Date(latestTs).toISOString()}`);
  for (const orig of byTimestamp[latestTs]) {
    const bakPath = path.join(MESSAGES_DIR, `${orig}.bak.${latestTs}`);
    const origPath = path.join(MESSAGES_DIR, orig);
    fs.copyFileSync(bakPath, origPath);
    console.log(`  ✅ ${orig} restored`);
  }
  console.log(`\nDone. Backups preserved at */*.bak.${latestTs}`);
}

// ─── main ──────────────────────────────────────────────────────────────────
const { mode } = parseArgs(process.argv.slice(2));

switch (mode) {
  case "preview":
    modePreview();
    break;
  case "apply":
    modeApply();
    break;
  case "rollback":
    modeRollback();
    break;
}