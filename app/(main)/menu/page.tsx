"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPrompt, clearPrompt, onPromptChange } from "@/lib/utils/pwaInstall";

function useInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    setCanInstall(getPrompt() !== null);
    return onPromptChange(() => setCanInstall(getPrompt() !== null));
  }, []);

  return { canInstall, installed };
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// iOS step-by-step modal
function IosModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl px-5 pb-10 pt-5"
        style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#1e2a42" }} />
        <p className="text-white font-bold text-[17px] mb-1">Add to Home Screen</p>
        <p className="text-[13px] mb-5" style={{ color: "#8a9bc3" }}>
          Follow these 3 steps in Safari:
        </p>
        <div className="flex flex-col gap-4">
          {[
            { n: "1", text: "Tap the Share icon at the bottom of Safari (the square with an arrow)" },
            { n: "2", text: 'Scroll down the share sheet and tap "Add to Home Screen"' },
            { n: "3", text: 'Tap "Add" in the top-right corner to finish' },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[13px]"
                style={{ background: "#00C087" }}
              >
                {n}
              </div>
              <p className="text-white text-[14px] leading-snug pt-0.5">{text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl text-white font-semibold text-[15px]"
          style={{ background: "#1e2a42" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { canInstall, installed } = useInstall();
  const [showIos, setShowIos] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    setIosDevice(isIos());
  }, []);

  async function handleAndroidInstall() {
    const p = getPrompt();
    if (!p) return;
    await p.prompt();
    const { outcome } = await p.userChoice;
    if (outcome === "accepted") clearPrompt();
  }

  const NAV_ITEMS = [
    { label: "Watchlist", href: "/watchlist", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="3" rx="1.5" fill="#8a9bc3"/>
        <rect x="3" y="10.5" width="12" height="3" rx="1.5" fill="#8a9bc3"/>
        <rect x="3" y="18" width="14" height="3" rx="1.5" fill="#8a9bc3"/>
      </svg>
    )},
    { label: "Markets", href: "/markets", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polyline points="3,17 9,11 13,15 21,7" stroke="#8a9bc3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { label: "News", href: "/news", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#8a9bc3" strokeWidth="1.5"/>
        <line x1="7" y1="9" x2="17" y2="9" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="7" y1="13" x2="14" y2="13" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )},
    { label: "Explore", href: "/explore", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="#8a9bc3" strokeWidth="1.5"/>
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#8a9bc3" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )},
  ];

  return (
    <div className="flex flex-col min-h-full pb-4">
      {showIos && <IosModal onClose={() => setShowIos(false)} />}

      {/* Header */}
      <div className="px-4 pt-14 pb-3" style={{ borderBottom: "1px solid #1e2a42" }}>
        <h1 className="text-[18px] font-bold text-white">Menu</h1>
      </div>

      {/* Navigation */}
      <div className="divide-y" style={{ borderColor: "#1e2a42" }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 px-4 py-4 active:opacity-70 transition-opacity"
          >
            <div className="w-8 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <span className="text-[15px] text-white">{item.label}</span>
            <svg className="ml-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="#8a9bc3" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* ── Download section ── */}
      <div className="px-4 mt-6">
        <p className="text-[11px] font-bold text-wb-muted uppercase tracking-wider mb-3">
          Download
        </p>

        {/* App card */}
        <div
          className="rounded-2xl p-4 mb-3 flex items-center gap-4"
          style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
        >
          {/* App icon */}
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-end justify-center gap-1 pb-2"
            style={{ background: "#0a0e17" }}
          >
            <div style={{ width: 7, height: 12, background: "#1e2a42", borderRadius: 2 }} />
            <div style={{ width: 7, height: 20, background: "#00C087", borderRadius: 2 }} />
            <div style={{ width: 7, height: 15, background: "#00C087", borderRadius: 2 }} />
            <div style={{ width: 7, height: 26, background: "#00C087", borderRadius: 2 }} />
          </div>
          <div>
            <p className="text-white font-bold text-[16px] leading-tight">Stockdash</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#8a9bc3" }}>
              Real-time stock tracker
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "#00C087" }}>
              Free · No account needed
            </p>
          </div>
        </div>

        {installed ? (
          /* Already installed */
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#00C087" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-[14px]">App installed</p>
              <p className="text-[12px]" style={{ color: "#8a9bc3" }}>You&apos;re using the installed version</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Android / Chrome */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Android icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18a2 2 0 01-2-2V9a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2" stroke="#a4c639" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 13h18M8 7l-1.5-3M16 7l1.5-3" stroke="#a4c639" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="11" r="1" fill="#a4c639"/>
                  <circle cx="15" cy="11" r="1" fill="#a4c639"/>
                  <rect x="7" y="18" width="2" height="3" rx="1" fill="#a4c639"/>
                  <rect x="15" y="18" width="2" height="3" rx="1" fill="#a4c639"/>
                </svg>
                <p className="text-white font-semibold text-[14px]">Android · Chrome</p>
              </div>
              {canInstall ? (
                <button
                  onClick={handleAndroidInstall}
                  className="w-full py-3 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2"
                  style={{ background: "#00C087" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v13m0 0l-4-4m4 4l4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 20h16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Install Now
                </button>
              ) : (
                <div
                  className="w-full py-3 rounded-xl text-center text-[13px]"
                  style={{ background: "#1e2a42", color: "#8a9bc3" }}
                >
                  Open this page in Chrome on Android
                </div>
              )}
            </div>

            {/* iOS / Safari */}
            <div
              className="rounded-2xl p-4"
              style={{ background: "#151b2d", border: "1px solid #1e2a42" }}
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Apple icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M16.5 3.5c-.6.7-1.6 1.2-2.5 1.1-.1-.9.3-1.9.9-2.5.6-.7 1.7-1.2 2.5-1.1.1 1-.3 1.9-.9 2.5z" fill="#aaa"/>
                  <path d="M20 17.5c-.4.9-.6 1.3-1.1 2.1-.7 1.1-1.8 2.4-3 2.4-1.1 0-1.4-.7-3-.7-1.5 0-1.9.7-3 .7-1.2 0-2.2-1.2-2.9-2.3C5 17.4 4 13.1 5.5 10.1c1-1.9 2.8-3.1 4.7-3.1 1.3 0 2.4.8 3.3.8.9 0 2.5-1 3.8-.9 1.3.1 2.5.7 3.2 1.9-2.8 1.7-2.3 5.4.5 6.7z" fill="#aaa"/>
                </svg>
                <p className="text-white font-semibold text-[14px]">iPhone · iPad (Safari)</p>
              </div>
              <button
                onClick={() => setShowIos(true)}
                className="w-full py-3 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2"
                style={{ background: iosDevice ? "#00C087" : "#1e2a42" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V3m0-3l-4 4m4-4l4 4" stroke={iosDevice ? "white" : "#8a9bc3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="3" y="14" width="18" height="7" rx="2" stroke={iosDevice ? "white" : "#8a9bc3"} strokeWidth="1.5"/>
                </svg>
                <span style={{ color: iosDevice ? "white" : "#8a9bc3" }}>See Instructions</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-5 mt-4">
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
