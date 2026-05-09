"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { AnalysisData } from "@/lib/yahoo/fetcher";

interface AnalysisTabProps {
  symbol: string;
  currentPrice: number;
}

const RATING_COLORS: Record<string, string> = {
  strongBuy: "#00c076",
  buy: "#4caf50",
  hold: "#f5c842",
  underperform: "#ff8c00",
  sell: "#ff333a",
};

const RATING_LABEL: Record<string, string> = {
  "strong_buy": "Strong Buy",
  "buy": "Buy",
  "hold": "Hold",
  "underperform": "Underperform",
  "sell": "Sell",
};

export default function AnalysisTab({ symbol, currentPrice }: AnalysisTabProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analysis/${symbol}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 text-wb-muted">
        Analysis not available
      </div>
    );
  }

  const ratings = [
    { key: "strongBuy", label: "Strong Buy", count: data.strongBuy },
    { key: "buy", label: "Buy", count: data.buy },
    { key: "hold", label: "Hold", count: data.hold },
    { key: "underperform", label: "Underperform", count: data.underperform },
    { key: "sell", label: "Sell", count: data.sell },
  ];

  const ratingLabel = RATING_LABEL[data.recommendationKey] || data.recommendationKey;
  const ratingKey = data.recommendationKey.replace("_", "").toLowerCase() === "strongbuy" ? "strongBuy" : data.recommendationKey;

  // Price target bar
  const low = data.targetLowPrice;
  const avg = data.targetMeanPrice;
  const high = data.targetHighPrice;
  const barMin = Math.min(low, currentPrice) * 0.97;
  const barMax = high * 1.03;
  const barRange = barMax - barMin;

  function toPercent(v: number) {
    return ((v - barMin) / barRange) * 100;
  }

  function fmtPct(current: number, target: number) {
    const p = ((target - current) / current) * 100;
    return `${p >= 0 ? "+" : ""}${p.toFixed(2)}%`;
  }

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Analyst Rating */}
      <div>
        <h2 className="text-[16px] font-bold text-white">Analyst Rating</h2>
        <p className="text-[12px] text-wb-muted mt-0.5">
          Based on {data.numberOfAnalystOpinions} analysts.
        </p>

        <div className="flex items-center gap-6 mt-4">
          {/* Donut indicator */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              border: `3px solid ${RATING_COLORS[ratingKey] || "#00c076"}`,
              background: `${RATING_COLORS[ratingKey] || "#00c076"}15`,
            }}
          >
            <span
              className="text-[13px] font-bold text-center leading-tight px-1"
              style={{ color: RATING_COLORS[ratingKey] || "#00c076" }}
            >
              {ratingLabel}
            </span>
          </div>

          {/* Bars */}
          <div className="flex-1 space-y-2">
            {ratings.map((r) => {
              const pct = (r.count / data.totalRatings) * 100;
              return (
                <div key={r.key} className="flex items-center gap-2">
                  <span className="text-[11px] text-wb-muted w-20 text-right">{r.label}</span>
                  <div
                    className="flex-1 rounded-full overflow-hidden"
                    style={{ height: 6, background: "#1e2a42" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: RATING_COLORS[r.key],
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-white w-8 text-right">
                    {Math.round(pct)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Price Target */}
      {low > 0 && high > 0 && (
        <div>
          <h2 className="text-[16px] font-bold text-white">Analyst Price Target</h2>
          <p className="text-[12px] text-wb-muted mt-0.5">
            Average target {avg.toFixed(2)} · High {high.toFixed(2)} · Low {low.toFixed(2)}
          </p>

          <div className="mt-4 relative" style={{ height: 80 }}>
            {/* Track */}
            <div
              className="absolute rounded-full"
              style={{
                left: 0,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                height: 4,
                background: "#1e2a42",
              }}
            />
            {/* Range fill */}
            <div
              className="absolute rounded-full"
              style={{
                left: `${toPercent(low)}%`,
                width: `${toPercent(high) - toPercent(low)}%`,
                top: "50%",
                transform: "translateY(-50%)",
                height: 4,
                background: "linear-gradient(90deg, #00c076, #1db7ff)",
              }}
            />

            {/* Current price dot */}
            <PriceMarker
              label={`${currentPrice.toFixed(2)}`}
              pct={toPercent(currentPrice)}
              color="#ffffff"
              above={false}
            />
            {/* Min */}
            <PriceMarker
              label={`Min ${low.toFixed(2)}\n${fmtPct(currentPrice, low)}`}
              pct={toPercent(low)}
              color="#00c076"
              above
            />
            {/* Avg */}
            <PriceMarker
              label={`Avg ${avg.toFixed(2)}\n${fmtPct(currentPrice, avg)}`}
              pct={toPercent(avg)}
              color="#1db7ff"
              above
            />
            {/* Max */}
            <PriceMarker
              label={`Max ${high.toFixed(2)}\n${fmtPct(currentPrice, high)}`}
              pct={toPercent(high)}
              color="#00c076"
              above
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PriceMarker({
  label,
  pct,
  color,
  above,
}: {
  label: string;
  pct: number;
  color: string;
  above: boolean;
}) {
  const lines = label.split("\n");
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${Math.min(Math.max(pct, 5), 90)}%`,
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {above && (
        <div
          className="mb-1 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
          style={{ background: color, color: "#000", marginTop: -40 }}
        >
          {lines[0]}
          {lines[1] && <span className="ml-1">{lines[1]}</span>}
        </div>
      )}
      <div
        className="rounded-full border-2"
        style={{
          width: 12,
          height: 12,
          background: color,
          borderColor: "#10141f",
          position: above ? "relative" : "relative",
        }}
      />
      {!above && (
        <span className="text-[10px] font-bold mt-1" style={{ color }}>
          {lines[0]}
        </span>
      )}
    </div>
  );
}
