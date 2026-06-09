import { GET } from "@/app/api/trends/route";
import { getTrends } from "@/lib/trends";
import { clearCache } from "@/lib/cache";
import type { TrendsSeries } from "@/lib/types";

jest.mock("@/lib/trends", () => ({ getTrends: jest.fn() }));

const mockGetTrends = getTrends as jest.MockedFunction<typeof getTrends>;

function req(url: string): Request {
  return new Request(url);
}

beforeEach(() => {
  jest.clearAllMocks();
  clearCache();
});

describe("GET /api/trends", () => {
  it("returns 200 with the interest series on the happy path", async () => {
    const series: TrendsSeries = {
      query: "levis 501",
      points: [
        { date: "2025-05-04", interest: 70 },
        { date: "2025-05-11", interest: 80 },
      ],
      current: 80,
      change: 14.3,
      available: true,
    };
    mockGetTrends.mockResolvedValue(series);
    const res = await GET(req("http://localhost/api/trends?q=levis%20501"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as TrendsSeries;
    expect(body.available).toBe(true);
    expect(body.points).toHaveLength(2);
    expect(mockGetTrends).toHaveBeenCalledWith("levis 501");
  });

  it("returns 400 when q is missing", async () => {
    const res = await GET(req("http://localhost/api/trends"));
    expect(res.status).toBe(400);
    expect(mockGetTrends).not.toHaveBeenCalled();
  });

  it("returns 200 with available:false when pytrends is unavailable", async () => {
    mockGetTrends.mockResolvedValue({
      query: "obscure",
      points: [],
      current: 0,
      change: 0,
      available: false,
    });
    const res = await GET(req("http://localhost/api/trends?q=obscure"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as TrendsSeries;
    expect(body.available).toBe(false);
    expect(body.points).toHaveLength(0);
  });
});
