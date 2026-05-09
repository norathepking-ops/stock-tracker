import { NextRequest } from "next/server";
import { fetchNews } from "@/lib/yahoo/fetcher";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const data = await fetchNews(symbol.toUpperCase());
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=120" },
  });
}
