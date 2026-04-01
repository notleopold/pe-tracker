import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchNews } from '../lib/fetcher'
import { formatArticle } from '../lib/formatter'
import { sendMessages } from '../lib/telegram'

// Only send articles published in the last 65 minutes
const WINDOW_MS = 65 * 60_000
// Max articles per cron run (avoid flooding the channel)
const MAX_PER_RUN = 8

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Protect endpoint with a secret
  const auth = req.headers['authorization'] ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const allItems = await fetchNews()

    // Filter to recent articles only
    const recent = allItems
      .filter((item) => Date.now() - new Date(item.pubDate).getTime() < WINDOW_MS)
      .slice(0, MAX_PER_RUN)

    if (recent.length === 0) {
      return res.json({ sent: 0, message: 'No new articles in the last 65 minutes' })
    }

    // Format each article (with AI summaries if ANTHROPIC_API_KEY is set)
    const useAI = !!process.env.ANTHROPIC_API_KEY
    const messages = await Promise.all(recent.map((item) => formatArticle(item, useAI)))

    const sent = await sendMessages(messages)

    return res.json({
      sent,
      total: recent.length,
      ai: useAI,
      window: '65 minutes',
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
