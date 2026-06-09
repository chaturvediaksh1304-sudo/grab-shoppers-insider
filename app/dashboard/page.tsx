"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { PriceChart } from "@/components/ui/PriceChart";
import { ForecastBadge } from "@/components/ui/ForecastBadge";
import { MacroBrowser } from "@/components/sections/MacroBrowser";
import { fetchItem, fetchTrends, fetchForecast } from "@/lib/api-client";
import type { ItemTrend, TrendsSeries, ForecastResult } from "@/lib/types";

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [item, setItem] = useState<ItemTrend | null>(null);
  const [trends, setTrends] = useState<TrendsSeries | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    setLoading(true);
    setError(null);
    setTrends(null);
    setForecast(null);

    const res = await fetchItem(q);
    if (!res.ok || !res.data) {
      setItem(null);
      setError(res.error ?? "Search failed.");
      setLoading(false);
      return;
    }
    setItem(res.data);

    const [tr, fc] = await Promise.all([
      fetchTrends(q),
      fetchForecast(q, res.data.history),
    ]);
    setTrends(tr.data ?? null);
    setForecast(fc.data ?? null);
    setLoading(false);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Auto-run a search when arriving via /dashboard?q=... (from landing cards).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q && q.trim().length >= 2) {
      handleSearch(q.trim());
    }
  }, [handleSearch]);

  return (
    <div className="surface-dashboard min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <header className="mb-6">
          <h1 className="font-display text-3xl italic sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-muted">
            Search any brand or item for live resale prices, search-interest, and a
            30-day price forecast.
          </p>
        </header>

        <SearchBar onSearch={handleSearch} loading={loading} initialValue={query} />

        {error && <ErrorPanel message={error} />}

        {item && !error && (
          <ResultPanel item={item} trends={trends} forecast={forecast} />
        )}

        <div className="mt-14">
          <MacroBrowser onSelect={handleSearch} />
        </div>
      </div>
    </div>
  );
}

function fmt(v: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

function ResultPanel({
  item,
  trends,
  forecast,
}: {
  item: ItemTrend;
  trends: TrendsSeries | null;
  forecast: ForecastResult | null;
}) {
  return (
    <section className="mt-8 rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl italic capitalize">{item.query}</h2>
          <p className="mt-1 line-clamp-1 text-sm text-muted">{item.title}</p>
        </div>
        <ForecastBadge
          direction={forecast?.direction ?? "STABLE"}
          confidence={forecast?.confidence ?? 0}
          available={forecast?.available ?? false}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label={item.priceEstimated ? "Est. resale" : "Avg resale"}
          value={fmt(item.stats.current, item.currency)}
        />
        <Stat
          label="Range"
          value={`${fmt(item.stats.low, item.currency)} – ${fmt(item.stats.high, item.currency)}`}
        />
        <Stat label="30-day" value={`${signed(item.change30)}%`} tone={item.change30} />
        <Stat label="90-day" value={`${signed(item.change90)}%`} tone={item.change90} />
      </div>

      <div className="mt-7">
        <PriceChart
          history={item.history}
          trends={trends?.available ? trends.points : undefined}
          forecast={forecast?.available ? forecast.forecast : undefined}
          currency={item.currency}
        />
      </div>

      <p className="mt-3 text-xs text-muted">
        {item.source === "ebay"
          ? `Resale price from ${item.stats.sampleSize} live eBay listings. `
          : "Estimated resale index — a curated baseline price shaped by real Google Trends demand. "}
        {trends?.available
          ? "Interest = Google Trends search demand (0–100)."
          : "Google Trends interest temporarily unavailable."}{" "}
        Forecast by Prophet on the demand-shaped price curve.
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: number;
}) {
  const toneClass =
    tone === undefined
      ? "text-foreground"
      : tone > 0
        ? "text-up"
        : tone < 0
          ? "text-down"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface-muted/60 p-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-mono-data text-base font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function signed(n: number): string {
  return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
}

function ErrorPanel({ message }: { message: string }) {
  const credsMissing = /credential/i.test(message);
  return (
    <div className="mt-6 flex items-start gap-3 rounded-card border border-border bg-surface p-5 text-sm">
      <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" />
      <div>
        <p className="font-medium text-foreground">
          {credsMissing ? "Add your eBay API keys" : "Search failed"}
        </p>
        <p className="mt-1 text-muted">
          {credsMissing
            ? "Paste EBAY_APP_ID and EBAY_CLIENT_SECRET into .env.local and restart the dev server."
            : message}
        </p>
      </div>
    </div>
  );
}
