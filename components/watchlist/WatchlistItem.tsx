"use client";

import Link from "next/link";
import TickerLogo from "@/components/ui/TickerLogo";
import Sparkline from "@/components/ui/Sparkline";
import type { QuoteData } from "@/lib/yahoo/fetcher";

interface WatchlistItemProps {
  quote: QuoteData;
  sparkData?: number[];
  onRemove?: (symbol: string) => void;
  editMode?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}

function fmtPrice(price: number) {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  });
}

function fmtPct(pct: number) {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function fmtChange(v: number) {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Returns green/red/orange based on direction, with optional opacity */
function ahColor(pct: number) {
  if (pct > 0) return "#00c076";
  if (pct < 0) return "#ff333a";
  return "#ff8c00"; // unchanged = orange
}

export default function WatchlistItem({
  quote,
  sparkData,
  onRemove,
  editMode,
  dragHandleProps,
  isDragging,
}: WatchlistItemProps) {
  const isUp = quote.regularMarketChangePercent >= 0;
  const badgeColor = isUp ? "#00c076" : "#ff333a";

  const hasAfterHours =
    quote.marketState !== "REGULAR" &&
    (quote.postMarketPrice != null || quote.preMarketPrice != null);

  const ahPct =
    (quote.postMarketChangePercent ?? quote.preMarketChangePercent) ?? 0;
  const ahLabel = `After: ${fmtPct(ahPct)}`;

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 transition-opacity"
      style={{
        background: isDragging ? "#1a2236" : undefined,
        opacity: isDragging ? 0.8 : 1,
      }}
    >
      {editMode && (
        <>
          {/* Remove button */}
          <button
            onClick={() => onRemove?.(quote.symbol)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#ff333a" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="2" y1="6" x2="10" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="10" height="1.5" rx="0.75" fill="#8a9bc3" />
              <rect x="3" y="7" width="10" height="1.5" rx="0.75" fill="#8a9bc3" />
              <rect x="3" y="11" width="10" height="1.5" rx="0.75" fill="#8a9bc3" />
            </svg>
          </div>
        </>
      )}

      <Link
        href={`/stock/${encodeURIComponent(quote.symbol)}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <TickerLogo symbol={quote.symbol} size={44} />

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] text-white">
              {quote.symbol.replace("^", "")}
            </span>
            {quote.marketState !== "REGULAR" && (
              <span
                className="text-[9px] px-1 py-0.5 rounded font-bold"
                style={{ background: "#1a2236", color: "#ff8c00" }}
              >
                24H
              </span>
            )}
            <span
              className="text-[10px] px-1 py-0.5 rounded"
              style={{ background: "#1a2236", color: "#8a9bc3" }}
            >
              US
            </span>
          </div>
          <span className="text-[12px] text-wb-muted truncate">{quote.shortName}</span>
        </div>

        <div className="flex-shrink-0">
          <Sparkline
            data={sparkData && sparkData.length > 1 ? sparkData : [quote.regularMarketPrice]}
            positive={isUp}
            width={80}
            height={36}
          />
        </div>

        <div className="flex flex-col items-end flex-shrink-0 min-w-[96px]">
          {/* % badge */}
          <div
            className="px-2 py-1 rounded text-[13px] font-bold text-white"
            style={{ background: badgeColor }}
          >
            {fmtPct(quote.regularMarketChangePercent)}
          </div>
          {/* price + abs change */}
          <div className="text-[12px] mt-0.5" style={{ color: "#8a9bc3" }}>
            {fmtPrice(quote.regularMarketPrice)}{" "}
            <span style={{ color: badgeColor }}>
              {fmtChange(quote.regularMarketChange)}
            </span>
          </div>
          {/* After-hours */}
          {hasAfterHours && (
            <div
              className="text-[11px] font-semibold"
              style={{ color: ahColor(ahPct) }}
            >
              {ahLabel}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
