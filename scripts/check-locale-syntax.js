#!/usr/bin/env node
/**
 * check-locale-syntax.js — P0-1: JSON 语法预校验
 *
 * 在 scan-locale-prefix.js 之前运行。确保所有 locale JSON 文件可被解析，
 * 否则 scan 脚本根本跑不起来。专治控制字符 (U+0000-U+001F) 等编辑器粘贴产物。
 *
 * 用法:
 *   node scripts/check-locale-syntax.js
 *   node scripts/check-locale-syntax.js --fix     (自动修复常见控制字符)
 *
 * 退出码:
 *   0 — 所有文件通过
 *   1 — 至少一个文件语法错误（CI 会 fail）
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.resolve(__dirname, "..", "messages");
const LOCALE_FILES = [
  "en.json", "zh-cn.json", "zh-tw.json", "ja.json", "ko.json",
  "de.json", "es.json", "fr.json",
  "faq.en.json", "faq.de.json", "faq.es.json", "faq.fr.json",
  "faq.ja.json", "faq.ko.json", "faq.zh-cn.json", "faq.zh-tw.json",
  "guide.en.json", "guide.de.json", "guide.es.json", "guide.fr.json",
  "guide.ja.json", "guide.ko.json", "guide.zh-cn.json", "guide.zh-tw.json",
  "_legal-content.json",
];

const LEGAL_CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;
const CONTROL_CHAR_NAMES = {
  "\x00":"NUL","\x01":"SOH","\x02":"STX","\x03":"ETX","\x04":"EOT",
  "\x05":"ENQ","\x06":"ACK","\x07":"BEL","\x08":"BS","\x0B":"VT",
  "\x0C":"FF","\x0E":"SO","\x0F":"SI","\x10":"DLE","\x11":"DC1",
  "\x12":"DC2","\x13":"DC3","\x14":"DC4","\x15":"NAK","\x16":"SYN",
  "\x17":"ETB","\x18":"CAN","\x19":"EM","\x1A":"SUB","\x1B":"ESC",
  "\x1C":"FS","\x1D":"GS","\x1E":"RS","\x1F":"US",
};

function findControlChars(text) {
  const issues = [];
  const lines = text.split("\n");
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let match;
    LEGAL_CONTROL_CHARS.lastIndex = 0;
    while ((match = LEGAL_CONTROL_CHARS.exec(line)) !== null) {
      const char = match[0];
      const charCode = char.charCodeAt(0);
      issues.push({
        line: lineIdx + 1,
        col: match.index + 1,
        char: charCode,
        name: CONTROL_CHAR_NAMES[char] || `U+${charCode.toString(16).toUpperCase().padStart(4,"0")}`,
        context: line.substring(Math.max(0, match.index - 20), match.index + 20).replace(LEGAL_CONTROL_CHARS, "?"),
      });
    }
  }
  return issues;
}

function stripControlChars(text) {
  return text.replace(LEGAL_CONTROL_CHARS, "");
}

function parseSyntaxError(filePath, err) {
  const posMatch = err.message.match(/position (\d+)/);
  if (!posMatch) return null;
  const pos = parseInt(posMatch[1], 10);
  const text = fs.readFileSync(filePath, "utf8");
  const before = text.substring(0, pos);
  const line = before.split("\n").length;
  const col = pos - before.lastIndexOf("\n");
  const contextStart = Math.max(0, pos - 40);
  const contextEnd = Math.min(text.length, pos + 40);
  const context = text.substring(contextStart, contextEnd).replace(/\n/g, "\\n");
  return { line, col, position: pos, context };
}

// ─── main ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const fixMode = args.includes("--fix");

let totalFiles = 0, passedFiles = 0, failedFiles = 0, fixedFiles = 0;
const allErrors = [];

console.log("# Locale JSON Syntax Check");
console.log(`  Directory: ${MESSAGES_DIR}`);
if (fixMode) console.log("  Mode: --fix (auto-repair enabled)");
console.log("");

for (const filename of LOCALE_FILES) {
  const filePath = path.join(MESSAGES_DIR, filename);
  totalFiles++;

  if (!fs.existsSync(filePath)) {
    allErrors.push({ file: filename, type: "missing", message: `File does not exist: ${filePath}` });
    console.log(`  ⚠️  ${filename}: MISSING (skipped)`);
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let textToParse = raw;
  let hadControlChars = false;

  // Check 1: Control characters
  const controlIssues = findControlChars(raw);
  if (controlIssues.length > 0) {
    hadControlChars = true;
    for (const issue of controlIssues) {
      const hex = issue.char.toString(16).toUpperCase().padStart(4, "0");
      console.log(`  ⚠️  ${filename}: Control char U+${hex} (${issue.name}) at line ${issue.line}, col ${issue.col}`);
      console.log(`      Context: ...${issue.context}...`);
    }
    console.log(`      → Likely cause: editor paste artifact, encoding mismatch`);
    if (fixMode) {
      textToParse = stripControlChars(raw);
      console.log(`      → FIXED: ${controlIssues.length} control char(s) removed`);
    }
    console.log("");
  }

  // Check 2: JSON.parse
  try {
    JSON.parse(textToParse);
    if (hadControlChars && fixMode) {
      fs.writeFileSync(filePath, textToParse + "\n", "utf8");
      fixedFiles++;
      console.log(`  ✅ ${filename}: cleaned and saved`);
    } else if (!hadControlChars) {
      console.log(`  ✅ ${filename}: valid`);
    }
    passedFiles++;
  } catch (err) {
    failedFiles++;
    const posInfo = parseSyntaxError(filePath, err);
    if (posInfo) {
      console.log(`  ❌ ${filename}: SYNTAX ERROR`);
      console.log(`      Line ${posInfo.line}, Col ${posInfo.col} (pos ${posInfo.position}): ${err.message}`);
      console.log(`      Context: ...${posInfo.context}...`);
    } else {
      console.log(`  ❌ ${filename}: ${err.message}`);
    }
    if (hadControlChars) {
      console.log(`      Note: Control chars found AND parse failed after stripping — structural error.`);
    }
    console.log("");
  }
}

// ─── summary ───────────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════");
console.log(`  Files total:   ${totalFiles}`);
console.log(`  ✅ Passed:     ${passedFiles}`);
console.log(`  ❌ Failed:     ${failedFiles}`);
if (fixMode) console.log(`  🔧 Fixed:      ${fixedFiles}`);
console.log("═══════════════════════════════════════════════");

if (fixMode && fixedFiles > 0) {
  console.log("");
  console.log("  Run `git diff messages/` to review changes before committing.");
}

if (failedFiles > 0) {
  console.log("");
  console.log("  Fix suggestions:");
  console.log("    1. If control chars:   node scripts/check-locale-syntax.js --fix");
  console.log("    2. If structural JSON:  Check the file in an editor at the reported line/col.");
  console.log("    3. If missing file:     Run 'node scripts/sync-messages.ts' to generate missing locale files.");
  process.exit(1);
} else {
  console.log("\n✅ All files pass syntax check.");
  process.exit(0);
}