'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type Feature = {
  key: string
  icon: string
  title: string
  desc: string
}

type Props = {
  locale: string
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  heroSecondary: string
  heroSocialProof: string
  features: Feature[]
  footerPrivacy: string
  footerTerms: string
  footerCookie: string
  footerHelp: string
  footerContact: string
}

/* ── Animation variants ── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
} as const

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
} as const

/* ── Floating heart component ── */
function FloatingHeart({ className, delay, duration, size }: {
  className: string
  delay: number
  duration: number
  size: number
}) {
  return (
    <motion.span
      className={`absolute select-none pointer-events-none ${className}`}
      style={{ fontSize: size }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.18, 0.18, 0],
        y: [0, -12, 0, 12],
      }}
      transition={{
        opacity: { duration: duration * 2, repeat: Infinity, ease: 'easeInOut', delay },
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      ♡
    </motion.span>
  )
}

/* ── Glow orb component ── */
function GlowOrb({ className, color, delay, duration }: {
  className: string
  color: string
  delay: number
  duration: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ background: color }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.06, 0.1, 0.06],
        scale: [0.8, 1, 0.8],
        x: [0, 20, -15, 0],
        y: [0, -15, 10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

/* ── Sparkle particle ── */
function Sparkle({ className, delay, duration }: {
  className: string
  delay: number
  duration: number
}) {
  return (
    <motion.span
      className={`absolute select-none pointer-events-none text-pink-300 dark:text-pink-400 ${className}`}
      style={{ fontSize: 6 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      ✦
    </motion.span>
  )
}

/* ── Main component ── */
export function HomeClient({
  locale,
  heroTitle,
  heroSubtitle,
  heroCta,
  heroSecondary,
  heroSocialProof,
  features,
  footerPrivacy,
  footerTerms,
  footerCookie,
  footerHelp,
  footerContact,
}: Props) {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-16 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      {/* ── Background decorations ── */}
      <GlowOrb className="w-[400px] h-[400px] -top-20 -left-20" color="#EC4899" delay={0} duration={10} />
      <GlowOrb className="w-[350px] h-[350px] top-1/2 -right-16" color="#A855F7" delay={2} duration={12} />
      <GlowOrb className="w-[300px] h-[300px] top-1/4 right-1/4" color="#6366F1" delay={4} duration={9} />

      <FloatingHeart className="left-[5%] top-[40%] text-rose-500 dark:text-rose-400" delay={0} duration={4} size={24} />
      <FloatingHeart className="right-[8%] top-[28%] text-rose-500 dark:text-rose-400" delay={1.5} duration={3.5} size={18} />
      <FloatingHeart className="left-[12%] bottom-[20%] text-rose-500 dark:text-rose-400" delay={3} duration={5} size={20} />

      <Sparkle className="left-[15%] top-[18%]" delay={0} duration={2.5} />
      <Sparkle className="right-[20%] top-[15%]" delay={0.8} duration={3} />
      <Sparkle className="left-[30%] top-[60%]" delay={1.5} duration={2} />
      <Sparkle className="right-[35%] bottom-[25%]" delay={2} duration={2.8} />
      <Sparkle className="left-[60%] top-[10%]" delay={0.5} duration={3.2} />
      <Sparkle className="right-[10%] bottom-[35%]" delay={1.2} duration={2.3} />

      <main className="relative z-10 w-full max-w-3xl text-center">
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 pb-12"
        >
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={`/${locale}/register`}
                className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-rose-600 hover:to-purple-700 hover:shadow-purple-500/40 transition-all duration-300"
              >
                {heroCta}
              </Link>
            </motion.span>

            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={`/${locale}/features`}
                className="inline-flex h-11 items-center rounded-full border border-rose-200 bg-white/60 backdrop-blur px-6 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300"
              >
                {heroSecondary}
              </Link>
            </motion.span>
          </motion.div>

          {/* ── Social proof ── */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-sm text-zinc-400 dark:text-zinc-500"
          >
            {heroSocialProof}
          </motion.p>
        </motion.div>

        {/* ── Feature grid with stagger animation ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pb-16"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.key}
              variants={item}
              whileHover={{
                y: -4,
                boxShadow:
                  '0 12px 40px rgba(244,114,182,0.15), 0 0 0 1px rgba(168,85,247,0.2)',
              }}
              onClick={() => router.push(`/${locale}/features`)}
              className="rounded-2xl border border-rose-100 bg-white/70 backdrop-blur p-6 text-left shadow-sm transition-all duration-300 dark:border-purple-800/50 dark:bg-purple-950/30 dark:hover:shadow-purple-500/10 cursor-pointer"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Footer ── */}
        <footer className="pt-12 text-sm text-zinc-400 dark:text-zinc-500">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/privacy`}>{footerPrivacy}</Link>
            <Link href={`/${locale}/terms`}>{footerTerms}</Link>
            <Link href={`/${locale}/cookies`}>{footerCookie}</Link>
            <Link href={`/${locale}/help`}>{footerHelp}</Link>
            <Link href={`/${locale}/contact`}>{footerContact}</Link>
          </div>
          <p className="mt-4">
            © {new Date().getFullYear()} We2
          </p>
        </footer>
      </main>
    </div>
  )
}