# Grab — Shoppers Insider

**Know what to buy before everyone else does.**

🔗 **Live demo: https://grab-shoppers-insider.vercel.app**
*(First load after idle may take ~30–60s while the free-tier ML service wakes — the page
renders immediately and the Trends chart + forecast fill in once it's warm.)*

A web app that shows resale price trends + ML-powered forecasts for fashion items.
It pulls **real Google Trends** search-demand, charts it against a resale price index,
and runs a **Prophet** time-series model to forecast the next 30 days as
**UP / DOWN / STABLE** with a confidence score. **Runs fully keyless** — no API keys
required to start.

- **Frontend:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Framer Motion · Recharts
- **Data:** Google Trends (pytrends, keyless) · eBay Browse API (optional)
- **ML:** Prophet, served by a local FastAPI microservice
- **Tests:** Jest (every API route)

> **Note on data:** The **Google Trends demand curve and the Prophet forecast on it are
> real**. The dollar price is an **estimated resale index** — a curated baseline price for
> each item, shaped by the real Trends demand curve and clearly labeled "est." (never a
> live market quote). Add optional eBay keys to replace the estimate with **live eBay
> listing prices** — `source` flips from `"estimate"` to `"ebay"` automatically.

---

## Setup (5 steps)

**Prerequisites:** Node 18+ (with [pnpm](https://pnpm.io) via `corepack enable pnpm`) and Python 3.9+.

```bash
# 1. Install JS deps
pnpm install

# 2. Set up the Python ML service (Prophet + pytrends)
python3 -m venv python/.venv && python/.venv/bin/pip install -r python/requirements.txt

# 3. Create your env file (no keys needed — eBay is optional)
cp .env.example .env.local

# 4. Run the web app + ML service together
pnpm dev:all

# 5. Open the app
open http://localhost:3000        # ML service runs on http://127.0.0.1:8000
```

That's it — **no API keys required**. Search any brand or item (e.g. *Gucci GG Marmont*
or *Nike Air Force 1*) on the dashboard to see the price chart, Google Trends demand
overlay, and Prophet forecast badge. To enrich prices with live eBay listings, paste an
optional eBay production keyset into `.env.local` (see `.env.example`).

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev:all` | Runs the Next.js app **and** the FastAPI ML service together |
| `pnpm dev` | Next.js app only (`localhost:3000`) |
| `pnpm ml` | FastAPI ML service only (`127.0.0.1:8000`) |
| `pnpm test` | Jest suite (all API routes) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |

## Project layout

```
app/                 # routes — landing (/), dashboard (/dashboard), api/{search,trends,forecast}
components/ui|sections|layout
lib/                 # ebay, trends, history (derivation), insider (assembly), cache, types
python/              # forecast.py (Prophet), trends_fetch.py (pytrends), app.py (FastAPI)
__tests__/api/       # route tests
```

## Architecture

```
 Browser
    │  (only ever calls /api/*)
    ▼
 Next.js on Vercel  ──────────────  app/api/{search,trends,forecast}
    │  server-side fetch                 (serverless functions)
    │  FORECAST_API_URL
    ▼
 FastAPI on Render  ──────────────  python/app.py
    ├─ POST /forecast → Prophet (python/forecast.py)
    └─ GET  /trends   → pytrends  (python/trends_fetch.py) → Google Trends
```

- **Frontend + API routes:** Next.js 14 on **Vercel**. The routes assemble the response and
  call the ML service server-side, so no keys or Python ever reach the browser.
- **ML service:** FastAPI on **Render** hosting **Prophet** (forecasts) and **pytrends**
  (real Google Trends). Prophet is too heavy for serverless, hence a dedicated host.
- **Price model:** `lib/history.ts` builds a price index from a curated baseline anchored to
  the real, smoothed Trends demand curve (elasticity-damped, step- and band-capped). Prophet
  forecasts that curve; the UP/DOWN/STABLE badge is effectively a real demand forecast.
- **Config:** Vercel env `FORECAST_API_URL` → the Render URL (set in `vercel.json`). Locally,
  `pnpm dev:all` runs both on `:3000` + `:8000`.

## Notes

- **No keys needed.** Runs on Google Trends + Prophet out of the box; optional eBay keys
  enrich prices with live listings. Google Trends degrades gracefully if rate-limited.
- **eBay (optional) free tier:** 5,000 calls/day. Responses are cached in-memory for 5 minutes.
- The Python ML service stays server-side; the browser only ever calls `/api/*`.

Built by Aksh Chaturvedi.
