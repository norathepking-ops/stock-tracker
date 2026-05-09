"use client";

import { useEffect, useState } from "react";
import MarketMovers from "@/components/markets/MarketMovers";
import type { QuoteData } from "@/lib/yahoo/fetcher";

function IndexCard({ q }: { q: QuoteData }) {
  const isUp = q.regularMarketChangePercent >= 0;
  const color = isUp ? "#00c076" : "#ff333a";
  const label = q.symbol === "^DJI" ? "DJI" : q.symbol === "^IXIC" ? "IXIC" : "SPX";

  return (
    <div
      className="flex-1 rounded-xl p-3"
      style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
    >
      <div className="text-[12px] text-wb-muted font-semibold">{label}</div>
      <div className="text-[14px] font-bold text-white mt-0.5">
        {q.regularMarketPrice.toFixed(2)}
      </div>
      <div className="text-[12px] font-semibold mt-0.5" style={{ color }}>
        {q.regularMarketChangePercent >= 0 ? "+" : ""}
        {q.regularMarketChangePercent.toFixed(2)}%
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const [indices, setIndices] = useState<QuoteData[]>([]);

  useEffect(() => {
    fetch("/api/indices")
      .then((r) => r.json())
      .then(setIndices)
      .catch(() => setIndices([]));

    const t = setInterval(() => {
      fetch("/api/indices")
        .then((r) => r.json())
        .then(setIndices)
        .catch(() => {});
    }, 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-14 pb-3 sticky top-0 z-10"
        style={{ background: "#10141f", borderBottom: "1px solid #1e2a42" }}
      >
        <h1 className="text-[18px] font-bold text-white">Market Movers</h1>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M21.5 2L14 9.5M21.5 2H16M21.5 2V7.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 22L10 14.5M2.5 22H8M2.5 22V16.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Index cards */}
      {indices.length > 0 && (
        <div className="flex gap-2 px-4 py-3">
          {indices.map((q) => (
            <IndexCard key={q.symbol} q={q} />
          ))}
        </div>
      )}

      {/* Movers */}
      <MarketMovers />
    </div>
  );
}
