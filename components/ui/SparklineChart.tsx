"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import type { PricePoint } from "@/lib/types";

interface SparklineChartProps {
  data: PricePoint[];
  /** "up" → sage, "down" → coral, else cobalt. */
  trend?: "up" | "down" | "flat";
  height?: number;
}

const COLOR = {
  up: "#4CAF82",
  down: "#E05555",
  flat: "#1A3FD4",
} as const;

/** Tiny axis-less price sparkline for cards. */
export function SparklineChart({ data, trend = "flat", height = 44 }: SparklineChartProps) {
  const color = COLOR[trend];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
