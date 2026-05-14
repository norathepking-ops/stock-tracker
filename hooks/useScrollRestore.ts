"use client";

import { useEffect } from "react";

/**
 * Saves and restores the <main> scroll position for a given page key.
 * Works across tab switches (via BottomNav scroll={false}) and back-button
 * navigation (via sessionStorage persistence).
 */
export function useScrollRestore(key: string) {
  useEffect(() => {
    const container = document.querySelector("main");
    if (!container) return;

    // Restore saved position (use rAF + small delay so dynamic content can render)
    const saved = sessionStorage.getItem(`sp:${key}`);
    const timer = setTimeout(() => {
      container.scrollTop = saved ? parseInt(saved, 10) : 0;
    }, 80);

    // Continuously save scroll position so any navigation captures the latest value
    const onScroll = () => {
      sessionStorage.setItem(`sp:${key}`, String(container.scrollTop));
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      container.removeEventListener("scroll", onScroll);
    };
  }, [key]);
}
