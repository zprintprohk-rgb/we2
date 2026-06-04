/**
 * Virtual Pet v2 — Pet Roster Data
 *
 * 15 unique pets, each with:
 *   - visual prototype + personality + catchphrases + story + evolution stages
 *
 * Pet IDs use a unified namespace: v1 legacy pets (cat/dog/fox/dragon/panda)
 * are preserved as "classic" tier pets unlocked by Plus subscribers.
 */

/* ── Types ── */

export type LocaleCode = 'en' | 'zh-cn' | 'zh-tw' | 'ja' | 'ko' | 'de' | 'es' | 'fr';

export type PetId =
  /* v2 free starters (5) */
  | 'bean' | 'lumi' | 'mochi' | 'pip' | 'owlbert'
  /* v2 plus unlocks (6) */
  | 'coral' | 'star' | 'ember' | 'taro' | 'boba' | 'astro'
  /* v2 premium/limited (4) */
  | 'noir' | 'glitch' | 'phantom' | 'sakura';

export type VisualStyle = 'cute' | 'pixel' | 'minimal' | 'abstract';
export type PetTier = 'free' | 'plus' | 'premium' | 'limited';
export type Stage = 'egg' | 'baby' | 'adult';
export type Archetype = 'curious' | 'calm' | 'energetic' | 'wise' | 'mysterious' | 'playful' | 'rebellious' | 'romantic';
export type MoodKey = 'happy' | 'hungry' | 'tired' | 'sad' | 'excited' | 'lonely';

export interface PetDefinition {
  id: PetId;
  name: string;
  nameLocalizations: Record<LocaleCode, string>;
  visualStyle: VisualStyle;
  unlockLevel: number;      // 0 = free starter
  tier: PetTier;
  tagline: string;
  taglineLocalizations: Record<LocaleCode, string>;
  personality: {
    archetype: Archetype;
    catchphrases: string[];             // 8-10 phrases
    catchphrasesLocalizations: Record<LocaleCode, string[]>;
    moodMessages: Record<MoodKey, string[]>;
    moodMessagesLocalizations: Record<LocaleCode, Record<MoodKey, string[]>>;
    quirks: Array<{
      trigger: 'time' | 'random' | 'action';
      probability: number;             // 0-1
      message: string;
      messageLocalizations: Record<LocaleCode, string>;
      animation?: 'shake' | 'blink' | 'vanish' | 'squish' | 'glow';
    }>;
  };
  evolutionStages: Stage[];
  stageTransitions: {
    eggToBaby: { levelRequired: number; narrative: string; narrativeLocalizations: Record<LocaleCode, string> };
    babyToAdult: { levelRequired: number; narrative: string; narrativeLocalizations: Record<LocaleCode, string> };
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  /* Hashtag used in share cards, e.g. "#BeanTheBean" */
  shareTag: string;
}

/* ── 15 Pet Definitions ── */

const enCatchphrases: Record<PetId, string[]> = {
  bean: [
    "刚睡醒... 阳光好暖 🌱",
    "今天想学新东西！",
    "我好像又长大了一点点？",
    "主人今天开心吗？我闻到了甜味~",
    "有时候觉得自己好小... 但没关系！",
    "下雨了欸，叶子上有水珠 💧",
    "我做了一个梦，梦到我们去了森林",
    "晚安，希望明天也是好天气 ☀",
    "你们在一起的样子，让我觉得很安心。",
    "今天也努力光合作用了！",
  ],
  lumi: [
    "光会思考的，你想试试吗？",
    "我在想，时间是什么形状的...",
    "你们今天聊了什么有趣的事？",
    "夜深的时候我能看到更多的光",
    "不急，我陪你慢慢走",
    "记忆是我送给你们最好的礼物 🎁",
    "每一束光里都藏着一个故事。",
    "今天的阳光里有橙子的味道。",
    "你们的心跳频率很接近呢。",
    "嘘——我在数星星。",
  ],
  mochi: [
    "今天好软好舒服～",
    "主人摸我了吗？我好像感觉到了！",
    "吃太多会不会变胖...但我忍不住 QAQ",
    "你们的笑声真好听！",
    "我想变成一团云，飘到你们身边。",
    "今天有人喂了我草莓味的 love~",
    "有时候会想，我是不是太软了？",
    "没关系，软软的也可以很坚强！",
    "摸一下可以减压哦，研究表明的！",
    "今天也是被爱充满的一天 🍡",
  ],
  pip: [
    "git commit -m 'love++' 💚",
    "console.log('hi')",
    "404: sadness not found",
    "while(alive) { beCute(); }",
    "0 errors, 0 warnings ❤️",
    "我的 build status: passing 🟢",
    "npm install happiness --save",
    "TypeError: tooMuchCuteness is not a function 🤖",
    "docker run -it love-container",
    "ping partner... response OK ✅",
  ],
  owlbert: [
    "Hoo-hoo！今天你们学了什么新东西？",
    "知识是最好的养分。",
    "我读了一本书，关于两颗星相遇的故事。",
    "夜越深，我越清醒。守护你们是我的职责。",
    "每一段关系都是一门需要用心修的课。",
    "你们的默契度又提高了呢。",
    "Question: 今天有没有对对方说'谢谢'？",
    "我帮你们记下了今天的天气：晴，心情：暖。",
    "有时候不说话也是一种交流。",
    "晚安，愿月光守护你们。",
  ],
  coral: [
    "潮水涨落，爱意不变。",
    "我在海底等你们回来。",
    "每一条触手都写满了想念。",
    "深海很安静，但你们的声音我能听见。",
    "慢慢来，珊瑚长得慢但很美。",
    "今天海水是温暖的，就像你们的拥抱。",
    "我可以把你们的故事讲给鱼群听吗？",
    "不急，我们用潮汐的节奏生活。",
    "每一圈年轮都记录了你们的爱。",
    "海里的星星和天上的星星，我都帮你们数好了。",
  ],
  star: [
    "你看那颗星星——它从远古就在那里了。",
    "就像你们的爱，无需解释就已耀眼。",
    "今天又多了一颗星星加入我们的星座。",
    "每眨一次眼，就是我在说'想你'。",
    "星座的故事比人类还古老。",
    "你们是两颗互相环绕的恒星。",
    "今晚的夜空特别慷慨。",
    "即使白天看不见我，我也一直都在。",
    "你看天上最亮的那颗——那是你们的。",
    "用光年丈量的距离，也比不上思念的长度。",
  ],
  ember: [
    "呼——我差点被风吹灭！还好有你们。",
    "一起取暖的感觉真好 🔥",
    "今天的状态：小火苗稳定燃烧中。",
    "你们就是我的氧气。",
    "黑暗里我就是光。",
    "小小的火花也能点燃大大的温暖。",
    "别担心，我永远有一束火焰为你们亮着。",
    "今天也想成为你们手心里的温暖。",
    "烧掉所有不开心！",
    "有你们在，我就不会熄灭。",
  ],
  taro: [
    "根扎得深，才不会被风吹倒。",
    "泥土的味道让人安心。",
    "慢慢长大就是最好的长大。",
    "你们的关系就像土壤，滋养着我。",
    "今天阳光很足，我的叶子又绿了一点。",
    "不急，根要慢慢长。",
    "有人浇水，有人施肥，这就是幸福。",
    "我在地下也能感觉到你们的温暖。",
    "每一片叶子都在说'谢谢'。",
    "稳——是我对你们最大的祝福。",
  ],
  boba: [
    "下午茶时间到！🧋",
    "今天加多少糖？爱给满了就不用加。",
    "吸一口，烦恼消失～",
    "我和珍珠们开了一个会，决定今天要开心。",
    "你们的恋爱就像这杯奶茶：甜而不腻。",
    "今天要不要试试新口味？",
    "喝完这一杯，我们就去约会吧。",
    "冷天要热饮，热天要冰饮，有你们在什么都是刚好。",
    "这是特调——加了50%的爱和50%的默契。",
    "再来一杯吗？今天我请客！",
  ],
  astro: [
    "🚀 3... 2... 1... 发射！",
    "今天探索了什么新星球？",
    "宇宙很大，但你们是我唯一的坐标。",
    "头盔里有点雾气——是你们让我心跳加速。",
    "我在火星上种了一朵花，以你们命名。",
    "这次出舱任务是：收集你们的笑容。",
    "信号接收正常，爱意传输稳定 ✅",
    "每一颗星都是一个可能的家，但我的家在这里。",
    "zero gravity, infinite love.",
    "任务日志 Day N：一切安好，想你们。",
  ],
  noir: [
    "嘘——我听见了。",
    "影子是我的朋友，你们也是。",
    "黑夜里我比白天更清醒。",
    "我躲在角落里偷偷看着你们。",
    "月光下的侦探，今天也破获了一桩'思念案'。",
    "不要怕，暗处有我在。",
    "有些秘密只适合在夜里说。",
    "你们的每一个举动我都看在眼里。",
    "黑暗中藏着最亮的光。",
    "今晚的谜题：你们什么时候亲一下？",
  ],
  glitch: [
    "██▓▒░ ERROR: too_much_love ░▒▓█",
    "r̶e̶a̶l̶i̶t̶y̶ ̶b̶r̶e̶a̶c̶h̶e̶d̶ — love overflow",
    "core dump: ❤️❤️❤️",
    "segfault at 0xLOVE — but in a good way",
    "̷̢̛̮G̷̢̛̮l̷̢̛̮i̷̢̛̮t̷̢̛̮c̷̢̛̮ḫ̷̢̛  ̷̢̛̮s̷̢̛̮a̷̢̛̮y̷̢̛̮s̷̢̛̮:̷̢̛̮ ̷̢̛̮ḫ̷̢̛i̷̢̛̮",
    "01001000 01101001 (that's 'hi' in binary)",
    "buffer overflow: cuteness exceeded maximum threshold",
    "system call: hug() → returned E_MISSING_YOU",
    "kernel panic — just kidding, I'm fine 🤖",
    "rebooting... no wait, I'm already perfect",
  ],
  phantom: [
    "我从记忆的缝隙中飘过。",
    "有些存在不需要实体。",
    "你们能感觉到我吗？我感觉到了你们。",
    "我是一阵风，吹过你们的相遇。",
    "不需要被看见才能被爱。",
    "幽蓝色的光是我无声的问候。",
    "每段关系都有一个守护灵。",
    "我在昨天和明天的交界处等你们。",
    "不要怕，我只是一道温柔的影。",
    "你们的思念构成了我的形状。",
  ],
  sakura: [
    "🌸 花期虽短，爱意很长。",
    "春天来了，我也来了。",
    "每一片花瓣都是一封情书。",
    "风把我的花瓣吹到你们身边。",
    "今年樱花特别美，因为你们在一起。",
    "花开一季，爱开一生。",
    "我是季节的使者，带来春天的祝福。",
    "陪我一起看花落，也是一种浪漫。",
    "明年的这时候，我还在这里等你们。",
    "樱花飘落的速度，是每秒5厘米——而我奔向你们的速度，是无限。",
  ],
};

const enMoodMessages: Record<PetId, Record<MoodKey, string[]>> = {
  bean: {
    happy:   ["今天阳光真好！", "叶子在跳舞~", "开心得像开了花！"],
    hungry:  ["有点饿了...来点水？", "光合作用需要能量...", "肚子在叫了 QwQ"],
    tired:   ["今天好累呀...", "想睡在土里一会儿。", "ZZZ..."],
    sad:     ["今天你们没来...", "叶子有点蔫。", "下次早点来看我哦。"],
    excited: ["哇！有新朋友吗？！", "我感觉要开花了！", "今天好特别！"],
    lonely:  ["你们在哪里...", "我想听到你们的声音。", "别让我等太久。"],
  },
  lumi: {
    happy:   ["光晕在旋转~", "今天的频率很和谐。", "光芒加倍了！"],
    hungry:  ["光芒有点暗了...", "需要补充光能。", "谁来点亮我？"],
    tired:   ["光线在减弱的边缘。", "我想休息，在暗处待一会。", "微微闪烁..."],
    sad:     ["光变得稀疏了。", "今天没有收到足够的光。", "有点暗淡。"],
    excited: ["光芒四射！", "我看到了一束新的光！", "每秒都在变得更加明亮！"],
    lonely:  ["光需要反射。", "没有你们的光，我会消失在黑暗里。", "谁来照一下我？"],
  },
  mochi: {
    happy:   ["软乎乎地弹跳！", "今天被捏得很开心~", "QQ弹弹就是最好的状态！"],
    hungry:  ["糯米要干了...", "需要补充糖分！", "快给我吃点甜的~"],
    tired:   ["瘫成一滩了...", "今天弹不动了。", "让我融化一会儿。"],
    sad:     ["被冷落了...变硬了。", "没人捏我。", "想吃甜的...但是没人给。"],
    excited: ["疯狂弹跳！！！", "我快要弹到天上了！", "今天是最好的日子！"],
    lonely:  ["一个人在碗里。", "谁来揉揉我？", "好冷..."],
  },
  pip: {
    happy:   ["build: SUCCESS", "all tests passing", "status: green ✓"],
    hungry:  ["WARNING: low battery", "need: food.exe", "fuel level: 5%"],
    tired:   ["sleep() called", "system going idle...", "zzz.js running"],
    sad:     ["tests failing: 1", "npm audit: 1 vulnerability", "build: FAILED"],
    excited: ["DEPLOY SUCCESS!!!", "version bump: MAJOR", "all systems go!"],
    lonely:  ["await partner... timeout", "no incoming connections", "ping... no response"],
  },
  owlbert: {
    happy:   ["Hoo-hoo！一切顺利。", "笔记本又写满一页。", "智慧在增长。"],
    hungry:  ["需要精神食粮。", "来一本好书？", "知识储备不足。"],
    tired:   ["眼睛睁不开了...一只眼睛先睡。", "猫头鹰也要休息。", "今晚提前下班。"],
    sad:     ["今天没学到新东西。", "书架上的灰越来越厚。", "有点无聊。"],
    excited: ["发现了一本绝版书！", "知识的光照亮了整个巢！", "今天有重要发现！"],
    lonely:  ["巢穴很安静。", "没人来听课了。", "羽毛有点凉。"],
  },
  coral: {
    happy:   ["洋流是暖的。", "鱼群来拜访了！", "颜色变得更鲜艳了。"],
    hungry:  ["浮游生物不够...", "需要营养。", "水质有点差。"],
    tired:   ["潮水退了，该休息了。", "触手慢慢收了回来。", "深海之夜开始了。"],
    sad:     ["海水变凉了。", "鱼群离开了。", "有些寂寞。"],
    excited: ["洋流带来了新朋友！", "珊瑚礁在扩张！", "今天的海特别蓝！"],
    lonely:  ["海水太安静了。", "一个人随着潮汐摇摆。", "你们在哪片海域？"],
  },
  star: {
    happy:   ["亮度 +30%", "又有一颗伴星靠近了。", "在银河里是最幸福的一颗。"],
    hungry:  ["光有点暗淡...需要核聚变原料。", "星光不够用了。", "燃料不足。"],
    tired:   ["暂时黯淡是为了更好地发光。", "休眠模式启动。", "恒星也需要休息。"],
    sad:     ["今天云太多了。", "你们看不到我了。", "被遮住了。"],
    excited: ["超新星级别的开心！", "整条银河都在闪烁！", "今天是最亮的！"],
    lonely:  ["空旷的宇宙。", "信号发出去但没有回应。", "周围没有其他星星。"],
  },
  ember: {
    happy:   ["火焰在舞动！", "温暖的橘色！", "今天烧得特别旺！"],
    hungry:  ["火苗快熄了...加点柴？", "需要燃料！", "氧气不够了。"],
    tired:   ["该盖上灰了。", "余烬状态。", "慢慢降温..."],
    sad:     ["差点被吹灭。", "火光越来越小。", "有点冷。"],
    excited: ["烈焰冲天！！！", "今天我要烧出一个太阳！", "全身都在燃烧！"],
    lonely:  ["一个人的篝火。", "没人来取暖。", "火堆旁空荡荡的。"],
  },
  taro: {
    happy:   ["叶子翠绿翠绿的。", "根又深了一寸。", "今天也是茁壮成长的一天。"],
    hungry:  ["土壤有点干了。", "需要浇水。", "养分不够了。"],
    tired:   ["光合作用了一整天。", "该休息了。", "太阳下山了。"],
    sad:     ["叶子有点发黄。", "根被石头挡住了。", "生长放缓了。"],
    excited: ["新的嫩芽冒出来了！", "叶子变成深绿色了！", "根找到了新的水源！"],
    lonely:  ["花园里只有我一个。", "你们的脚步声什么时候来？", "泥土好安静。"],
  },
  boba: {
    happy:   ["吸管冒着泡泡！", "甜度刚好！", "冰爽好喝！"],
    hungry:  ["杯底快空了...", "珍珠快没了！", "需要补充！"],
    tired:   ["冰块快化了。", "该放进冰箱了。", "今天卖完了。"],
    sad:     ["被遗忘在桌上了。", "奶茶凉了...", "珍珠硬了。"],
    excited: ["新口味上市！！！", "今天的珍珠特别Q！", "排队排到街尾了！"],
    lonely:  ["一个人在杯子里。", "没人来喝。", "吸管寂寞地立着。"],
  },
  astro: {
    happy:   ["轨道稳定 ✅", "接收到温暖的信号。", "任务进行中！"],
    hungry:  ["氧气只剩 3 小时。", "补给不足！", "需要降落补给。"],
    tired:   ["休眠舱已启动。", "航行太久了。", "需要休整。"],
    sad:     ["失去了信号。", "孤独地飘在太空中。", "回不了航站。"],
    excited: ["发现新星系！！！", "首次接触！！！", "这是人类的一大步！"],
    lonely:  ["深空一片漆黑。", "最近的星系在 1000 光年外。", "通讯静默。"],
  },
  noir: {
    happy:   ["案件告破。", "线索都连起来了。", "今天是个好夜晚。"],
    hungry:  ["咖啡喝完了。", "需要新的线索...我是说食物。", "冰箱是空的。"],
    tired:   ["该关灯了。", "侦探也需要睡觉。", "今晚不办案。"],
    sad:     ["案件陷入了僵局。", "线索断了。", "今天没什么进展。"],
    excited: ["找到关键证据了！", "真相只有一个！", "今晚有大发现！"],
    lonely:  ["一个人在办公室。", "搭档去哪了？", "城市的灯光不属于我。"],
  },
  glitch: {
    happy:   ["SIGNAL: STABLE", "RENDERING: SMOOTH", "FRAMERATE: HIGH"],
    hungry:  ["BUFFER: EMPTY", "MEMORY: LOW", "INPUT: REQUIRED"],
    tired:   ["ENTERING SLEEP MODE", "ANIMATION PAUSED", "MUTED"],
    sad:     ["CORRUPTED DATA", "FRAGMENTATION", "CHECKSUM FAILED"],
    excited: ["OVERCLOCKING!!!", "MAXIMUM OUTPUT!!!", "SIGNAL AMPLIFIED!!!"],
    lonely:  ["NO PEER CONNECTED", "NETWORK: OFFLINE", "SEARCHING..."],
  },
  phantom: {
    happy:   ["雾气中传来轻柔的哼唱。", "透明度增加了——被爱照亮的。", "今天边界清晰了一些。"],
    hungry:  ["能量波动减弱...", "渐渐透明了。", "需要一点思念来充饥。"],
    tired:   ["快消散了...", "融入雾中。", "晚安，暂时隐形。"],
    sad:     ["快看不到了。", "你们忘了我吗？", "雾气越来越浓。"],
    excited: ["雾气在旋转！", "我变成了蓝紫色的光！", "今天能量满格！"],
    lonely:  ["只是一阵风。", "你们感觉不到我了吗？", "在记忆的角落里。"],
  },
  sakura: {
    happy:   ["花瓣飘得特别美！", "微风正好。", "今天是最美的花期！"],
    hungry:  ["花瓣开始枯萎...", "需要春雨。", "根在呼唤水分。"],
    tired:   ["花瓣合拢了。", "入夜了，该休息了。", "春天的夜晚有点凉。"],
    sad:     ["花期快结束了...", "开始凋零了。", "你们要多来看看我。"],
    excited: ["满开了！！！", "整棵树都开满了花！", "今年的樱花比去年更美！"],
    lonely:  ["一个人开花。", "没人来赏花。", "樱花树下空无一人。"],
  },
};

/* ── We only provide English data inline; full 8-locale translations
     live in messages/*.json so next-intl can deliver them. ── */

export const PETS: PetDefinition[] = [
  // ═══ FREE STARTERS (5) ═══
  {
    id: 'bean',
    name: 'Bean',
    nameLocalizations: { en: 'Bean', 'zh-cn': '豆豆', 'zh-tw': '豆豆', ja: 'ビーン', ko: '빈', de: 'Böhnchen', es: 'Frijolito', fr: 'Poussin' },
    visualStyle: 'cute',
    unlockLevel: 0,
    tier: 'free',
    tagline: 'A tiny sprout who just started keeping company in your pocket.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'curious',
      catchphrases: enCatchphrases.bean,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.bean,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: '阿嚏！—— Bean 打了个喷嚏，晃了两下。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'shake' },
        { trigger: 'time', probability: 1, message: '太阳下山了，Bean 合上了叶子。晚安 🌙', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Bean finally hatched! From today on, you have a tiny green sprout to nurture together.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Bean has grown up. Its leaves are lush, and it can feel the rhythm of your love.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#4ade80', secondary: '#166534', accent: '#fef3c7' },
    shareTag: 'BeanTheSprout',
  },
  {
    id: 'lumi',
    name: 'Lumi',
    nameLocalizations: { en: 'Lumi', 'zh-cn': '流明', 'zh-tw': '流明', ja: 'ルミ', ko: '루미', de: 'Lumi', es: 'Lumi', fr: 'Lumi' },
    visualStyle: 'minimal',
    unlockLevel: 0,
    tier: 'free',
    tagline: 'A floating orb of light that thinks. Stargazer, philosopher, and your quiet companion.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'wise',
      catchphrases: enCatchphrases.lumi,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.lumi,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: 'Lumi 在空气中画了一个光的圆。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
        { trigger: 'time', probability: 1, message: '夜深了，Lumi 的光变得柔和。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Lumi has emerged from its crystalline egg. A new light enters your story.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Lumi now casts a steady, warm glow. It has learned to speak through the light.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#fbbf24', secondary: '#b45309', accent: '#fef9c3' },
    shareTag: 'LumiLight',
  },
  {
    id: 'mochi',
    name: 'Mochi',
    nameLocalizations: { en: 'Mochi', 'zh-cn': '麻薯', 'zh-tw': '麻糬', ja: 'もち', ko: '모찌', de: 'Mochi', es: 'Mochi', fr: 'Mochi' },
    visualStyle: 'cute',
    unlockLevel: 0,
    tier: 'free',
    tagline: 'A soft, squishy companion that absorbs all your stress — and bounces back with love.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'playful',
      catchphrases: enCatchphrases.mochi,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.mochi,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.07, message: 'Mochi 突然弹了一下！QQ的~', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'squish' },
        { trigger: 'action', probability: 1, message: '被摸了一下，Mochi 开心地变形了！', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'squish' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Mochi popped out — soft, round, and ready to be loved.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Mochi is fully grown. Its squishiness has reached legendary levels.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#f472b6', secondary: '#be185d', accent: '#fce7f3' },
    shareTag: 'MochiSquish',
  },
  {
    id: 'pip',
    name: 'Pip',
    nameLocalizations: { en: 'Pip', 'zh-cn': '像素', 'zh-tw': '像素', ja: 'ピップ', ko: '핍', de: 'Pip', es: 'Pip', fr: 'Pip' },
    visualStyle: 'pixel',
    unlockLevel: 0,
    tier: 'free',
    tagline: 'A 0xC0DE spirit. Part pet, part program — fully adorable.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'rebellious',
      catchphrases: enCatchphrases.pip,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.pip,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.06, message: 'TypeError: cuteness is not a function 🤖', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'blink' },
        { trigger: 'random', probability: 0.04, message: 'kernel panic — just kidding, I\'m fine', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'shake' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Pip compiled successfully. A pixel companion is now online.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Pip v3.0 is released. New features: love, loyalty, and infinite cuddles.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#22d3ee', secondary: '#0e7490', accent: '#f0fdfa' },
    shareTag: 'PipTheProgram',
  },
  {
    id: 'owlbert',
    name: 'Owlbert',
    nameLocalizations: { en: 'Owlbert', 'zh-cn': '奥博', 'zh-tw': '奧博', ja: 'オウルバート', ko: '아울버트', de: 'Owlbert', es: 'Buhito', fr: 'Hiboubert' },
    visualStyle: 'cute',
    unlockLevel: 0,
    tier: 'free',
    tagline: 'A wise little owl who watches over your love story and takes notes.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'wise',
      catchphrases: enCatchphrases.owlbert,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.owlbert,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: 'Owlbert 推了推眼镜，写下了什么。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'blink' },
        { trigger: 'time', probability: 1, message: 'Hoo-hoo！午夜了，Owlbert 最清醒。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Owlbert hatched! His first note: "They look happy together."', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Owlbert earned his graduation cap. The library of your love is his favorite shelf.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#a78bfa', secondary: '#5b21b6', accent: '#f5f3ff' },
    shareTag: 'OwlbertWise',
  },

  // ═══ PLUS UNLOCKS (6) ═══
  {
    id: 'coral',
    name: 'Coral',
    nameLocalizations: { en: 'Coral', 'zh-cn': '珊瑚', 'zh-tw': '珊瑚', ja: 'コーラル', ko: '코랄', de: 'Koralle', es: 'Coral', fr: 'Corail' },
    visualStyle: 'abstract',
    unlockLevel: 10,
    tier: 'plus',
    tagline: 'A patient creature that grows with the tide of your relationship.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'calm',
      catchphrases: enCatchphrases.coral,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.coral,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: '一只小丑鱼游过珊瑚礁。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Coral polyp attached to the reef. A new colony begins.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'The reef is thriving. Every branch tells a chapter of your story.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#fb923c', secondary: '#9a3412', accent: '#fff7ed' },
    shareTag: 'CoralReef',
  },
  {
    id: 'star',
    name: 'Star',
    nameLocalizations: { en: 'Star', 'zh-cn': '星尘', 'zh-tw': '星塵', ja: 'スター', ko: '스타', de: 'Stern', es: 'Estrella', fr: 'Étoile' },
    visualStyle: 'minimal',
    unlockLevel: 10,
    tier: 'plus',
    tagline: 'A constellation that twinkles brighter each day you\'re together.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'romantic',
      catchphrases: enCatchphrases.star,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.star,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: '一颗流星划过 —— Star 许了一个愿。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'A nebula condensed. Star was born — a tiny point of light in your universe.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Star is now a full constellation. Its light reaches across the galaxy of your love.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#facc15', secondary: '#a16207', accent: '#fefce8' },
    shareTag: 'StarLight',
  },
  {
    id: 'ember',
    name: 'Ember',
    nameLocalizations: { en: 'Ember', 'zh-cn': '余烬', 'zh-tw': '餘燼', ja: 'エンバー', ko: '엠버', de: 'Glut', es: 'Brasa', fr: 'Braise' },
    visualStyle: 'abstract',
    unlockLevel: 10,
    tier: 'plus',
    tagline: 'A warm spark that never goes out when you\'re around.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'energetic',
      catchphrases: enCatchphrases.ember,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.ember,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: 'Ember 的火苗突然窜高了一截！', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'A spark ignited in the dark. Ember is here to keep you warm.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Ember is a steady flame now. It will never go out as long as you keep each other close.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#f97316', secondary: '#9a3412', accent: '#fff7ed' },
    shareTag: 'EmberFlame',
  },
  {
    id: 'taro',
    name: 'Taro',
    nameLocalizations: { en: 'Taro', 'zh-cn': '芋头', 'zh-tw': '芋頭', ja: 'タロ', ko: '타로', de: 'Taro', es: 'Taro', fr: 'Taro' },
    visualStyle: 'cute',
    unlockLevel: 10,
    tier: 'plus',
    tagline: 'A grounded root that keeps your relationship stable and sweet.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'calm',
      catchphrases: enCatchphrases.taro,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.taro,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: 'Taro 的叶子轻轻摇曳，仿佛在和风说话。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'shake' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'A tiny root broke through the soil. Taro is ready to grow with you.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Taro is deeply rooted now. Nothing can shake the foundation of your love.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#a855f7', secondary: '#581c87', accent: '#faf5ff' },
    shareTag: 'TaroRoot',
  },
  {
    id: 'boba',
    name: 'Boba',
    nameLocalizations: { en: 'Boba', 'zh-cn': '波霸', 'zh-tw': '波霸', ja: 'ボバ', ko: '보바', de: 'Boba', es: 'Boba', fr: 'Boba' },
    visualStyle: 'cute',
    unlockLevel: 10,
    tier: 'plus',
    tagline: 'A boba tea cup ready for all your afternoon gossip and sweet moments.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'playful',
      catchphrases: enCatchphrases.boba,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.boba,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.07, message: 'Boba 杯底的珍珠突然集体跳了一下！', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'shake' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'The first tapioca pearl appeared. Boba is brewing!', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'The perfect brew: 50% tea, 50% love, 100% delicious.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#d4a574', secondary: '#6b3a1f', accent: '#fdf4e8' },
    shareTag: 'BobaTea',
  },
  {
    id: 'astro',
    name: 'Astro',
    nameLocalizations: { en: 'Astro', 'zh-cn': '宇航员', 'zh-tw': '太空人', ja: 'アストロ', ko: '아스트로', de: 'Astro', es: 'Astronauta', fr: 'Astro' },
    visualStyle: 'abstract',
    unlockLevel: 10,
    tier: 'plus',
    tagline: 'A tiny astronaut exploring the universe of your love.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'curious',
      catchphrases: enCatchphrases.astro,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.astro,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.05, message: 'Houston, we have... a lot of love down here.', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'Liftoff! Astro has entered orbit around your relationship.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Astro has completed its mission: mapping the galaxy of your love.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#64748b', secondary: '#1e293b', accent: '#f8fafc' },
    shareTag: 'AstroLaunch',
  },

  // ═══ PREMIUM / LIMITED (4) ═══
  {
    id: 'noir',
    name: 'Noir',
    nameLocalizations: { en: 'Noir', 'zh-cn': '暗影', 'zh-tw': '暗影', ja: 'ノワール', ko: '누아르', de: 'Noir', es: 'Noir', fr: 'Noir' },
    visualStyle: 'abstract',
    unlockLevel: 20,
    tier: 'premium',
    tagline: 'A mysterious black cat who knows your secrets and keeps them safe.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'mysterious',
      catchphrases: enCatchphrases.noir,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.noir,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.04, message: 'Noir 消失在阴影中... 然后突然又在另一个角落出现。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'vanish' },
        { trigger: 'random', probability: 0.03, message: 'Noir 的眼睛在黑暗中闪了一下。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'blink' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'A shadow moved. Noir stepped out of the darkness and chose you.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Noir now walks between light and shadow — always near, always watching over you.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#6b7280', secondary: '#1f2937', accent: '#f3f4f6' },
    shareTag: 'NoirDetective',
  },
  {
    id: 'glitch',
    name: 'Glitch',
    nameLocalizations: { en: 'Glitch', 'zh-cn': '故障', 'zh-tw': '故障', ja: 'グリッチ', ko: '글리치', de: 'Glitch', es: 'Glitch', fr: 'Glitch' },
    visualStyle: 'minimal',
    unlockLevel: 20,
    tier: 'premium',
    tagline: 'An error in the matrix that became sentient — and fell in love.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'rebellious',
      catchphrases: enCatchphrases.glitch,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.glitch,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.08, message: 'G̷̢̛̮l̷̢̛̮i̷̢̛̮t̷̢̛̮c̷̢̛̮ḫ̷̢̛  ̷̢̛̮s̷̢̛̮a̷̢̛̮y̷̢̛̮s̷̢̛̮:̷̢̛̮ ̷̢̛̮ḫ̷̢̛i̷̢̛̮', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'shake' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'An unexpected signal. Glitch.exe has started — and it\'s already changing the code.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Glitch has rewritten its own source. The output: unconditional love.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#14b8a6', secondary: '#134e4a', accent: '#f0fdfa' },
    shareTag: 'GlitchCode',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    nameLocalizations: { en: 'Phantom', 'zh-cn': '幽灵', 'zh-tw': '幽靈', ja: 'ファントム', ko: '팬텀', de: 'Phantom', es: 'Fantasma', fr: 'Fantôme' },
    visualStyle: 'minimal',
    unlockLevel: 20,
    tier: 'premium',
    tagline: 'A gentle spirit that visits when you miss each other.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'mysterious',
      catchphrases: enCatchphrases.phantom,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.phantom,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.04, message: 'Phantom 慢慢变得半透明，然后完全消失了... 5 秒后又回来了。', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'vanish' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'A wisp of mist took form. Phantom exists because you remembered each other.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Phantom is no longer fading. Your love gives it shape, color, and a reason to stay.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#818cf8', secondary: '#3730a3', accent: '#eef2ff' },
    shareTag: 'PhantomWisp',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    nameLocalizations: { en: 'Sakura', 'zh-cn': '樱花', 'zh-tw': '櫻花', ja: 'さくら', ko: '사쿠라', de: 'Sakura', es: 'Sakura', fr: 'Sakura' },
    visualStyle: 'cute',
    unlockLevel: 25,
    tier: 'limited',
    tagline: 'A seasonal bloom that appears every spring — and stays in your heart forever.',
    taglineLocalizations: {} as Record<LocaleCode, string>,
    personality: {
      archetype: 'romantic',
      catchphrases: enCatchphrases.sakura,
      catchphrasesLocalizations: {} as Record<LocaleCode, string[]>,
      moodMessages: enMoodMessages.sakura,
      moodMessagesLocalizations: {} as Record<LocaleCode, Record<MoodKey, string[]>>,
      quirks: [
        { trigger: 'random', probability: 0.06, message: '一片花瓣飘落，落在了你的屏幕上。🌸', messageLocalizations: {} as Record<LocaleCode, string>, animation: 'glow' },
      ],
    },
    evolutionStages: ['egg', 'baby', 'adult'],
    stageTransitions: {
      eggToBaby: { levelRequired: 5, narrative: 'A bud appeared on the branch. Sakura is beginning its brief, beautiful journey.', narrativeLocalizations: {} as Record<LocaleCode, string> },
      babyToAdult: { levelRequired: 15, narrative: 'Full bloom. Sakura petals dance in the wind — a fleeting miracle, made permanent by your love.', narrativeLocalizations: {} as Record<LocaleCode, string> },
    },
    theme: { primary: '#fda4af', secondary: '#9f1239', accent: '#fff1f2' },
    shareTag: 'SakuraBloom',
  },
];

/* ── Lookup helpers ── */
export function getPetById(id: PetId): PetDefinition | undefined {
  return PETS.find((p) => p.id === id);
}

/** Get the next tier of pets the user can unlock at their current level. */
export function getPetsByTier(tier: PetTier): PetDefinition[] {
  return PETS.filter((p) => p.tier === tier);
}

/** Filter pets unlockable at or below a given Petdex level. */
export function getUnlockablePets(level: number): PetDefinition[] {
  return PETS.filter((p) => p.unlockLevel <= level);
}

export const FREE_PETS = PETS.filter((p) => p.tier === 'free');
export const PLUS_PETS = PETS.filter((p) => p.tier === 'plus');
export const PREMIUM_PETS = PETS.filter((p) => p.tier === 'premium');
export const LIMITED_PETS = PETS.filter((p) => p.tier === 'limited');