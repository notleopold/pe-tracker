'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NewsItem, EventType, FeedResponse } from '@/lib/types'
import { PE_FIRMS, EVENT_TYPES, EVENT_COLORS } from '@/lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EventBadge({ type }: { type: EventType }) {
  const c = EVENT_COLORS[type]
  const label = EVENT_TYPES.find((e) => e.id === type)?.label ?? type
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {label}
    </span>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  const firmNames = item.firms
    .map((id) => PE_FIRMS.find((f) => f.id === id)?.name)
    .filter(Boolean) as string[]

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#161616] border border-[#252525] rounded-xl p-4 active:bg-[#1e1e1e] transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs text-gray-500 truncate">{item.source}</span>
        <span className="text-xs text-gray-600 shrink-0">{timeAgo(item.pubDate)}</span>
      </div>

      <p className="text-sm font-medium text-white leading-snug line-clamp-3 mb-3">
        {item.title}
      </p>

      {(item.eventType || firmNames.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {item.eventType && <EventBadge type={item.eventType} />}
          {firmNames.slice(0, 3).map((name) => (
            <span
              key={name}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#1e1e1e] text-gray-400 border border-[#2e2e2e]"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-[#161616] border border-[#252525] rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 bg-[#252525] rounded w-24" />
        <div className="h-3 bg-[#252525] rounded w-12" />
      </div>
      <div className="h-4 bg-[#252525] rounded w-full mb-2" />
      <div className="h-4 bg-[#252525] rounded w-4/5 mb-2" />
      <div className="h-4 bg-[#252525] rounded w-3/5 mb-4" />
      <div className="h-5 bg-[#252525] rounded w-20" />
    </div>
  )
}

function DigestView({ items }: { items: NewsItem[] }) {
  const last24h = items.filter(
    (item) => Date.now() - new Date(item.pubDate).getTime() < 86_400_000
  )

  const grouped = EVENT_TYPES.map((et) => ({
    ...et,
    items: last24h.filter((i) => i.eventType === et.id),
  })).filter((g) => g.items.length > 0)

  const uncategorized = last24h.filter((i) => !i.eventType)

  if (last24h.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm">No articles in the last 24 hours</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="bg-[#161616] border border-[#252525] rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Last 24h — {last24h.length} articles
        </p>
        <div className="grid grid-cols-3 gap-2">
          {EVENT_TYPES.map((et) => {
            const count = last24h.filter((i) => i.eventType === et.id).length
            const c = EVENT_COLORS[et.id]
            return (
              <div key={et.id} className={`rounded-lg p-3 border ${c.bg} ${c.border}`}>
                <div className={`text-xl font-bold ${c.text}`}>{count}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{et.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stories grouped by event type */}
      {grouped.map((group) => (
        <div key={group.id}>
          <div className="flex items-center gap-2 mb-3">
            <EventBadge type={group.id as EventType} />
            <span className="text-xs text-gray-600">{group.items.length} stories</span>
          </div>
          <div className="space-y-2">
            {group.items.slice(0, 5).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Other
            </span>
            <span className="text-xs text-gray-600">{uncategorized.length}</span>
          </div>
          <div className="space-y-2">
            {uncategorized.slice(0, 5).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [view, setView] = useState<'feed' | 'digest'>('feed')
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/news')
      const data: FeedResponse = await res.json()
      setItems(data.items)
      setLastUpdated(data.lastUpdated)
    } catch {
      // Keep existing items if fetch fails
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 15 * 60_000)
    return () => clearInterval(interval)
  }, [fetchNews])

  const filteredItems = items.filter((item) => {
    if (selectedFirm && !item.firms.includes(selectedFirm)) return false
    if (selectedEvent && item.eventType !== selectedEvent) return false
    return true
  })

  const hasActiveFilter = selectedFirm !== null || selectedEvent !== null

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#1e1e1e]">
        <div className="max-w-2xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h1 className="text-base font-bold tracking-tight">PE Tracker</h1>
              {lastUpdated && (
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Updated {timeAgo(lastUpdated)}
                </p>
              )}
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
              aria-label="Refresh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? 'animate-spin' : ''}
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </div>

          {/* View toggle */}
          <div className="pb-3">
            <div className="flex gap-1 bg-[#161616] rounded-lg p-1 w-fit border border-[#222]">
              {(['feed', 'digest'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    view === v
                      ? 'bg-white text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {v === 'feed' ? 'Feed' : 'Digest'}
                </button>
              ))}
            </div>
          </div>

          {/* Filters (Feed only) */}
          {view === 'feed' && (
            <div className="border-t border-[#1e1e1e]">
              {/* Event type chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    !selectedEvent
                      ? 'bg-white text-black border-white'
                      : 'text-gray-500 border-[#2a2a2a] hover:border-[#444]'
                  }`}
                >
                  All events
                </button>
                {EVENT_TYPES.map((et) => {
                  const isSelected = selectedEvent === et.id
                  const c = EVENT_COLORS[et.id]
                  return (
                    <button
                      key={et.id}
                      onClick={() => setSelectedEvent(isSelected ? null : et.id)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? `${c.bg} ${c.text} ${c.border}`
                          : 'text-gray-500 border-[#2a2a2a] hover:border-[#444]'
                      }`}
                    >
                      {et.label}
                    </button>
                  )
                })}
              </div>

              {/* Firm chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedFirm(null)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    !selectedFirm
                      ? 'bg-white text-black border-white'
                      : 'text-gray-500 border-[#2a2a2a] hover:border-[#444]'
                  }`}
                >
                  All firms
                </button>
                {PE_FIRMS.map((firm) => (
                  <button
                    key={firm.id}
                    onClick={() => setSelectedFirm(selectedFirm === firm.id ? null : firm.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedFirm === firm.id
                        ? 'bg-white text-black border-white'
                        : 'text-gray-500 border-[#2a2a2a] hover:border-[#444]'
                    }`}
                  >
                    {firm.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-10">
        {loading && items.length === 0 ? (
          // Loading skeletons
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : view === 'digest' ? (
          <DigestView items={items} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">No results for current filters</p>
            {hasActiveFilter && (
              <button
                onClick={() => {
                  setSelectedFirm(null)
                  setSelectedEvent(null)
                }}
                className="mt-3 text-xs text-gray-600 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
