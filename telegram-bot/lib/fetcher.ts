import { FIRM_ALIASES, EVENT_KEYWORDS, RSS_QUERIES } from './constants'
import type { NewsItem, EventType } from './types'

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function parseRSSItems(xml: string) {
  const items: { title: string; link: string; pubDate: string; source: string }[] = []
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

  for (const block of blocks) {
    const c = block[1]

    const rawTitle =
      c.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
      c.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''

    const link =
      c.match(/<link>([\s\S]*?)<\/link>/)?.[1] ||
      c.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] || ''

    const pubDate = c.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || ''

    let source =
      c.match(/<source[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/source>/)?.[1] ||
      c.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || ''

    let title = decodeHtml(rawTitle.trim())

    if (!source) {
      const lastDash = title.lastIndexOf(' - ')
      if (lastDash !== -1) {
        source = title.slice(lastDash + 3).trim()
        title = title.slice(0, lastDash).trim()
      }
    } else {
      const suffix = ` - ${source}`
      if (title.endsWith(suffix)) title = title.slice(0, -suffix.length).trim()
    }

    if (title && link) items.push({ title, link, pubDate, source })
  }
  return items
}

function detectFirms(text: string): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const [firmId, aliases] of Object.entries(FIRM_ALIASES)) {
    for (const alias of aliases) {
      if (lower.includes(alias.toLowerCase())) { found.add(firmId); break }
    }
  }
  return Array.from(found)
}

function detectEventType(text: string): EventType | null {
  const lower = text.toLowerCase()
  for (const [type, keywords] of Object.entries(EVENT_KEYWORDS) as [EventType, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) return type
    }
  }
  return null
}

export async function fetchNews(): Promise<NewsItem[]> {
  const seen = new Map<string, NewsItem>()

  await Promise.allSettled(
    RSS_QUERIES.map(async (query) => {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PETrackerBot/1.0)' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) return
        const xml = await res.text()
        for (const item of parseRSSItems(xml)) {
          const key = item.title.slice(0, 60).toLowerCase()
          if (seen.has(key)) continue
          const text = `${item.title} ${item.source}`
          seen.set(key, {
            id: key,
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source: item.source,
            firms: detectFirms(text),
            eventType: detectEventType(text),
          })
        }
      } catch { /* skip */ }
    })
  )

  return Array.from(seen.values())
    .filter((i) => i.pubDate)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}
