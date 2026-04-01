export type EventType = 'acquisition' | 'exit' | 'merger' | 'fundraise' | 'leadership'

export interface NewsItem {
  id: string
  title: string
  link: string
  pubDate: string
  source: string
  firms: string[]
  eventType: EventType | null
}

export interface FeedResponse {
  items: NewsItem[]
  lastUpdated: string
}
