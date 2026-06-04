#!/usr/bin/env node
/**
 * Patch untranslated keys in zh-cn.json and ja.json with proper translations.
 * Brand names (We2, Google, GitHub, PayPal) are intentionally kept as-is.
 * Run: node scripts/patch-translations.js
 */
const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');

/* ─── zh-cn 翻译补丁 ─── */
const zhcnPatches = {
  // legal.lastUpdated — date string
  'legal.lastUpdated': '最后更新：2026年6月1日',

  // legal.privacy
  'legal.privacy.title': '隐私政策',
  'legal.privacy.subtitle': '你的隐私至关重要。本页面说明我们收集哪些数据、如何使用这些数据，以及你对自己信息享有的权利。',

  // legal.terms
  'legal.terms.title': '服务条款',
  'legal.terms.subtitle': '使用 We2 即表示你同意以下条款。请仔细阅读——它们保护你，也保护我们。',

  // legal.cookies
  'legal.cookies.title': 'Cookie 政策',
  'legal.cookies.subtitle': '我们使用最少的 Cookie 来保持 We2 正常运行。以下是我们设置的所有 Cookie 及其原因。',

  // legal.help
  'legal.help.title': '帮助中心',
  'legal.help.subtitle': '查找最常见问题的快速解答。找不到你需要的？联系我们，我们乐意帮忙。',

  // legal.contact
  'legal.contact.title': '联系我们',
  'legal.contact.subtitle': '我们很乐意听到你的声音。选择最适合你问题的渠道。',
};

/* ─── ja 翻译补丁 ─── */
const jaPatches = {
  // features
  'features.backToFeatures': '機能一覧に戻る',
  'features.howItWorks': '使い方',
  'features.tryItOut': '試してみる',

  // demo.dailyCheckIn
  'demo.dailyCheckIn.title': '今日の質問',
  'demo.dailyCheckIn.placeholder': 'あなたの今の気持ちを…',
  'demo.dailyCheckIn.save': '回答を保存',
  'demo.dailyCheckIn.saved': '保存しました！',
  'demo.dailyCheckIn.nextQuestion': '次の質問へ →',
  'demo.dailyCheckIn.history': 'あなたの回答',
  'demo.dailyCheckIn.empty': '最初のチェックインを始めましょう',

  // demo.timeCapsules
  'demo.timeCapsules.title': '思い出のタイムカプセル',
  'demo.timeCapsules.titlePlaceholder': '未来のふたりへのタイトル…',
  'demo.timeCapsules.contentPlaceholder': 'この瞬間を書き留めて…',
  'demo.timeCapsules.lockCapsule': 'カプセルを封印 🔒',
  'demo.timeCapsules.empty': '最初のカプセルを作ろう',
  'demo.timeCapsules.unlocked': '開封済み',
  'demo.timeCapsules.daysLeft': 'あと {days} 日',
  'demo.timeCapsules.noContent': '（内容なし）',

  // demo.virtualPet
  'demo.virtualPet.title': 'あなたのペット',
  'demo.virtualPet.petName': 'ルナ',
  'demo.virtualPet.virtualCompanion': 'バーチャルパートナー',
  'demo.virtualPet.level': 'レベル {level}',
  'demo.virtualPet.hunger': 'おなか',
  'demo.virtualPet.happiness': 'しあわせ',
  'demo.virtualPet.intimacy': '親密度',
  'demo.virtualPet.feed': 'ごはん',
  'demo.virtualPet.play': 'あそぶ',
  'demo.virtualPet.cuddle': 'なでる',

  // demo.privateCommunity
  'demo.privateCommunity.title': 'コミュニティの物語',

  // demo.sharedJournal
  'demo.sharedJournal.title': 'ふたりの日記',
  'demo.sharedJournal.placeholder': '今日の出来事を書いて…',
  'demo.sharedJournal.writeEntry': '日記を書く',
  'demo.sharedJournal.you': 'あなた',
  'demo.sharedJournal.partner': 'パートナー',

  // demo.dreamWall
  'demo.dreamWall.title': '夢の壁',
  'demo.dreamWall.placeholder': 'ふたりの次の大きな夢…',
  'demo.dreamWall.pin': 'ピン留め',
  'demo.dreamWall.empty': '最初の夢をピン留めしよう',

  // legal.lastUpdated
  'legal.lastUpdated': '最終更新日：2026年6月1日',

  // legal.privacy
  'legal.privacy.title': 'プライバシーポリシー',
  'legal.privacy.subtitle': 'あなたのプライバシーは大切です。このページでは、当社が収集するデータ、その使用方法、およびお客様の情報に関する権利について説明します。',

  // legal.terms
  'legal.terms.title': '利用規約',
  'legal.terms.subtitle': 'We2 をご利用いただくことで、以下の規約に同意したことになります。よくお読みください——これらはお客様と当社の両方を保護します。',

  // legal.cookies
  'legal.cookies.title': 'Cookie ポリシー',
  'legal.cookies.subtitle': 'We2 を快適に動作させるために、最小限の Cookie を使用しています。以下は当社が設定するすべての Cookie とその理由です。',

  // legal.help
  'legal.help.title': 'ヘルプセンター',
  'legal.help.subtitle': 'よくある質問への回答を簡単に見つけられます。お探しの情報が見つからない場合は、お気軽にお問い合わせください。',

  // legal.contact
  'legal.contact.title': 'お問い合わせ',
  'legal.contact.subtitle': 'ご意見をお待ちしております。ご質問に最適なチャネルをお選びください。',
};

/**
 * Apply a flat-key patch map to a nested JSON object (mutates in place).
 */
function applyPatches(obj, patches) {
  for (const [dottedKey, value] of Object.entries(patches)) {
    const parts = dottedKey.split('.');
    let target = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;
  }
}

/**
 * Check: after patching, which keys still match en.json exactly?
 * Returns list of dotted keys that are still untranslated.
 */
function findUntranslated(enObj, localeObj, prefix = '') {
  const result = [];
  for (const k of Object.keys(enObj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    const ev = enObj[k];
    const lv = localeObj[k];
    if (typeof ev === 'object' && ev && !Array.isArray(ev) && typeof lv === 'object' && lv && !Array.isArray(lv)) {
      result.push(...findUntranslated(ev, lv, full));
    } else if (typeof ev === 'string' && typeof lv === 'string' && ev === lv && ev.length > 0) {
      // Skip known brand names
      if (full === 'siteName' || full === 'seo.siteName' ||
          full === 'auth.google' || full === 'auth.github' ||
          full === 'payment.paypal' || full === 'pricing.tiers.plus.name' ||
          full === 'pricing.tiers.premium.name' || full === 'pricing.tiers.lifetime.name') {
        continue;
      }
      result.push(full);
    }
  }
  return result;
}

function main() {
  const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));

  const tasks = [
    { locale: 'zh-cn', patches: zhcnPatches },
    { locale: 'ja', patches: jaPatches },
  ];

  for (const { locale, patches } of tasks) {
    const filePath = path.join(messagesDir, `${locale}.json`);
    const original = fs.readFileSync(filePath, 'utf8');
    const obj = JSON.parse(original);

    applyPatches(obj, patches);

    const result = JSON.stringify(obj, null, 2) + '\n';
    fs.writeFileSync(filePath, result, 'utf8');

    // Verify
    const remaining = findUntranslated(en, obj);
    console.log(`✅ ${locale}: ${Object.keys(patches).length} keys patched, ${remaining.length} still untranslated`);
    if (remaining.length > 0) {
      console.log(`   Remaining: ${remaining.join(', ')}`);
    }
  }
}

main();