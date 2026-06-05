const fs = require('fs')
const data = {
  en: {
    back: 'Back', next: 'Next', finish: 'All set',
    welcome: { title: 'Always Here', subtitle: 'Your small robot is here - a companion that grows with you.', cta: 'Begin' },
    name: { title: 'Name your Togthr', subtitle: 'A name for the small robot that will be with you.', placeholder: 'e.g. Pixel, Mimi, Beibei...' },
    mode: {
      title: 'How will you journey?', subtitle: 'You can change this anytime.',
      solo: { title: 'On my own', desc: 'A pet companion for you, with AI chat support.' },
      together: { title: 'With someone', desc: 'Share rituals, capsules, and a pet together.' }
    },
    done: {
      title: '{name} is ready!',
      soloNote: 'Your pet is here. Feed it, chat with it, send stickers.',
      togetherNote: 'Your pet is here. Send the first capsule to start your shared story.',
      feedPet: 'Feed {name}', sayHi: 'Say hi', startOver: 'Start over'
    }
  },
  'zh-cn': {
    back: '上一步', next: '下一步', finish: '完成',
    welcome: { title: '一直都在', subtitle: '你的小机器人来了 - 一个陪你一起长大的伙伴。', cta: '开始' },
    name: { title: '给 TA 起个名字', subtitle: '为这只陪你左右的小机器人取名。', placeholder: '比如：皮蛋、米米、北北...' },
    mode: {
      title: '想怎么用？', subtitle: '随时可以改。',
      solo: { title: '自己一个人', desc: '一只陪伴你的宠物 + AI 聊天支持。' },
      together: { title: '和 TA 一起', desc: '分享日常、胶囊、共同养一只宠物。' }
    },
    done: {
      title: '{name} 准备好啦！',
      soloNote: '你的宠物来了。喂它、跟它聊天、发贴纸。',
      togetherNote: '你的宠物来了。发第一个胶囊，开始你们的故事。',
      feedPet: '喂 {name}', sayHi: '打个招呼', startOver: '重新开始'
    }
  },
  'zh-tw': {
    back: '上一步', next: '下一步', finish: '完成',
    welcome: { title: '一直都在', subtitle: '你的小機器人來了 - 一個陪你一起長大的夥伴。', cta: '開始' },
    name: { title: '給 TA 起個名字', subtitle: '為這隻陪你左右的小機器人取名。', placeholder: '比如：皮蛋、米米、北北...' },
    mode: {
      title: '想怎麼用？', subtitle: '隨時可以改。',
      solo: { title: '自己一個人', desc: '一隻陪伴你的寵物 + AI 聊天支援。' },
      together: { title: '和 TA 一起', desc: '分享日常、膠囊、共同養一隻寵物。' }
    },
    done: {
      title: '{name} 準備好啦！',
      soloNote: '你的寵物來了。餵它、跟它聊天、發貼圖。',
      togetherNote: '你的寵物來了。發第一個膠囊，開始你們的故事。',
      feedPet: '餵 {name}', sayHi: '打個招呼', startOver: '重新開始'
    }
  },
  ja: {
    back: '戻る', next: '次へ', finish: '完了',
    welcome: { title: 'ずっとそばに', subtitle: 'あなたの小さなロボットが来ました - 一緒に成長する相棒。', cta: 'はじめる' },
    name: { title: 'Togthrに名前を', subtitle: 'そばにいる小さなロボットの名前。', placeholder: '例：ピクセル、みみ、べいべい...' },
    mode: {
      title: 'どんな旅を？', subtitle: 'いつでも変更できます。',
      solo: { title: 'ひとりで', desc: 'あなたを見守るペット + AI チャット。' },
      together: { title: '誰かと', desc: '日常、カプセル、ペットを分かち合う。' }
    },
    done: {
      title: '{name} の準備完了！',
      soloNote: 'ペットが来ました。エサをあげて、話して、スタンプを送ろう。',
      togetherNote: 'ペットが来ました。最初のカプセルを送って、物語を始めよう。',
      feedPet: '{name} にえさ', sayHi: 'こんにちは', startOver: 'やり直す'
    }
  },
  ko: {
    back: '뒤로', next: '다음', finish: '완료',
    welcome: { title: '항상 함께', subtitle: '당신의 작은 로봇이 왔어요 - 함께 자라나는 동반자.', cta: '시작' },
    name: { title: '이름을 지어주세요', subtitle: '곁에 있을 작은 로봇의 이름.', placeholder: '예: 픽셀, 미미, 베이베이...' },
    mode: {
      title: '어떻게 사용하실 건가요?', subtitle: '언제든 바꿀 수 있어요.',
      solo: { title: '혼자서', desc: '반려동물 + AI 채팅.' },
      together: { title: '누군가와', desc: '일상, 캡슐, 반려동물을 함께.' }
    },
    done: {
      title: '{name} 준비 완료!',
      soloNote: '펫이 왔어요. 밥 주고, 대화하고, 스티커 보내기.',
      togetherNote: '펫이 왔어요. 첫 캡슐을 보내서 이야기를 시작하세요.',
      feedPet: '{name} 밥주기', sayHi: '인사하기', startOver: '다시 시작'
    }
  },
  de: {
    back: 'Zurück', next: 'Weiter', finish: 'Fertig',
    welcome: { title: 'Immer da', subtitle: 'Dein kleiner Roboter ist da - ein Begleiter, der mit dir wächst.', cta: 'Starten' },
    name: { title: 'Nenne deinen Togthr', subtitle: 'Ein Name für den kleinen Roboter, der bei dir sein wird.', placeholder: 'z.B. Pixel, Mimi, Beibei...' },
    mode: {
      title: 'Wie willst du reisen?', subtitle: 'Du kannst dies jederzeit ändern.',
      solo: { title: 'Allein', desc: 'Ein Begleiter für dich, mit KI-Chat.' },
      together: { title: 'Mit jemandem', desc: 'Geteilte Rituale, Kapseln, ein gemeinsames Tier.' }
    },
    done: {
      title: '{name} ist bereit!',
      soloNote: 'Dein Haustier ist da. Füttere es, chatte, schicke Sticker.',
      togetherNote: 'Dein Haustier ist da. Sende die erste Kapsel.',
      feedPet: '{name} füttern', sayHi: 'Sag hallo', startOver: 'Neu starten'
    }
  },
  fr: {
    back: 'Retour', next: 'Suivant', finish: 'Terminé',
    welcome: { title: 'Toujours là', subtitle: 'Ton petit robot est là - un compagnon qui grandit avec toi.', cta: 'Commencer' },
    name: { title: 'Nomme ton Togthr', subtitle: 'Un nom pour le petit robot qui sera avec toi.', placeholder: 'ex. Pixel, Mimi, Beibei...' },
    mode: {
      title: 'Comment vas-tu voyager ?', subtitle: 'Tu peux changer à tout moment.',
      solo: { title: 'Seul', desc: 'Un compagnon pour toi, avec chat IA.' },
      together: { title: "Avec quelqu'un", desc: 'Rituels partagés, capsules, un animal commun.' }
    },
    done: {
      title: '{name} est prêt !',
      soloNote: 'Ton animal est là. Nourris-le, discute, envoie des stickers.',
      togetherNote: 'Ton animal est là. Envoie la première capsule.',
      feedPet: 'Nourrir {name}', sayHi: 'Dire bonjour', startOver: 'Recommencer'
    }
  },
  es: {
    back: 'Atrás', next: 'Siguiente', finish: 'Listo',
    welcome: { title: 'Siempre aquí', subtitle: 'Tu pequeño robot está aquí - un compañero que crece contigo.', cta: 'Empezar' },
    name: { title: 'Nombra a tu Togthr', subtitle: 'Un nombre para el pequeño robot que estará contigo.', placeholder: 'ej. Pixel, Mimi, Beibei...' },
    mode: {
      title: '¿Cómo viajarás?', subtitle: 'Puedes cambiar esto en cualquier momento.',
      solo: { title: 'Solo', desc: 'Un compañero para ti, con chat IA.' },
      together: { title: 'Con alguien', desc: 'Rituales compartidos, cápsulas, una mascota común.' }
    },
    done: {
      title: '¡{name} está listo!',
      soloNote: 'Tu mascota está aquí. Aliméntala, chatea, envía stickers.',
      togetherNote: 'Tu mascota está aquí. Envía la primera cápsula.',
      feedPet: 'Alimentar a {name}', sayHi: 'Saludar', startOver: 'Empezar de nuevo'
    }
  }
}
Object.entries(data).forEach(([loc, val]) => {
  const p = 'messages/' + loc + '.json'
  const j = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!j.onboarding) j.onboarding = {}
  j.onboarding = val
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8')
  console.log('OK ' + loc)
})
