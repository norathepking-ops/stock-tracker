"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/watchlist",
    label: "Watchlists",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="2" rx="1" fill={active ? "#1db7ff" : "#8a9bc3"} />
        <rect x="3" y="9" width="10" height="2" rx="1" fill={active ? "#1db7ff" : "#8a9bc3"} />
        <rect x="3" y="14" width="14" height="2" rx="1" fill={active ? "#1db7ff" : "#8a9bc3"} />
        <rect x="3" y="19" width="8" height="2" rx="1" fill={active ? "#1db7ff" : "#8a9bc3"} />
      </svg>
    ),
  },
  {
    href: "/markets",
    label: "Markets",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="4" ry="9" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <line x1="3" y1="12" x2="21" y2="12" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <line x1="4.5" y1="7" x2="19.5" y2="7" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <line x1="4.5" y1="17" x2="19.5" y2="17" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/news",
    label: "News",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <line x1="7" y1="9" x2="17" y2="9" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <line x1="7" y1="12" x2="14" y2="12" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <line x1="7" y1="15" x2="11" y2="15" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Explore",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? "#1db7ff" : "#8a9bc3"} strokeWidth="1.5" />
        <polygon points="10,8 16,12 10,16" fill={active ? "#1db7ff" : "#8a9bc3"} />
      </svg>
    ),
  },
  {
    href: "/menu",
    label: "Menu",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="2" fill={active ? "#1db7ff" : "#8a9bc3"} />
        <circle cx="6" cy="12" r="2" fill={active ? "#1db7ff" : "#8a9bc3"} />
        <circle cx="18" cy="12" r="2" fill={active ? "#1db7ff" : "#8a9bc3"} />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t"
      style={{
        background: "#151b2d",
        borderColor: "#1e2a42",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            scroll={false}
            className="flex flex-1 flex-col items-center gap-1 py-2"
          >
            {tab.icon(active)}
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? "#1db7ff" : "#8a9bc3" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
