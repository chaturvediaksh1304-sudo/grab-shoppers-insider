import type { EbayListing, PriceStats } from "./types";

// eBay Browse API client — OAuth2 client-credentials flow with an in-memory
// token cache. Returns ACTIVE listings (Browse API has no sold-price history).

const OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const SCOPE = "https://api.ebay.com/oauth/api_scope";
const MARKETPLACE = "EBAY_US";

/** Thrown when eBay credentials are missing — the route maps this to 503. */
export class EbayCredentialsError extends Error {
  constructor(message = "Missing eBay credentials (EBAY_APP_ID / EBAY_CLIENT_SECRET).") {
    super(message);
    this.name = "EbayCredentialsError";
  }
}

/** Thrown when eBay returns a non-2xx response — the route maps this to 502. */
export class EbayApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "EbayApiError";
  }
}

interface CachedToken {
  token: string;
  expires: number; // epoch ms
}
let tokenCache: CachedToken | null = null;

/** Fetches (and caches) an application access token via client credentials. */
export async function getAccessToken(): Promise<string> {
  const appId = process.env.EBAY_APP_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!appId || !secret) {
    throw new EbayCredentialsError();
  }

  if (tokenCache && tokenCache.expires > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const basic = Buffer.from(`${appId}:${secret}`).toString("base64");
  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: SCOPE,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new EbayApiError(`eBay OAuth failed (${res.status}): ${text}`, res.status);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
  };
  return tokenCache.token;
}

// Minimal shape of the Browse API response we consume.
interface BrowseResponse {
  itemSummaries?: Array<{
    title?: string;
    price?: { value?: string; currency?: string };
    image?: { imageUrl?: string };
    thumbnailImages?: Array<{ imageUrl?: string }>;
    itemWebUrl?: string;
  }>;
}

/**
 * Searches active fixed-price eBay listings for `query` and returns up to
 * `limit` normalized listings (priced items only).
 */
export async function searchItems(query: string, limit = 50): Promise<EbayListing[]> {
  const token = await getAccessToken();
  const url = new URL(BROWSE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("filter", "buyingOptions:{FIXED_PRICE}");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new EbayApiError(`eBay Browse failed (${res.status}): ${text}`, res.status);
  }

  const data = (await res.json()) as BrowseResponse;
  const summaries = data.itemSummaries ?? [];

  return summaries
    .map((s): EbayListing | null => {
      const value = s.price?.value ? Number.parseFloat(s.price.value) : NaN;
      if (!Number.isFinite(value) || value <= 0) return null;
      return {
        title: s.title ?? query,
        price: value,
        currency: s.price?.currency ?? "USD",
        image: s.image?.imageUrl ?? s.thumbnailImages?.[0]?.imageUrl ?? null,
        url: s.itemWebUrl ?? null,
      };
    })
    .filter((l): l is EbayListing => l !== null);
}

/** Computes avg / low / high / median across listing prices. */
export function computeStats(listings: EbayListing[]): PriceStats {
  const prices = listings.map((l) => l.price).sort((a, b) => a - b);
  const n = prices.length;
  if (n === 0) {
    return { current: 0, low: 0, high: 0, median: 0, sampleSize: 0 };
  }
  const sum = prices.reduce((acc, p) => acc + p, 0);
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];
  return {
    current: round2(sum / n),
    low: round2(prices[0]),
    high: round2(prices[n - 1]),
    median: round2(median),
    sampleSize: n,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
