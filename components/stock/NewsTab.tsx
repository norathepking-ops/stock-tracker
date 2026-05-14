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

interface NewsTabProps {
  symbol: string;
}

export default function NewsTab({ symbol }: NewsTabProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news/${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-wb-muted">
        No news available
      </div>
    );
  }

  return (
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
            <h3 className="text-[14px] font-semibold text-white leading-snug line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-wb-muted">{item.publisher}</span>
              <span className="text-[11px] text-wb-muted">·</span>
              <span className="text-[11px] text-wb-muted">{timeAgo(item.publishedAt)}</span>
            </div>
            {item.relatedTickers && item.relatedTickers.length > 0 && (
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {item.relatedTickers.slice(0, 4).map((t) => (
                  <span
                    key={t.symbol}
                    className="text-[11px] font-semibold"
                    style={{ color: t.changePercent >= 0 ? "#00c076" : "#ff333a" }}
                  >
                    {t.symbol}{" "}
                    {t.changePercent !== 0 && (
                      <>
                        {t.changePercent >= 0 ? "+" : ""}
                        {t.changePercent.toFixed(2)}%
                      </>
                    )}
                  </span>
                ))}
              </div>
            )}
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
  );
}
