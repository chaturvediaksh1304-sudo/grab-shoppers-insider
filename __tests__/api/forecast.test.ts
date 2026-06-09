import { POST } from "@/app/api/forecast/route";
import { clearCache } from "@/lib/cache";
import type { ForecastResult, PricePoint } from "@/lib/types";

function req(body: unknown): Request {
  return new Request("http://localhost/api/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const history: PricePoint[] = [
  { date: "2025-04-01", price: 90 },
  { date: "2025-05-01", price: 93 },
  { date: "2025-06-01", price: 97 },
];

beforeEach(() => {
  jest.restoreAllMocks();
  clearCache();
});

describe("POST /api/forecast", () => {
  it("returns the forecast from the ML service on the happy path", async () => {
    const mlResult: ForecastResult = {
      query: "nike air force 1",
      direction: "UP",
      confidence: 78,
      horizonDays: 30,
      changePercent: 4.1,
      forecast: [{ date: "2025-07-01", yhat: 101, yhatLower: 96, yhatUpper: 106 }],
      available: true,
    };
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mlResult), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const res = await POST(req({ query: "nike air force 1", history }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ForecastResult;
    expect(body.direction).toBe("UP");
    expect(body.available).toBe(true);

    // Verify it POSTed ds/y mapped history to the ML service.
    const sent = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(sent.history[0]).toEqual({ ds: "2025-04-01", y: 90 });
  });

  it("returns 400 when history has fewer than 2 points", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    const res = await POST(req({ query: "x", history: [{ date: "2025-06-01", price: 90 }] }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("degrades to available:false when the ML service is down", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await POST(req({ query: "levis 501", history }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as ForecastResult;
    expect(body.available).toBe(false);
    expect(body.direction).toBe("STABLE");
  });
});
