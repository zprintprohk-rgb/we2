# i18n-true-translate-deliverable (Togthr fusion-v3)

> Mirror of the team deliverable at `C:\Users\Administrator\.mavis\plans\plan_c8911e58\outputs\i18n-true-translate-7-locales\deliverable.md`.
> Kept in `docs/fusion-v3/` per the original task spec (path in agent message).

**Task**: Translate all 7 non-English locale files (`messages/{zh-cn,zh-tw,ja,ko,de,es,fr}.json`) so that values are real translations, not English placeholders. Key names unchanged. Preserve placeholders, emoji, brand names, festival names.

**Date**: 2026-06-07
**Worker**: coder

---

## 1. Summary

Built a single Node-based translation script (`scripts/i18n-true-translate-7-locales.js`) holding a master translation table for all untranslated values across 7 locales (one dict per locale, keyed by flat dotted path). The script loads `en.json` as source of truth, diffs each locale against it, and applies translations only for keys whose value is currently identical to en. **976 keys translated** in a single run, preserving JSON structure, indentation, and the `en.json` source of truth (never modified).

---

## 2. Diff stat (file size change per locale)

| File | Before (bytes) | After (bytes) | Diff | Keys translated |
|---|---:|---:|---:|---:|
| `messages/zh-cn.json` | 32 856 | 32 775 | −81 | 114 |
| `messages/zh-tw.json` | 32 551 | 32 496 | −55 | 167 |
| `messages/ja.json`    | 36 643 | 37 251 | +608 | 115 |
| `messages/ko.json`    | 34 119 | 34 702 | +583 | 165 |
| `messages/de.json`    | 34 113 | 34 459 | +346 | 114 |
| `messages/es.json`    | 33 591 | 34 060 | +469 | 152 |
| `messages/fr.json`    | 34 468 | 35 019 | +551 | 149 |
| **Total** | | | | **976 keys** |

---

## 3. Verification — all i18n gates green

| Gate | Command | Result |
|---|---|---|
| Pollution scan | `node scripts/scan-locale-prefix.js` | ✅ 0 bugs across 7 locales |
| Message sync | `npm run sync-messages` | ✅ All message files are in sync! |
| Syntax | `node scripts/check-locale-syntax.js` | ✅ 25/25 files valid |
| Placeholders | `node scripts/check-locale-placeholders.js` | ✅ 0 errors, 0 warnings |
| Completeness | `node scripts/check-translation-completeness.js` | ✅ 100% coverage (465/465), status HIGH on all 7 locales |

`scan-locale-prefix.js` summary:

```
## zh-cn  (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
## zh-tw  (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
## ja     (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
## ko     (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
## de     (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
## es     (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
## fr     (465 keys)   key-name prefix:0  value prefix:0  missing:0  orphan:0
✅ No issues found across 7 locales.
```

---

## 4. Sample translations (15 spot-checks)

### `home.hero.welcomeFirst` (short chatty greeting)
- en: Hi — I just woke up. I will be here, always.
- zh-cn: 嗨，我刚醒来。我会一直在的。
- zh-tw: 嗨，我啱啱醒。我會一直喺度㗎。
- ja: やあ、ちょうど起きたところだよ。ずっとそばにいるね。
- ko: 안녕! 방금 깼어. 계속 곁에 있을게.
- de: Hi! Ich bin gerade aufgewacht. Ich bin immer für dich da.
- es: ¡Hola! Acabo de despertar. Estaré aquí, siempre.
- fr: Salut ! Je viens de me réveiller. Je serai là, toujours.

### `home.hero.statusHello` (pet status bubble)
- en: Hi! Nice to meet you.
- zh-cn: 嗨！很高兴见到你。 / zh-tw: 嗨！你好呀。 / ja: やあ！はじめまして。 / ko: 안녕! 만나서 반가워.
- de: Hi! Schön, dich zu sehen. / es: ¡Hola! Mucho gusto. / fr: Salut ! Heureux de te voir.

### `home.hero.relationsEyebrow` (UI eyebrow)
- en: Choose your companion
- zh-cn: 选一位陪伴你 / zh-tw: 揀一個陪你嘅佢 / ja: なかまを選ぼう / ko: 동반자를 골라봐
- de: Wähle deine Begleitung / es: Elige a tu compañero / fr: Choisis ton compagnon

### `pricing.tiers.eternal.tagline` (tier tagline)
- en: All access + exclusive
- zh-cn: 全权限 + 独家 / zh-tw: 全部解鎖 + 獨家 / ja: すべて解禁 + 限定 / ko: 전부 잠금해제 + 독점
- de: Voller Zugang + exklusiv / es: Todo incluido + exclusivo / fr: Accès total + exclusif

### `pricing.theater.headline` (pricing hero)
- en: Unlock a life that grows with you
- zh-cn: 解锁一段与你一同成长的生活 / zh-tw: 解鎖一段同你一齊成長嘅生活
- ja: あなたといっしょに育つ生活をアンロック / ko: 당신과 함께 자라는 삶을 열어 봐
- de: Schalte ein Leben frei, das mit dir wächst / es: Desbloquea una vida que crece contigo
- fr: Débloque une vie qui grandit avec toi

### `pricing.tierMeta.plus.eyebrow` (pricing tier label)
- en: Companion
- zh-cn: 陪伴 / zh-tw: 同行者 / ja: なかま / ko: 동반자
- de: Begleiter / es: Compañero / fr: Compagnon

### `pricing.ctaSubscribe` (CTA)
- en: Subscribe Now
- zh-cn: 立即订阅 / zh-tw: 即刻訂閱 / ja: 今すぐ登録 / ko: 지금 구독
- de: Jetzt abonnieren / es: Suscribirse / fr: S’abonner

### `pet.mood.sweet` (mood)
- en: Sweet
- zh-cn: 甜蜜 / zh-tw: 甜蜜 / ja: 甘い / ko: 달콤
- de: Süß / es: Dulce / fr: Douceur

### `pet.rarity.legendary` (rarity)
- en: Legendary
- zh-cn: 传说 / zh-tw: 傳說 / ja: レジェンダリー / ko: 레전더리
- de: Legendär / es: Legendaria / fr: Légendaire

### `pet.festival.dragonboat` (festival — culturally localized)
- en: Dragon Boat Festival
- zh-cn: 端午 / zh-tw: 端午 / ja: 端午の節句 / ko: 단오
- de: Drachenbootfest / es: Festival del Bote del Dragón / fr: Festival des Bateaux-Dragons

### `pet.altar.title` (UI title)
- en: Summon Your Soul Companion
- zh-cn: 召唤你的灵魂伙伴 / zh-tw: 召喚你嘅靈魂同伴 / ja: ソウルのなかまを召喚 / ko: 영혼의 동반자를 소환
- de: Beschwöre deinen Seelen-Begleiter / es: Invoca a tu compañero del alma / fr: Invoque ton compagnon d’âme

### `pet.petting` (microcopy)
- en: Pet me~
- zh-cn: 摸摸我~ / zh-tw: 摸下我~ / ja: なでて~ / ko: 쓰다듬어 줘~
- de: Streichle mich~ / es: Acaríciame~ / fr: Câline-moi~

### `pet.lockHint` (help text)
- en: Locked pets are still previewed — subscribe or open blind boxes to unlock
- zh-cn: 未解锁的宠物也可以预览——订阅或开盲盒即可解锁
- zh-tw: 未解鎖嘅寵物都可以預覽——訂閱或者開盲盒就可以拎到
- ja: ロック中のペットもプレビュー可能 — 購読かガチャで解放
- ko: 잠긴 펫도 미리보기는 가능 — 구독하거나 블라인드박스를 열어 해제해요
- de: Gesperrte Pets sind weiterhin sichtbar — freischalten per Abo oder Blindbox
- es: Las mascotas bloqueadas también se previsualizan — suscríbete o abre cajas sorpresa para desbloquearlas
- fr: Les pets verrouillés restent visibles — abonne-toi ou ouvre des blind boxes pour les débloquer

### `chat.anniversary` (anniversary toast)
- en: 100 messages — a chapter complete
- zh-cn: 100 条消息——一章完结 / zh-tw: 100 個訊息——一章完咗
- ja: 100通のメッセージ — ひとつの章が完結 / ko: 메시지 100개 — 한 챕터 완성
- de: 100 Nachrichten — ein Kapitel vollendet / es: 100 mensajes — un capítulo completo / fr: 100 messages — un chapitre complet

### `chat.mood.sleepy` (mood)
- en: Sleepy
- zh-cn: 困倦 / zh-tw: 眼瞓 / ja: 眠い / ko: 졸림
- de: Müde / es: Adormilado / fr: Somnolent

---

## 5. Translation principles applied

- **Key names**: never changed
- **Placeholders** preserved verbatim: `{discount}` `{count}` `{year}` `{level}` `{days}` `{n}` `{maxSize}` `{maxFiles}` `{types}` `{max}` `{next}` `{name}` `{locale}` `{hours}` `{gateway}` `{0}` `{1}`
- **Emoji** preserved (none in the untranslated keys touched, but `lockCapsule` keeps its `🔒`)
- **Brand names** kept: Togthr, Togthr Plus, Togthr Eternal, We2 Premium, We2 Forever, PayPal, Alipay, AlipayHK, Google, GitHub
- **Festival names** localized where culturally meaningful (e.g. Dragon Boat → 端午/端午の節句/단오/Drachenbootfest/Festival del Bote del Dragón/Festival des Bateaux-Dragons); kept in international form for events whose own name is English (Black Friday, Cyber Monday, Baby Shower, Diwali)
- **Tone per locale**:
  - **zh-cn** — 简体中文，口语化
  - **zh-tw** — **香港繁体**（应用程式 / 网絡 / 鼠标 / 硬碟 convention），口语，避免台湾用语
  - **ja** — 敬体/常体混合，自然
  - **ko** — 해요体
  - **de** — du-Form
  - **es** — tú-Form
  - **fr** — tu-Form
- **No `[locale]` prefix** introduced; values are pure translations
- **Empty value** preserved: `pricing.tiers.soulmate.price = ""` (intentional)

---

## 6. Acceptance checklist

- ✅ `node scripts/scan-locale-prefix.js` — 0 value prefix bugs across 7 locales
- ✅ `npm run sync-messages` — EXIT 0, "All message files are in sync!"
- ✅ `node scripts/check-locale-syntax.js` — 25/25 valid JSON
- ✅ `node scripts/check-locale-placeholders.js` — 0 errors, 0 warnings
- ✅ `node scripts/check-translation-completeness.js` — 100% coverage (465/465), HIGH on all 7
- ✅ Only modified the 7 files specified in task scope (`messages/{zh-cn,zh-tw,ja,ko,de,es,fr}.json`); `en.json` untouched
- ✅ Head-check: `head -20 messages/zh-cn.json` shows Chinese characters from line 1
- ✅ Total keys translated: 976 across 7 locales, all in the previously-untranslated set

---

## 7. Notes for verifier

1. The script `scripts/i18n-true-translate-7-locales.js` is the single source of truth for new translations. Re-running it is idempotent.
2. zh-tw uses **Hong Kong** conventions (per `.harness/docs/i18n-8-locales.md`); Taiwan Mandarin patterns (應用程式/網路/滑鼠) are not present.
3. `faq.*.json` and `guide.*.json` (separate message bundles) were **not** touched — out of scope per task spec (only the 8 main `messages/*.json`).
4. Long-form `legal.*.sections[].body` paragraphs were already translated in the existing files; only `legal.{privacy,terms,cookies,help,contact}.title/subtitle` and `legal.lastUpdated` had English bleed-through, and those are now fixed.
