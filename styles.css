# MACRO·INTEL — Live Dashboard v2

A fully live macroeconomic intelligence dashboard with real market prices,
live news feeds, and AI-powered deep analysis on every asset and story.

---

## What's genuinely live

| Feature            | Source                  | Refresh rate |
|--------------------|-------------------------|--------------|
| Crypto prices      | CoinGecko API (free)    | Every 30s    |
| Equity/FX/Commodity| Yahoo Finance (free)    | Every 30s    |
| News headlines     | Reuters + BBC RSS feeds | Every 5 min  |
| Fear & Greed gauge | Derived from VIX        | Every 8s     |
| AI analysis        | Claude via Anthropic    | On-demand    |

---

## File structure

```
macro-live/
├── index.html        ← Dashboard UI
├── styles.css        ← Full stylesheet
├── data.js           ← Fallback data + static config
├── app.js            ← Live data engine + AI analysis
├── vercel.json       ← Deployment config
├── api/
│   ├── prices.js     ← Serverless: CoinGecko + Yahoo Finance
│   ├── news.js       ← Serverless: RSS news aggregator
│   └── analyse.js    ← Serverless: Anthropic AI proxy
└── README.md
```

---

## Deploy to Vercel

### Step 1 — Create GitHub repo
1. Go to github.com → "+" → "New repository"
2. Name: `macro-live`, set to **Public**
3. Click "Create repository"

### Step 2 — Upload ALL files
1. Click "Add file" → "Upload files"
2. Upload the root files AND the `api/` folder with its 3 files
3. **Important**: the `api/` folder must be uploaded as a folder, not just the files
4. Click "Commit changes"

### Step 3 — Deploy on Vercel
1. Go to vercel.com → "Add New Project"
2. Import your `macro-live` repo
3. Leave all settings default → "Deploy"
4. Your live URL will be ready in ~45 seconds

### Step 4 — Add your Anthropic API key
1. Vercel project → **Settings** → **Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = your key from console.anthropic.com
3. Click Save → go to **Deployments** → **Redeploy**

> The dashboard works without the API key — prices and news are live.
> The API key only enables the AI deep-analysis click-throughs.

### Step 5 — Embed in Notion
1. Copy your Vercel URL
2. In Notion: type `/embed` → paste URL → Enter
3. Drag the embed block to ~900px height

---

## Uploading the api/ folder to GitHub

GitHub's web UI doesn't let you create folders directly. Do this:

**Option A (easiest):** Drag the entire `macro-live` folder onto the
GitHub upload screen — it will preserve the folder structure automatically.

**Option B:** Click "Add file" → "Create new file" → type `api/prices.js`
as the filename (GitHub auto-creates the folder). Paste the content. Repeat
for `api/news.js` and `api/analyse.js`.

---

## Fallback behaviour

If any live data source is unavailable (API limits, outage), the dashboard
automatically falls back to the static data in `data.js`. You'll never see
a broken dashboard — it degrades gracefully.

---

## Updating content

To change conviction assets, signals, events, or cycle phases — edit `data.js`
and commit to GitHub. Vercel auto-redeploys in ~30 seconds.

---

*Not financial advice. For informational purposes only.*
