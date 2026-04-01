import type { EventType } from './types'

export const EVENT_EMOJIS: Record<EventType, string> = {
  acquisition: '🔵',
  exit: '🟢',
  merger: '🟣',
  fundraise: '🟡',
  leadership: '🔴',
}

export const EVENT_LABELS: Record<EventType, string> = {
  acquisition: 'ACQUISITION',
  exit: 'EXIT / IPO',
  merger: 'MERGER',
  fundraise: 'FUNDRAISING',
  leadership: 'LEADERSHIP',
}

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

export const FIRM_NAMES: Record<string, string> = {
  kkr: 'KKR',
  blackstone: 'Blackstone',
  carlyle: 'Carlyle',
  apollo: 'Apollo',
  'bain-capital': 'Bain Capital',
  tpg: 'TPG',
  'warburg-pincus': 'Warburg Pincus',
  cvc: 'CVC Capital',
  eqt: 'EQT',
  advent: 'Advent International',
  'bc-partners': 'BC Partners',
  cinven: 'Cinven',
  permira: 'Permira',
  bridgepoint: 'Bridgepoint',
  apax: 'Apax',
  'silver-lake': 'Silver Lake',
  'thoma-bravo': 'Thoma Bravo',
  'vista-equity': 'Vista Equity',
  'general-atlantic': 'General Atlantic',
  ardian: 'Ardian',
  'pai-partners': 'PAI Partners',
  'hg-capital': 'HG Capital',
}

export const EVENT_KEYWORDS: Record<EventType, string[]> = {
  acquisition: [
    'acqui', 'buyout', 'lbo', 'leveraged buyout', 'buys ', 'purchased',
    'takeover', 'takes over', 'take-private', 'take private', 'invests in',
    'investment in', 'stakes in',
  ],
  exit: [
    'exit', 'ipo', 'listing', 'divests', 'divestiture', 'secondary sale',
    'sells stake', 'portfolio sale', 'goes public', 'flotation',
  ],
  merger: ['merger', 'merges', 'merging', 'combines with', 'joint venture', 'consolidat'],
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

export const RSS_QUERIES = [
  '"private equity" (KKR OR Blackstone OR Carlyle OR Apollo OR "Bain Capital" OR TPG)',
  '"private equity" (CVC OR EQT OR Permira OR Cinven OR "BC Partners" OR Ardian OR Bridgepoint OR Apax)',
  '"private equity" ("Warburg Pincus" OR "Silver Lake" OR "Thoma Bravo" OR "Vista Equity" OR "General Atlantic" OR "PAI Partners")',
  '"private equity" (acquisition OR LBO OR buyout OR merger OR exit OR fundraising OR "take-private")',
  'private equity Europe "Middle East" Africa deal 2026',
]
