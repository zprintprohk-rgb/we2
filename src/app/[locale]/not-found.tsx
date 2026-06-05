'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/routing'

/**
 * 404 page (PRD §8 P1 - friendly not-found state).
 *
 * Pet is "lost" (a fun in-joke — they're roaming their own device).
 * 3 CTAs: Home, Daily, Chat — gives the user a way forward without
 * the dead-end of a single 'go back' button.
 *
 * Dark-mode native, since the whole site is dark-first.
 */

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      {/* "Lost" pet — robot with a confused expression */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0],
          rotate: [0, -3, 3, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
          y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative mb-6 h-40 w-40 sm:h-48 sm:w-48"
        aria-hidden="true"
      >
        {/* Soft glow ring behind */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-300/20 via-amber-300/20 to-purple-400/20 blur-2xl" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pets/expression-thinking.png"
          alt=""
          className="relative h-full w-full object-contain drop-shadow-[0_4px_16px_rgba(251,191,36,0.2)]"
        />
        {/* Question mark bubble */}
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -right-2 -top-2 text-4xl"
        >
          ❓
        </motion.div>
      </motion.div>

      {/* 404 number — pixel-block style */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-2 font-mono text-7xl font-black tracking-tighter sm:text-8xl bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 bg-clip-text text-transparent"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100"
      >
        {t('title')}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8 max-w-md text-sm text-zinc-500 dark:text-zinc-400"
      >
        {t('description')}
      </motion.p>

      {/* 3 CTAs — give the user a path forward, not just back */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50"
        >
          🏠 {t('backHome')}
        </Link>
        <Link
          href="/daily"
          className="inline-flex h-10 items-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          🐾 {t('feedPet')}
        </Link>
        <Link
          href="/chat"
          className="inline-flex h-10 items-center rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          💬 {t('sayHi')}
        </Link>
      </motion.div>

      {/* 8-bit hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12 text-[10px] uppercase tracking-widest text-zinc-500"
      >
        ✦ {t('pixelHint')} ✦
      </motion.p>
    </div>
  )
}
