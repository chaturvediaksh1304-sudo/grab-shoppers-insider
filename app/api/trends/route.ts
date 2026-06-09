import { NextResponse } from "next/server";
import { getTrends } from "@/lib/trends";
import { cached } from "@/lib/cache";

// GET /api/trends?q=<brand or item>
// Returns a Google Trends interest-over-time series. Always 200 — when pytrends
// is rate-limited the body carries `available: false` so the UI can degrade.
export async function GET(request: Request): Promise<NextResponse> {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter `q`." },
      { status: 400 },
    );
  }

  const data = await cached(`trends:${q.toLowerCase()}`, () => getTrends(q));
  return NextResponse.json(data);
}
