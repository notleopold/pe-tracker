import { NextResponse } from 'next/server'
import { FIRM_ALIASES, EVENT_KEYWORDS, RSS_QUERIES } from '@/lib/constants'
import type { NewsItem, EventType } from '@/lib/types'

// Cache for 5 minutes on Vercel edge
export const revalidate = 300

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function parseRSSItems(xml: string): Array<{ title: string; link: string; pubDate: string; source: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; source: string }> = []

  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

  for (const block of itemBlocks) {
    const content = block[1]

    // Title: may be CDATA or plain
    const rawTitle =
      content.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ||
      content.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
      ''

    const link =
      content.match(/<link>([\s\S]*?)<\/link>/)?.[1] ||
      content.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ||
      ''

    const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || ''

    // Source may be in <source> tag or embedded at the end of the title as " - Source"
    let source =
      content.match(/<source[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/source>/)?.[1] ||
      content.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ||
      ''

    // Strip source from title if embedded (Google News format: "Title - Source")
    let title = decodeHtmlEntities(rawTitle.trim())
    if (!source) {
      const lastDash = title.lastIndexOf(' - ')
      if (lastDash !== -1) {
        source = title.slice(lastDash + 3).trim()
        title = title.slice(0, lastDash).trim()
      }
    } else {
      // Also clean source suffix from title if present
      const suffix = ` - ${source}`
      if (title.endsWith(suffix)) {
        title = title.slice(0, -suffix.length).trim()
      }
    }

    if (title && link) {
      items.push({ title, link, pubDate, source })
    }
  }

  return items
}

function detectFirms(text: string): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const [firmId, aliases] of Object.entries(FIRM_ALIASES)) {
    for (const alias of aliases) {
      if (lower.includes(alias.toLowerCase())) {
        found.add(firmId)
        break
      }
    }
  }
  return Array.from(found)
}

function detectEventType(text: string): EventType | null {
  const lower = text.toLowerCase()
  for (const [type, keywords] of Object.entries(EVENT_KEYWORDS) as [EventType, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return type
      }
    }
  }
  return null
}

export async function GET() {
  try {
    const seen = new Map<string, NewsItem>()

    await Promise.allSettled(
      RSS_QUERIES.map(async (query) => {
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; PETracker/1.0; +https://github.com)',
            },
            signal: AbortSignal.timeout(8000),
          })
          if (!res.ok) return
          const xml = await res.text()
          const parsed = parseRSSItems(xml)

          for (const item of parsed) {
            // Deduplicate by title (first 60 chars)
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
        } catch {
          // Skip failed individual queries silently
        }
      })
    )

    const items = Array.from(seen.values())
      .filter((item) => item.pubDate)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 120)

    return NextResponse.json(
      { items, lastUpdated: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
    )
  } catch {
    return NextResponse.json({ items: [], lastUpdated: new Date().toISOString() })
  }
}
