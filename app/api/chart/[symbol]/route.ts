import { NextRequest } from "next/server";
import { fetchChart } from "@/lib/yahoo/fetcher";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const range = req.nextUrl.searchParams.get("range") || "3mo";
  const interval = req.nextUrl.searchParams.get("interval") || "1d";

  const data = await fetchChart(symbol.toUpperCase(), range);
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
