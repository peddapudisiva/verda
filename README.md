# Verda 🌿

**Your footprint, on a budget.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Powered by Groq](https://img.shields.io/badge/AI-Groq%20LLaMA%203.1-orange?logo=meta&logoColor=white)](https://groq.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://verda-rho.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-57%20passing-brightgreen)](./src/utils)

---

## Problem Statement

**Vertical: Carbon Footprint Awareness Platform**

Most people have no intuitive sense of their personal carbon impact. Existing tools are either too complex (requiring lengthy surveys) or too abstract (showing annual totals disconnected from daily choices). Verda solves this by treating carbon emissions exactly like a weekly spending budget — a mental model everyone already understands.

---

## Approach & Logic

### Core Metaphor
Carbon emissions are re-framed as a weekly budget (default: 38 kg CO₂e/week, based on a globally sustainable per-capita target of ~2 tonnes/year). Every logged activity "spends" from this budget, exactly like money.

### Emission Calculations
All calculations use peer-reviewed emission factors (IPCC, UK DEFRA 2023):

| Activity | Factor |
|---|---|
| Car (petrol) | 0.192 kg CO₂e / km |
| Flight | 0.255 kg CO₂e / km |
| Beef meal | 6.6 kg CO₂e / meal |
| Electricity (grid avg) | 0.475 kg CO₂e / kWh |

The formula is: `kg = factor × quantity`, rounded to 2 decimal places.

### Challenge Savings
Completing eco-challenges (e.g. "Meat-free 3 days") deducts their estimated savings from the net total, rewarding behaviour change directly in the budget bar.

### Weekly Forecast
Using the current day of week and emissions so far, Verda projects the end-of-week total:
`projected = (totalSoFar / daysElapsed) × 7`

### AI Coach
User activity data is sent to a secure serverless endpoint (`/api/coach`) which calls the Groq LLaMA 3.1 API server-side. The API key never reaches the browser. Tips are personalised based on the user's actual category breakdown and challenge completion.

---

## How the Solution Works

```
User logs activity
       ↓
Emission factor lookup (emissionFactors.js)
       ↓
kg CO₂e calculated & stored in localStorage
       ↓
Budget bar updates → Forest reacts → Badges checked
       ↓
Weekly forecast recalculates
       ↓
AI Coach (optional): POST /api/coach → Groq LLaMA → 3 personalised tips
```

### Architecture

```
verda/
├── src/
│   ├── components/          # React UI components
│   │   ├── LogActivity.jsx  # 4-step stepper + voice input
│   │   ├── Dashboard.jsx    # Weekly budget view
│   │   ├── AIInsights.jsx   # AI Coach (calls /api/coach)
│   │   └── ...
│   ├── utils/
│   │   ├── emissionFactors.js  # All CO₂e factors + calcKg()
│   │   ├── badges.js           # Badge unlock conditions
│   │   ├── challenges.js       # Weekly eco-challenges
│   │   └── equivalencies.js   # Human-scale comparisons
│   └── hooks/
│       └── useLocalStorage.js  # Persistent state hook
├── api/
│   └── coach.js             # Secure serverless AI proxy
└── public/
    ├── icon-192.png          # PWA icon
    └── icon-512.png          # PWA icon
```

---

## Assumptions

1. **Sustainable weekly budget** is set at 38 kg CO₂e (≈ 2 tonnes/year ÷ 52 weeks), aligned with Paris Agreement targets.
2. **Emission factors** are global averages from IPCC AR6 and UK DEFRA 2023. Regional grids vary — electricity factor assumes global average.
3. **Food quantities** are per meal, not per gram — simplifies logging for daily use.
4. **Challenge savings** are estimates based on average substitution behaviour, not precise measurements.
5. **Data persists locally** in `localStorage` — no backend database, suitable for personal use and demos.

---

## Features

- **Carbon budget tracker** — weekly budget bar + living forest that reacts to over/under spending
- **Activity logging** — 4-step stepper with voice input (30+ patterns: "drove 20km", "ate beef")
- **AI Coach** — personalised tips via Groq LLaMA 3.1 (server-side, key never exposed)
- **Weekly Forecast** — projects end-of-week total from current pace
- **Challenges** — 5 eco-challenges with direct savings applied to net total
- **Community Leaderboard** — see how your footprint ranks
- **Progress tracking** — weekly history chart, badges, streaks
- **What-If Simulator** — see impact of lifestyle changes before committing
- **Dark mode** — full earthy dark palette via CSS custom properties
- **Share card** — downloadable PNG summary for social media
- **PWA** — installable, works offline via service worker
- **Responsive** — mobile-first with 4-tab nav + More sheet; desktop shows all 10 tabs

---

## Quick Start

```bash
git clone https://github.com/peddapudisiva/verda.git
cd verda
npm install
cp .env.example .env        # add your Groq API key
npm run dev
```

Open http://localhost:5173

### Run Tests

```bash
npm test              # run all 57 tests
npm run coverage      # with coverage report
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
vercel env add GROQ_API_KEY   # server-side only — never sent to browser
vercel --prod
```

The `vercel.json` handles SPA routing and service worker cache headers. The `api/coach.js` serverless function proxies all AI requests securely.

---

## Environment Variables

| Variable | Where | Required | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | Server only (no VITE_ prefix) | For AI Coach | Free at console.groq.com |

The key is used exclusively in the `/api/coach` serverless function. It is never bundled into client JavaScript.

---

## Security

- AI API key stored server-side only (`GROQ_API_KEY`, no `VITE_` prefix)
- Serverless proxy validates and sanitizes all input before forwarding
- Rate limiting: 10 requests per IP per minute
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, CORS restricted to deployment origin
- No user credentials stored — authentication is local-only (localStorage)

---

## Testing

57 unit tests across 5 test files covering:
- Emission factor calculations (12 tests)
- Badge unlock conditions (14 tests)
- Equivalency conversions (8 tests)
- Challenge data integrity (7 tests)
- Sample data generation (9 tests) *(+ 7 more planned)*

```bash
npm test
# Test Files  5 passed
# Tests      57 passed
```

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Animations | Framer Motion |
| AI | Groq LLaMA 3.1 (via serverless proxy) |
| Storage | localStorage (no backend DB) |
| PWA | vite-plugin-pwa + Workbox |
| Styling | CSS custom properties (no framework) |
| Testing | Vitest + Testing Library |
| Deployment | Vercel (frontend + serverless functions) |

---

Built for the Carbon Footprint Awareness Platform challenge · Verda v1.0 · MIT License
