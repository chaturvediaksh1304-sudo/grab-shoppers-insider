import { GET } from "@/app/api/search/route";
import { getItemTrend } from "@/lib/insider";
import type { ItemTrend } from "@/lib/types";

jest.mock("@/lib/insider", () => ({ getItemTrend: jest.fn() }));

const mockGetItemTrend = getItemTrend as jest.MockedFunction<typeof getItemTrend>;

function req(url: string): Request {
  return new Request(url);
}

const ebaySample: ItemTrend = {
  query: "nike air force 1",
  title: "Nike Air Force 1 '07",
  image: "https://i.ebayimg.com/x.jpg",
  currency: "USD",
  stats: { current: 95, low: 60, high: 140, median: 92, sampleSize: 42 },
  change30: 3.2,
  change60: -1.1,
  change90: 5.4,
  history: [
    { date: "2025-05-01", price: 90 },
    { date: "2025-06-01", price: 95 },
  ],
  source: "ebay",
  derived: true,
  priceEstimated: false,
};

const estimateSample: ItemTrend = {
  ...ebaySample,
  query: "gucci gg marmont bag",
  title: "Gucci GG Marmont",
  image: null,
  stats: { current: 1500, low: 1340, high: 1660, median: 1500, sampleSize: 52 },
  source: "estimate",
  priceEstimated: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/search", () => {
  it("returns 200 with the item trend on the happy path", async () => {
    mockGetItemTrend.mockResolvedValue(ebaySample);
    const res = await GET(req("http://localhost/api/search?q=nike%20air%20force%201"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ItemTrend;
    expect(body.query).toBe("nike air force 1");
    expect(body.stats.sampleSize).toBe(42);
    expect(body.history).toHaveLength(2);
    expect(mockGetItemTrend).toHaveBeenCalledWith("nike air force 1");
  });

  it("returns 200 with an estimate when eBay keys are absent (keyless default)", async () => {
    mockGetItemTrend.mockResolvedValue(estimateSample);
    const res = await GET(req("http://localhost/api/search?q=gucci%20gg%20marmont%20bag"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ItemTrend;
    expect(body.source).toBe("estimate");
    expect(body.priceEstimated).toBe(true);
    expect(body.stats.current).toBe(1500);
  });

  it("returns 400 when q is missing", async () => {
    const res = await GET(req("http://localhost/api/search"));
    expect(res.status).toBe(400);
    expect(mockGetItemTrend).not.toHaveBeenCalled();
  });

  it("returns 500 when assembly throws unexpectedly", async () => {
    mockGetItemTrend.mockRejectedValue(new Error("boom"));
    const res = await GET(req("http://localhost/api/search?q=nike"));
    expect(res.status).toBe(500);
  });
});
