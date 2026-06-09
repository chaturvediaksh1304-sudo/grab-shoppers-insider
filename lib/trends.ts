import type { TrendsPoint, TrendsSeries } from "./types";

// Google Trends fetcher. pytrends has no JS client, so the real call lives in
// the Python FastAPI microservice (`GET /trends?q=`) — one Python runtime hosts
// both Prophet and pytrends. pytrends is frequently rate-limited (HTTP 429), so
// any failure degrades gracefully to `available: false` rather than throwing.

const FORECAST_API_URL = process.env.FORECAST_API_URL ?? "http://127.0.0.1:8000";

interface TrendsApiResponse {
  points?: Array<{ date?: string; interest?: number }>;
  available?: boolean;
}

export async function getTrends(query: string): Promise<TrendsSeries> {
  const unavailable: TrendsSeries = {
    query,
    points: [],
    current: 0,
    change: 0,
    available: false,
  };

  try {
    const url = new URL("/trends", FORECAST_API_URL);
    url.searchParams.set("q", query);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, { signal: controller.signal }).finally(() =>
      clearTimeout(timer),
    );

    if (!res.ok) return unavailable;

    const data = (await res.json()) as TrendsApiResponse;
    if (data.available === false) return unavailable;

    const points: TrendsPoint[] = (data.points ?? [])
      .map((p) => ({
        date: String(p.date ?? ""),
        interest: Number(p.interest ?? 0),
      }))
      .filter((p) => p.date !== "" && Number.isFinite(p.interest));

    if (points.length === 0) return unavailable;

    return {
      query,
      points,
      current: points[points.length - 1].interest,
      change: recentChange(points),
      available: true,
    };
  } catch {
    return unavailable;
  }
}

/** % change in interest over roughly the trailing 30 days (~4 weekly points). */
function recentChange(points: TrendsPoint[]): number {
  if (points.length < 5) return 0;
  const last = points[points.length - 1].interest;
  const prior = points[points.length - 5].interest;
  if (prior === 0) return 0;
  return Math.round(((last - prior) / prior) * 1000) / 10;
}
