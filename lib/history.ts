import type { PriceStats, PricePoint, TrendsSeries } from "./types";

// Derives a price time series for the chart + Prophet input.
//
// We have no historical sold-price feed, so we ground the series in an anchor
// price `P` (a curated baseline, or the live eBay average when keys are set)
// shaped over time by the REAL Google Trends interest-over-time curve. Resale
// value tracks demand, so price drifts with the (smoothed, elasticity-damped)
// Trends curve, capped per step and anchored so the latest point equals `P`.
// When Trends is unavailable, we fall back to a deterministic seasonal
// synthesis so charts still render. Everything is seeded by the query → stable
// across calls (so the 5-min cache returns identical data).

const ELASTICITY = 0.12; // price moves ~12% as much as a normalized demand swing
const NOISE = 0.01; // ±1% seeded jitter so the line isn't unnaturally smooth
const SMOOTH_WINDOW = 8; // ~8-week moving average to de-spike noisy Trends data
const MAX_STEP = 0.05; // cap week-over-week move at ±5% (keeps luxury prices believable)
const MAX_BAND = 0.18; // clamp the whole series to ±18% of the base price

/** Trailing moving average (edge-clamped) — smooths a noisy series. */
function movingAverage(values: number[], window: number): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/** Deterministic string hash → 32-bit seed. */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — deterministic given a seed. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildDerivedHistory(
  query: string,
  stats: PriceStats,
  trends: TrendsSeries,
): PricePoint[] {
  const P = stats.current > 0 ? stats.current : stats.median || 100;
  const rand = rng(hashSeed(query));

  if (trends.available && trends.points.length >= 8) {
    // Smooth the (often spiky, low-volume) Trends curve before shaping price.
    const smoothed = movingAverage(
      trends.points.map((p) => p.interest),
      SMOOTH_WINDOW,
    );
    const mean = smoothed.reduce((a, b) => a + b, 0) / smoothed.length || 1;
    const denom = Math.max(mean, 12); // floor avoids blow-ups on tiny means
    // Anchor demand to the LATEST week so "now" naturally equals the base price
    // (no post-scaling, which would otherwise re-introduce drift past the band).
    const ref = smoothed[smoothed.length - 1];

    // Price walk: each step nudges toward the demand-implied level, capped at
    // ±MAX_STEP per week and clamped to an absolute ±MAX_BAND of the base — so
    // cumulative drift over a quarter stays believable for resale goods.
    const bandLo = P * (1 - MAX_BAND);
    const bandHi = P * (1 + MAX_BAND);
    const prices: number[] = [];
    let prev = P;
    for (let i = 0; i < smoothed.length; i++) {
      const demand = (smoothed[i] - ref) / denom; // swing relative to now
      const target = P * (1 + ELASTICITY * demand) * (1 + (rand() - 0.5) * 2 * NOISE);
      const stepped =
        i === 0 ? target : Math.min(prev * (1 + MAX_STEP), Math.max(prev * (1 - MAX_STEP), target));
      const next = Math.min(bandHi, Math.max(bandLo, stepped));
      prices.push(next);
      prev = next;
    }
    prices[prices.length - 1] = P; // exact anchor for "now"

    return trends.points.map((p, i) => ({ date: p.date, price: round2(prices[i]) }));
  }

  return synthesize(P, rand);
}

/** Fallback: 52 weekly points over the trailing year with seasonal drift. */
function synthesize(P: number, rand: () => number): PricePoint[] {
  const weeks = 52;
  const phase = rand() * Math.PI * 2;
  const drift = (rand() - 0.5) * 0.2; // up to ±20% total trend across the year
  const points: PricePoint[] = [];
  const today = new Date();

  for (let i = 0; i < weeks; i++) {
    const t = i / (weeks - 1); // 0 → 1
    const seasonal = 0.06 * Math.sin(phase + t * Math.PI * 2);
    const trend = drift * (t - 1); // ends near 0 so latest ≈ P
    const jitter = (rand() - 0.5) * 2 * NOISE;
    const d = new Date(today);
    d.setDate(d.getDate() - (weeks - 1 - i) * 7);
    points.push({ date: isoDate(d), price: round2(P * (1 + seasonal + trend + jitter)) });
  }
  // Anchor latest to P.
  const scale = P / (points[points.length - 1].price || P);
  return points.map((p) => ({ date: p.date, price: round2(p.price * scale) }));
}

/** % change between the latest point and roughly `days` ago (weekly cadence). */
export function computeChanges(history: PricePoint[]): {
  change30: number;
  change60: number;
  change90: number;
} {
  const pct = (weeksBack: number): number => {
    if (history.length === 0) return 0;
    const last = history[history.length - 1].price;
    const idx = Math.max(0, history.length - 1 - weeksBack);
    const prior = history[idx].price;
    if (prior === 0) return 0;
    return Math.round(((last - prior) / prior) * 1000) / 10;
  };
  return { change30: pct(4), change60: pct(8), change90: pct(13) };
}
