"""Google Trends fetcher (pytrends) for Grab — Shoppers Insider.

Returns weekly interest-over-time (0–100) for the past 12 months. pytrends is
frequently rate-limited (HTTP 429); callers get {"available": False} on failure
rather than an exception.

Server use:  imported by app.py (FastAPI GET /trends)
CLI:         python trends_fetch.py "nike air force 1"
"""
from __future__ import annotations

import json
import sys
from typing import Dict, List


def fetch_trends(keyword: str, timeframe: str = "today 12-m") -> Dict[str, object]:
    try:
        from pytrends.request import TrendReq

        pytrends = TrendReq(hl="en-US", tz=360)
        pytrends.build_payload([keyword], timeframe=timeframe)
        df = pytrends.interest_over_time()

        if df is None or df.empty or keyword not in df.columns:
            return {"query": keyword, "points": [], "available": False}

        points: List[Dict[str, object]] = [
            {"date": idx.strftime("%Y-%m-%d"), "interest": int(row[keyword])}
            for idx, row in df.iterrows()
        ]
        return {"query": keyword, "points": points, "available": True}
    except Exception as exc:  # noqa: BLE001 — degrade gracefully on any pytrends error
        return {"query": keyword, "points": [], "available": False, "error": str(exc)}


def main() -> None:
    keyword = sys.argv[1] if len(sys.argv) > 1 else "nike air force 1"
    print(json.dumps(fetch_trends(keyword), indent=2))


if __name__ == "__main__":
    main()
