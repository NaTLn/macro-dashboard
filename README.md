<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>MACRO·INTEL — Live Dashboard</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="styles.css"/>
</head>
<body>

<!-- LOADING -->
<div id="loading-screen">
  <div class="loader-content">
    <div class="loader-logo">MACRO·INTEL</div>
    <div class="loader-bar-wrap"><div class="loader-bar" id="loader-bar"></div></div>
    <div class="loader-status" id="loader-status">Connecting to live feeds...</div>
  </div>
</div>

<div id="app" style="display:none">

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <div class="logo"><span class="live-dot"></span>MACRO·INTEL</div>
      <div class="header-meta" id="header-pills">
        <span class="regime-pill">Late Cycle</span>
        <span class="regime-pill amber">Sticky Inflation</span>
        <span class="regime-pill red">Risk-Off</span>
      </div>
    </div>
    <div class="header-right">
      <div class="header-stat"><span class="hs-label">VIX</span><span class="hs-val red" id="h-vix">—</span></div>
      <div class="header-stat"><span class="hs-label">DXY</span><span class="hs-val blue" id="h-dxy">—</span></div>
      <div class="header-stat"><span class="hs-label">BTC</span><span class="hs-val" id="h-btc">—</span></div>
      <div class="header-stat"><span class="hs-label">GOLD</span><span class="hs-val gold" id="h-gold">—</span></div>
      <div class="time-block">
        <div id="live-time" class="live-time">--:--:--</div>
        <div class="live-date" id="live-date">-- --- ----</div>
      </div>
    </div>
  </header>

  <!-- TICKER STRIP -->
  <div class="ticker-strip">
    <div class="ticker-track" id="ticker-track">
      <div class="ticker-loading">Loading live prices...</div>
    </div>
  </div>

  <!-- MAIN GRID -->
  <main class="main-grid">

    <!-- NEWS -->
    <section class="card card-news">
      <div class="card-header">
        <span class="card-title"><i class="dot cyan"></i>Live Newsfeed</span>
        <div class="news-tabs" id="news-tabs">
          <button class="ntab active" data-filter="all">All</button>
          <button class="ntab" data-filter="geo">Geopolitical</button>
          <button class="ntab" data-filter="macro">Macro</button>
          <button class="ntab" data-filter="central">Central Banks</button>
          <button class="ntab" data-filter="trade">Trade</button>
          <button class="ntab" data-filter="energy">Energy</button>
        </div>
      </div>
      <div class="news-refresh-bar">
        <span class="nrb-label" id="news-updated">Fetching live stories...</span>
        <button class="nrb-btn" onclick="refreshNews()">↺ Refresh</button>
      </div>
      <div class="news-list" id="news-list">
        <div class="feed-loading"><div class="mini-spinner"></div><span>Loading headlines...</span></div>
      </div>
      <button class="action-btn" onclick="openAnalysis('top-stories','Analyse the 3 most important macro or geopolitical developments happening right now in April 2026 and what specific trades they imply with entry, stop and target levels')">↗ Deep-dive top stories</button>
    </section>

    <!-- CONVICTION -->
    <section class="card card-conviction">
      <div class="card-header">
        <span class="card-title"><i class="dot green"></i>High-Conviction Trades</span>
        <span class="updated-tag">Live scoring</span>
      </div>
      <div class="conviction-list" id="conviction-list"></div>
      <button class="action-btn" onclick="openAnalysis('top-pick','Give me the full trade thesis for the single highest conviction macro trade available right now in April 2026 — include fundamental drivers, entry zone, stop loss, and 3 price targets with timeframes. Be specific with numbers.')">↗ Full thesis: top pick</button>
    </section>

    <!-- REGIME -->
    <section class="card card-regime">
      <div class="card-header">
        <span class="card-title"><i class="dot amber"></i>Macro Regime</span>
      </div>
      <div class="regime-grid">
        <div class="regime-box"><div class="rb-label">Growth Cycle</div><div class="rb-val amber">Late</div><div class="rb-sub">Slowing momentum</div></div>
        <div class="regime-box"><div class="rb-label">Inflation</div><div class="rb-val amber">Sticky</div><div class="rb-sub">Above 2% target</div></div>
        <div class="regime-box"><div class="rb-label">Policy Stance</div><div class="rb-val blue">Hold</div><div class="rb-sub">Fed / BoE / ECB</div></div>
        <div class="regime-box"><div class="rb-label">Risk Appetite</div><div class="rb-val red">Cautious</div><div class="rb-sub">VIX elevated</div></div>
      </div>
      <div class="cycles-section">
        <div class="sec-micro-label">Market Cycles</div>
        <div id="cycles-list"></div>
      </div>
      <button class="action-btn" onclick="openAnalysis('regime','Explain the current macro regime in April 2026 in detail — what cycle phase are we in, what does history say about asset performance in this phase, and what should traders be positioned for over the next 6 months?')">↗ Analyse current regime</button>
    </section>

    <!-- FEAR & GREED -->
    <section class="card card-fear">
      <div class="card-header">
        <span class="card-title"><i class="dot red"></i>Fear & Greed</span>
        <span class="updated-tag" id="fg-updated">Live</span>
      </div>
      <div class="fg-display">
        <div class="fg-arc-wrap">
          <canvas id="fg-canvas" width="200" height="110"></canvas>
          <div class="fg-center">
            <div class="fg-num" id="fg-num">—</div>
            <div class="fg-label" id="fg-label">LOADING</div>
          </div>
        </div>
      </div>
      <div class="vol-grid">
        <div class="vol-box" onclick="openAssetAnalysis('VIX','What does the current VIX level mean for markets, how should traders adjust position sizing, and what options strategies make sense right now?')">
          <div class="vb-label">VIX</div>
          <div class="vb-val red" id="vix-val">—</div>
          <div class="vb-sub">Equity vol</div>
        </div>
        <div class="vol-box" onclick="openAssetAnalysis('US 10-Year Treasury Yield','Analyse the US 10-year yield at current levels — what is driving it, where are the key levels, and what does it mean for equities, gold, and the dollar?')">
          <div class="vb-label">US 10Y</div>
          <div class="vb-val amber" id="us10y-val">—</div>
          <div class="vb-sub">Bond yield</div>
        </div>
        <div class="vol-box" onclick="openAssetAnalysis('DXY US Dollar Index','Analyse the DXY at current levels — what is driving dollar strength or weakness, what are the key technical levels, and what does this mean for different asset classes?')">
          <div class="vb-label">DXY</div>
          <div class="vb-val blue" id="dxy-val">—</div>
          <div class="vb-sub">USD index</div>
        </div>
      </div>
    </section>

    <!-- SIGNALS -->
    <section class="card card-signals">
      <div class="card-header">
        <span class="card-title"><i class="dot purple"></i>Key Macro Signals</span>
      </div>
      <div class="signals-list" id="signals-list"></div>
      <button class="action-btn" onclick="openAnalysis('signals','What are the 5 most important macro and technical signals traders must watch this week in April 2026? For each one give the specific level to watch, what a breach means, and which assets are most affected.')">↗ Explain this week's signals</button>
    </section>

    <!-- EVENTS -->
    <section class="card card-events">
      <div class="card-header">
        <span class="card-title"><i class="dot blue"></i>Events Calendar</span>
      </div>
      <div class="events-list" id="events-list"></div>
      <button class="action-btn" onclick="openAnalysis('events','Which upcoming economic event in April-May 2026 has the highest potential to move markets significantly? Walk me through how to trade around it — pre-event positioning, the key scenarios, and what happens to specific assets in each scenario.')">↗ Highest-impact event analysis</button>
    </section>

    <!-- HEATMAP -->
    <section class="card card-heatmap">
      <div class="card-header">
        <span class="card-title"><i class="dot cyan"></i>Asset Heatmap — 24h Performance</span>
        <span class="updated-tag" id="heatmap-updated">Live data</span>
      </div>
      <div class="heatmap-categories" id="heatmap"></div>
      <div class="heatmap-legend">
        <span class="legend-label">Strong Sell</span>
        <div class="legend-bar"></div>
        <span class="legend-label">Strong Buy</span>
      </div>
    </section>

  </main>
</div>

<!-- MODAL -->
<div id="analysis-modal" class="modal-overlay" style="display:none" onclick="handleModalClick(event)">
  <div class="modal-box">
    <div class="modal-header">
      <div>
        <div class="modal-title" id="modal-title">Analysis</div>
        <div class="modal-subtitle" id="modal-subtitle"></div>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" id="modal-body">
      <div class="modal-loading">
        <div class="modal-spinner"></div>
        <div class="modal-loading-text">Analysing market conditions...</div>
      </div>
    </div>
  </div>
</div>

<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
