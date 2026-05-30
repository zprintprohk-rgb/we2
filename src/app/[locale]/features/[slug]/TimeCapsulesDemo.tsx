'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Package, Lock, LockOpen, Clock } from 'lucide-react';
import { storage } from '@/lib/storage';

function genId(): string {
  return crypto.randomUUID();
}

/* ── Types ── */

interface Capsule {
  id: string;
  title: string;
  content: string;
  unlockDate: string;
  type: 'text' | 'photo' | 'voice';
  createdAt: number;
}

interface TimeCapsulesDemoProps {
  locale: string;
}

const STORAGE_KEY = 'capsules';

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isUnlocked(unlockDate: string): boolean {
  return daysUntil(unlockDate) <= 0;
}

const TYPE_OPTIONS = [
  { value: 'text' as const, label: '📝' },
  { value: 'photo' as const, label: '📷' },
  { value: 'voice' as const, label: '🎤' },
];

/* ── Component ── */

export const TimeCapsulesDemo: FC<TimeCapsulesDemoProps> = () => {
  const t = useTranslations('demo.timeCapsules');
  const prefersReduced = useReducedMotion();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [type, setType] = useState<Capsule['type']>('text');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sealedId, setSealedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = storage.get(STORAGE_KEY) as Capsule[] | null;
    if (stored) setCapsules(stored);
  }, []);

  const persist = useCallback((updated: Capsule[]) => {
    setCapsules(updated);
    storage.set(STORAGE_KEY, updated);
  }, []);

  const handleCreate = useCallback(() => {
    if (!title.trim() || !unlockDate) return;

    const newCapsule: Capsule = {
      id: genId(),
      title: title.trim(),
      content: content.trim(),
      unlockDate,
      type,
      createdAt: Date.now(),
    };

    const updated = [newCapsule, ...capsules];
    persist(updated);
    setTitle('');
    setContent('');
    setUnlockDate('');
    setType('text');
    setSealedId(newCapsule.id);
    setTimeout(() => setSealedId(null), 2000);
  }, [title, content, unlockDate, type, capsules, persist]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {t('title')}
      </h3>

      {/* Create form */}
      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-5 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          className="w-full h-11 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-purple-400/60 dark:focus:border-purple-400/60 transition-colors"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('contentPlaceholder')}
          rows={3}
          className="w-full rounded-xl bg-white/30 backdrop-blur-md border border-white/40 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-purple-400/60 dark:focus:border-purple-400/60 transition-colors resize-none"
        />

        <div className="flex gap-3 items-center">
          {/* Unlock date */}
          <div className="flex-1 h-11 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 px-4 flex items-center">
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none [color-scheme:light]"
            />
          </div>

          {/* Type selector */}
          <div className="flex gap-1.5">
            {TYPE_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                onClick={() => setType(opt.value)}
                className={`w-11 h-11 rounded-xl text-lg flex items-center justify-center transition-all ${
                  type === opt.value
                    ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white shadow-md shadow-purple-500/25 scale-110'
                    : 'bg-white/30 backdrop-blur-md border border-white/40 text-zinc-500 hover:bg-white/40'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={prefersReduced ? undefined : { scale: 0.97 }}
          transition={{ stiffness: 400, damping: 17, type: 'spring' }}
          onClick={handleCreate}
          disabled={!title.trim() || !unlockDate}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {t('lockCapsule')}
        </motion.button>
      </div>

      {/* Capsule list */}
      {capsules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/60 bg-white/20 backdrop-blur-sm p-10 dark:border-purple-800/30 dark:bg-purple-950/10 flex flex-col items-center justify-center gap-3">
          <Package className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
            {t('empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {capsules.map((capsule) => {
            const unlocked = isUnlocked(capsule.unlockDate);
            const days = daysUntil(capsule.unlockDate);
            const isExpanded = expandedId === capsule.id;
            const isJustSealed = sealedId === capsule.id;

            return (
              <motion.div
                key={capsule.id}
                initial={isJustSealed ? { scale: 0.9, opacity: 0 } : false}
                animate={
                  isJustSealed
                    ? { scale: [0.9, 1.05, 1], opacity: 1 }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.4, ease: 'easeOut' }}
                layout
                className={`rounded-2xl border p-4 backdrop-blur-xl shadow-sm transition-all ${
                  unlocked
                    ? 'bg-white/50 border-purple-400/40 dark:bg-purple-950/30 dark:border-purple-500/40 cursor-pointer'
                    : 'bg-white/30 border-white/40 dark:bg-purple-950/10 dark:border-purple-800/20'
                }`}
                onClick={() => unlocked && setExpandedId(isExpanded ? null : capsule.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Lock status */}
                  <div className="flex-shrink-0 mt-0.5">
                    {unlocked ? (
                      <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <LockOpen className="h-5 w-5 text-purple-500" />
                      </motion.div>
                    ) : (
                      <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-semibold text-sm transition-all ${
                        unlocked
                          ? 'text-zinc-800 dark:text-zinc-100'
                          : 'text-zinc-400 dark:text-zinc-500 blur-[2px] select-none'
                      }`}
                    >
                      {capsule.title}
                    </h4>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {unlocked ? t('unlocked') : t('daysLeft', { days: Math.max(days, 0) })}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100/50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-700/30">
                        {capsule.type === 'text' ? '📝' : capsule.type === 'photo' ? '📷' : '🎤'}
                      </span>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-purple-200/30 dark:border-purple-700/20">
                            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                              {capsule.content || t('noContent')}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};