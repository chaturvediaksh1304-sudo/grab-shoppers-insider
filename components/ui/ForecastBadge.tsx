import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendDirection } from "@/lib/types";

interface ForecastBadgeProps {
  direction: TrendDirection;
  confidence: number;
  /** When false, render a muted "forecast unavailable" pill. */
  available?: boolean;
  size?: "sm" | "md";
}

const CONFIG: Record<
  TrendDirection,
  { label: string; icon: typeof TrendingUp; classes: string }
> = {
  UP: {
    label: "Rising",
    icon: TrendingUp,
    classes: "bg-up/12 text-up ring-up/20",
  },
  DOWN: {
    label: "Falling",
    icon: TrendingDown,
    classes: "bg-down/12 text-down ring-down/20",
  },
  STABLE: {
    label: "Stable",
    icon: Minus,
    classes: "bg-cobalt/10 text-cobalt ring-cobalt/20",
  },
};

/** UP / DOWN / STABLE forecast pill with a confidence percentage. */
export function ForecastBadge({
  direction,
  confidence,
  available = true,
  size = "md",
}: ForecastBadgeProps) {
  if (!available) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1.5 text-xs font-medium text-muted ring-1 ring-border">
        <Minus className="h-3.5 w-3.5" />
        Forecast unavailable
      </span>
    );
  }

  const { label, icon: Icon, classes } = CONFIG[direction];
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill font-semibold ring-1 ${classes} ${pad}`}
      title={`Prophet 30-day forecast: ${label} · ${confidence}% confidence`}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {label}
      <span className="font-mono-data font-normal opacity-80">{confidence}%</span>
    </span>
  );
}
