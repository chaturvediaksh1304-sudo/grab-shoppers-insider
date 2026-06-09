import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import type { ForecastResult, PricePoint } from "@/lib/types";

const FORECAST_API_URL = process.env.FORECAST_API_URL ?? "http://127.0.0.1:8000";

// Allow up to 60s so the call can wait through a cold start of the (free-tier)
// Render ML service. Vercel Hobby caps function duration at 60s.
export const maxDuration = 60;

interface ForecastBody {
  query?: string;
  history?: PricePoint[];
  horizonDays?: number;
}

/** Graceful fallback when the Python ML service is unreachable. */
function unavailable(query: string | undefined, horizonDays: number): ForecastResult {
  return {
    query,
    direction: "STABLE",
    confidence: 0,
    horizonDays,
    changePercent: 0,
    forecast: [],
    available: false,
  };
}

// POST /api/forecast  { query, history: PricePoint[], horizonDays? }
// Forwards the item's derived price history to the Prophet FastAPI service.
export async function POST(request: Request): Promise<NextResponse> {
  let body: ForecastBody;
  try {
    body = (await request.json()) as ForecastBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const history = body.history ?? [];
  const horizonDays = body.horizonDays ?? 30;
  if (history.length < 2) {
    return NextResponse.json(
      { error: "`history` must contain at least 2 points." },
      { status: 400 },
    );
  }

  const key = `forecast:${(body.query ?? "").toLowerCase()}:${history.length}:${horizonDays}`;

  const result = await cached<ForecastResult>(key, async () => {
    try {
      const res = await fetch(new URL("/forecast", FORECAST_API_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: body.query,
          horizonDays,
          history: history.map((p) => ({ ds: p.date, y: p.price })),
        }),
      });
      if (!res.ok) return unavailable(body.query, horizonDays);
      return (await res.json()) as ForecastResult;
    } catch {
      return unavailable(body.query, horizonDays);
    }
  });

  return NextResponse.json(result);
}
