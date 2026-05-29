'use client'

import { Link } from '@/i18n/routing'
import { motion } from 'framer-motion'

type Feature = {
  key: string
  icon: string
  title: string
  desc: string
}

type Props = {
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  heroSecondary: string
  features: Feature[]
  footerPrivacy: string
  footerTerms: string
  footerCookie: string
  footerHelp: string
  footerContact: string
}

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

export function HomeClient({
  heroTitle,
  heroSubtitle,
  heroCta,
  heroSecondary,
  features,
  footerPrivacy,
  footerTerms,
  footerCookie,
  footerHelp,
  footerContact,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-16 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      <main className="w-full max-w-3xl text-center">
        {/* Hero */}
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
                href="/register"
                className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-rose-600 hover:to-purple-700 transition-all duration-300"
              >
                {heroCta}
              </Link>
            </motion.span>

            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/features"
                className="inline-flex h-11 items-center rounded-full border border-rose-200 bg-white/60 backdrop-blur px-6 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300"
              >
                {heroSecondary}
              </Link>
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Feature grid with stagger animation */}
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
              className="rounded-2xl border border-rose-100 bg-white/70 backdrop-blur p-6 text-left shadow-sm transition-all duration-300 dark:border-purple-800/50 dark:bg-purple-950/30 dark:hover:shadow-purple-500/10"
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

        {/* Footer */}
        <footer className="pt-12 text-sm text-zinc-400 dark:text-zinc-500">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy">{footerPrivacy}</Link>
            <Link href="/terms">{footerTerms}</Link>
            <Link href="/cookies">{footerCookie}</Link>
            <Link href="/help">{footerHelp}</Link>
            <Link href="/contact">{footerContact}</Link>
          </div>
          <p className="mt-4">
            © {new Date().getFullYear()} We2
          </p>
        </footer>
      </main>
    </div>
  )
}