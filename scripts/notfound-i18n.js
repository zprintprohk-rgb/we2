const fs = require('fs')
const data = {
  en: {
    title: 'Where am I?',
    description: 'This page wandered off. Your pet is looking for it too.',
    backHome: 'Home',
    feedPet: 'Feed pet',
    sayHi: 'Say hi',
    pixelHint: '8-bit moment',
  },
  'zh-cn': {
    title: '走丢了？',
    description: '这个页面不知道跑哪去了。你的宠物也在找它。',
    backHome: '回家',
    feedPet: '喂宠物',
    sayHi: '打个招呼',
    pixelHint: '像素时刻',
  },
  'zh-tw': {
    title: '走丟了？',
    description: '這個頁面不知道跑哪去了。你的寵物也在找它。',
    backHome: '回家',
    feedPet: '餵寵物',
    sayHi: '打個招呼',
    pixelHint: '像素時刻',
  },
  ja: {
    title: '迷子になっちゃった？',
    description: 'このページはどっかへ行っちゃった。ペットも探してるよ。',
    backHome: 'ホーム',
    feedPet: 'えさ',
    sayHi: 'こんにちは',
    pixelHint: 'ピクセルな瞬間',
  },
  ko: {
    title: '길을 잃었나요?',
    description: '이 페이지는 어딘가로 사라졌어요. 펫도 찾고 있어요.',
    backHome: '홈',
    feedPet: '밥주기',
    sayHi: '인사하기',
    pixelHint: '픽셀 순간',
  },
  de: {
    title: 'Verlaufen?',
    description: 'Diese Seite ist weggelaufen. Dein Haustier sucht sie auch.',
    backHome: 'Start',
    feedPet: 'Füttern',
    sayHi: 'Sag hallo',
    pixelHint: '8-Bit-Moment',
  },
  fr: {
    title: 'Égaré ?',
    description: 'Cette page s\'est perdue. Ton animal la cherche aussi.',
    backHome: 'Accueil',
    feedPet: 'Nourrir',
    sayHi: 'Dire bonjour',
    pixelHint: 'Moment 8-bit',
  },
  es: {
    title: '¿Perdido?',
    description: 'Esta página se perdió. Tu mascota también la busca.',
    backHome: 'Inicio',
    feedPet: 'Alimentar',
    sayHi: 'Saludar',
    pixelHint: 'Momento 8-bit',
  },
}
Object.entries(data).forEach(([loc, val]) => {
  const p = 'messages/' + loc + '.json'
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!j.notFound) j.notFound = {}
  j.notFound = val
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8')
  console.log('OK ' + loc)
})
