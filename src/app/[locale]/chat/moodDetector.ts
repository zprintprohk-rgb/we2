/**
 * Simple keyword-based mood detector.
 * 5 moods: sweet / fight / calm / sleepy / think
 *
 * Pure function, no React, no side effects — easy to test.
 */

import type { Mood } from '@/lib/design-tokens'

const KEYWORDS: Record<Mood, RegExp[]> = {
  sweet:  [/love/i, /\bmiss/i, /\bhappy\b/i, /\bgreat\b/i, /\bjoy\b/i, /\byay\b/i, /\bcool\b/i, /💕/, /❤️/, /🥰/, /😄/, /🎉/, /喜欢/, /想你/, /开心/],
  fight:  [/\bhate\b/i, /\bangry\b/i, /\bmad\b/i, /\bfight/i, /\bannoyed\b/i, /\bfrustrated\b/i, /😡/, /😤/, /💢/, /讨厌/, /生气/, /吵/, /烦/],
  calm:   [/\bcalm\b/i, /\bpeace\b/i, /\bthank/i, /\bok(ay)?\b/i, /\bsure\b/i, /\bhi\b/i, /\bhello\b/i, /🌿/, /🍵/, /嗯/, /好/, /谢谢/],
  sleepy: [/\btired\b/i, /\bsleep/i, /\bexhausted\b/i, /\bbed\b/i, /\bzzz\b/i, /😴/, /💤/, /困/, /累/, /睡/],
  think:  [/\bhmm/i, /\bwhy\b/i, /\bwhat if\b/i, /\bmaybe\b/i, /\bthink/i, /\bwonder/i, /\?$/, /🤔/, /嗯\?/, /怎么/, /为什么/],
}

export function detectMood(text: string): Mood {
  const t = text.toLowerCase()
  // Count matches per mood; pick highest (tiebreaker: order)
  let best: Mood = 'calm'
  let bestCount = 0
  for (const mood of Object.keys(KEYWORDS) as Mood[]) {
    let count = 0
    for (const re of KEYWORDS[mood]) {
      if (re.test(t)) count++
    }
    if (count > bestCount) {
      best = mood
      bestCount = count
    }
  }
  return best
}
