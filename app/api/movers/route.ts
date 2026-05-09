import { NextRequest } from "next/server";
import { fetchMultiQuote, MARKET_MOVERS_SYMBOLS } from "@/lib/yahoo/fetcher";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "gainers";

  const quotes = await fetchMultiQuote(MARKET_MOVERS_SYMBOLS);

  let sorted = [...quotes];
  if (type === "gainers") {
    sorted = sorted.sort(
      (a, b) => b.regularMarketChangePercent - a.regularMarketChangePercent
    );
  } else if (type === "losers") {
    sorted = sorted.sort(
      (a, b) => a.regularMarketChangePercent - b.regularMarketChangePercent
    );
  } else if (type === "active") {
    sorted = sorted.sort(
      (a, b) => b.regularMarketVolume - a.regularMarketVolume
    );
  }

  return Response.json(sorted.slice(0, 20), {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
