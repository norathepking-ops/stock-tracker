"use client";

import Link from "next/link";

export default function MenuPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div
        className="px-4 pt-14 pb-3"
        style={{ borderBottom: "1px solid #1e2a42" }}
      >
        <h1 className="text-[18px] font-bold text-white">Menu</h1>
      </div>

      <div className="divide-y" style={{ borderColor: "#1e2a42" }}>
        {[
          { label: "Watchlist", href: "/watchlist", icon: "📋" },
          { label: "Markets", href: "/markets", icon: "🌍" },
          { label: "News", href: "/news", icon: "📰" },
          { label: "Search", href: "/search", icon: "🔍" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 px-4 py-4 active:opacity-70 transition-opacity"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[15px] text-white">{item.label}</span>
            <svg className="ml-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
        ))}
      </div>

      <div className="px-4 py-6 mt-2">
        <div
          className="rounded-xl p-4"
          style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
        >
          <p className="text-[12px] text-wb-muted text-center">
            Data provided by Yahoo Finance · 15-min delay
          </p>
        </div>
      </div>
    </div>
  );
}
