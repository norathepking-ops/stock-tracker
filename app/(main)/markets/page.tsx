"use client";

import MarketMovers from "@/components/markets/MarketMovers";
import { useScrollRestore } from "@/hooks/useScrollRestore";

export default function MarketsPage() {
  useScrollRestore("markets");

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="flex items-center px-4 pt-14 pb-3 sticky top-0 z-10"
        style={{ background: "#10141f", borderBottom: "1px solid #1e2a42" }}
      >
        <h1 className="text-[18px] font-bold text-white">Markets</h1>
      </div>

      <MarketMovers />
    </div>
  );
}
