# MACRO·INTEL — Live Macro Dashboard

A professional macroeconomic intelligence dashboard with live price updates,
geopolitical newsfeed, conviction trade matrix, fear & greed gauge,
asset heatmap, and AI-powered deep analysis on every asset and news story.

---

## Files

```
macro-dashboard/
├── index.html     ← Main dashboard (entry point)
├── styles.css     ← All styling
├── data.js        ← News, conviction assets, signals, events data
├── app.js         ← All interactivity, price simulation, AI analysis
├── vercel.json    ← Vercel deployment config
└── README.md      ← This file
```

---

## Deploy to Vercel (step by step)

### 1. Create GitHub repository
- Go to github.com → click "+" → "New repository"
- Name it `macro-dashboard`, set to Public
- Click "Create repository"

### 2. Upload files
- In your new repo, click "Add file" → "Upload files"
- Drag and drop ALL files from this folder
- Click "Commit changes"

### 3. Deploy on Vercel
- Go to vercel.com → "Add New Project"
- Import your `macro-dashboard` GitHub repo
- Leave all settings default → click "Deploy"
- Wait ~30 seconds → you'll get a live URL

### 4. Add your Anthropic API key (for AI analysis)
- In Vercel: go to your project → Settings → Environment Variables
- Add variable: Name = `ANTHROPIC_API_KEY`, Value = your key
- Get your key at: console.anthropic.com
- Click "Save" → go to Deployments → "Redeploy"

### 5. Embed in Notion
- Copy your Vercel URL (e.g. macro-dashboard.vercel.app)
- In Notion: type /embed → paste URL → press Enter
- Drag the bottom edge of the embed to make it taller (800px+ recommended)

---

## Features

- **Live ticker strip** — 16 assets scrolling with simulated real-time price updates
- **Tabbed newsfeed** — 12 macro/geopolitical stories, filterable by category
- **Conviction matrix** — 8 high-conviction trades with direction and score bars
- **Macro regime panel** — growth/inflation/policy/risk at a glance + cycle phases
- **Fear & Greed gauge** — animated arc gauge with live pulsing updates
- **Key signals** — 6 macro signals with HIGH/MED conviction ratings
- **Events calendar** — 8 upcoming high-impact economic events
- **Asset heatmap** — 28 assets across equities, commodities, crypto, FX
- **AI deep analysis** — click ANY asset, news story, or button to get instant
  professional-grade analysis powered by Claude

---

## Updating content

To update news stories, assets, signals, or events — just edit `data.js`
and commit the change to GitHub. Vercel auto-redeploys in ~30 seconds.

---

## Notes

- The dashboard is designed to be embedded in Notion or run standalone
- Price movements are simulated (±0.06% random drift every 1.8 seconds)
- For real live prices, connect to a market data API (CoinGecko, Yahoo Finance)
  and replace the simulation logic in app.js `startPriceFlicker()`
- The AI analysis requires an Anthropic API key (see step 4 above)

---

*Not financial advice. For informational purposes only.*
