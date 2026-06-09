import { NextResponse } from "next/server";
import { getItemTrend } from "@/lib/insider";

// GET /api/search?q=<brand or item>
// Returns an ItemTrend: a price history modeled on the real Google Trends demand
// curve (anchored to a curated/estimated baseline), enriched with live eBay
// listings when credentials are configured. Runs fully keyless by default.
export async function GET(request: Request): Promise<NextResponse> {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter `q`." },
      { status: 400 },
    );
  }

  try {
    const data = await getItemTrend(q);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Unexpected error fetching item trend." },
      { status: 500 },
    );
  }
}
