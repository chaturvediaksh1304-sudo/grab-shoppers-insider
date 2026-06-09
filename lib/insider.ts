import { searchItems, computeStats } from "./ebay";
import { getTrends } from "./trends";
import { buildDerivedHistory, computeChanges } from "./history";
import { cached } from "./cache";
import { matchMacroItem, baseFor } from "./macro";
import type { ItemTrend, PriceStats, PricePoint } from "./types";

/**
 * Assembles the full item-trend payload for a query.
 *
 * The data engine is **Google Trends (real, keyless)** anchored to a curated
 * baseline price — the price history tracks the real demand curve and Prophet
 * forecasts it. eBay is an *optional* booster: when `EBAY_APP_ID` /
 * `EBAY_CLIENT_SECRET` are set, live eBay listings replace the estimated price
 * (`source: "ebay"`); otherwise we serve a clearly-flagged estimate
 * (`source: "estimate"`, `priceEstimated: true`). Cached 5 min (spec §9).
 */
export async function getItemTrend(query: string): Promise<ItemTrend> {
  const q = query.trim();
  return cached(`item:${q.toLowerCase()}`, async () => {
    const trends = await getTrends(q);
    const curated = matchMacroItem(q);

    // Optional real-eBay path — only when credentials are configured.
    if (hasEbayCreds()) {
      try {
        const listings = await searchItems(q);
        if (listings.length > 0) {
          const stats = computeStats(listings);
          const history = buildDerivedHistory(q, stats, trends);
          const { change30, change60, change90 } = computeChanges(history);
          const rep = listings.find((l) => l.image) ?? listings[0];
          return {
            query: q,
            title: rep?.title ?? curated?.label ?? q,
            image: rep?.image ?? curated?.image ?? null,
            currency: listings[0]?.currency ?? "USD",
            stats,
            change30,
            change60,
            change90,
            history,
            source: "ebay",
            derived: true,
            priceEstimated: false,
          };
        }
      } catch {
        // Fall through to the keyless estimate path on any eBay failure.
      }
    }

    // Keyless estimate: curated/estimated baseline price shaped by real Trends.
    const base = baseFor(q);
    const seed: PriceStats = { current: base, low: base, high: base, median: base, sampleSize: 0 };
    const history = buildDerivedHistory(q, seed, trends);
    const { change30, change60, change90 } = computeChanges(history);

    return {
      query: q,
      title: curated?.label ?? q,
      image: curated?.image ?? null,
      currency: "USD",
      stats: statsFrom(base, history, trends.available ? trends.points.length : 0),
      change30,
      change60,
      change90,
      history,
      source: "estimate",
      derived: true,
      priceEstimated: true,
    };
  });
}

function hasEbayCreds(): boolean {
  return Boolean(process.env.EBAY_APP_ID && process.env.EBAY_CLIENT_SECRET);
}

/** Builds stats from the derived history; `current` anchors to the base price. */
function statsFrom(current: number, history: PricePoint[], sampleSize: number): PriceStats {
  const prices = history.map((p) => p.price).sort((a, b) => a - b);
  const n = prices.length;
  const median = n === 0 ? current : n % 2 ? prices[(n - 1) / 2] : (prices[n / 2 - 1] + prices[n / 2]) / 2;
  return {
    current: round2(current),
    low: round2(n ? prices[0] : current),
    high: round2(n ? prices[n - 1] : current),
    median: round2(median),
    sampleSize,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
