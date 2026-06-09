"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SparklineChart } from "./SparklineChart";
import { ForecastBadge } from "./ForecastBadge";
import type { MacroItem, PricePoint, TrendDirection } from "@/lib/types";

export interface TrendCardData {
  item: MacroItem;
  price: number;
  currency: string;
  change: number; // % (e.g. 30-day)
  direction: TrendDirection;
  confidence: number;
  forecastAvailable: boolean;
  history: PricePoint[];
  /** True when price + forecast data is present (keyless Trends or live eBay). */
  live: boolean;
  /** True when `price` is a curated estimate (Trends-modeled), not a live quote. */
  estimated: boolean;
}

interface TrendCardProps extends TrendCardData {
  onSelect?: (query: string) => void;
}

function fmtPrice(v: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

/** Macro-browse card: product image, current price, 30-day change, sparkline, forecast. */
export function TrendCard({
  item,
  price,
  currency,
  change,
  direction,
  confidence,
  forecastAvailable,
  history,
  live,
  estimated,
  onSelect,
}: TrendCardProps) {
  const rising = change >= 0;
  const trend: "up" | "down" | "flat" = change > 0.5 ? "up" : change < -0.5 ? "down" : "flat";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(item.query)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface text-left shadow-card hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.label}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <span className="font-display text-3xl italic text-white/90">
              {item.label.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-pill bg-background/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted backdrop-blur">
          {item.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-snug text-foreground">{item.label}</h3>
          {live && (
            <ForecastBadge
              direction={direction}
              confidence={confidence}
              available={forecastAvailable}
              size="sm"
            />
          )}
        </div>

        {live ? (
          <>
            <div className="flex items-end justify-between gap-2">
              <span className="font-mono-data text-xl font-semibold text-foreground">
                {fmtPrice(price, currency)}
                {estimated && (
                  <span className="ml-1 align-top text-[10px] font-normal text-muted">est.</span>
                )}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 font-mono-data text-sm font-medium ${
                  rising ? "text-up" : "text-down"
                }`}
              >
                {rising ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {rising ? "+" : ""}
                {change.toFixed(1)}%
              </span>
            </div>

            <div className="mt-auto">
              <SparklineChart data={history} trend={trend} />
            </div>
          </>
        ) : (
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="font-mono-data text-sm text-muted">Tap to view trend</span>
            <span className="text-sm font-medium text-cobalt transition-transform group-hover:translate-x-0.5">
              View →
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
