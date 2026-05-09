"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface TechData {
  rsi: number | null;
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
  ma50: number | null;
  ma200: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  currentPrice: number;
  bullish: number;
  bearish: number;
  signal: "bullish" | "bearish" | "neutral";
  summary: string;
}

interface TechnicalTabProps {
  symbol: string;
  currentPrice: number;
}

async function computeTechnicals(symbol: string, currentPrice: number): Promise<TechData> {
  const res = await fetch(`/api/chart/${encodeURIComponent(symbol)}?range=1y`);
  const candles = await res.json();
  const closes: number[] = candles.map((c: { close: number }) => c.close).filter(Boolean);

  function ma(n: number): number | null {
    if (closes.length < n) return null;
    const slice = closes.slice(-n);
    return slice.reduce((a, b) => a + b, 0) / n;
  }

  function rsi(period = 14): number | null {
    if (closes.length < period + 1) return null;
    const slice = closes.slice(-(period + 1));
    let gains = 0, losses = 0;
    for (let i = 1; i < slice.length; i++) {
      const diff = slice[i] - slice[i - 1];
      if (diff > 0) gains += diff; else losses -= diff;
    }
    const ag = gains / period, al = losses / period;
    if (al === 0) return 100;
    return 100 - 100 / (1 + ag / al);
  }

  function ema(n: number, data: number[]): number | null {
    if (data.length < n) return null;
    const k = 2 / (n + 1);
    let e = data[0];
    for (let i = 1; i < data.length; i++) e = data[i] * k + e * (1 - k);
    return e;
  }

  function bollinger(period = 20): { upper: number | null; lower: number | null } {
    if (closes.length < period) return { upper: null, lower: null };
    const slice = closes.slice(-period);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / period);
    return { upper: avg + 2 * stdDev, lower: avg - 2 * stdDev };
  }

  const rsiVal = rsi();
  const ma5Val = ma(5);
  const ma10Val = ma(10);
  const ma20Val = ma(20);
  const ma50Val = ma(50);
  const ma200Val = ma(200);

  // MACD (12, 26, 9)
  const ema12 = ema(12, closes);
  const ema26 = ema(26, closes);
  const macdVal = ema12 != null && ema26 != null ? ema12 - ema26 : null;
  const macdSignalVal = macdVal != null ? macdVal * (2 / 10) : null;
  const macdHistVal = macdVal != null && macdSignalVal != null ? macdVal - macdSignalVal : null;

  const boll = bollinger();

  let bull = 0, bear = 0;
  if (rsiVal != null) { if (rsiVal < 30) bull++; else if (rsiVal > 70) bear++; else if (rsiVal >= 45 && rsiVal <= 60) bull++; }
  if (ma5Val) currentPrice > ma5Val ? bull++ : bear++;
  if (ma10Val) currentPrice > ma10Val ? bull++ : bear++;
  if (ma20Val) currentPrice > ma20Val ? bull++ : bear++;
  if (ma50Val) currentPrice > ma50Val ? bull++ : bear++;
  if (ma200Val) currentPrice > ma200Val ? bull++ : bear++;
  if (macdVal != null && macdSignalVal != null) macdVal > macdSignalVal ? bull++ : bear++;
  if (boll.lower != null && boll.upper != null) {
    if (currentPrice < boll.lower) bull++;
    else if (currentPrice > boll.upper) bear++;
  }

  const signal: TechData["signal"] =
    bull > bear ? "bullish" : bear > bull ? "bearish" : "neutral";

  const total = bull + bear;
  const summary =
    signal === "bullish"
      ? `${bull} of ${total} indicators bullish`
      : signal === "bearish"
      ? `${bear} of ${total} indicators bearish — caution advised`
      : "Mixed signals — wait for confirmation";

  return {
    rsi: rsiVal, ma5: ma5Val, ma10: ma10Val, ma20: ma20Val,
    ma50: ma50Val, ma200: ma200Val,
    macd: macdVal, macdSignal: macdSignalVal, macdHist: macdHistVal,
    bollingerUpper: boll.upper, bollingerLower: boll.lower,
    currentPrice, bullish: bull, bearish: bear, signal, summary,
  };
}

export default function TechnicalTab({ symbol, currentPrice }: TechnicalTabProps) {
  const [data, setData] = useState<TechData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    computeTechnicals(symbol, currentPrice)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [symbol, currentPrice]);

  if (loading) return <div className="flex items-center justify-center py-16"><LoadingSpinner size={32} /></div>;
  if (!data) return <div className="flex items-center justify-center py-16 text-wb-muted">Technical data unavailable</div>;

  const signalColor = data.signal === "bullish" ? "#00c076" : data.signal === "bearish" ? "#ff333a" : "#f5c842";
  const total = data.bullish + data.bearish;
  const bullPct = total > 0 ? (data.bullish / total) * 100 : 50;

  const fmt = (v: number | null) => v != null ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

  const maSignal = (val: number | null) => {
    if (!val) return { text: "—", positive: null };
    return currentPrice > val
      ? { text: "Bullish ▲", positive: true }
      : { text: "Bearish ▼", positive: false };
  };

  const rsiSignal = (v: number | null) => {
    if (v == null) return { text: "—", positive: null };
    if (v < 30) return { text: "Oversold 📈", positive: true };
    if (v > 70) return { text: "Overbought 📉", positive: false };
    if (v >= 50) return { text: "Neutral+", positive: true };
    return { text: "Neutral−", positive: false };
  };

  const indicators = [
    { label: "RSI (14)", value: data.rsi != null ? data.rsi.toFixed(1) : "—", ...rsiSignal(data.rsi) },
    { label: "MA (5)", value: fmt(data.ma5), ...maSignal(data.ma5) },
    { label: "MA (10)", value: fmt(data.ma10), ...maSignal(data.ma10) },
    { label: "MA (20)", value: fmt(data.ma20), ...maSignal(data.ma20) },
    { label: "MA (50)", value: fmt(data.ma50), ...maSignal(data.ma50) },
    { label: "MA (200)", value: fmt(data.ma200), ...maSignal(data.ma200) },
    {
      label: "MACD",
      value: data.macd != null ? data.macd.toFixed(3) : "—",
      text: data.macd != null && data.macdSignal != null
        ? data.macd > data.macdSignal ? "Bullish ▲" : "Bearish ▼"
        : "—",
      positive: data.macd != null && data.macdSignal != null
        ? data.macd > data.macdSignal
        : null,
    },
    {
      label: "Bollinger Upper",
      value: fmt(data.bollingerUpper),
      text: data.bollingerUpper != null
        ? currentPrice > data.bollingerUpper ? "Above Band ⚠️" : "Below Band ✓"
        : "—",
      positive: data.bollingerUpper != null ? currentPrice <= data.bollingerUpper : null,
    },
    {
      label: "Bollinger Lower",
      value: fmt(data.bollingerLower),
      text: data.bollingerLower != null
        ? currentPrice < data.bollingerLower ? "Oversold Zone 📈" : "Normal"
        : "—",
      positive: data.bollingerLower != null ? currentPrice < data.bollingerLower : null,
    },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Summary */}
      <div className="rounded-xl p-4" style={{ background: `${signalColor}15`, border: `1px solid ${signalColor}40` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: signalColor }} />
            <span className="text-[16px] font-bold" style={{ color: signalColor }}>
              {data.signal === "bullish" ? "Bullish" : data.signal === "bearish" ? "Bearish" : "Neutral"}
            </span>
          </div>
          <span className="text-[12px] text-wb-muted">
            {data.bullish}↑ / {data.bearish}↓
          </span>
        </div>
        {/* Bullish/Bearish bar */}
        <div className="flex rounded-full overflow-hidden mb-2" style={{ height: 8 }}>
          <div style={{ width: `${bullPct}%`, background: "#00c076" }} />
          <div style={{ width: `${100 - bullPct}%`, background: "#ff333a" }} />
        </div>
        <p className="text-[12px] text-wb-muted">{data.summary}</p>
      </div>

      {/* Indicators table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e2a42" }}>
        <div
          className="flex px-4 py-2 text-[11px] text-wb-muted font-semibold uppercase tracking-wide"
          style={{ background: "#1a2236" }}
        >
          <span className="flex-1">Indicator</span>
          <span className="w-24 text-right">Value</span>
          <span className="w-24 text-right">Signal</span>
        </div>
        {indicators.map((ind, i) => (
          <div
            key={ind.label}
            className="flex items-center px-4 py-2.5"
            style={{ borderTop: i > 0 ? "1px solid #1e2a42" : undefined }}
          >
            <span className="flex-1 text-[13px] text-white">{ind.label}</span>
            <span className="w-24 text-right text-[12px] font-mono" style={{ color: "#8a9bc3" }}>{ind.value}</span>
            <span
              className="w-24 text-right text-[12px] font-semibold"
              style={{ color: ind.positive === true ? "#00c076" : ind.positive === false ? "#ff333a" : "#f5c842" }}
            >
              {ind.text}
            </span>
          </div>
        ))}
      </div>

      {/* Bollinger context */}
      {data.bollingerUpper && data.bollingerLower && (
        <div className="rounded-xl p-4" style={{ background: "#151b2d", border: "1px solid #1e2a42" }}>
          <p className="text-[13px] font-semibold text-white mb-2">Bollinger Band Position</p>
          <div className="relative" style={{ height: 24 }}>
            <div className="absolute inset-0 rounded-full" style={{ background: "#1e2a42" }} />
            {(() => {
              const range = data.bollingerUpper - data.bollingerLower;
              const pct = Math.min(Math.max(((currentPrice - data.bollingerLower) / range) * 100, 2), 98);
              return (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2"
                  style={{ left: `${pct}%`, transform: "translate(-50%,-50%)", background: "#1db7ff", borderColor: "#10141f" }}
                />
              );
            })()}
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-wb-muted">
            <span>{fmt(data.bollingerLower)} (lower)</span>
            <span className="text-white font-semibold">{fmt(currentPrice)}</span>
            <span>{fmt(data.bollingerUpper)} (upper)</span>
          </div>
        </div>
      )}
    </div>
  );
}
