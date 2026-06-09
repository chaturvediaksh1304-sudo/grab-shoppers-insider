# CLAUDE.md — Grab: Shoppers Insider

> This file is the single source of truth for Claude Code and all subagents building this project.
> Read this fully before writing a single line of code.

---

## 1. Project Overview

**Name:** Grab — Shoppers Insider
**Tagline:** Know what to buy before everyone else does.
**What it is:** A web app that shows resale price trends + ML-powered forecasts for fashion items across brands and categories. Targets resellers (buy before value spikes) and smart shoppers (know if an item holds value).
**Inspired by:** Phia (phia.com) — same audience, complementary intelligence layer.
**Built by:** Aksh Chaturvedi — new grad SWE/AI-ML engineer targeting Phia as a company.

---

## 2. Core Features

### Feature 1 — Search & Item Trend View
- User searches brand or item (e.g., "Nike Air Force 1", "Levi's 501")
- App fetches eBay sold listings data → plots price over time
- Shows: current avg resale price, 30/60/90-day trend, high/low range
- Shows: Google Trends interest score alongside price (social buzz signal)

### Feature 2 — Macro Trend Browser
- Browse trending brands/categories without searching
- "Hot right now" section — items with rising resale value + rising search interest
- "Cooling down" section — items losing resale momentum
- Cards with mini sparkline charts

### Feature 3 — ML Forecast
- Prophet time series model on backend
- Given item price history → predicts next 30-day price direction
- Output: UP / DOWN / STABLE badge + confidence %
- Displayed on both search result and macro browse views

### Feature 4 — Phone Preview UI
- Section on landing page showing the app UI in a phone mockup frame
- Animated — mimics Phia's product showcase aesthetic

---

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, Vercel-native, matches XSkill experience |
| Styling | Tailwind CSS + custom CSS vars | Speed + design control |
| Charts | Recharts | Lightweight, React-native |
| ML (forecast) | Python via Next.js API route calling a FastAPI microservice OR use `prophet` via a serverless Python function | Prophet for time series |
| Data — Resale | eBay Browse API (sold listings) | Free tier, reliable, official |
| Data — Trends | pytrends (Google Trends, no key needed) | Free, no auth |
| Animation | Framer Motion | Wispr-style text motion effects |
| Deployment | Vercel (from GitHub repo) | Free tier, instant CI/CD |
| Package manager | pnpm | Fast |

---

## 4. Project Structure

```
grab-shoppers-insider/
├── CLAUDE.md                  ← this file
├── .env.local                 ← API keys (NEVER commit)
├── .gitignore                 ← includes .env.local
├── package.json
├── tailwind.config.ts
├── next.config.ts
│
├── public/
│   └── assets/
│       ├── grab-logo.png      ← upload here
│       ├── grab-logo.svg      ← upload here
│       └── phone-mockup.png   ← device frame image
│
├── app/
│   ├── layout.tsx             ← global fonts, nav
│   ├── page.tsx               ← landing page (hero + features + phone preview)
│   ├── dashboard/
│   │   └── page.tsx           ← main app — search + macro trends
│   └── api/
│       ├── search/
│       │   └── route.ts       ← calls eBay API, returns price history
│       ├── trends/
│       │   └── route.ts       ← calls pytrends via Python subprocess or microservice
│       └── forecast/
│           └── route.ts       ← calls Prophet model, returns prediction
│
├── components/
│   ├── ui/
│   │   ├── SearchBar.tsx
│   │   ├── TrendCard.tsx
│   │   ├── PriceChart.tsx
│   │   ├── ForecastBadge.tsx
│   │   ├── SparklineChart.tsx
│   │   └── PhonePreview.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── HotRightNow.tsx
│   │   ├── CoolingDown.tsx
│   │   └── HowItWorks.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── ebay.ts                ← eBay API client
│   ├── trends.ts              ← Google Trends fetcher
│   └── types.ts               ← shared TypeScript types
│
└── python/
    ├── forecast.py            ← Prophet model script
    ├── trends_fetch.py        ← pytrends script
    └── requirements.txt       ← prophet, pytrends, fastapi, uvicorn
```

---

## 5. Design System

### Brand Identity
- **Logo:** "grab" in italic serif (same style as uploaded logo) — white text on blue gradient
- **Brand color:** Rich cobalt blue (`#1A3FD4`) → deep navy (`#0D1B6E`) gradient
- **Accent:** Crisp white, with soft warm cream (`#FAF8F5`) for light sections
- **Error/down:** Muted coral (`#E05555`)
- **Success/up:** Sage green (`#4CAF82`)
- **Neutral:** `#1C1C1E` dark, `#F5F5F0` light bg

### Typography
- **Display/Hero:** `Playfair Display` italic (matches grab logo serif energy)
- **Body:** `DM Sans` (clean, modern, readable)
- **Data/Numbers:** `JetBrains Mono` (gives credibility to price data)
- Load via Google Fonts in `layout.tsx`

### Motion (Wispr-inspired)
- Hero headline: words fade + slide up with staggered delay (Framer Motion)
- Section reveals: fade-in-up on scroll
- Chart lines: animate draw-in on mount
- Cards: subtle lift on hover (translateY -4px + shadow)
- NO gratuitous animation — every motion has purpose

### Color Modes
- Default: **light mode** (cream/white bg, dark text) — matches Phia's consumer feel
- Dashboard: **slightly darker** card surfaces for data density

### UI Aesthetic
- Phia-inspired: rounded cards, generous whitespace, editorial product imagery
- NOT a Bloomberg terminal — data should feel approachable
- Phone mockup section: floating device with animated app UI inside
- Product images: real fashion item photography (sourced via Unsplash/Pexels free tier or eBay item images from API)

---

## 6. API Configuration

### eBay Browse API
```
Base URL: https://api.ebay.com/buy/browse/v1
Auth: OAuth 2.0 client credentials
Env var: EBAY_APP_ID, EBAY_CLIENT_SECRET
Key endpoint: /item_summary/search?q={item}&filter=buyingOptions:{FIXED_PRICE}&limit=50
Use sold listings to get historical price data
```

### Google Trends (pytrends)
```
No API key needed
Python library: pytrends
Usage: TrendReq → build_payload([keyword]) → interest_over_time()
Returns weekly interest score 0-100 for past 12 months
```

### Prophet (ML Forecast)
```
Python library: prophet
Input: DataFrame with ds (date) + y (price) columns
Output: forecast df with yhat, yhat_lower, yhat_upper for next 30 days
Run as: python python/forecast.py --item "nike air force 1"
Called from Next.js API route via child_process or separate FastAPI server
```

### Environment Variables (.env.local)
```
EBAY_APP_ID=
EBAY_CLIENT_SECRET=
EBAY_OAUTH_TOKEN=          # generated at runtime, cache it
NEXT_PUBLIC_APP_NAME=Grab
NEXT_PUBLIC_APP_TAGLINE=Shoppers Insider
```

---

## 7. Multi-Agent Workflow (Superpowers)

This project uses the **obra/superpowers** agentic framework pattern. Each subagent has a defined role:

### Agent Roles

| Agent | Responsibility |
|---|---|
| **Architect** | Project setup, Next.js scaffold, folder structure, env config |
| **Data Agent** | eBay API integration, pytrends integration, data normalization layer |
| **ML Agent** | Prophet model, forecast API route, accuracy validation |
| **Frontend Agent** | All React components, Tailwind styling, Framer Motion animations |
| **QA Agent** | Code review, TDD test writing (Jest + React Testing Library), debugging |

### Workflow Rules
1. **Architect** runs first — scaffolds the entire project before any feature work
2. **Data Agent** builds API routes + lib utilities before Frontend touches data
3. **ML Agent** works in parallel with Data Agent (Python side)
4. **Frontend Agent** consumes completed API contracts — mock data if API not ready
5. **QA Agent** reviews every PR before merge, writes tests for every API route

### TDD Requirements
- Every API route in `/app/api/*` must have a corresponding test in `__tests__/api/`
- Test the happy path + at least 2 edge cases per route
- Use `jest` + `node-mocks-http` for API route testing
- Run: `pnpm test` before every commit

---

## 8. Build Order (Sequential)

Follow this exact order. Do not skip steps.

```
Step 1: Scaffold
  - npx create-next-app@latest grab-shoppers-insider
  - Install deps: tailwindcss framer-motion recharts lucide-react
  - Set up .env.local, .gitignore, tailwind.config.ts
  - Add Google Fonts to layout.tsx
  - Create folder structure per Section 4

Step 2: Design System
  - Define CSS variables in globals.css (colors, radii, shadows)
  - Build Navbar + Footer components
  - Test layout renders correctly at localhost:3000

Step 3: Data Layer
  - Build lib/ebay.ts — eBay OAuth + search function
  - Build app/api/search/route.ts — accepts ?q= param, returns price array
  - Build python/trends_fetch.py — returns Google Trends data as JSON
  - Build app/api/trends/route.ts — calls Python script, returns trends
  - Write tests for both API routes

Step 4: ML Layer
  - Build python/forecast.py — Prophet model
  - Build app/api/forecast/route.ts — calls forecast.py, returns prediction
  - Write tests for forecast route

Step 5: Components
  - PriceChart.tsx (Recharts line chart, animated)
  - SparklineChart.tsx (mini version for cards)
  - ForecastBadge.tsx (UP/DOWN/STABLE with confidence)
  - TrendCard.tsx (brand card with sparkline + badge)
  - SearchBar.tsx (with debounce)

Step 6: Pages
  - Dashboard page — search bar + results + macro grid
  - Landing page — Hero + HotRightNow preview + HowItWorks + PhonePreview

Step 7: Polish
  - Framer Motion animations on Hero text (word-by-word stagger)
  - Scroll-triggered section reveals
  - Chart draw-in animations
  - Phone mockup section with animated UI inside
  - Real product images (Unsplash fashion API or eBay item images)

Step 8: QA Pass
  - Full test suite run
  - Lighthouse score check (aim >85 performance)
  - Mobile responsiveness check (375px, 768px, 1440px)
  - Fix all console errors/warnings

Step 9: Deploy Prep
  - Final .gitignore check (no .env.local, no node_modules)
  - README.md with setup instructions
  - Push to GitHub
  - Connect to Vercel
```

---

## 9. Key Constraints & Rules

- **Never commit `.env.local`** — it is in .gitignore from step 1
- **Never use placeholder/lorem ipsum** in final UI — use real fashion brands and items
- **eBay free tier limits:** 5,000 calls/day — implement response caching (5-min TTL) using Next.js `unstable_cache` or simple in-memory cache
- **Prophet runs server-side only** — never expose Python scripts to client
- **All data fetching in API routes** — no direct API calls from React components
- **Mobile-first** — every component designed for 375px first, then scaled up
- **No `any` types in TypeScript** — strict mode on
- **Framer Motion** for all animations — no raw CSS keyframes for interactive elements

---

## 10. Definition of Done

The project is complete when:
- [ ] User can search any fashion brand/item and see price trend chart
- [ ] Chart shows eBay price history (real data, not mocked)
- [ ] Google Trends interest score appears alongside price chart
- [ ] Prophet forecast badge shows UP/DOWN/STABLE with confidence
- [ ] Macro browse page shows hot/cooling items with sparklines
- [ ] Landing page has Wispr-style animated hero text
- [ ] Phone preview section shows app UI in device mockup
- [ ] Grab logo appears in navbar and favicon
- [ ] All tests pass (`pnpm test`)
- [ ] Runs cleanly at `localhost:3000`
- [ ] README explains setup in under 5 steps
- [ ] `.env.local` is gitignored and `.env.example` exists with empty keys

---

## 11. Context for Claude Code

You are building a portfolio project designed to impress the founders of **Phia** (phia.com) — Phoebe Gates and Sophia Kianni. The project demonstrates:
1. Real data engineering (eBay API pipeline)
2. ML credibility (Prophet time series forecasting)
3. Marketing intelligence (Google Trends signal)
4. Consumer-grade UI/UX (not a bland dashboard)

Every decision should be made with this audience in mind. When in doubt: **make it look better, make the data more real, make the code cleaner.**

Builder: Aksh Chaturvedi | GitHub: chaturvediaksh1304-sudo
