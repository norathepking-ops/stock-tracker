"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import StockHeader from "@/components/stock/StockHeader";
import ChartTab from "@/components/stock/ChartTab";
import NewsTab from "@/components/stock/NewsTab";
import AnalysisTab from "@/components/stock/AnalysisTab";
import TechnicalTab from "@/components/stock/TechnicalTab";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import TickerLogo from "@/components/ui/TickerLogo";
import type { QuoteData } from "@/lib/yahoo/fetcher";

const TABS = ["Chart", "News", "Analysis", "Technical"] as const;
type Tab = (typeof TABS)[number];

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Chart");
  const [watchlisted, setWatchlisted] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const decodedSymbol = decodeURIComponent(symbol).toUpperCase();

  useEffect(() => {
    const stored = localStorage.getItem("wb_watchlist");
    if (stored) {
      try {
        const list: string[] = JSON.parse(stored);
        setWatchlisted(list.includes(decodedSymbol));
      } catch {}
    }
  }, [decodedSymbol]);

  useEffect(() => {
    async function fetchQ() {
      try {
        const res = await fetch(`/api/quote/${encodeURIComponent(decodedSymbol)}`);
        if (res.ok) setQuote(await res.json());
      } catch {}
      finally { setLoading(false); }
    }
    fetchQ();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchQ, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [decodedSymbol]);

  function toggleWatchlist() {
    const stored = localStorage.getItem("wb_watchlist");
    let list: string[] = [];
    try { if (stored) list = JSON.parse(stored); } catch {}
    if (watchlisted) {
      list = list.filter((s) => s !== decodedSymbol);
    } else {
      if (!list.includes(decodedSymbol)) list.push(decodedSymbol);
    }
    localStorage.setItem("wb_watchlist", JSON.stringify(list));
    setWatchlisted(!watchlisted);
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "#0a0e17" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 pt-14 pb-3 sticky top-0 z-20"
        style={{ background: "#0a0e17", borderBottom: "1px solid #1e2a42" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4l-6 6 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <TickerLogo symbol={decodedSymbol} size={32} />
          <div>
            <div className="text-[17px] font-bold leading-tight">
              {decodedSymbol.replace("^", "")}
            </div>
            {quote && (
              <div className="text-[11px] text-wb-muted leading-tight">
                {quote.longName || quote.shortName}
              </div>
            )}
          </div>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/search")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="1.5" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button onClick={toggleWatchlist}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                fill={watchlisted ? "#ff333a" : "none"}
                stroke={watchlisted ? "#ff333a" : "white"}
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <LoadingSpinner size={40} />
        </div>
      ) : !quote ? (
        <div className="flex items-center justify-center flex-1 text-wb-muted">
          Symbol not found
        </div>
      ) : (
        <>
          {/* Price header */}
          <StockHeader quote={quote} />

          {/* Tab bar */}
          <div
            ref={tabsRef}
            className="flex tabs-scroll sticky z-10"
            style={{
              top: 80,
              background: "#0a0e17",
              borderBottom: "1px solid #1e2a42",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-shrink-0 px-4 py-3 text-[14px] font-semibold relative transition-colors"
                style={{ color: activeTab === tab ? "#ffffff" : "#8a9bc3" }}
              >
                {tab}
                {activeTab === tab && (
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-full"
                    style={{ height: 2, background: "#1db7ff" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto pb-6">
            {activeTab === "Chart" && <ChartTab symbol={decodedSymbol} />}
            {activeTab === "News" && <NewsTab symbol={decodedSymbol} />}
            {activeTab === "Analysis" && (
              <AnalysisTab
                symbol={decodedSymbol}
                currentPrice={quote.regularMarketPrice}
              />
            )}
            {activeTab === "Technical" && (
              <TechnicalTab
                symbol={decodedSymbol}
                currentPrice={quote.regularMarketPrice}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
