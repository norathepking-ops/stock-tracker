"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { NewsItem } from "@/lib/yahoo/fetcher";

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news/market")
      .then((r) => r.json())
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <div
        className="flex items-center px-4 pt-14 pb-3 sticky top-0 z-10"
        style={{ background: "#10141f", borderBottom: "1px solid #1e2a42" }}
      >
        <h1 className="text-[18px] font-bold text-white">Market News</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 py-16">
          <LoadingSpinner size={36} />
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "#1e2a42" }}>
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 px-4 py-4 active:opacity-70 transition-opacity"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-white leading-snug line-clamp-3">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-wb-muted">{item.publisher}</span>
                  <span className="text-[11px] text-wb-muted">·</span>
                  <span className="text-[11px] text-wb-muted">{timeAgo(item.publishedAt)}</span>
                </div>
              </div>
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
