# 8-locale integrity guide (Togthr.life)

Owner: `i18n-expert` rein. Last bootstrap: 2026-06-07.

## Locales

8 locales, fixed list. The 9th locale is **not** yours to add — escalate to orchestrator.

| Code | Language | Notes |
|---|---|---|
| `en` | English (US) | Default. Source of truth for new key text. |
| `zh-cn` | Chinese (Simplified, Mainland) | Alipay target. |
| `zh-tw` | Chinese (Traditional, **Hong Kong**) | NOT Taiwan. Maps to HK conventions: "应用程式" not "應用程式". |
| `ja` | Japanese | |
| `ko` | Korean | |
| `de` | German | |
| `fr` | French | |
| `es` | Spanish (ES) | |

## The 4 gates

Always run in this order. All 4 must be green before merge.

```bash
node scripts/check-locale-syntax.js
node scripts/check-locale-pollution.js
node scripts/check-translation-completeness.js
node scripts/check-locale-placeholders.js
```

| Gate | What it catches | Common false positive |
|---|---|---|
| syntax | malformed JSON, duplicate keys, illegal `{{var}}` (project uses `{var}` only) | none — must always pass |
| pollution | zh-leakage in non-zh locales, en-leakage in non-en locales | brand names ("Togthr"), intentional "Togthr Companions" — flagged for review, not auto-fix |
| completeness | missing keys per locale vs the union of all 8 | brand names, proper nouns — confirm intent, then add to baseline |
| placeholders | placeholder count/name mismatches between locales | a placeholder is only in some locales by design (rare) — confirm with developer |

Then the regression check:

```bash
node scripts/check-translation-regression.js
```

Compares current tree against `.translation-baseline.json`. Pollution must not regress.

## Key naming

- Use `.` for nested namespaces, `_` for sub-namespaces when `.` would be ambiguous
- `[]` allowed for indexed groups
- Never loose camelCase for new keys
- Don't prefix with the locale code (the file path already encodes the locale)

## When to regenerate `.translation-baseline.json`

Only on a **full green** tree. Partial updates mask regressions.

## zh-tw gotcha (HONG KONG, not Taiwan)

If a translator or LLM produces zh-tw strings using Taiwan (zh-TW) conventions, they are wrong for this project. Quick check:

- ❌ "應用程式" / "網路" / "滑鼠" / "硬碟" → Taiwan
- ✅ "应用程式" / "網絡" / "鼠标" / "硬碟" → HK (this project)

When you see Taiwan patterns in `messages/zh-tw/*.json`, block the commit.

## Common pollution patterns to grep for

```bash
# Chinese chars in non-zh locales (high-signal)
grep -rP '[\x{4e00}-\x{9fff}]' messages/en/ messages/ja/ messages/ko/ messages/de/ messages/fr/ messages/es/ --include="*.json"

# English-only keys with no zh-cn equivalent
diff <(jq -r 'paths(scalars) | join(".")' messages/en/common.json | sort) \
     <(jq -r 'paths(scalars) | join(".")' messages/zh-cn/common.json | sort)
```

## When to escalate

- 9th locale request → orchestrator → user
- Brand name pollution that's genuinely a new feature flag (not a typo) → orchestrator
- Missing translation for a real product feature (not just a placeholder key) → orchestrator + `developer` to ship the feature text
