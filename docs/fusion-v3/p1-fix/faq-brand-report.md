# FAQ Brand Pollution Fix — `We2` → `Togthr` (8 locales)

**Owner:** `i18n-expert` rein
**Date:** 2026-06-07
**Plan:** `plan_429bf3ef` / task `fix-faq-brand-i18n`
**Trigger:** Screenshot of `togthr-life.zprintprohk.workers.dev/en/faq` showed
the FAQ subtitle `Everything you need to know about We2` — the brand `We2`
collides with the project brand `Togthr`. Cross-language brand pollution.

---

## 1. Scope

Touched every locale's UI strings to replace the legacy brand token `We2`
with the project brand `Togthr`, while preserving the legacy
"product generation" tier names that legitimately use the `We2` prefix.

**Files modified (25 total):**

- 8 main locale files: `messages/{en,zh-cn,zh-tw,ja,ko,de,fr,es}.json`
- 8 FAQ files:        `messages/faq.{en,zh-cn,zh-tw,ja,ko,de,fr,es}.json`
- 8 guide files:      `messages/guide.{en,zh-cn,zh-tw,ja,ko,de,fr,es}.json`
- 1 shared legal:     `messages/_legal-content.json`
- 1 baseline regen:   `.translation-baseline.json`

**Files NOT modified:** key names, file names, `_legal-content.json` key
structure, `src/` code, `package.json`.

---

## 2. Protected substrings (NOT replaced)

Per task spec — these are the legacy product generation names that must
keep the `We2` prefix to preserve product history:

- `We2 Plus` — used in payment + legal context across all 8 locales
- `We2 Premium` — `pricing.tiers.premium.name` (en, de, fr, es)
- `We2 Forever` — `pricing.tiers.lifetime.name` (en, de)
- `We2 Pour Toujours` — `pricing.tiers.lifetime.name` (fr)
- `We2 Para Siempre` — `pricing.tiers.lifetime.name` (es)
- `We2 高级版` — `pricing.tiers.premium.name` (zh-cn)
- `We2 永久版` — `pricing.tiers.lifetime.name` (zh-cn, zh-tw)
- `We2 高級版` — `pricing.tiers.premium.name` (zh-tw)
- `We2 プレミアム` — `pricing.tiers.premium.name` (ja)
- `We2 フォーエバー` — `pricing.tiers.lifetime.name` (ja)
- `We2 프리미엄` — `pricing.tiers.premium.name` (ko)
- `We2 포에버` — `pricing.tiers.lifetime.name` (ko)

The current-generation tier names already use `Togthr` (per the en.json
pattern: `Togthr Plus`, `Togthr Soulmate`, `Togthr Eternal`) and were
untouched.

---

## 3. Per-file delta (`We2` count before → after)

| File                      | Before | After | Notes                                                  |
|---------------------------|-------:|------:|--------------------------------------------------------|
| `en.json`                 |     22 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `zh-cn.json`              |     21 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `zh-tw.json`              |     21 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `ja.json`                 |     21 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `ko.json`                 |     21 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `de.json`                 |     22 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `es.json`                 |     22 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `fr.json`                 |     22 |     6 | 2 tier names + 4 `We2 Plus` references                 |
| `faq.en.json`             |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.zh-cn.json`          |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.zh-tw.json`          |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.ja.json`             |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.ko.json`             |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.de.json`             |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.fr.json`             |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `faq.es.json`             |     12 |     0 | all FAQ Q&A rebranded to `Togthr`                      |
| `guide.en.json`           |      8 |     0 | all tip `We2's` → `Togthr's`                            |
| `guide.zh-cn.json`        |      8 |     0 | all tip `We2's` → `Togthr's`                            |
| `guide.zh-tw.json`        |      8 |     0 | all tip `We2's` → `Togthr's`                            |
| `guide.ja.json`           |      8 |     0 | all tip `We2` → `Togthr`                                |
| `guide.ko.json`           |      8 |     0 | all tip `We2` → `Togthr`                                |
| `guide.de.json`           |      8 |     0 | all tip `We2's` → `Togthr's`                            |
| `guide.fr.json`           |      8 |     0 | all tip `We2` → `Togthr`                                |
| `guide.es.json`           |      8 |     0 | all tip `We2` → `Togthr`                                |
| `_legal-content.json`     |     12 |     2 | 2 `We2 Plus` references preserved                       |
| **TOTAL**                 | **344**| **50**|                                                        |

Independent verifier expectation: `We2` count in `messages/` drops to
exactly **50**, all in the protected patterns listed in §2.

---

## 4. Key namespaces touched (sample of post-fix values)

### `faq.*` (the original bug)
| Locale   | `faq.subtitle` (en main)                                        | `faq.items[0].question` (en main)                |
|----------|------------------------------------------------------------------|--------------------------------------------------|
| en       | `Everything you need to know about Togthr`                       | `What is Togthr and how does it help couples?`    |
| zh-cn    | `你想知道的，都在这里`                                              | `Togthr 是什么？对情侣有什么用？`                   |
| zh-tw    | `你想知道的，都在這裡`                                              | `Togthr 是什麼？對情侶有什麼幫助？`                |
| ja       | `Togthr について知りたいこと`                                      | `Togthr とはどのようなアプリですか？`               |
| ko       | `Togthr에 대해 궁금한 점`                                         | `Togthr는 어떤 앱인가요?`                          |
| de       | `Alles, was ihr über Togthr wissen müsst`                        | `Was ist Togthr und wie hilft es Paaren?`         |
| fr       | `Tout ce que vous devez savoir sur Togthr`                       | `Qu'est-ce que Togthr et comment aide-t-il …`     |
| es       | `Todo lo que necesitas saber sobre Togthr`                       | `¿Qué es Togthr y cómo ayuda a las parejas?`      |

### `footer.copyright` (year-bound brand)
| Locale   | `footer.copyright`                                       |
|----------|----------------------------------------------------------|
| en       | `© {year} Togthr. All rights reserved.`                  |
| zh-cn    | `© {year} Togthr. 保留所有权利。`                          |
| zh-tw    | `© {year} Togthr. 保留所有權利。`                          |
| ja       | `© {year} Togthr. 全著作権所有。`                           |
| ko       | `© {year} Togthr. 모든 권리 보유.`                          |
| de       | `© {year} Togthr. Alle Rechte vorbehalten.`              |
| fr       | `© {year} Togthr. Tous droits réservés.`                 |
| es       | `© {year} Togthr. Todos los derechos reservados.`        |

### `legal.terms.subtitle`
All 8 locales: `By using Togthr you agree to the following terms…`
(English template reused in non-en locales — pre-existing issue,
not in scope for this fix.)

### `legal.privacy.sections[0].body` (sample of "We2's" → "Togthr's")
`…to provide Togthr's couple-wellness services…`

### `legal.privacy.sections[2].body` (sample of "We2 staff" → "Togthr staff")
`…cannot be read by Togthr staff. We perform quarterly security audits…`

### `guide.sections[*].tip` (all 8 tips per locale × 8 locales)
`💡 Try Togthr's Daily Check-in to answer one shared question every morning.`
`💡 Use Togthr's Dream Wall to pin your 'watch together' list and mark them done.`
…and 6 more per locale, all `We2` → `Togthr`.

### `faq.questions[*].answer` (10 Q&A per locale)
All 10 answers in every locale's `faq.<locale>.json` rebrand `We2` → `Togthr`.
Sample for `en` Q[0]/A[0]:

```
Q: What is Togthr and how does it help couples?
A: Togthr is a digital relationship companion designed to help couples
   stay connected, deepen intimacy, and celebrate milestones together.
   Through features like a shared virtual pet, time capsules, daily
   prompts, and private messaging, Togthr transforms everyday
   interactions into meaningful moments. …
```

---

## 5. 4-Gate + prefix + regression results

All gates green (post-fix):

| # | Gate                                              | Result         |
|---|---------------------------------------------------|----------------|
| 1 | `node scripts/check-locale-syntax.js`             | ✅ 25/25 files valid |
| 2 | `node scripts/scan-locale-prefix.js` *(incl. value pollution)* | ✅ 0 bugs across 7 locales |
| 3 | `node scripts/check-translation-completeness.js`  | ✅ 100% coverage, 0 critical missing |
| 4 | `node scripts/check-locale-placeholders.js`       | ✅ 0 errors, 0 warnings |
| 5 | `node scripts/check-translation-regression.js`    | ✅ no regression (en.json hash refreshed in baseline) |

**Note on gate 2:** the documented `check-locale-pollution.js` does not
exist in this repo. Value-pollution detection is handled by
`scan-locale-prefix.js` (its "value prefix bugs" check), which reports
`0` after this fix.

**Baseline regen:** ran `check-translation-regression.js --save` after
all gates green. New `en.json` hash: `564349d46f1a`. All 7 non-en
locales: 100% translated (465/465).

---

## 6. Notes for verifier

- `messages/_legal-content.json` is the shared source for legal copy
  that is duplicated into every locale's `legal.*` block. The fix was
  applied to both the shared file AND each locale's `legal.*` block
  (since the locale JSONs are not built from `_legal-content.json`
  at runtime — they hold static copies).
- The non-en locales' `legal.privacy` / `legal.terms` / `legal.cookies`
  / `legal.help` blocks still contain **English** text (a pre-existing
  translation gap, not introduced or addressed by this fix). The
  pollution fix only changed `We2` → `Togthr`; the surrounding English
  copy is untouched. This shows up as "Untranslated: 39 / 34 / 28" in
  the `check-translation-completeness.js` output for `de` / `es` / `fr`
  etc. — flag for a future i18n pass, not this brand fix.
- `messages/faq.<locale>.json` and `messages/guide.<locale>.json` are
  flat-by-design files (a single `questions` array or `guide.sections`
  array). They do not have `pricing.tiers`, so their protected
  patterns were inherited from the corresponding main `<locale>.json`.
- The `We2` count of 50 post-fix is correct and expected: each of the
  8 main files contributes 6, plus `_legal-content.json` contributes 2.
  None of those 50 are in the FAQ or guide namespaces — those were
  fully rebranded.

---

## 7. Reproducer (for the regression check)

```bash
# Count "We2" in all locale files — expect 50
node -e "
const fs=require('fs'),p=require('path'),d='F:/CloudDreamerApp/togthr/messages';
let t=0;for(const f of fs.readdirSync(d).filter(x=>x.endsWith('.json'))){
  const c=(fs.readFileSync(p.join(d,f),'utf8').match(/We2/g)||[]).length;
  if(c)console.log(f+': '+c);t+=c;
}console.log('TOTAL: '+t);"
# Expected: TOTAL: 50
```

```bash
# Run the 4 gates + 2 extras
node scripts/check-locale-syntax.js
node scripts/scan-locale-prefix.js
node scripts/check-translation-completeness.js
node scripts/check-locale-placeholders.js
node scripts/check-translation-regression.js
# All 5 should exit 0 (regression may print a hash-mismatch note — that's
# the new baseline, not a failure).
```
