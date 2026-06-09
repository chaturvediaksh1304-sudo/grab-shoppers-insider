"""FastAPI microservice hosting Prophet forecasts + pytrends for Grab.

Run locally:  cd python && .venv/bin/uvicorn app:app --port 8000 --reload
Called by the Next.js routes /api/forecast and lib/trends.ts.
"""
from __future__ import annotations

from typing import List, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from forecast import run_forecast
from trends_fetch import fetch_trends

app = FastAPI(title="Grab ML Service", version="0.1.0")

# Allow the local Next.js dev origin to call directly if ever needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryPoint(BaseModel):
    ds: str
    y: float


class ForecastRequest(BaseModel):
    history: List[HistoryPoint]
    horizonDays: int = 30
    query: Optional[str] = None


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "grab-ml"}


@app.post("/forecast")
def forecast(req: ForecastRequest) -> dict:
    if len(req.history) < 2:
        return {
            "query": req.query,
            "direction": "STABLE",
            "confidence": 0,
            "horizonDays": req.horizonDays,
            "changePercent": 0.0,
            "forecast": [],
            "available": False,
        }
    history = [{"ds": p.ds, "y": p.y} for p in req.history]
    return run_forecast(history, horizon_days=req.horizonDays, query=req.query)


@app.get("/trends")
def trends(q: str = Query(..., description="brand or item keyword")) -> dict:
    return fetch_trends(q)
