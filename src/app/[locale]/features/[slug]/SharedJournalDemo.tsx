'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PenLine, User } from 'lucide-react';
import { storage } from '@/lib/storage';

/* ── Types ── */

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  author: 'you' | 'partner';
}

interface SharedJournalDemoProps {
  locale: string;
}

const STORAGE_KEY = 'journal';

function genId(): string {
  return crypto.randomUUID();
}

function todayStr(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    content:
      'We had the most amazing dinner at that little Italian place downtown. The tiramisu was to die for!',
    date: 'May 29, 2026',
    author: 'you',
  },
  {
    id: '2',
    content:
      'Spent the whole afternoon in the park. Fed the ducks and watched the sunset. Perfect day.',
    date: 'May 28, 2026',
    author: 'partner',
  },
];

/* ── Component ── */

export const SharedJournalDemo: FC<SharedJournalDemoProps> = () => {
  const prefersReduced = useReducedMotion();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = storage.get(STORAGE_KEY) as JournalEntry[] | null;
    if (stored && stored.length > 0) {
      setEntries(stored);
    } else {
      setEntries(MOCK_ENTRIES);
      storage.set(STORAGE_KEY, MOCK_ENTRIES);
    }
  }, []);

  const handleWrite = useCallback(() => {
    if (!content.trim()) return;

    const newEntry: JournalEntry = {
      id: genId(),
      content: content.trim(),
      date: todayStr(),
      author: 'you',
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    storage.set(STORAGE_KEY, updated);
    setContent('');
  }, [content, entries]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Shared Journal
      </h3>

      {/* Desktop: side-by-side, Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Editor */}
        <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-5 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {todayStr()}
            </span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write today's entry..."
            rows={5}
            className="w-full rounded-xl bg-white/30 backdrop-blur-md border border-white/40 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400/60 dark:focus:border-emerald-400/60 transition-colors resize-none"
          />

          <motion.button
            whileTap={prefersReduced ? undefined : { scale: 0.97 }}
            transition={{ stiffness: 400, damping: 17, type: 'spring' }}
            onClick={handleWrite}
            disabled={!content.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Write Entry
          </motion.button>
        </div>

        {/* Right: Timeline */}
        <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-5 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm">
          <div className="relative pl-6 before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:to-teal-500 before:opacity-30 space-y-4">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isYou = entry.author === 'you';

              return (
                <div
                  key={entry.id}
                  className="relative cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {/* Node */}
                  <div
                    className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-purple-950 ${
                      isYou ? 'bg-emerald-400' : 'bg-purple-400'
                    }`}
                  />

                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {entry.date}
                  </p>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isYou
                          ? 'bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      <User className="h-2.5 w-2.5" />
                      {isYou ? 'You' : 'Partner'}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed line-clamp-2">
                    {entry.content}
                  </p>

                  {/* Accordion expand */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 pt-2 border-t border-emerald-200/30 dark:border-emerald-700/20">
                          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {entry.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};