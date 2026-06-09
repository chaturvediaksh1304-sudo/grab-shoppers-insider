"use client";

import { useEffect, useState } from "react";
import { Flame, Snowflake, Sparkles, Loader2 } from "lucide-react";
import { MACRO_ITEMS } from "@/lib/macro";
import { fetchItem, fetchForecast } from "@/lib/api-client";
import { TrendCard, type TrendCardData } from "@/components/ui/TrendCard";
import type { MacroItem } from "@/lib/types";

interface MacroBrowserProps {
  onSelect?: (query: string) => void;
  /** Preview mode (landing page): a single compact row. */
  preview?: boolean;
}

type State =
  | { kind: "loading" }
  | { kind: "ready"; cards: TrendCardData[] };

/**
 * Loads a card for a curated item. The hardcoded luxury image always renders;
 * the price + Prophet forecast come from the keyless Google Trends pipeline
 * (or live eBay when credentials are configured). Never throws — a network
 * failure yields a non-live card (image only).
 */
async function loadCard(item: MacroItem): Promise<TrendCardData> {
  const base: TrendCardData = {
    item,
    price: 0,
    currency: "USD",
    change: 0,
    direction: "STABLE",
    confidence: 0,
    forecastAvailable: false,
    history: [],
    live: false,
    estimated: false,
  };

  const res = await fetchItem(item.query);
  if (!res.ok || !res.data) return base;
  const trend = res.data;

  const fc = await fetchForecast(item.query, trend.history);
  const forecast = fc.data;

  return {
    item, // keep the curated luxury image
    price: trend.stats.current,
    currency: trend.currency,
    change: trend.change30,
    direction: forecast?.direction ?? "STABLE",
    confidence: forecast?.confidence ?? 0,
    forecastAvailable: forecast?.available ?? false,
    history: trend.history,
    live: true,
    estimated: trend.source === "estimate",
  };
}

export function MacroBrowser({ onSelect, preview = false }: MacroBrowserProps) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const items = preview ? MACRO_ITEMS.slice(0, 3) : MACRO_ITEMS;

    Promise.all(items.map(loadCard)).then((cards) => {
      if (!cancelled) setState({ kind: "ready", cards });
    });

    return () => {
      cancelled = true;
    };
  }, [preview]);

  if (state.kind === "loading") {
    return <SkeletonGrid count={preview ? 3 : 8} />;
  }

  const { cards } = state;
  const anyLive = cards.some((c) => c.live);

  if (preview) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.slice(0, 3).map((c) => (
          <TrendCard key={c.item.query} {...c} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  // Rare fallback: every request network-failed → show the curated grid (images).
  if (!anyLive) {
    return (
      <div className="flex flex-col gap-5">
        <MacroSection
          title="Luxury resale to watch"
          subtitle="Live data temporarily unavailable"
          icon={<Sparkles className="h-5 w-5 text-cobalt" />}
          cards={cards}
          onSelect={onSelect}
        />
      </div>
    );
  }

  const hot = cards.filter((c) => c.live && c.change >= 0).sort((a, b) => b.change - a.change);
  const cooling = cards.filter((c) => c.live && c.change < 0).sort((a, b) => a.change - b.change);
  const pending = cards.filter((c) => !c.live);

  return (
    <div className="flex flex-col gap-12">
      <MacroSection
        title="Hot right now"
        subtitle="Rising resale value"
        icon={<Flame className="h-5 w-5 text-down" />}
        cards={hot}
        onSelect={onSelect}
      />
      <MacroSection
        title="Cooling down"
        subtitle="Losing momentum"
        icon={<Snowflake className="h-5 w-5 text-cobalt" />}
        cards={cooling}
        onSelect={onSelect}
      />
      <MacroSection
        title="More to watch"
        subtitle=""
        icon={<Sparkles className="h-5 w-5 text-cobalt" />}
        cards={pending}
        onSelect={onSelect}
      />
    </div>
  );
}

function MacroSection({
  title,
  subtitle,
  icon,
  cards,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  cards: TrendCardData[];
  onSelect?: (q: string) => void;
}) {
  if (cards.length === 0) return null;
  return (
    <section>
      <div className="mb-5 flex items-baseline gap-3">
        {icon}
        <h2 className="font-display text-2xl italic">{title}</h2>
        {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <TrendCard key={c.item.query} {...c} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading luxury resale…
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-card border border-border bg-surface-muted"
          />
        ))}
      </div>
    </div>
  );
}
