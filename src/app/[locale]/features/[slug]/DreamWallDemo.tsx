'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { storage } from '@/lib/storage';

/* ── Types ── */

interface Dream {
  id: string;
  emoji: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface DreamWallDemoProps {
  locale: string;
}

const STORAGE_KEY = 'dreams';

const EMOJIS = ['🏠', '✈️', '🎓', '💍', '🎁', '🚗', '💰', '🏋️'];

function genId(): string {
  return crypto.randomUUID();
}

/* ── Component ── */

export const DreamWallDemo: FC<DreamWallDemoProps> = () => {
  const t = useTranslations('demo.dreamWall');
  const prefersReduced = useReducedMotion();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🏠');
  const [text, setText] = useState('');

  useEffect(() => {
    setMounted(true);
    const stored = storage.get(STORAGE_KEY) as Dream[] | null;
    if (stored) setDreams(stored);
  }, []);

  const persist = useCallback((updated: Dream[]) => {
    // Sort: incomplete first, then by createdAt desc
    const sorted = [...updated].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
    setDreams(sorted);
    storage.set(STORAGE_KEY, sorted);
  }, []);

  const handlePin = useCallback(() => {
    if (!text.trim()) return;

    const newDream: Dream = {
      id: genId(),
      emoji: selectedEmoji,
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    persist([newDream, ...dreams]);
    setText('');
    setSelectedEmoji('🏠');
  }, [text, selectedEmoji, dreams, persist]);

  const handleToggle = useCallback(
    (id: string) => {
      const updated = dreams.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d));
      persist(updated);
    },
    [dreams, persist],
  );

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {t('title')}
      </h3>

      {/* Pin area */}
      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-5 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm space-y-4">
        {/* Emoji picker */}
        <div className="grid grid-cols-4 gap-2">
          {EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileTap={prefersReduced ? undefined : { scale: 0.92 }}
              onClick={() => setSelectedEmoji(emoji)}
              className={`h-11 rounded-xl text-2xl flex items-center justify-center transition-all ${
                selectedEmoji === emoji
                  ? 'bg-yellow-300/30 border-2 border-yellow-400 scale-110 shadow-md shadow-yellow-400/30'
                  : 'bg-white/30 backdrop-blur-md border border-white/40 hover:bg-white/50'
              }`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('placeholder')}
            onKeyDown={(e) => e.key === 'Enter' && handlePin()}
            className="flex-1 h-11 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 px-4 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400/60 dark:focus:border-yellow-400/60 transition-colors"
          />

          <motion.button
            whileTap={prefersReduced ? undefined : { scale: 0.97 }}
            transition={{ stiffness: 400, damping: 17, type: 'spring' }}
            onClick={handlePin}
            disabled={!text.trim()}
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t('pin')}
          </motion.button>
        </div>
      </div>

      {/* Dream grid */}
      {dreams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/60 bg-white/20 backdrop-blur-sm p-10 dark:border-purple-800/30 dark:bg-purple-950/10 flex flex-col items-center justify-center gap-3">
          <span className="text-3xl opacity-50">✨</span>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
            {t('empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {dreams.map((dream) => (
              <motion.div
                key={dream.id}
                layout
                initial={
                  prefersReduced ? false : { scale: 0.8, opacity: 0 }
                }
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`rounded-2xl border backdrop-blur-xl p-4 shadow-sm flex items-start gap-3 transition-all ${
                  dream.completed
                    ? 'bg-white/20 border-white/20 opacity-50 dark:bg-purple-950/5 dark:border-purple-800/10'
                    : 'bg-white/50 border-white/40 dark:bg-purple-950/30 dark:border-purple-800/30'
                }`}
              >
                {/* Emoji */}
                <motion.span
                  className={`text-4xl flex-shrink-0 select-none ${
                    dream.completed ? 'grayscale' : ''
                  }`}
                  whileHover={
                    prefersReduced ? undefined : { scale: 1.15, rotate: [0, -8, 8, 0] }
                  }
                  transition={{ duration: 0.4 }}
                >
                  {dream.emoji}
                </motion.span>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-relaxed break-words ${
                      dream.completed
                        ? 'line-through text-zinc-400 dark:text-zinc-500'
                        : 'text-zinc-700 dark:text-zinc-200'
                    }`}
                  >
                    {dream.text}
                  </p>
                </div>

                {/* Checkbox */}
                <motion.button
                  whileTap={prefersReduced ? undefined : { scale: 0.85 }}
                  onClick={() => handleToggle(dream.id)}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    dream.completed
                      ? 'bg-yellow-400 border-yellow-400'
                      : 'border-zinc-300 dark:border-zinc-600 hover:border-yellow-400'
                  }`}
                >
                  <AnimatePresence>
                    {dream.completed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        exit={{ scale: 0 }}
                        transition={{ stiffness: 400, damping: 12, type: 'spring' }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};