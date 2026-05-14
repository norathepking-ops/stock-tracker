# Stockdash — Project Bible for Claude

> **READ THIS FIRST.** This file is your ground truth for every session. Read it completely before writing any code. Update it at the end of every session.

---

## Project Overview

**Stockdash** is a mobile-first PWA stock tracking app styled exactly like Webull (dark theme). Built with Next.js App Router + TypeScript + Tailwind CSS. Data comes from Yahoo Finance via the `yahoo-finance2` node package. No backend server — everything runs via Next.js API routes.

**Working directory:** `C:\Users\Admin\Desktop\All Apps\Stockdash\webull-clone\`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom colors) + inline styles |
| Data | yahoo-finance2 v3 (Node.js API routes only) |
| Database | Supabase (clients configured, auth NOT yet active) |
| Charts | TradingView Lightweight Charts |
| PWA | Custom manifest + service worker (public/sw.js) |
| Storage | localStorage (watchlist, scroll positions) |

---

## Design System — NEVER CHANGE THESE

```
Background (main):   #0a0e17
Background (page):   #10141f
Card / nav bar:      #151b2d
Input / hover:       #1a2236
Border:              #1e2a42
Text (primary):      #ffffff
Text (muted):        #8a9bc3
Green (gain):        #00c076
Red (loss):          #ff333a
Blue (accent/CTA):   #1db7ff
Font:                Inter (Google Fonts)
Theme color:         #0a0e17
```

**Rules:**
- Always use inline `style={{ background: "..." }}` for exact color values — Tailwind custom colors (`bg-wb-*`) are also set up for the primary ones
- Mobile-first — this is a PWA, viewport is locked at width=device-width, no zoom
- All pages have `pt-14` top padding for the fixed header (safe area + iOS notch)
- Bottom nav is always 80px tall — all main pages use `pb-20` on their scroll container

---

## App Architecture

```
webull-clone/
├── app/
│   ├── layout.tsx               ← Root layout: PWA meta, Inter font, PwaRegistration
│   ├── page.tsx                 ← Redirects to /watchlist
│   ├── globals.css              ← Global styles + Tailwind
│   ├── icon.tsx                 ← Dynamic app icon
│   ├── apple-icon.tsx           ← Apple touch icon
│   ├── (main)/                  ← Route group with shared BottomNav
│   │   ├── layout.tsx           ← Wraps children with BottomNav, pb-20 scroll
│   │   ├── watchlist/page.tsx   ← [TAB 1] My Watchlist — MAIN SCREEN
│   │   ├── markets/page.tsx     ← [TAB 2] Market Movers
│   │   ├── news/page.tsx        ← [TAB 3] Market News feed
│   │   ├── explore/page.tsx     ← [TAB 4] Global indices + search
│   │   ├── search/page.tsx      ← Standalone search (may be legacy)
│   │   └── menu/page.tsx        ← [TAB 5] Menu + PWA install
│   ├── stock/[symbol]/page.tsx  ← Stock detail page (NOT inside (main))
│   └── api/
│       ├── quote/[symbol]/      ← GET single stock quote
│       ├── chart/[symbol]/      ← GET chart data (?range=1d|5d|1mo|3mo|6mo|1y|2y)
│       ├── news/[symbol]/       ← GET news for ticker (use "market" for general)
│       ├── analysis/[symbol]/   ← GET analyst ratings + price targets
│       ├── movers/              ← GET top gainers/losers/active/value
│       ├── indices/             ← GET all global indices (INDEX_SYMBOLS list)
│       ├── search/              ← GET search results (?q=query)
│       └── icon/                ← Dynamic icon route
├── components/
│   ├── layout/
│   │   └── BottomNav.tsx        ← 5-tab nav: Watchlists, Markets, News, Explore, Menu
│   ├── watchlist/
│   │   ├── WatchlistItem.tsx    ← Row: logo + ticker + sparkline + price + %change
│   │   └── AddTickerModal.tsx   ← Search modal to add tickers
│   ├── stock/
│   │   ├── StockHeader.tsx      ← Price, change, AH/PM price display
│   │   ├── ChartTab.tsx         ← TradingView chart with range selector
│   │   ├── NewsTab.tsx          ← News list for specific ticker
│   │   ├── AnalysisTab.tsx      ← Analyst ratings + price target bar
│   │   └── TechnicalTab.tsx     ← Technical indicator summary
│   ├── markets/
│   │   └── MarketMovers.tsx     ← 4 sections: Gainers, Losers, Active, Value
│   ├── ui/
│   │   ├── Sparkline.tsx        ← Mini SVG line chart
│   │   ├── LoadingSpinner.tsx   ← Spinning loader
│   │   └── TickerLogo.tsx       ← Company logo (fallback to colored circle)
│   └── PwaRegistration.tsx      ← Registers public/sw.js service worker
├── hooks/
│   └── useScrollRestore.ts      ← Saves/restores scroll position per page key
├── lib/
│   ├── yahoo/
│   │   └── fetcher.ts           ← All Yahoo Finance fetching functions + types
│   ├── supabase/
│   │   ├── client.ts            ← Browser Supabase client
│   │   └── server.ts            ← Server Supabase client
│   └── utils/
│       ├── marketSession.ts     ← Market hours / session detection
│       └── pwaInstall.ts        ← Captures beforeinstallprompt event
├── scripts/                     ← Build/utility scripts
├── public/
│   ├── manifest.json            ← PWA manifest
│   ├── sw.js                    ← Service worker
│   └── icons/                   ← icon-192.png, icon-512.png
├── next.config.ts               ← Image domains: yimg.com, yahoo.com, zenfs.com
├── tailwind.config.ts           ← Custom wb-* color tokens
└── supabase-schema.sql          ← DB schema (not yet applied)
```

---

## Features Implemented (DO NOT BREAK)

### Watchlist (`/watchlist`)
- localStorage persistence with key `wb_watchlist`
- Default tickers: `^DJI, ^IXIC, ^GSPC, AAPL, NVDA, META, TSLA`
- Auto-refresh every 10 seconds
- Sparkline chart per ticker (1d range)
- Drag-to-reorder (drag handles in edit mode)
- Edit mode toggle (pencil icon in header)
- Add ticker via search modal (magnifying glass icon)
- Remove ticker (in edit mode)
- "Last updated" timestamp in header
- Shows price change % per ticker row

### Stock Detail (`/stock/[symbol]`)
- Real-time price + change header (10s refresh)
- After-hours / pre-market price display
- Watchlist toggle (heart icon)
- 4 tabs: **Chart**, **News**, **Analysis**, **Technical**
- Chart: TradingView Lightweight Charts, range selector (1D/5D/1M/3M/6M/1Y/2Y), candlestick + line mode
- News: Latest news with thumbnail, source, time ago
- Analysis: Analyst recommendation bar (Strong Buy → Sell), price target range (Low/Avg/High)
- Technical: RSI, MA signals summary

### Markets (`/markets`)
- 4 sections: Top Gainers, Top Losers, Most Active (volume), Most Value
- Pulls from 100 major US stocks pool (`MARKET_MOVERS_SYMBOLS`)

### Explore (`/explore`)
- Search bar with 300ms debounce → `/api/search`
- Popular stocks quick-links: AAPL, NVDA, TSLA, META, MSFT, AMZN, GOOGL, AMD
- Global indices grid: US, Asia Pacific, Europe, Americas, Commodities & Crypto
- 15-second auto-refresh for indices
- Index cards link to stock detail page

### News (`/news`)
- General market news via `/api/news/market`
- Article list with thumbnail, source, time-ago

### Menu (`/menu`)
- Navigation links to all main sections
- PWA install: Android (Chrome beforeinstallprompt) + iOS (Safari instructions modal)
- App info card

### PWA
- Web manifest at `/public/manifest.json`
- Service worker at `/public/sw.js`
- Apple touch icon, theme-color meta
- No zoom (viewport locked)
- Safe area insets for iPhone notch

### Scroll Restore
- `useScrollRestore(key)` hook used in all main pages
- Saves scroll position to sessionStorage, restores on back-navigation

---

## Key Data Types (`lib/yahoo/fetcher.ts`)

```typescript
QuoteData       // regularMarketPrice, change, changePercent, postMarketPrice, preMarketPrice, marketState, etc.
ChartCandle     // time(unix), open, high, low, close, volume
NewsItem        // title, link, publisher, publishedAt(ms), thumbnail?, relatedTickers?
AnalysisData    // recommendationKey, targetLowPrice, targetMeanPrice, targetHighPrice, strongBuy, buy, hold, etc.
```

Key constants in `fetcher.ts`:
- `MARKET_MOVERS_SYMBOLS` — 100 major US stocks for market movers
- `INDEX_SYMBOLS` — global indices list

---

## Supabase (Configured, NOT Active)
- Clients exist at `lib/supabase/client.ts` and `lib/supabase/server.ts`
- Schema at `supabase-schema.sql` (not applied yet)
- Watchlist currently uses **localStorage only** — Supabase auth/sync is a future feature
- **Do NOT add Supabase auth until explicitly asked**

---

## Rules for Claude — Read Before Every Task

### Golden Rule: ADD, don't REWRITE
- When adding a feature, **add to existing files** — never replace a whole page
- If a page needs a new section, insert it at the right place
- If a component needs a new prop, add it without removing existing props

### Before touching any file:
1. Read the file first
2. Understand what already exists
3. Plan the minimal diff needed
4. Make surgical edits only

### Colors are sacred
- Never change background colors from the values in the Design System section
- Never add light-mode styles
- Never change the accent blue from `#1db7ff`
- The app is ALWAYS dark theme — no conditional theming

### BottomNav is fixed
- 5 tabs: Watchlists → Markets → News → Explore → Menu
- Never add, remove, or reorder these tabs without explicit instruction
- Tab order and routes must stay as-is

### Data fetching pattern
- All yahoo-finance2 calls happen in `lib/yahoo/fetcher.ts` or API route files
- API routes call fetcher functions — never call yahoo-finance2 directly from components
- Polling intervals: watchlist/stock = 10s, explore indices = 15s

### Don't touch these unless asked
- `public/manifest.json` — PWA config
- `public/sw.js` — Service worker
- `tailwind.config.ts` — Color tokens
- `next.config.ts` — Image domains
- `lib/supabase/` — Auth not active yet

---

## How to Add a New Feature Safely

1. **Identify the file(s)** — check architecture above
2. **Read each file** before editing
3. **Locate the insertion point** — never replace, always insert
4. **Test mentally**: does this break any existing feature? Check the "Features Implemented" list
5. **After completing**, update the relevant section in this CLAUDE.md

---

## Development Workflow

```bash
# Start dev server
cd "C:\Users\Admin\Desktop\All Apps\Stockdash\webull-clone"
npm run dev

# Commit after each meaningful feature
git add <specific-files>
git commit -m "feat: <description>"
```

**Git branch:** `master`
**Remote:** connected (check `git remote -v`)

---

## Session Log — Update After Every Session

| Date | What Changed |
|---|---|
| 2026-05-14 | Initial CLAUDE.md created. All features above confirmed implemented. |

---

*Last updated: 2026-05-14. If this date is old, re-scan the codebase before proceeding.*
