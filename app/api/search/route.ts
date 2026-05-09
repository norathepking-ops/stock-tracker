import { NextRequest } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.trim().length < 1) return Response.json([]);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (yf as any).search(q, {
      quotesCount: 10,
      newsCount: 0,
    }, { validateResult: false }) as any;

    const quotes = (result?.quotes || [])
      .filter((r: { quoteType?: string }) =>
        ["EQUITY", "ETF", "INDEX", "MUTUALFUND"].includes(r.quoteType || "")
      )
      .map((r: {
        symbol?: string;
        shortname?: string;
        longname?: string;
        exchange?: string;
        quoteType?: string;
      }) => ({
        symbol: r.symbol,
        shortname: r.shortname || r.symbol,
        longname: r.longname || r.shortname || r.symbol,
        exchange: r.exchange || "US",
        quoteType: r.quoteType,
      }));

    return Response.json(quotes);
  } catch (err) {
    console.error("Search error:", err);
    return Response.json([]);
  }
}
