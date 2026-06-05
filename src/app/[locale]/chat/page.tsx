/**
 * /chat — Soulmate AI chat (Fusion v2)
 *
 * Server entry — renders the interactive <ChatClient />.
 * Mood-responsive background + pet presence + capsule quick replies
 * + 1.2s mock AI responses (mock behavior preserved from v1).
 */

import ChatClient from './ChatClient'

export default function SoulmateChatPage() {
  return <ChatClient />
}
