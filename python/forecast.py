"""Prophet price forecast for Grab — Shoppers Insider.

Takes a price history (list of {ds, y}) and forecasts the next N days, returning
a UP / DOWN / STABLE direction + a confidence score derived from the prediction
interval width.

Server use:   imported by app.py (FastAPI POST /forecast)
CLI demo:     python forecast.py --item "nike air force 1"
"""
from __future__ import annotations

import argparse
import json
import math
from typing import Dict, List, Optional

# Movement thresholds (percent) for the direction badge.
UP_THRESHOLD = 1.5
DOWN_THRESHOLD = -1.5


def run_forecast(
    history: List[Dict[str, float]], horizon_days: int = 30, query: Optional[str] = None
) -> Dict[str, object]:
    """Fit Prophet on `history` and forecast `horizon_days` ahead.

    history: [{"ds": "2025-01-05", "y": 95.0}, ...] (>= 2 points).
    """
    if not history or len(history) < 2:
        raise ValueError("history must contain at least 2 points")

    # Imported lazily so the module imports cheaply (and tests can stub it).
    import pandas as pd
    from prophet import Prophet

    df = pd.DataFrame(history)
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"])
    df = df.dropna().sort_values("ds")

    # Trend-only model. Our derived history spans ~1 year of weekly points —
    # too short to fit a yearly cycle, and enabling seasonality makes Prophet
    # overfit and extrapolate absurdly over a 30-day horizon. A regularized
    # piecewise-linear trend with uncertainty intervals is the robust choice
    # for a directional (UP/DOWN/STABLE) price forecast.
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=False,
        yearly_seasonality=False,
        changepoint_prior_scale=0.08,
        interval_width=0.8,
    )
    # Quiet cmdstanpy logging noise.
    import logging

    logging.getLogger("prophet").setLevel(logging.ERROR)
    logging.getLogger("cmdstanpy").setLevel(logging.ERROR)

    model.fit(df)

    future = model.make_future_dataframe(periods=horizon_days, freq="D")
    forecast = model.predict(future)
    tail = forecast.tail(horizon_days)

    last_actual = float(df["y"].iloc[-1])
    last_yhat = float(tail["yhat"].iloc[-1])
    change_percent = ((last_yhat - last_actual) / last_actual) * 100 if last_actual else 0.0

    if change_percent > UP_THRESHOLD:
        direction = "UP"
    elif change_percent < DOWN_THRESHOLD:
        direction = "DOWN"
    else:
        direction = "STABLE"

    # Confidence: tighter relative interval → higher confidence.
    mean_width = float((tail["yhat_upper"] - tail["yhat_lower"]).mean())
    rel_width = mean_width / max(last_yhat, 1e-6)
    confidence = int(max(20, min(95, round((1 - min(rel_width, 1.0)) * 100))))

    points = [
        {
            "date": row["ds"].strftime("%Y-%m-%d"),
            "yhat": round(float(row["yhat"]), 2),
            "yhatLower": round(float(row["yhat_lower"]), 2),
            "yhatUpper": round(float(row["yhat_upper"]), 2),
        }
        for _, row in tail.iterrows()
    ]

    return {
        "query": query,
        "direction": direction,
        "confidence": confidence,
        "horizonDays": horizon_days,
        "changePercent": round(change_percent, 2),
        "forecast": points,
        "available": True,
    }


def _demo_history(item: str, weeks: int = 52, base: float = 100.0) -> List[Dict[str, float]]:
    """Deterministic synthetic weekly history for the CLI demo (no eBay call)."""
    import datetime as dt

    seed = abs(hash(item)) % (10**6)
    today = dt.date.today()
    history: List[Dict[str, float]] = []
    for i in range(weeks):
        t = i / (weeks - 1)
        seasonal = 0.06 * math.sin((seed % 7) + t * 2 * math.pi)
        noise = (((seed >> i) & 7) - 3) / 100.0
        d = today - dt.timedelta(days=(weeks - 1 - i) * 7)
        history.append({"ds": d.isoformat(), "y": round(base * (1 + seasonal + noise), 2)})
    return history


def main() -> None:
    parser = argparse.ArgumentParser(description="Prophet price forecast")
    parser.add_argument("--item", required=True, help="item name (CLI demo)")
    parser.add_argument("--horizon", type=int, default=30)
    args = parser.parse_args()

    history = _demo_history(args.item)
    result = run_forecast(history, horizon_days=args.horizon, query=args.item)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
