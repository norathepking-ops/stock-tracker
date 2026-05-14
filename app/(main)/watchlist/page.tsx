"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import WatchlistItem from "@/components/watchlist/WatchlistItem";
import AddTickerModal from "@/components/watchlist/AddTickerModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import type { QuoteData } from "@/lib/yahoo/fetcher";

const DEFAULT_WATCHLIST = ["^DJI", "^IXIC", "^GSPC", "AAPL", "NVDA", "META", "TSLA"];
const STORAGE_KEY = "wb_watchlist";
const REFRESH_INTERVAL = 10000;

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return DEFAULT_WATCHLIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_WATCHLIST;
}

function saveWatchlist(symbols: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
}

export default function WatchlistPage() {
  useScrollRestore("watchlist");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drag-and-drop state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    setSymbols(loadWatchlist());
  }, []);

  const fetchQuotes = useCallback(async (syms: string[]) => {
    if (syms.length === 0) { setLoading(false); return; }
    try {
      const results = await Promise.all(
        syms.map((s) =>
          fetch(`/api/quote/${encodeURIComponent(s)}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      );
      setQuotes((prev) => {
        const next = { ...prev };
        results.forEach((q, i) => { if (q) next[syms[i]] = q; });
        return next;
      });
      setLastUpdated(new Date());
    } catch {}
    finally { setLoading(false); }
  }, []);

  const fetchSparkline = useCallback(async (sym: string) => {
    try {
      const res = await fetch(`/api/chart/${encodeURIComponent(sym)}?range=1d`);
      const data = await res.json();
      const closes: number[] = data.map((c: { close: number }) => c.close).filter(Boolean);
      if (closes.length > 1) {
        setSparklines((prev) => ({ ...prev, [sym]: closes }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (symbols.length === 0) return;
    fetchQuotes(symbols);
    symbols.forEach((s) => { if (!sparklines[s]) fetchSparkline(s); });

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchQuotes(symbols), REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols]);

  function addSymbol(sym: string) {
    if (symbols.includes(sym)) return;
    const next = [...symbols, sym];
    setSymbols(next);
    saveWatchlist(next);
    fetchSparkline(sym);
  }

  function removeSymbol(sym: string) {
    const next = symbols.filter((s) => s !== sym);
    setSymbols(next);
    saveWatchlist(next);
  }

  // Drag handlers
  function handleDragStart(i: number) {
    dragIndex.current = i;
  }

  function handleDragEnter(i: number) {
    setDragOver(i);
  }

  function handleDragEnd() {
    if (dragIndex.current === null || dragOver === null || dragIndex.current === dragOver) {
      dragIndex.current = null;
      setDragOver(null);
      return;
    }
    const next = [...symbols];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dragOver, 0, moved);
    setSymbols(next);
    saveWatchlist(next);
    dragIndex.current = null;
    setDragOver(null);
  }

  return (
    <>
      {showAdd && (
        <AddTickerModal
          onAdd={addSymbol}
          onClose={() => setShowAdd(false)}
          existing={symbols}
        />
      )}

      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-14 pb-3 sticky top-0 z-10"
          style={{ background: "#0a0e17", borderBottom: "1px solid #1e2a42" }}
        >
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="16" height="2" rx="1" fill="#8a9bc3" />
              <rect x="2" y="8" width="10" height="2" rx="1" fill="#8a9bc3" />
              <rect x="2" y="13" width="12" height="2" rx="1" fill="#8a9bc3" />
            </svg>
            <div className="flex flex-col">
              <h1 className="text-[18px] font-bold text-white leading-tight">My Watchlist</h1>
              {lastUpdated && (
                <p className="text-[10px] text-wb-muted leading-tight">
                  อัปเดต {lastUpdated.toTimeString().slice(0, 8)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setShowAdd(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="1.5" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={() => setEditMode((v) => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  stroke={editMode ? "#1db7ff" : "#fff"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke={editMode ? "#1db7ff" : "#fff"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Column header */}
        <div
          className="flex items-center px-4 py-2 text-[11px] text-wb-muted"
          style={{ borderBottom: "1px solid #1e2a42" }}
        >
          <span className="flex-1">Symbol</span>
          <span className="mr-16">Chart</span>
          <span>%Change</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center flex-1 py-16">
            <LoadingSpinner size={36} />
          </div>
        ) : (
          <div>
            {symbols.map((sym, i) => {
              const q = quotes[sym];
              if (!q) return null;
              const isDragOver = dragOver === i;
              return (
                <div
                  key={sym}
                  draggable={editMode}
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleDragEnd}
                  style={{
                    borderBottom: "1px solid #1e2a42",
                    borderTop: isDragOver ? "2px solid #1db7ff" : undefined,
                    transition: "border-color 0.1s",
                  }}
                >
                  <WatchlistItem
                    quote={q}
                    sparkData={sparklines[sym]}
                    onRemove={removeSymbol}
                    editMode={editMode}
                    isDragging={dragIndex.current === i}
                  />
                </div>
              );
            })}
          </div>
        )}

        {!loading && symbols.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16">
            <p className="text-wb-muted text-[14px]">No stocks in watchlist</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-full text-[14px] font-semibold text-white"
              style={{ background: "#1db7ff" }}
            >
              Add Stock
            </button>
          </div>
        )}
      </div>
    </>
  );
}
