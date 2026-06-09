"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { useMemo } from "react";
import type { ForecastPoint, PricePoint, TrendsPoint } from "@/lib/types";

interface PriceChartProps {
  history: PricePoint[];
  trends?: TrendsPoint[];
  forecast?: ForecastPoint[];
  currency?: string;
}

interface Row {
  date: string;
  price?: number;
  interest?: number;
  yhat?: number;
  band?: [number, number];
}

const COBALT = "#1A3FD4";
const SLATE = "#8b8fa3";

function fmtMonth(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Main item chart: historical price (cobalt) + Prophet 30-day forecast
 * (dashed, with an uncertainty band) on the left axis, and Google Trends
 * interest (slate area) on the right axis. A reference line marks "now".
 */
export function PriceChart({ history, trends, forecast, currency = "USD" }: PriceChartProps) {
  const { rows, nowDate } = useMemo(() => buildRows(history, trends, forecast), [
    history,
    trends,
    forecast,
  ]);

  const fmtPrice = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id="interestFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SLATE} stopOpacity={0.18} />
            <stop offset="100%" stopColor={SLATE} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COBALT} stopOpacity={0.14} />
            <stop offset="100%" stopColor={COBALT} stopOpacity={0.03} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e0" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtMonth}
          tick={{ fontSize: 11, fill: "#6b6b70", fontFamily: "var(--font-jetbrains)" }}
          minTickGap={40}
          tickLine={false}
          axisLine={{ stroke: "#e8e6e0" }}
        />
        <YAxis
          yAxisId="price"
          tickFormatter={fmtPrice}
          tick={{ fontSize: 11, fill: "#6b6b70", fontFamily: "var(--font-jetbrains)" }}
          width={56}
          tickLine={false}
          axisLine={false}
          domain={["auto", "auto"]}
        />
        <YAxis
          yAxisId="interest"
          orientation="right"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: SLATE, fontFamily: "var(--font-jetbrains)" }}
          width={32}
          tickLine={false}
          axisLine={false}
        />

        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e8e6e0",
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
          }}
          labelFormatter={(l) => fmtMonth(String(l))}
          formatter={(value, name) => {
            if (value == null) return ["—", name];
            if (name === "Interest") return [`${Math.round(Number(value))}/100`, name];
            if (name === "Forecast band") return ["", ""];
            return [fmtPrice(Number(value)), name];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-dm-sans)" }}
          iconType="plainline"
        />

        <Area
          yAxisId="interest"
          type="monotone"
          dataKey="interest"
          name="Interest"
          stroke={SLATE}
          strokeWidth={1.5}
          fill="url(#interestFill)"
          connectNulls
          isAnimationActive
          animationDuration={1200}
        />

        <Area
          yAxisId="price"
          type="monotone"
          dataKey="band"
          name="Forecast band"
          stroke="none"
          fill="url(#bandFill)"
          connectNulls
          isAnimationActive={false}
          legendType="none"
        />

        <Line
          yAxisId="price"
          type="monotone"
          dataKey="price"
          name="Resale price"
          stroke={COBALT}
          strokeWidth={2.5}
          dot={false}
          connectNulls
          isAnimationActive
          animationDuration={1500}
        />

        <Line
          yAxisId="price"
          type="monotone"
          dataKey="yhat"
          name="Forecast"
          stroke={COBALT}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          connectNulls
          isAnimationActive
          animationDuration={1500}
        />

        {nowDate && (
          <ReferenceLine
            yAxisId="price"
            x={nowDate}
            stroke="#b9b6ad"
            strokeDasharray="2 4"
            label={{ value: "now", position: "insideTopRight", fontSize: 10, fill: "#9a978d" }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Merges the three series onto a shared, date-sorted axis. */
function buildRows(
  history: PricePoint[],
  trends?: TrendsPoint[],
  forecast?: ForecastPoint[],
): { rows: Row[]; nowDate: string | null } {
  const byDate = new Map<string, Row>();
  const get = (date: string): Row => {
    let r = byDate.get(date);
    if (!r) {
      r = { date };
      byDate.set(date, r);
    }
    return r;
  };

  for (const p of history) get(p.date).price = p.price;
  for (const t of trends ?? []) get(t.date).interest = t.interest;

  const nowDate = history.length ? history[history.length - 1].date : null;

  if (forecast && forecast.length && nowDate) {
    // Connect the dashed forecast to the last actual price.
    const anchor = get(nowDate);
    anchor.yhat = anchor.price;
    anchor.band = anchor.price != null ? [anchor.price, anchor.price] : undefined;
    for (const f of forecast) {
      const r = get(f.date);
      r.yhat = f.yhat;
      r.band = [f.yhatLower, f.yhatUpper];
    }
  }

  const rows = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  return { rows, nowDate };
}
