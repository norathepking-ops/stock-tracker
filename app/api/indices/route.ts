import { fetchMultiQuote, INDEX_SYMBOLS } from "@/lib/yahoo/fetcher";

export async function GET() {
  const data = await fetchMultiQuote(INDEX_SYMBOLS);
  return Response.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
