// Shared types for the Grab data + ML layers. Strict mode — no `any`.

export type TrendDirection = "UP" | "DOWN" | "STABLE";

/** A single point on a price time series. `date` is ISO `yyyy-mm-dd`. */
export interface PricePoint {
  date: string;
  price: number;
}

/** Aggregate stats computed across current eBay listings. */
export interface PriceStats {
  current: number; // average of current listing prices
  low: number;
  high: number;
  median: number;
  sampleSize: number;
}

/**
 * The full item trend payload returned by `/api/search`.
 * `history` is a price time series **derived** from the real current eBay
 * price distribution shaped by the real Google Trends curve — eBay's Browse
 * API exposes active listings, not historical sold prices. `derived` flags this.
 */
export interface ItemTrend {
  query: string;
  title: string;
  image: string | null;
  currency: string;
  stats: PriceStats;
  change30: number; // % change over the trailing 30 days of derived history
  change60: number;
  change90: number;
  history: PricePoint[];
  /** "ebay" = real eBay listings (when keys present); "estimate" = curated
   *  baseline price modeled on the real Google Trends demand curve. */
  source: "ebay" | "estimate";
  derived: boolean;
  /** True when `current` is a curated estimate rather than a live market price. */
  priceEstimated: boolean;
}

/** One weekly Google Trends interest reading (0–100). */
export interface TrendsPoint {
  date: string;
  interest: number;
}

/** Google Trends interest-over-time series for a query. */
export interface TrendsSeries {
  query: string;
  points: TrendsPoint[];
  current: number;
  change: number; // % change in interest over the trailing ~30 days
  available: boolean; // false when pytrends is rate-limited / unreachable
}

/** A single forecasted point from Prophet. */
export interface ForecastPoint {
  date: string;
  yhat: number;
  yhatLower: number;
  yhatUpper: number;
}

/** The forecast payload returned by `/api/forecast`. */
export interface ForecastResult {
  query?: string;
  direction: TrendDirection;
  confidence: number; // 0–100
  horizonDays: number;
  changePercent: number; // predicted % change across the horizon
  forecast: ForecastPoint[];
  available: boolean; // false when the ML service is unreachable
}

/** A curated macro-browse item (seeds the Hot / Cooling grids). */
export interface MacroItem {
  query: string;
  label: string;
  category: string;
  image: string;
  /** Approx real resale baseline price (USD) — anchors the estimated index. */
  basePrice: number;
}

/** A normalized eBay listing (internal — not returned to the client). */
export interface EbayListing {
  title: string;
  price: number;
  currency: string;
  image: string | null;
  url: string | null;
}
