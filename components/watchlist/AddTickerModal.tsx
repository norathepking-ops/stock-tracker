"use client";

import { useState, useEffect, useRef } from "react";
import TickerLogo from "@/components/ui/TickerLogo";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  quoteType: string;
}

interface AddTickerModalProps {
  onAdd: (symbol: string) => void;
  onClose: () => void;
  existing: string[];
}

export default function AddTickerModal({ onAdd, onClose, existing }: AddTickerModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#10141f" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-12 pb-3"
        style={{ borderBottom: "1px solid #1e2a42" }}
      >
        <div
          className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2"
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
            placeholder="Search symbol or company"
            className="flex-1 bg-transparent outline-none text-white text-[15px] placeholder-wb-muted"
          />
          {loading && <LoadingSpinner size={16} />}
        </div>
        <button
          onClick={onClose}
          className="text-wb-blue text-[15px] font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {results.map((r) => {
          const isAdded = existing.includes(r.symbol);
          return (
            <button
              key={r.symbol}
              onClick={() => {
                if (!isAdded) {
                  onAdd(r.symbol);
                  onClose();
                }
              }}
              disabled={isAdded}
              className="w-full flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity"
              style={{ borderBottom: "1px solid #1e2a42" }}
            >
              <TickerLogo symbol={r.symbol} size={40} />
              <div className="flex flex-col text-left flex-1 min-w-0">
                <span className="font-bold text-[15px] text-white">{r.symbol}</span>
                <span className="text-[12px] text-wb-muted truncate">
                  {r.shortname || r.longname}
                </span>
              </div>
              {isAdded ? (
                <span className="text-wb-muted text-[13px]">Added</span>
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "#1db7ff" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="7" y1="2" x2="7" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="7" x2="12" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}

        {!loading && query.length > 0 && results.length === 0 && (
          <div className="flex items-center justify-center py-16 text-wb-muted">
            No results for &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
