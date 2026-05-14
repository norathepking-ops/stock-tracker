"use client";

import { useEffect } from "react";
import { capturePrompt, type BeforeInstallPromptEvent } from "@/lib/utils/pwaInstall";

export default function PwaRegistration() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Capture the install prompt as early as possible
    const handler = (e: Event) => {
      e.preventDefault();
      capturePrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null;
}
