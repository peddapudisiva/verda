# Verda 🌿

**Your footprint, on a budget.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20claude-sonnet-4-20250514-orange?logo=anthropic&logoColor=white)](https://anthropic.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://verda-rho.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

A hackathon-ready React web app that treats carbon emissions like a weekly budget you spend down.

---

## Features

- **Carbon budget tracker** — weekly budget bar + living forest that wilts as you over-spend
- **Activity logging** — 4-step stepper with voice input ("I drove 20km", "I ate beef")
- **AI Coach** — personalised tips powered by Claude (Anthropic API)
- **Challenges** — 5 weekly eco-challenges with savings tracking
- **What-If Simulator** — see the impact of lifestyle changes before committing
- **Community Leaderboard** — see how you rank against other users
- **Weekly Forecast** — projects your end-of-week total from current pace
- **Dark mode** — full earthy dark palette
- **Share card** — download a PNG summary for social media
- **PWA** — installable on mobile, works offline
- **Responsive** — mobile-first with 4-tab nav + More sheet

---

## Quick Start

```bash
cd verda
npm install
cp .env.example .env        # add your Anthropic key
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

### Option A — CLI
```bash
npm i -g vercel
vercel
vercel env add VITE_ANTHROPIC_API_KEY
vercel --prod
```

### Option B — Dashboard
1. Push to GitHub
2. Go to vercel.com/new → import the repo
3. Framework preset: **Vite** (auto-detected)
4. Add env var: `VITE_ANTHROPIC_API_KEY`
5. Click Deploy

The `vercel.json` handles SPA routing and service worker cache headers automatically.

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | For AI Coach | Get one at console.anthropic.com |

The key is sent directly from the browser using the `anthropic-dangerous-direct-browser-access` header — fine for demos. For production, proxy through a backend.

---

## Stack

| | |
|---|---|
| Framework | React 18 + Vite |
| Animations | Framer Motion |
| AI | Anthropic Claude API |
| Storage | localStorage |
| PWA | vite-plugin-pwa + Workbox |
| Styling | CSS custom properties |
| Charts | Hand-drawn SVG |
| Icons | Playwright-generated PNG |

---

Built with React + Framer Motion + Claude · Verda v1.0
