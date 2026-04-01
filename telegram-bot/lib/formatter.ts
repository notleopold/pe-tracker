import Anthropic from '@anthropic-ai/sdk'
import { EVENT_EMOJIS, EVENT_LABELS, FIRM_NAMES, EVENT_EMOJIS as EMOJIS } from './constants'
import type { NewsItem, EventType } from './types'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${h}h ago`
}

// Optional: generate a 1-2 sentence AI insight using Claude Haiku
export async function generateInsight(title: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{
        role: 'user',
        content: `You are a private equity analyst. Given this news headline, write 1-2 concise sentences highlighting the key facts (deal value, firms involved, strategic rationale). Be factual, no fluff.

Headline: "${title}"

Insight:`,
      }],
    })
    const text = (msg.content[0] as { text: string }).text.trim()
    return text || null
  } catch {
    return null
  }
}

// Format a single article as a Telegram HTML message
export async function formatArticle(item: NewsItem, withAI = true): Promise<string> {
  const firmNames = item.firms.map((id) => FIRM_NAMES[id]).filter(Boolean)

  // Header line
  let header = ''
  if (item.eventType) {
    const emoji = EVENT_EMOJIS[item.eventType]
    const label = EVENT_LABELS[item.eventType]
    header = `${emoji} <b>${label}</b>`
    if (firmNames.length > 0) header += ` · ${firmNames.slice(0, 2).join(' · ')}`
  } else if (firmNames.length > 0) {
    header = `⚫ ${firmNames.slice(0, 2).join(' · ')}`
  } else {
    header = '⚫ Private Equity'
  }

  // Title
  const title = `\n<b>${escapeHtml(item.title)}</b>`

  // Optional AI insight
  let insight = ''
  if (withAI) {
    const ai = await generateInsight(item.title)
    if (ai) insight = `\n\n<i>${escapeHtml(ai)}</i>`
  }

  // Footer
  const footer = `\n\n📰 ${escapeHtml(item.source)} · ${timeAgo(item.pubDate)}\n<a href="${item.link}">Read →</a>`

  return `${header}${title}${insight}${footer}`
}

// Format the daily digest as a single Telegram HTML message
export function formatDigest(items: NewsItem[]): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const eventTypes: EventType[] = ['acquisition', 'exit', 'merger', 'fundraise', 'leadership']
  const grouped = eventTypes.map((type) => ({
    type,
    items: items.filter((i) => i.eventType === type),
  }))

  let msg = `📊 <b>PE Daily Digest — ${dateStr}</b>\n`
  msg += `<i>${items.length} articles tracked in the last 24h</i>\n`

  // Stats line
  msg += '\n'
  for (const { type, items: typeItems } of grouped) {
    if (typeItems.length > 0) {
      msg += `${EMOJIS[type]} ${EVENT_LABELS[type]}: <b>${typeItems.length}</b>\n`
    }
  }

  // Top stories per category
  for (const { type, items: typeItems } of grouped) {
    if (typeItems.length === 0) continue
    msg += `\n${EMOJIS[type]} <b>${EVENT_LABELS[type]}</b>\n`
    for (const item of typeItems.slice(0, 3)) {
      const firmNames = item.firms.map((id) => FIRM_NAMES[id]).filter(Boolean)
      const firm = firmNames.length > 0 ? ` <i>(${firmNames[0]})</i>` : ''
      msg += `• <a href="${item.link}">${escapeHtml(item.title)}</a>${firm}\n`
    }
  }

  const appUrl = process.env.VERCEL_BOT_URL
    ? process.env.VERCEL_BOT_URL.replace('pe-tracker-bot', 'pe-tracker-omega')
    : 'https://pe-tracker-omega.vercel.app'

  msg += `\n<a href="${appUrl}">View all →</a>`

  return msg
}
