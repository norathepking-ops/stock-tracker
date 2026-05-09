import { NextRequest } from "next/server";
import { fetchAnalysis } from "@/lib/yahoo/fetcher";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const data = await fetchAnalysis(symbol.toUpperCase());
  if (!data) {
    return Response.json({ error: "Analysis not available" }, { status: 404 });
  }
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
