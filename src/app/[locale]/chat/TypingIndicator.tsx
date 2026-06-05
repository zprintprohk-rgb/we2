'use client'

/**
 * TypingIndicator — 3-dot pulse wave (the AI is typing).
 * Uses staggered scale animation for the "wave" feel.
 */

import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      data-testid="typing-indicator"
      className="flex justify-start"
    >
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md glass-card-emph px-4 py-3">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-zinc-300"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
