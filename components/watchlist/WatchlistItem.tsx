"use client";

import Link from "next/link";
import TickerLogo from "@/components/ui/TickerLogo";
import Sparkline from "@/components/ui/Sparkline";
import { getMarketSession, getSessionLabel } from "@/lib/utils/marketSession";
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

export default function WatchlistItem({
  quote,
  sparkData,
  onRemove,
  editMode,
  dragHandleProps,
  isDragging,
}: WatchlistItemProps) {
  const isUp = quote.regularMarketChangePercent >= 0;
  const badgeColor = isUp ? "#00C087" : "#FF3B30";

  const session = getMarketSession();
  const sessionLabel = getSessionLabel(session);

  const extPct =
    session === "PRE"
      ? (quote.preMarketChangePercent ?? 0)
      : (quote.postMarketChangePercent ?? quote.preMarketChangePercent ?? 0);

  const hasExtended =
    session !== "REGULAR" &&
    sessionLabel !== null &&
    (quote.postMarketChangePercent != null || quote.preMarketChangePercent != null);

  const extColor =
    extPct > 0 ? "#00C087" : extPct < 0 ? "#FF3B30" : "#8a9bc3";

  return (
    <div
      className="relative flex items-center px-3 py-[10px] transition-opacity"
      style={{
        background: isDragging ? "#1a2236" : undefined,
        opacity: isDragging ? 0.8 : 1,
      }}
    >
      {editMode && (
        <>
          <button
            onClick={() => onRemove?.(quote.symbol)}
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-2"
            style={{ background: "#FF3B30" }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <line x1="2" y1="6" x2="10" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none mr-2"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
        {/* Logo */}
        <TickerLogo symbol={quote.symbol} size={34} />

        {/* Symbol + Company name */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-bold text-white leading-[1.2]"
            style={{ fontSize: 15 }}
          >
            {quote.symbol.replace("^", "")}
          </span>
          <span
            className="truncate leading-[1.2]"
            style={{ fontSize: 11, color: "#8a9bc3" }}
          >
            {quote.shortName}
          </span>
        </div>

        {/* Sparkline */}
        <div className="flex-shrink-0">
          <Sparkline
            data={sparkData && sparkData.length > 1 ? sparkData : [quote.regularMarketPrice]}
            positive={isUp}
            width={72}
            height={32}
          />
        </div>

        {/* Price + % badge + extended label */}
        <div className="flex flex-col items-end flex-shrink-0 min-w-[90px]">
          {/* Current price */}
          <span
            className="text-white font-semibold leading-tight"
            style={{ fontSize: 16 }}
          >
            {fmtPrice(quote.regularMarketPrice)}
          </span>

          {/* % badge */}
          <div
            className="mt-[3px] rounded-[4px] text-white font-semibold text-right leading-tight"
            style={{
              background: badgeColor,
              fontSize: 12,
              paddingLeft: 8,
              paddingRight: 8,
              paddingTop: 3,
              paddingBottom: 3,
              minWidth: 70,
            }}
          >
            {fmtPct(quote.regularMarketChangePercent)}
          </div>

          {/* After / Night / Pre session label */}
          {hasExtended && (
            <span
              className="mt-[3px] font-medium leading-tight"
              style={{ fontSize: 10, color: extColor }}
            >
              {sessionLabel}: {fmtPct(extPct)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
