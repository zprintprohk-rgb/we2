/* ── Feature metadata types ── */
export type FeatureSlug =
  | 'daily-check-in'
  | 'time-capsules'
  | 'virtual-pet'
  | 'private-community'
  | 'shared-journal'
  | 'dream-wall'

export type DemoType =
  | 'check-in'
  | 'time-capsule'
  | 'virtual-pet'
  | 'community'
  | 'shared-journal'
  | 'dream-wall'

export type FeatureMeta = {
  id: string
  slug: FeatureSlug
  iconName: string
  titleKey: string
  descKey: string
  longDescKey: string
  theme: {
    barFrom: string
    barVia: string
    barTo: string
    iconFrom: string
    iconTo: string
    shadowColor: string
    glowFrom: string
    glowTo: string
    descColor: string
    text?: string
    bg?: string
    badge?: string
  }
  lucideIcon:
    | 'HeartHandshake'
    | 'Clock'
    | 'PawPrint'
    | 'Users'
    | 'BookOpen'
    | 'Sparkles'
  demoType: DemoType
  steps: string[]
}

/* ── Feature → slug reverse mapping (key → slug) ── */
export const KEY_TO_SLUG: Record<string, FeatureSlug> = {
  sharedJournal: 'daily-check-in',
  moodTracker: 'time-capsules',
  dreamWall: 'virtual-pet',
  dailyGratitude: 'private-community',
  petAdoption: 'shared-journal',
  timeCapsule: 'dream-wall',
}

export const SLUG_TO_KEY: Record<FeatureSlug, string> = {
  'daily-check-in': 'sharedJournal',
  'time-capsules': 'moodTracker',
  'virtual-pet': 'dreamWall',
  'private-community': 'dailyGratitude',
  'shared-journal': 'petAdoption',
  'dream-wall': 'timeCapsule',
}

/* ── Feature icons map (key → Lucide name) ── */
export const KEY_TO_LUCIDE: Record<string, FeatureMeta['lucideIcon']> = {
  sharedJournal: 'HeartHandshake',
  moodTracker: 'Clock',
  dreamWall: 'PawPrint',
  dailyGratitude: 'Users',
  petAdoption: 'BookOpen',
  timeCapsule: 'Sparkles',
}

/* ── Complete feature metadata ── */
export const FEATURES: FeatureMeta[] = [
  {
    id: 'sharedJournal',
    slug: 'daily-check-in',
    iconName: 'Daily Check-in',
    titleKey: 'home.features.sharedJournal.title',
    descKey: 'home.features.sharedJournal.desc',
    longDescKey: 'features.dailyCheckIn.longDesc',
    theme: {
      barFrom: 'from-pink-400',
      barVia: 'via-rose-400',
      barTo: 'to-pink-500',
      iconFrom: 'from-pink-500',
      iconTo: 'to-rose-400',
      shadowColor: 'rgba(236,72,153,0.25)',
      glowFrom: 'from-pink-400',
      glowTo: 'to-rose-300',
      descColor: 'text-pink-900/60 dark:text-pink-200/50',
      text: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950/30',
      badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
    },
    lucideIcon: 'HeartHandshake',
    demoType: 'check-in',
    steps: [
      'features.dailyCheckIn.step1',
      'features.dailyCheckIn.step2',
      'features.dailyCheckIn.step3',
      'features.dailyCheckIn.step4',
    ],
  },
  {
    id: 'moodTracker',
    slug: 'time-capsules',
    iconName: 'Time Capsules',
    titleKey: 'home.features.moodTracker.title',
    descKey: 'home.features.moodTracker.desc',
    longDescKey: 'features.timeCapsules.longDesc',
    theme: {
      barFrom: 'from-violet-400',
      barVia: 'via-purple-400',
      barTo: 'to-indigo-500',
      iconFrom: 'from-violet-500',
      iconTo: 'to-purple-400',
      shadowColor: 'rgba(168,85,247,0.25)',
      glowFrom: 'from-violet-400',
      glowTo: 'to-purple-300',
      descColor: 'text-violet-900/60 dark:text-violet-200/50',
      text: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    },
    lucideIcon: 'Clock',
    demoType: 'time-capsule',
    steps: [
      'features.timeCapsules.step1',
      'features.timeCapsules.step2',
      'features.timeCapsules.step3',
      'features.timeCapsules.step4',
    ],
  },
  {
    id: 'dreamWall',
    slug: 'virtual-pet',
    iconName: 'Virtual Pet',
    titleKey: 'home.features.dreamWall.title',
    descKey: 'home.features.dreamWall.desc',
    longDescKey: 'features.virtualPet.longDesc',
    theme: {
      barFrom: 'from-blue-400',
      barVia: 'via-indigo-400',
      barTo: 'to-blue-500',
      iconFrom: 'from-blue-500',
      iconTo: 'to-indigo-400',
      shadowColor: 'rgba(99,102,241,0.25)',
      glowFrom: 'from-blue-400',
      glowTo: 'to-indigo-300',
      descColor: 'text-blue-900/60 dark:text-blue-200/50',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    },
    lucideIcon: 'PawPrint',
    demoType: 'virtual-pet',
    steps: [
      'features.virtualPet.step1',
      'features.virtualPet.step2',
      'features.virtualPet.step3',
      'features.virtualPet.step4',
    ],
  },
  {
    id: 'dailyGratitude',
    slug: 'private-community',
    iconName: 'Private Community',
    titleKey: 'home.features.dailyGratitude.title',
    descKey: 'home.features.dailyGratitude.desc',
    longDescKey: 'features.privateCommunity.longDesc',
    theme: {
      barFrom: 'from-amber-400',
      barVia: 'via-orange-400',
      barTo: 'to-amber-500',
      iconFrom: 'from-amber-500',
      iconTo: 'to-orange-400',
      shadowColor: 'rgba(245,158,11,0.25)',
      glowFrom: 'from-amber-400',
      glowTo: 'to-orange-300',
      descColor: 'text-amber-900/60 dark:text-amber-200/50',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    },
    lucideIcon: 'Users',
    demoType: 'community',
    steps: [
      'features.privateCommunity.step1',
      'features.privateCommunity.step2',
      'features.privateCommunity.step3',
      'features.privateCommunity.step4',
    ],
  },
  {
    id: 'petAdoption',
    slug: 'shared-journal',
    iconName: 'Shared Journal',
    titleKey: 'home.features.petAdoption.title',
    descKey: 'home.features.petAdoption.desc',
    longDescKey: 'features.sharedJournal.longDesc',
    theme: {
      barFrom: 'from-emerald-400',
      barVia: 'via-teal-400',
      barTo: 'to-emerald-500',
      iconFrom: 'from-emerald-500',
      iconTo: 'to-teal-400',
      shadowColor: 'rgba(20,184,166,0.25)',
      glowFrom: 'from-emerald-400',
      glowTo: 'to-teal-300',
      descColor: 'text-emerald-900/60 dark:text-emerald-200/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    },
    lucideIcon: 'BookOpen',
    demoType: 'shared-journal',
    steps: [
      'features.sharedJournal.step1',
      'features.sharedJournal.step2',
      'features.sharedJournal.step3',
      'features.sharedJournal.step4',
    ],
  },
  {
    id: 'timeCapsule',
    slug: 'dream-wall',
    iconName: 'Dream Wall',
    titleKey: 'home.features.timeCapsule.title',
    descKey: 'home.features.timeCapsule.desc',
    longDescKey: 'features.dreamWall.longDesc',
    theme: {
      barFrom: 'from-yellow-400',
      barVia: 'via-amber-400',
      barTo: 'to-yellow-500',
      iconFrom: 'from-yellow-500',
      iconTo: 'to-amber-400',
      shadowColor: 'rgba(234,179,8,0.25)',
      glowFrom: 'from-yellow-400',
      glowTo: 'to-amber-300',
      descColor: 'text-yellow-900/60 dark:text-yellow-200/50',
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    },
    lucideIcon: 'Sparkles',
    demoType: 'dream-wall',
    steps: [
      'features.dreamWall.step1',
      'features.dreamWall.step2',
      'features.dreamWall.step3',
      'features.dreamWall.step4',
    ],
  },
]

/* ── Helper: get feature by slug ── */
export function getFeatureBySlug(slug: string): FeatureMeta | undefined {
  return FEATURES.find((f) => f.slug === slug)
}

export function getFeatureByKey(key: string): FeatureMeta | undefined {
  return FEATURES.find((f) => f.id === key)
}

export const VALID_SLUGS = FEATURES.map((f) => f.slug)