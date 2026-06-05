const fs = require('fs')
const data = {
  en: {
    title: 'The Tree Hole',
    subtitle: 'Anonymous notes. Hugs instead of likes. No names, no judgment.',
    rule1: 'No real names',
    rule2: 'Hugs replace likes',
    rule3: '24h auto-purge',
    composer: {
      placeholder: 'Write something. Anything. ~280 chars.',
      send: 'Drop into the hole',
    },
    mood: {
      calm: 'Calm', warm: 'Warm', reflect: 'Reflect', light: 'Light',
    },
    hug: 'Hug',
    autoPurgeHint: 'vanishes in {hours}h',
    empty: 'No notes yet. Be the first to drop one.',
    mockNotice: 'Day 1 client mock — server-purge in Day 2.',
  },
  'zh-cn': {
    title: '树洞',
    subtitle: '匿名留言。用抱抱代替点赞。没有名字，没有评判。',
    rule1: '不用真名',
    rule2: '抱抱代替点赞',
    rule3: '24h 自动消失',
    composer: {
      placeholder: '写点什么吧。任何事。~280 字。',
      send: '丢进树洞',
    },
    mood: {
      calm: '平静', warm: '温暖', reflect: '沉思', light: '轻盈',
    },
    hug: '抱抱',
    autoPurgeHint: '{hours}小时后消失',
    empty: '还没有留言。第一个来留个脚印。',
    mockNotice: 'Day 1 客户端 mock — 服务端自动清理 Day 2 上线。',
  },
  'zh-tw': {
    title: '樹洞',
    subtitle: '匿名留言。用抱抱代替點讚。沒有名字，沒有評判。',
    rule1: '不用真名',
    rule2: '抱抱代替點讚',
    rule3: '24h 自動消失',
    composer: {
      placeholder: '寫點什麼吧。任何事。~280 字。',
      send: '丟進樹洞',
    },
    mood: {
      calm: '平靜', warm: '溫暖', reflect: '沉思', light: '輕盈',
    },
    hug: '抱抱',
    autoPurgeHint: '{hours}小時後消失',
    empty: '還沒有留言。第一個來留個腳印。',
    mockNotice: 'Day 1 客戶端 mock — 服務端自動清理 Day 2 上線。',
  },
  ja: {
    title: '木の洞',
    subtitle: '匿名のメモ。いいねの代わりにハグ。名前なし、批判なし。',
    rule1: '実名なし',
    rule2: 'ハグがいいねの代わり',
    rule3: '24hで自動消去',
    composer: {
      placeholder: '何か書いてください。~280文字。',
      send: '洞に落とす',
    },
    mood: {
      calm: '穏やか', warm: '温かい', reflect: '思索', light: '軽やか',
    },
    hug: 'ハグ',
    autoPurgeHint: '{hours}時間後に消えます',
    empty: 'まだメモがありません。最初に一つ落としましょう。',
    mockNotice: 'Day 1 クライアントモック — 自動消去は Day 2。',
  },
  ko: {
    title: '나무 구멍',
    subtitle: '익명 메모. 좋아요 대신 포옹. 이름도, 판단도 없음.',
    rule1: '실명 없음',
    rule2: '포옹이 좋아요 대체',
    rule3: '24h 자동 삭제',
    composer: {
      placeholder: '뭐든 적어보세요. ~280자.',
      send: '구멍에 떨어뜨리기',
    },
    mood: {
      calm: '차분', warm: '따뜻', reflect: '성찰', light: '가벼움',
    },
    hug: '포옹',
    autoPurgeHint: '{hours}시간 후 사라짐',
    empty: '아직 메모가 없어요. 가장 먼저 하나 남겨보세요.',
    mockNotice: 'Day 1 클라이언트 목업 — 자동 삭제는 Day 2.',
  },
  de: {
    title: 'Das Baumloch',
    subtitle: 'Anonyme Notizen. Umarmungen statt Likes. Keine Namen, kein Urteil.',
    rule1: 'Keine echten Namen',
    rule2: 'Umarmungen statt Likes',
    rule3: '24h Auto-Löschung',
    composer: {
      placeholder: 'Schreib etwas. Irgendetwas. ~280 Zeichen.',
      send: 'Ins Loch werfen',
    },
    mood: {
      calm: 'Ruhig', warm: 'Warm', reflect: 'Nachdenklich', light: 'Leicht',
    },
    hug: 'Umarmen',
    autoPurgeHint: 'verschwindet in {hours}h',
    empty: 'Noch keine Notizen. Sei die erste.',
    mockNotice: 'Day 1 Client-Mock — Auto-Löschung in Day 2.',
  },
  fr: {
    title: 'Le Trou d\'Arbre',
    subtitle: 'Notes anonymes. Câlins au lieu de likes. Pas de noms, pas de jugement.',
    rule1: 'Pas de vrais noms',
    rule2: 'Câlins au lieu de likes',
    rule3: 'Auto-suppression 24h',
    composer: {
      placeholder: 'Écris quelque chose. N\'importe quoi. ~280 caractères.',
      send: 'Jeter dans le trou',
    },
    mood: {
      calm: 'Calme', warm: 'Chaleureux', reflect: 'Pensif', light: 'Léger',
    },
    hug: 'Câlin',
    autoPurgeHint: 'disparaît dans {hours}h',
    empty: 'Pas encore de notes. Sois le premier.',
    mockNotice: 'Maquette Day 1 — suppression auto en Day 2.',
  },
  es: {
    title: 'El Hoyo del Árbol',
    subtitle: 'Notas anónimas. Abrazos en lugar de likes. Sin nombres, sin juicios.',
    rule1: 'Sin nombres reales',
    rule2: 'Abrazos en lugar de likes',
    rule3: 'Auto-borrado 24h',
    composer: {
      placeholder: 'Escribe algo. Lo que sea. ~280 caracteres.',
      send: 'Soltar en el hoyo',
    },
    mood: {
      calm: 'Calma', warm: 'Cálido', reflect: 'Reflexivo', light: 'Ligero',
    },
    hug: 'Abrazo',
    autoPurgeHint: 'desaparece en {hours}h',
    empty: 'Aún no hay notas. Sé el primero.',
    mockNotice: 'Mock Día 1 — auto-borrado en Día 2.',
  },
}
Object.entries(data).forEach(([loc, val]) => {
  const p = 'messages/' + loc + '.json'
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!j.community) j.community = {}
  j.community = val
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8')
  console.log('OK ' + loc)
})
