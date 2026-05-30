'use client';

import { useState, useEffect, useCallback, type FC } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { storage } from '@/lib/storage';

/* ── Types ── */

interface Post {
  id: string;
  content: string;
  tag: string;
  likes: number;
  liked: boolean;
  authorInitial: string;
  authorColor: string;
}

interface PrivateCommunityDemoProps {
  locale: string;
}

const STORAGE_KEY = 'posts';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    content: 'Just celebrated our 3rd anniversary! Long distance is hard but so worth it ❤️',
    tag: 'Milestone',
    likes: 24,
    liked: false,
    authorInitial: 'A',
    authorColor: 'from-pink-400 to-rose-500',
  },
  {
    id: '2',
    content: 'Any creative date night ideas for this weekend? We are on a budget 💡',
    tag: 'Advice',
    likes: 18,
    liked: false,
    authorInitial: 'M',
    authorColor: 'from-blue-400 to-indigo-500',
  },
  {
    id: '3',
    content: 'He surprised me with breakfast in bed today. I am the luckiest person alive 🥹',
    tag: 'Gratitude',
    likes: 32,
    liked: false,
    authorInitial: 'J',
    authorColor: 'from-purple-400 to-violet-500',
  },
];

function genId(): string {
  return crypto.randomUUID();
}

/* ── Component ── */

export const PrivateCommunityDemo: FC<PrivateCommunityDemoProps> = () => {
  const prefersReduced = useReducedMotion();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mounted, setMounted] = useState(false);
  const [likeAnimId, setLikeAnimId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = storage.get(STORAGE_KEY) as Post[] | null;
    if (stored && stored.length > 0) {
      setPosts(stored);
    } else {
      setPosts(MOCK_POSTS);
      storage.set(STORAGE_KEY, MOCK_POSTS);
    }
  }, []);

  const handleLike = useCallback(
    (id: string) => {
      const updated = posts.map((p) => {
        if (p.id !== id) return p;
        const newLiked = !p.liked;
        return {
          ...p,
          liked: newLiked,
          likes: p.likes + (newLiked ? 1 : -1),
        };
      });
      setPosts(updated);
      storage.set(STORAGE_KEY, updated);
      setLikeAnimId(id);
      setTimeout(() => setLikeAnimId(null), 600);
    },
    [posts],
  );

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Community Stories
      </h3>

      <div className="rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl p-4 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm space-y-3">
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: 'easeOut' }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/40 dark:bg-purple-950/20 border border-white/20 dark:border-purple-800/20"
            >
              {/* Anonymous avatar */}
              <div
                className={`h-9 w-9 rounded-full bg-gradient-to-br ${post.authorColor} flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md`}
              >
                {post.authorInitial}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30 font-medium">
                    {post.tag}
                  </span>

                  {/* Like button */}
                  <motion.button
                    whileTap={prefersReduced ? undefined : { scale: 0.9 }}
                    onClick={() => handleLike(post.id)}
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 transition-colors"
                    style={{
                      color: post.liked ? '#ec4899' : undefined,
                    }}
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-500">
                      <motion.span
                        animate={
                          likeAnimId === post.id && post.liked
                            ? { scale: [1, 1.4, 1] }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="inline-block"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            post.liked ? 'fill-pink-400 text-pink-400' : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        />
                      </motion.span>
                    </span>
                    <span
                      className={
                        post.liked ? 'text-pink-500' : 'text-zinc-500 dark:text-zinc-400'
                      }
                    >
                      {post.likes}
                    </span>
                    {/* +1 float animation */}
                    <AnimatePresence>
                      {likeAnimId === post.id && post.liked && (
                        <motion.span
                          initial={{ opacity: 1, y: 0 }}
                          animate={{ opacity: 0, y: -16 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="absolute text-xs font-bold text-pink-500"
                        >
                          +1
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};