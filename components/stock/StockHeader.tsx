"use client";

import type { QuoteData } from "@/lib/yahoo/fetcher";

function fmtPrice(v: number) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: v < 1 ? 4 : 2,
  });
}

function fmtBig(v: number) {
  if (v >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString("en-US");
}

function fmtPct(p: number) {
  return `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;
}

function fmtVol(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

/** green/red/orange for after-hours */
function ahColor(pct: number) {
  if (pct > 0) return "#00c076";
  if (pct < 0) return "#ff333a";
  return "#ff8c00";
}

export default function StockHeader({ quote }: { quote: QuoteData }) {
  const isUp = quote.regularMarketChangePercent >= 0;
  const changeColor = isUp ? "#00c076" : "#ff333a";

  const hasAh =
    quote.marketState !== "REGULAR" &&
    (quote.postMarketPrice != null || quote.preMarketPrice != null);

  const ahPrice = quote.postMarketPrice ?? quote.preMarketPrice;
  const ahChange = quote.postMarketChange ?? quote.preMarketChange ?? 0;
  const ahPct = quote.postMarketChangePercent ?? quote.preMarketChangePercent ?? 0;
  const ahLabel =
    quote.marketState === "POST" || quote.marketState === "POSTPOST"
      ? "After Hours"
      : "Pre-Market";

  return (
    <div className="px-4 pt-3 pb-2" style={{ background: "#0a0e17" }}>
      {/* Main price */}
      <div className="text-[36px] font-bold text-white leading-tight tracking-tight">
        {fmtPrice(quote.regularMarketPrice)}
      </div>

      {/* Regular change */}
      <div className="flex items-center gap-2 mt-0.5">
        <svg
          width="10" height="10" viewBox="0 0 10 10"
          fill={changeColor}
          style={{ transform: isUp ? "rotate(180deg)" : undefined }}
        >
          <polygon points="5,9 0,1 10,1" />
        </svg>
        <span className="text-[14px] font-semibold" style={{ color: changeColor }}>
          {fmtPrice(Math.abs(quote.regularMarketChange))}{" "}
          {fmtPct(quote.regularMarketChangePercent)}
        </span>
      </div>

      {/* After / Pre market */}
      {hasAh && ahPrice != null && (
        <div className="mt-1 text-[13px] font-semibold">
          <span style={{ color: ahColor(ahPct) }}>
            {ahLabel}: {fmtPrice(ahPrice)}{" "}
            {ahChange >= 0 ? "+" : ""}
            {fmtPrice(Math.abs(ahChange))}{" "}
            {fmtPct(ahPct)}
          </span>
        </div>
      )}

      {/* Stats row */}
      <div
        className="flex flex-wrap gap-4 mt-3 pt-3 text-[12px]"
        style={{ borderTop: "1px solid #1e2a42" }}
      >
        <div className="flex flex-col">
          <span className="text-wb-muted">H/L</span>
          <span className="text-white font-medium">
            {fmtPrice(quote.regularMarketDayHigh)} / {fmtPrice(quote.regularMarketDayLow)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-wb-muted">Vol</span>
          <span className="text-white font-medium">{fmtVol(quote.regularMarketVolume)}</span>
        </div>
        {quote.marketCap > 0 && (
          <div className="flex flex-col">
            <span className="text-wb-muted">Mkt Cap</span>
            <span className="text-white font-medium">{fmtBig(quote.marketCap)}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-wb-muted">Status</span>
          <span
            className="font-medium text-[11px] uppercase"
            style={{
              color:
                quote.marketState === "REGULAR"
                  ? "#00c076"
                  : "#ff8c00",
            }}
          >
            {quote.marketState === "REGULAR"
              ? "Open"
              : quote.marketState === "POST" || quote.marketState === "POSTPOST"
              ? "After Hours"
              : quote.marketState === "PRE" || quote.marketState === "PREPRE"
              ? "Pre-Market"
              : "Closed"}
          </span>
        </div>
      </div>
    </div>
  );
}
