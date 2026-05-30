'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { storage } from '@/lib/storage';

/* ── Types ── */

interface SavedAnswer {
  date: string;
  text: string;
}

interface DailyCheckInDemoProps {
  locale: string;
}

/* ── Static questions ── */

const QUESTIONS = [
  "What's one thing your partner did today that made you smile?",
  'Share a memory from this week that you would like to relive.',
  "What's one quality you admire most in your partner right now?",
  'If you could gift your partner one superpower, what would it be?',
];

const STORAGE_KEY = 'checkin_answers';

/* ── Component ── */

export const DailyCheckInDemo: FC<DailyCheckInDemoProps> = () => {
  const prefersReduced = useReducedMotion();
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  /* Hydration-safe: only read storage after mount */
  useEffect(() => {
    setMounted(true);
    const stored = storage.get(STORAGE_KEY) as SavedAnswer[] | null;
    if (stored && Array.isArray(stored)) {
      setSavedAnswers(stored);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!answer.trim()) return;

    const newAnswer: SavedAnswer = {
      date: new Date().toISOString().split('T')[0],
      text: answer.trim(),
    };

    const updated = [newAnswer, ...savedAnswers];
    setSavedAnswers(updated);
    storage.set(STORAGE_KEY, updated);
    setIsSaved(true);
    setAnswer('');
  }, [answer, savedAnswers]);

  const handleNextQuestion = useCallback(() => {
    setIsSaved(false);
    setQuestionIndex((prev) => (prev + 1) % QUESTIONS.length);
  }, []);

  if (!mounted) {
    /* Prevent hydration mismatch */
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {"Today's Question"}
      </h3>

      {/* Question card */}
      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-6 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm">
        <motion.p
          key={questionIndex}
          initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-lg font-medium text-zinc-800 dark:text-zinc-100 leading-relaxed mb-4"
        >
          {QUESTIONS[questionIndex]}
        </motion.p>

        <AnimatePresence mode="wait">
          {!isSaved ? (
            <motion.div
              key="input"
              initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
              animate={prefersReduced ? {} : { opacity: 1, height: 'auto' }}
              exit={prefersReduced ? {} : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-3 overflow-hidden"
            >
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-xl bg-white/40 backdrop-blur-xl border-2 border-white/40 focus:border-pink-400/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)] dark:bg-purple-950/40 dark:border-purple-800/30 dark:focus:border-pink-400/60 transition-all duration-200 resize-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder="Share your moment..."
              />
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.15 }}
                onClick={handleSave}
                disabled={!answer.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Save Answer
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="saved"
              initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
              animate={prefersReduced ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <motion.div
                initial={prefersReduced ? {} : { scale: 0, rotate: -45 }}
                animate={prefersReduced ? {} : { scale: 1.2, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17, mass: 0.8 }}
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                Answer saved!
              </p>
              <motion.button
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                onClick={handleNextQuestion}
                className="text-sm text-pink-500 dark:text-pink-400 hover:underline transition-colors"
              >
                Next question →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      {savedAnswers.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Your Answers
          </h3>
          <div className="space-y-2">
            {savedAnswers.slice(0, 5).map((item, i) => (
              <motion.div
                key={`${item.date}-${i}`}
                initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
                animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-white/30 bg-white/30 backdrop-blur p-3 dark:bg-purple-950/20 dark:border-purple-800/20"
              >
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{item.date}</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed line-clamp-2">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-white/20 dark:bg-zinc-800/20">
          <MessageCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Start your first check-in
          </p>
        </div>
      )}
    </div>
  );
};