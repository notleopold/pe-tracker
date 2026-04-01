import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchNews } from '../lib/fetcher'
import { formatDigest } from '../lib/formatter'
import { sendMessage } from '../lib/telegram'

const WINDOW_MS = 24 * 60 * 60_000 // 24 hours

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = req.headers['authorization'] ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const allItems = await fetchNews()

    const last24h = allItems.filter(
      (item) => Date.now() - new Date(item.pubDate).getTime() < WINDOW_MS
    )

    if (last24h.length === 0) {
      return res.json({ sent: false, message: 'No articles in the last 24 hours' })
    }

    const message = formatDigest(last24h)
    const ok = await sendMessage(message)

    return res.json({ sent: ok, articles: last24h.length })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
