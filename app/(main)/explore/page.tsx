"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TickerLogo from "@/components/ui/TickerLogo";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import type { QuoteData } from "@/lib/yahoo/fetcher";

interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  quoteType: string;
}

const INDEX_META: Record<string, { label: string; sub: string }> = {
  "^DJI":       { label: "DJI",        sub: "Dow Jones" },
  "^IXIC":      { label: "NASDAQ",     sub: "US Tech" },
  "^GSPC":      { label: "S&P 500",    sub: "US Market" },
  "^N225":      { label: "Nikkei",     sub: "Japan" },
  "^KS11":      { label: "KOSPI",      sub: "Korea" },
  "^HSI":       { label: "Hang Seng",  sub: "Hong Kong" },
  "000001.SS":  { label: "SSE",        sub: "China" },
  "^NSEI":      { label: "NIFTY 50",   sub: "India" },
  "^AXJO":      { label: "ASX 200",    sub: "Australia" },
  "^TWII":      { label: "TAIEX",      sub: "Taiwan" },
  "^FTSE":      { label: "FTSE 100",   sub: "UK" },
  "^GDAXI":     { label: "DAX",        sub: "Germany" },
  "^FCHI":      { label: "CAC 40",     sub: "France" },
  "^FTSEMIB":   { label: "FTSE MIB",   sub: "Italy" },
  "^GSPTSE":    { label: "TSX",        sub: "Canada" },
  "^BVSP":      { label: "Bovespa",    sub: "Brazil" },
  "GC=F":       { label: "Gold",       sub: "USD / oz" },
  "CL=F":       { label: "WTI Oil",    sub: "USD / bbl" },
  "BTC-USD":    { label: "Bitcoin",    sub: "Crypto" },
};

const SECTIONS = [
  { title: "US Indices",              symbols: ["^DJI", "^IXIC", "^GSPC"],                                   cols: 3 },
  { title: "Asia Pacific",            symbols: ["^N225", "^KS11", "^HSI", "000001.SS", "^NSEI", "^AXJO", "^TWII"], cols: 3 },
  { title: "Europe",                  symbols: ["^FTSE", "^GDAXI", "^FCHI", "^FTSEMIB"],                    cols: 2 },
  { title: "Americas",                symbols: ["^GSPTSE", "^BVSP"],                                         cols: 2 },
  { title: "Commodities & Crypto",    symbols: ["GC=F", "CL=F", "BTC-USD"],                                  cols: 3 },
];

function fmtIndexPrice(v: number): string {
  if (v >= 10000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function IndexCard({ q }: { q: QuoteData }) {
  const isUp = q.regularMarketChangePercent >= 0;
  const color = isUp ? "#00c076" : "#ff333a";
  const meta = INDEX_META[q.symbol];
  const label = meta?.label ?? q.shortName ?? q.symbol;
  const sub   = meta?.sub ?? "";

  return (
    <Link
      href={`/stock/${encodeURIComponent(q.symbol)}`}
      className="rounded-xl p-3 active:opacity-70 transition-opacity"
      style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
    >
      <div className="text-[12px] font-bold text-white truncate">{label}</div>
      {sub && <div className="text-[10px] text-wb-muted truncate">{sub}</div>}
      <div className="text-[13px] font-bold text-white mt-1 truncate">
        {fmtIndexPrice(q.regularMarketPrice)}
      </div>
      <div className="text-[11px] font-bold mt-0.5" style={{ color }}>
        {isUp ? "+" : ""}{q.regularMarketChangePercent.toFixed(2)}%
      </div>
    </Link>
  );
}

function IndexSection({
  title,
  symbols,
  cols,
  bySymbol,
}: {
  title: string;
  symbols: string[];
  cols: number;
  bySymbol: Record<string, QuoteData>;
}) {
  const rows = symbols.map((s) => bySymbol[s]).filter(Boolean) as QuoteData[];
  if (rows.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <p className="text-[11px] font-bold text-wb-muted uppercase tracking-wider mb-2">
        {title}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 8,
        }}
      >
        {rows.map((q) => (
          <IndexCard key={q.symbol} q={q} />
        ))}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  useScrollRestore("explore");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [indices, setIndices] = useState<QuoteData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/indices")
        .then((r) => r.json())
        .then((data) => { setIndices(data); setLastUpdated(new Date()); })
        .catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await res.json());
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [query]);

  const bySymbol: Record<string, QuoteData> = {};
  for (const q of indices) bySymbol[q.symbol] = q;

  const isSearching = query.trim().length > 0;

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-4 pt-14 pb-3 sticky top-0 z-10"
        style={{ background: "#10141f", borderBottom: "1px solid #1e2a42" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[18px] font-bold text-white">Explore</h1>
          {lastUpdated && (
            <span className="text-[10px] text-wb-muted">
              อัปเดต {lastUpdated.toTimeString().slice(0, 8)}
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "#1a2236" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#8a9bc3" strokeWidth="1.5" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#8a9bc3" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks, ETFs, indices..."
            className="flex-1 bg-transparent outline-none text-white text-[15px] placeholder-wb-muted"
          />
          {searching && <LoadingSpinner size={16} />}
          {query.length > 0 && !searching && (
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => setQuery("")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#1e2a42" />
                <line x1="5" y1="5" x2="11" y2="11" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="11" y1="5" x2="5" y2="11" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isSearching ? (
        <div className="divide-y" style={{ borderColor: "#1e2a42" }}>
          {results.map((r) => (
            <Link
              key={r.symbol}
              href={`/stock/${r.symbol}`}
              className="flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity"
            >
              <TickerLogo symbol={r.symbol} size={40} />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-[15px] text-white">{r.symbol}</span>
                <span className="text-[12px] text-wb-muted truncate">
                  {r.shortname || r.longname}
                </span>
              </div>
              <span
                className="text-[11px] px-2 py-0.5 rounded"
                style={{ background: "#1a2236", color: "#8a9bc3" }}
              >
                {r.quoteType}
              </span>
            </Link>
          ))}
          {!searching && results.length === 0 && (
            <div className="py-16 text-center text-wb-muted">
              No results for &quot;{query}&quot;
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="px-4 pt-4 pb-2">
            <p className="text-[12px] text-wb-muted mb-3 font-semibold uppercase tracking-wide">
              Popular
            </p>
            <div className="flex flex-wrap gap-2">
              {["AAPL", "NVDA", "TSLA", "META", "MSFT", "AMZN", "GOOGL", "AMD"].map((s) => (
                <Link
                  key={s}
                  href={`/stock/${s}`}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white"
                  style={{ background: "#1a2236", border: "1px solid #1e2a42" }}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1e2a42" }}>
            {SECTIONS.map((s) => (
              <IndexSection
                key={s.title}
                title={s.title}
                symbols={s.symbols}
                cols={s.cols}
                bySymbol={bySymbol}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
