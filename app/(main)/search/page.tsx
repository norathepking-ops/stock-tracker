"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TickerLogo from "@/components/ui/TickerLogo";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Result {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  quoteType: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await res.json());
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  }, [query]);

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-4 pt-14 pb-3 sticky top-0 z-10"
        style={{ background: "#10141f", borderBottom: "1px solid #1e2a42" }}
      >
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
          {loading && <LoadingSpinner size={16} />}
          {query.length > 0 && !loading && (
            <button onClick={() => setQuery("")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#1e2a42" />
                <line x1="5" y1="5" x2="11" y2="11" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="11" y1="5" x2="5" y2="11" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

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
        {!loading && query.length > 0 && results.length === 0 && (
          <div className="py-16 text-center text-wb-muted">
            No results for &quot;{query}&quot;
          </div>
        )}
        {query.length === 0 && (
          <div className="px-4 py-6">
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
        )}
      </div>
    </div>
  );
}
