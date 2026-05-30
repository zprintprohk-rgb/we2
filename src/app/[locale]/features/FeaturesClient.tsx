'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { FeatureCard, type Feature } from '@/components/FeatureCard'

type Props = {
  locale: string
  title: string
  subtitle: string
  features: Feature[]
}

export function FeaturesClient({ locale, title, subtitle, features }: Props) {
  const prefersReduced = useReducedMotion()

  const container: Variants = {
    hidden: prefersReduced ? {} : { opacity: 0 },
    show: prefersReduced
      ? {}
      : {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-16 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      {/* ── Background decorative glow orbs ── */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[450px] w-[450px] rounded-full bg-rose-400/10 blur-3xl dark:bg-rose-400/5" />
      <div className="pointer-events-none absolute top-1/2 -right-20 h-[380px] w-[380px] rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-400/5" />
      <div className="pointer-events-none absolute top-1/4 right-1/3 h-[320px] w-[320px] rounded-full bg-indigo-400/8 blur-3xl dark:bg-indigo-400/4" />

      <main className="relative z-10 w-full max-w-5xl">
        {/* ── Header ── */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            {title}
          </h1>
          <motion.p
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="mt-4 max-w-2xl mx-auto text-lg text-zinc-500 dark:text-zinc-400"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* ── Feature Cards Grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <FeatureCard key={feature.key} feature={feature} locale={locale} index={i} />
          ))}
        </motion.div>
      </main>
    </div>
  )
}