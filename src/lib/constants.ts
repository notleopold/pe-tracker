import type { EventType } from './types'

export const PE_FIRMS = [
  { id: 'kkr', name: 'KKR' },
  { id: 'blackstone', name: 'Blackstone' },
  { id: 'carlyle', name: 'Carlyle' },
  { id: 'apollo', name: 'Apollo' },
  { id: 'bain-capital', name: 'Bain Capital' },
  { id: 'tpg', name: 'TPG' },
  { id: 'warburg-pincus', name: 'Warburg Pincus' },
  { id: 'cvc', name: 'CVC Capital' },
  { id: 'eqt', name: 'EQT' },
  { id: 'advent', name: 'Advent International' },
  { id: 'bc-partners', name: 'BC Partners' },
  { id: 'cinven', name: 'Cinven' },
  { id: 'permira', name: 'Permira' },
  { id: 'bridgepoint', name: 'Bridgepoint' },
  { id: 'apax', name: 'Apax' },
  { id: 'silver-lake', name: 'Silver Lake' },
  { id: 'thoma-bravo', name: 'Thoma Bravo' },
  { id: 'vista-equity', name: 'Vista Equity' },
  { id: 'general-atlantic', name: 'General Atlantic' },
  { id: 'ardian', name: 'Ardian' },
  { id: 'pai-partners', name: 'PAI Partners' },
  { id: 'hg-capital', name: 'HG Capital' },
] as const

export const EVENT_TYPES: { id: EventType; label: string }[] = [
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'exit', label: 'Exit / IPO' },
  { id: 'merger', label: 'Merger' },
  { id: 'fundraise', label: 'Fundraising' },
  { id: 'leadership', label: 'Leadership' },
]

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  acquisition: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  exit: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  merger: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  fundraise: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  leadership: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
}

// Aliases used for text matching (firm detection in articles)
export const FIRM_ALIASES: Record<string, string[]> = {
  kkr: ['KKR'],
  blackstone: ['Blackstone'],
  carlyle: ['Carlyle', 'The Carlyle Group'],
  apollo: ['Apollo Global', 'Apollo Management', 'Apollo'],
  'bain-capital': ['Bain Capital'],
  tpg: ['TPG Capital', 'TPG'],
  'warburg-pincus': ['Warburg Pincus'],
  cvc: ['CVC Capital', 'CVC Partners', 'CVC'],
  eqt: ['EQT Partners', 'EQT'],
  advent: ['Advent International'],
  'bc-partners': ['BC Partners'],
  cinven: ['Cinven'],
  permira: ['Permira'],
  bridgepoint: ['Bridgepoint'],
  apax: ['Apax Partners', 'Apax'],
  'silver-lake': ['Silver Lake'],
  'thoma-bravo': ['Thoma Bravo'],
  'vista-equity': ['Vista Equity Partners', 'Vista Equity'],
  'general-atlantic': ['General Atlantic'],
  ardian: ['Ardian'],
  'pai-partners': ['PAI Partners'],
  'hg-capital': ['HG Capital', 'HgCapital'],
}

export const EVENT_KEYWORDS: Record<EventType, string[]> = {
  acquisition: [
    'acqui', 'buyout', 'lbo', 'leveraged buyout', 'buys ', 'purchased',
    'takeover', 'takes over', 'take-private', 'take private', 'invests in',
    'investment in', 'deal', 'stakes in',
  ],
  exit: [
    'exit', 'ipo', 'listing', 'divests', 'divestiture', 'secondary sale',
    'sells stake', 'portfolio sale', 'goes public', 'flotation',
  ],
  merger: [
    'merger', 'merges', 'merging', 'combines with', 'joint venture',
    'consolidat', 'tie-up',
  ],
  fundraise: [
    'raises ', 'new fund', 'closes fund', 'capital raise', 'fundraising',
    'fund target', 'fund launch', 'billion fund', 'million fund', 'fund close',
    'fund ii', 'fund iii', 'fund iv', 'fund v',
  ],
  leadership: [
    'appoints', 'names as', 'hires', 'joins as', 'steps down',
    'resigned', 'departure', 'new ceo', 'new cfo', 'new partner',
    'managing director', 'promotes', 'new head',
  ],
}

// Google News RSS search queries — cover all major firms and event types
export const RSS_QUERIES = [
  '"private equity" (KKR OR Blackstone OR Carlyle OR Apollo OR "Bain Capital" OR TPG)',
  '"private equity" (CVC OR EQT OR Permira OR Cinven OR "BC Partners" OR Ardian OR Bridgepoint OR Apax)',
  '"private equity" ("Warburg Pincus" OR "Silver Lake" OR "Thoma Bravo" OR "Vista Equity" OR "General Atlantic" OR "PAI Partners" OR "HG Capital")',
  '"private equity" (acquisition OR LBO OR buyout OR merger OR exit OR fundraising OR "take-private")',
  'private equity Europe Middle East Africa deal 2025 OR 2026',
]
