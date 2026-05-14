export type MarketSession = "REGULAR" | "PRE" | "AFTER" | "NIGHT";

export function getMarketSession(): MarketSession {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const h = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  const m = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
  const totalMin = h * 60 + m;

  const PRE_START = 4 * 60;         // 04:00 ET
  const MARKET_OPEN = 9 * 60 + 30;  // 09:30 ET
  const MARKET_CLOSE = 16 * 60;     // 16:00 ET
  const AFTER_END = 20 * 60;        // 20:00 ET

  if (totalMin >= MARKET_OPEN && totalMin < MARKET_CLOSE) return "REGULAR";
  if (totalMin >= MARKET_CLOSE && totalMin < AFTER_END) return "AFTER";
  if (totalMin >= PRE_START && totalMin < MARKET_OPEN) return "PRE";
  return "NIGHT"; // 20:00 – 04:00 ET
}

export function getSessionLabel(session: MarketSession): string | null {
  switch (session) {
    case "PRE": return "Pre";
    case "AFTER": return "After";
    case "NIGHT": return "Night";
    default: return null;
  }
}
