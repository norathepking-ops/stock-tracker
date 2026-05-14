"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TickerLogo from "@/components/ui/TickerLogo";
import Sparkline from "@/components/ui/Sparkline";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { QuoteData } from "@/lib/yahoo/fetcher";

type Tab = "active" | "gainers" | "losers";

function fmtVol(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

function fmtPrice(v: number) {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(p: number) {
  return `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;
}

export default function MarketMovers() {
  const [tab, setTab] = useState<Tab>("active");
  const [data, setData] = useState<QuoteData[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const sparkFetched = useRef<Set<string>>(new Set());
  const hasLoaded = useRef(false);
  // Tracks the latest fetch — stale responses with older IDs are discarded
  const activeFetchId = useRef(0);

  useEffect(() => {
    const myId = ++activeFetchId.current;

    if (!hasLoaded.current) {
      setInitialLoading(true);
    } else {
      setSwitching(true);
    }

    fetch(`/api/movers?type=${tab}`)
      .then((r) => r.json())
      .then((rows: QuoteData[]) => {
        if (myId !== activeFetchId.current) return; // stale — a newer tab was clicked
        setData(rows);
        setLastUpdated(new Date());
        hasLoaded.current = true;
        rows.forEach((q) => {
          if (sparkFetched.current.has(q.symbol)) return;
          sparkFetched.current.add(q.symbol);
          fetch(`/api/chart/${encodeURIComponent(q.symbol)}?range=1d`)
            .then((r) => r.json())
            .then((candles: { close: number }[]) => {
              const closes = candles.map((c) => c.close).filter(Boolean);
              if (closes.length > 1) {
                setSparklines((prev) => ({ ...prev, [q.symbol]: closes }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {
        if (myId !== activeFetchId.current) return;
        setData([]);
      })
      .finally(() => {
        if (myId !== activeFetchId.current) return;
        setInitialLoading(false);
        setSwitching(false);
      });
  }, [tab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: "Most Active" },
    { id: "gainers", label: "Top Gainers" },
    { id: "losers", label: "Top Losers" },
  ];

  function switchTab(newTab: Tab) {
    const main = document.querySelector("main");
    const saved = main?.scrollTop ?? 0;
    setTab(newTab);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (main) main.scrollTop = saved;
      });
    });
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center tabs-scroll" style={{ borderBottom: "1px solid #1e2a42" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => switchTab(t.id)}
            className="flex-shrink-0 px-4 py-3 text-[14px] font-semibold transition-colors relative"
            style={{ color: tab === t.id ? "#ffffff" : "#8a9bc3" }}
          >
            {t.label}
            {tab === t.id && (
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-full"
                style={{ height: 2, background: "#1db7ff" }}
              />
            )}
          </button>
        ))}
        {lastUpdated && (
          <span className="ml-auto pl-2 pr-4 text-[10px] text-wb-muted whitespace-nowrap flex-shrink-0">
            อัปเดต {lastUpdated.toTimeString().slice(0, 8)}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div
        className="flex items-center px-4 py-2 text-[11px] text-wb-muted"
        style={{ borderBottom: "1px solid #1e2a42" }}
      >
        <span className="flex-1">Symbol</span>
        <span className="w-20 text-center">Chart</span>
        <span className="w-28 text-right">
          {tab === "active" ? "Volume" : "% Change"}
        </span>
      </div>

      {initialLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size={32} />
        </div>
      ) : (
        <div
          className="divide-y"
          style={{
            borderColor: "#1e2a42",
            opacity: switching ? 0.45 : 1,
            transition: "opacity 0.15s",
            pointerEvents: switching ? "none" : undefined,
          }}
        >
          {data.map((q) => {
            const isUp = q.regularMarketChangePercent >= 0;
            const color = isUp ? "#00c076" : "#ff333a";
            const spark = sparklines[q.symbol];
            return (
              <Link
                key={q.symbol}
                href={`/stock/${encodeURIComponent(q.symbol)}`}
                className="flex items-center px-4 py-3 active:opacity-70 transition-opacity"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <TickerLogo symbol={q.symbol} size={36} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[14px] text-white">{q.symbol}</span>
                    <span className="text-[11px] text-wb-muted truncate max-w-[100px]">
                      {q.shortName}
                    </span>
                  </div>
                </div>

                <div className="w-20 flex justify-center">
                  <Sparkline
                    data={spark && spark.length > 1
                      ? spark
                      : [q.regularMarketDayLow, q.regularMarketPrice]}
                    positive={isUp}
                    width={68}
                    height={30}
                  />
                </div>

                <div className="w-28 text-right flex flex-col">
                  {tab === "active" ? (
                    <span className="text-[13px] text-white font-semibold">
                      {fmtVol(q.regularMarketVolume)}
                    </span>
                  ) : (
                    <span className="text-[13px] font-bold" style={{ color }}>
                      {fmtPct(q.regularMarketChangePercent)}
                    </span>
                  )}
                  <span className="text-[11px] text-wb-muted">
                    {fmtPrice(q.regularMarketPrice)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
