"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ChartTabProps {
  symbol: string;
}

const RANGES = [
  { label: "1D", range: "1d" },
  { label: "1W", range: "5d" },
  { label: "1M", range: "1mo" },
  { label: "3M", range: "3mo" },
  { label: "6M", range: "6mo" },
  { label: "1Y", range: "1y" },
];

type CandleSeries = { setData: (d: unknown[]) => void };
type HistSeries = { setData: (d: unknown[]) => void };

export default function ChartTab({ symbol }: ChartTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<CandleSeries | null>(null);
  const volumeSeriesRef = useRef<HistSeries | null>(null);
  const chartInitialized = useRef(false);
  const [range, setRange] = useState("1d");
  const [loading, setLoading] = useState(true);

  // Load chart data and push to existing series
  const loadData = useCallback(async (r: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chart/${encodeURIComponent(symbol)}?range=${r}`);
      const data: Array<{
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }> = await res.json();

      if (!Array.isArray(data) || data.length === 0) return;

      // Deduplicate by time (keep last occurrence)
      const seen = new Map<number, typeof data[0]>();
      for (const d of data) seen.set(d.time, d);
      const deduped = [...seen.values()].sort((a, b) => a.time - b.time);

      candleSeriesRef.current?.setData(
        deduped.map((d) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
      volumeSeriesRef.current?.setData(
        deduped.map((d) => ({
          time: d.time,
          value: d.volume,
          color: d.close >= d.open ? "#00c07640" : "#ff333a40",
        }))
      );
    } catch (e) {
      console.error("Chart load error:", e);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Initialize chart once when symbol changes
  useEffect(() => {
    if (!containerRef.current) return;
    chartInitialized.current = false;
    let chartInstance: { remove: () => void; applyOptions: (o: object) => void; priceScale: (id: string) => { applyOptions: (o: object) => void }; timeScale: () => { fitContent: () => void } } | null = null;

    async function init() {
      if (!containerRef.current) return;

      const { createChart, CandlestickSeries, HistogramSeries } = await import("lightweight-charts");

      // Clean up previous chart if any
      if (containerRef.current.childElementCount > 0) {
        containerRef.current.innerHTML = "";
      }

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 340,
        layout: {
          background: { color: "#10141f" },
          textColor: "#8a9bc3",
        },
        grid: {
          vertLines: { color: "#1a2236" },
          horzLines: { color: "#1a2236" },
        },
        crosshair: {
          vertLine: { color: "#1db7ff", labelBackgroundColor: "#1db7ff" },
          horzLine: { color: "#1db7ff", labelBackgroundColor: "#1db7ff" },
        },
        rightPriceScale: { borderColor: "#1e2a42" },
        timeScale: {
          borderColor: "#1e2a42",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartInstance = chart;

      const candle = chart.addSeries(CandlestickSeries, {
        upColor: "#00c076",
        downColor: "#ff333a",
        borderUpColor: "#00c076",
        borderDownColor: "#ff333a",
        wickUpColor: "#00c076",
        wickDownColor: "#ff333a",
      });

      const vol = chart.addSeries(HistogramSeries, {
        color: "#1e2a42",
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });

      candleSeriesRef.current = candle as unknown as CandleSeries;
      volumeSeriesRef.current = vol as unknown as HistSeries;
      chartInitialized.current = true;

      // Load initial data
      await loadData(range);
      chart.timeScale().fitContent();

      const handleResize = () => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const cleanupPromise = init();

    return () => {
      cleanupPromise.then((fn) => fn?.());
      chartInstance?.remove();
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      chartInitialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  // Reload when range changes (chart already initialized)
  useEffect(() => {
    if (!chartInitialized.current) return;
    loadData(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <div className="flex flex-col">
      {/* Range selector */}
      <div className="flex gap-1 px-4 py-2">
        {RANGES.map((r) => {
          const active = range === r.range;
          return (
            <button
              key={r.range}
              onClick={() => setRange(r.range)}
              className="flex-1 py-1.5 text-[12px] font-bold rounded transition-colors"
              style={{
                background: active ? "#1db7ff20" : "transparent",
                color: active ? "#1db7ff" : "#8a9bc3",
                border: `1px solid ${active ? "#1db7ff60" : "transparent"}`,
              }}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Chart container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <LoadingSpinner size={32} />
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full"
          style={{ opacity: loading ? 0.4 : 1, transition: "opacity 0.2s" }}
        />
      </div>
    </div>
  );
}
