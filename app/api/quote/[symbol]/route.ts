import { NextRequest } from "next/server";
import { fetchQuote } from "@/lib/yahoo/fetcher";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const data = await fetchQuote(symbol.toUpperCase());
  if (!data) {
    return Response.json({ error: "Symbol not found" }, { status: 404 });
  }
  return Response.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
