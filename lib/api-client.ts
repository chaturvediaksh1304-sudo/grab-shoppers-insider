import type { ItemTrend, TrendsSeries, ForecastResult, PricePoint } from "./types";

// Client-side fetchers for the browser. They hit the relative /api routes so
// all upstream credentials and Python calls stay server-side.

export interface Result<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(url, init);
    const body = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      return { ok: false, status: res.status, error: body.error ?? res.statusText };
    }
    return { ok: true, status: res.status, data: body as T };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : "Network error" };
  }
}

export function fetchItem(query: string): Promise<Result<ItemTrend>> {
  return getJson<ItemTrend>(`/api/search?q=${encodeURIComponent(query)}`);
}

export function fetchTrends(query: string): Promise<Result<TrendsSeries>> {
  return getJson<TrendsSeries>(`/api/trends?q=${encodeURIComponent(query)}`);
}

export function fetchForecast(
  query: string,
  history: PricePoint[],
): Promise<Result<ForecastResult>> {
  return getJson<ForecastResult>(`/api/forecast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, history }),
  });
}
