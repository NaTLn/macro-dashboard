// ============================================
// MACRO·INTEL — Live Application Engine
// ============================================

// ---------- STATE ----------
const STATE = {
  prices:      {},
  news:        [],
  newsFilter:  'all',
  fgValue:     32,
  lastPriceUpdate: null,
  lastNewsUpdate:  null,
};

// Refresh intervals
const PRICE_INTERVAL = 30  * 1000;  // 30 seconds
const NEWS_INTERVAL  = 5 * 60 * 1000; // 5 minutes
const FG_INTERVAL    = 8  * 1000;   // 8 seconds

// ---------- BOOT ----------
window.addEventListener('DOMContentLoaded', () => { bootSequence(); });

async function bootSequence() {
  const bar    = document.getElementById('loader-bar');
  const status = document.getElementById('loader-status');

  const steps = [
    [20, 'Connecting to market data...'],
    [45, 'Fetching live prices...'],
    [65, 'Loading news feeds...'],
    [82, 'Calibrating signals...'],
    [95, 'Building dashboard...'],
    [100,'Ready.'],
  ];

  // Start fetching data while loading animates
  const pricePromise = fetchPrices();
  const newsPromise  = fetchNews();

  for (const [pct, msg] of steps) {
    bar.style.width = pct + '%';
    status.textContent = msg;
    await sleep(300);
  }

  await sleep(150);
  document.getElementById('loading-screen').classList.add('fade-out');
  await sleep(500);
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Await data then render
  await Promise.allSettled([pricePromise, newsPromise]);
  initDashboard();
  startAutoRefresh();
}

// ---------- INIT ----------
function initDashboard() {
  buildTickerStrip();
  buildNewsFeed();
  buildConvictionList();
  buildCycles();
  buildSignals();
  buildEvents();
  buildHeatmap();
  updateHeaderStats();
  drawFearGauge(STATE.fgValue);
  startClock();
  setupNewsTabs();
  setupModalClose();
}

// ---------- LIVE DATA FETCHING ----------
async function fetchPrices() {
  try {
    const r = await fetch('/api/prices');
    if (!r.ok) throw new Error('Prices API error');
    const data = await r.json();
    // Merge live data into state
    for (const [sym, info] of Object.entries(data)) {
      if (sym.startsWith('_')) continue;
      if (info.price && info.chg !== undefined) {
        STATE.prices[sym] = { ...info, sym };
      }
    }
    STATE.lastPriceUpdate = new Date();
  } catch (err) {
    console.warn('Live prices unavailable, using fallback:', err.message);
    // Use fallback data
    for (const [sym, info] of Object.entries(FALLBACK_PRICES)) {
      if (!STATE.prices[sym]) STATE.prices[sym] = { ...info, sym };
    }
  }
}

async function fetchNews() {
  try {
    const r = await fetch('/api/news');
    if (!r.ok) throw new Error('News API error');
    const data = await r.json();
    if (data.items && data.items.length > 0) {
      STATE.news = data.items.map(item => ({
        ...item,
        tagLabel: tagLabel(item.tag),
      }));
      STATE.lastNewsUpdate = new Date();
    } else {
      throw new Error('Empty news response');
    }
  } catch (err) {
    console.warn('Live news unavailable, using fallback:', err.message);
    if (STATE.news.length === 0) STATE.news = FALLBACK_NEWS;
  }
}

function tagLabel(tag) {
  const map = { geo:'Geopolitical', central:'Central Banks', trade:'Trade', energy:'Energy', macro:'Macro' };
  return map[tag] || 'Macro';
}

// ---------- AUTO REFRESH ----------
function startAutoRefresh() {
  // Prices every 30s
  setInterval(async () => {
    await fetchPrices();
    buildTickerStrip();
    updateHeaderStats();
    buildHeatmap();
    updateHeatmapTimestamp();
  }, PRICE_INTERVAL);

  // News every 5 min
  setInterval(async () => {
    await fetchNews();
    buildNewsFeed();
    updateNewsTimestamp();
  }, NEWS_INTERVAL);

  // F&G drift
  setInterval(() => {
    STATE.fgValue = Math.max(5, Math.min(95, STATE.fgValue + (Math.random() - 0.5) * 2));
    drawFearGauge(Math.round(STATE.fgValue));
  }, FG_INTERVAL);
}

// ---------- REFRESH BUTTON ----------
async function refreshNews() {
  const btn = document.querySelector('.nrb-btn');
  if (btn) { btn.textContent = '↺ Loading...'; btn.disabled = true; }
  document.getElementById('news-updated').textContent = 'Fetching...';
  await fetchNews();
  buildNewsFeed();
  updateNewsTimestamp();
  if (btn) { btn.textContent = '↺ Refresh'; btn.disabled = false; }
}

function updateNewsTimestamp() {
  const el = document.getElementById('news-updated');
  if (el) el.textContent = STATE.lastNewsUpdate
    ? `Updated ${timeAgo(STATE.lastNewsUpdate)}`
    : 'Live feed active';
}

function updateHeatmapTimestamp() {
  const el = document.getElementById('heatmap-updated');
  if (el) el.textContent = STATE.lastPriceUpdate
    ? `Updated ${timeAgo(STATE.lastPriceUpdate)}`
    : 'Live data';
}

// ---------- CLOCK ----------
function startClock() {
  function tick() {
    const now = new Date();
    const el = document.getElementById('live-time');
    const el2 = document.getElementById('live-date');
    if (el)  el.textContent  = now.toUTCString().split(' ')[4] + ' UTC';
    if (el2) el2.textContent = now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- HEADER STATS ----------
function updateHeaderStats() {
  const p = STATE.prices;
  setHeaderVal('h-vix',  p['VIX']?.price,    v => v?.toFixed(1));
  setHeaderVal('h-dxy',  p['DXY']?.price,    v => v?.toFixed(2));
  setHeaderVal('h-btc',  p['BTC/USD']?.price,v => v ? '$' + Math.round(v).toLocaleString() : null);
  setHeaderVal('h-gold', p['GOLD']?.price,   v => v ? '$' + v.toFixed(2) : null);
}

function setHeaderVal(id, val, fmt) {
  const el = document.getElementById(id);
  if (!el || val == null) return;
  const str = fmt(val);
  if (str && el.textContent !== str) {
    el.textContent = str;
  }
}

// ---------- TICKER STRIP ----------
function buildTickerStrip() {
  const track = document.getElementById('ticker-track');
  const order = ['S&P 500','NASDAQ','FTSE 100','DAX','GOLD','SILVER','OIL WTI','BTC/USD','ETH/USD','SOL/USD','EUR/USD','GBP/USD','USD/JPY','DXY','US 10Y','VIX','NAT GAS','COPPER'];
  const items = order.map(sym => STATE.prices[sym]).filter(Boolean);

  if (!items.length) {
    track.innerHTML = '<div class="ticker-loading">Fetching live prices...</div>';
    return;
  }

  // Double for seamless loop
  const html = [...items, ...items].map((t, i) => {
    const up  = (t.chg || 0) >= 0;
    const chg = t.chg != null ? ((up?'+':'') + t.chg.toFixed(2) + '%') : '—';
    return `<div class="ticker-item" onclick="openAssetAnalysis('${t.sym}')">
      <span class="ti-sym">${t.sym}</span>
      <span class="ti-price ${up?'up':'down'}">${fmtPrice(t)}</span>
      <span class="ti-chg ${up?'up':'down'}">${chg}</span>
    </div>`;
  }).join('');
  track.innerHTML = html;
}

function fmtPrice(t) {
  if (!t.price) return '—';
  if (t.price > 10000) return '$' + t.price.toLocaleString('en-GB',{maximumFractionDigits:0});
  if (t.price > 100)   return t.price.toFixed(2);
  if (t.price > 10)    return t.price.toFixed(3);
  return t.price.toFixed(4);
}

// ---------- NEWS FEED ----------
function setupNewsTabs() {
  document.querySelectorAll('.ntab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ntab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.newsFilter = btn.dataset.filter;
      buildNewsFeed();
    });
  });
}

function buildNewsFeed() {
  const list = document.getElementById('news-list');
  if (!list) return;

  const filtered = STATE.newsFilter === 'all'
    ? STATE.news
    : STATE.news.filter(n => n.tag === STATE.newsFilter);

  if (!filtered.length) {
    list.innerHTML = '<div class="feed-loading" style="color:var(--text3);font-family:var(--mono);font-size:11px;padding:20px">No stories in this category yet.</div>';
    return;
  }

  list.innerHTML = filtered.map(n => `
    <div class="news-item" onclick="openNewsAnalysis(${JSON.stringify(n.headline)})">
      <div class="news-tags">
        <span class="ntag ntag-${n.tag}">${n.tagLabel || tagLabel(n.tag)}</span>
        ${n.hot ? '<span class="ntag ntag-hot">Breaking</span>' : ''}
      </div>
      <div class="news-headline">${escHtml(n.headline)}</div>
      <div class="news-meta">${escHtml(n.meta || '')} · click for analysis ↗</div>
    </div>`).join('');

  updateNewsTimestamp();
}

// ---------- CONVICTION ----------
function buildConvictionList() {
  const list = document.getElementById('conviction-list');
  if (!list) return;
  list.innerHTML = CONVICTION_ASSETS.map(c => `
    <div class="conv-item" onclick="openAssetAnalysis(${JSON.stringify(c.asset)})">
      <span class="conv-sym" style="color:${c.color}">${c.asset}</span>
      <span class="conv-dir dir-${c.dir}">${c.dir.toUpperCase()}</span>
      <div class="conv-bar-wrap">
        <div class="conv-bar" style="width:0%;background:${c.color}" data-target="${c.score}"></div>
      </div>
      <span class="conv-score" style="color:${c.color}">${c.score}</span>
    </div>`).join('');

  // Animate bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.conv-bar').forEach(bar => {
      const target = bar.dataset.target;
      setTimeout(() => { bar.style.width = target + '%'; }, 100);
    });
  });
}

// ---------- CYCLES ----------
function buildCycles() {
  const el = document.getElementById('cycles-list');
  if (!el) return;
  el.innerHTML = CYCLES.map(c => `
    <div class="cycle-row">
      <span class="cycle-name">${c.name}</span>
      <span class="cycle-phase ${c.cls}">${c.phase}</span>
    </div>`).join('');
}

// ---------- SIGNALS ----------
function buildSignals() {
  const el = document.getElementById('signals-list');
  if (!el) return;
  el.innerHTML = SIGNALS.map(s => `
    <div class="signal-item">
      <div class="signal-icon" style="background:${s.col}18">${s.icon}</div>
      <div class="signal-body">
        <div class="signal-text">${s.text}</div>
        <div class="signal-str" style="color:${s.col}">${s.str} CONVICTION</div>
      </div>
    </div>`).join('');
}

// ---------- EVENTS ----------
function buildEvents() {
  const el = document.getElementById('events-list');
  if (!el) return;
  el.innerHTML = EVENTS.map(e => `
    <div class="event-item" onclick="openAnalysis('event', ${JSON.stringify('Analyse this upcoming macro event and exactly how to trade around it: ' + e.text + '. Cover: key scenarios, which assets move most, pre-event positioning, and what happens in each scenario.')})">
      <div class="event-date">${e.date}</div>
      <div class="event-imp imp-${e.imp}"></div>
      <div class="event-text">${e.text}</div>
    </div>`).join('');
}

// ---------- HEATMAP ----------
function buildHeatmap() {
  const wrap = document.getElementById('heatmap');
  if (!wrap) return;
  wrap.innerHTML = HEATMAP_CATEGORIES.map(cat => `
    <div>
      <div class="hmap-row-label">${cat.category}</div>
      <div class="hmap-row">
        ${cat.assets.map(a => {
          const liveData = a.key ? STATE.prices[a.key] : null;
          const val = liveData ? (liveData.chg || 0) : (a.val || 0);
          const label = a.label;
          return `<div class="hmap-cell" style="${cellBg(val)}"
            onclick="openAssetAnalysis(${JSON.stringify(a.key || a.label)})">
            <div class="hc-sym" style="color:${cellTxt(val)}">${label}</div>
            <div class="hc-val" style="color:${cellTxt(val)}">${val>=0?'+':''}${val.toFixed(1)}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function cellBg(v) {
  if (v <= -3)   return 'background:#7f1d1d';
  if (v <= -1)   return 'background:#991b1b';
  if (v <= -0.2) return 'background:#2d1f1f';
  if (v <   0.2) return 'background:#1a2028';
  if (v <   1)   return 'background:#1a2a1a';
  if (v <   3)   return 'background:#14532d';
  return 'background:#166534';
}
function cellTxt(v) {
  if (v < -0.5) return '#fca5a5';
  if (v >  0.5) return '#86efac';
  return '#6b7280';
}

// ---------- FEAR & GREED ----------
function drawFearGauge(val) {
  const canvas = document.getElementById('fg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 76;
  ctx.clearRect(0, 0, 200, 110);

  // BG arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineWidth = 11; ctx.strokeStyle = '#1a2028'; ctx.stroke();

  // Value arc
  const pct = val / 100;
  const grad = ctx.createLinearGradient(cx-r, cy, cx+r, cy);
  grad.addColorStop(0,    '#ef4444');
  grad.addColorStop(0.33, '#f59e0b');
  grad.addColorStop(0.66, '#22c55e');
  grad.addColorStop(1,    '#06b6d4');
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + pct * Math.PI, false);
  ctx.lineWidth = 11; ctx.strokeStyle = grad; ctx.lineCap = 'round'; ctx.stroke();

  // Needle
  const angle = Math.PI + pct * Math.PI;
  const nx = cx + (r - 18) * Math.cos(angle);
  const ny = cy + (r - 18) * Math.sin(angle);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
  ctx.lineWidth = 2; ctx.strokeStyle = '#e2e8f0'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2);
  ctx.fillStyle = '#e2e8f0'; ctx.fill();

  // Text
  const numEl = document.getElementById('fg-num');
  const lblEl = document.getElementById('fg-label');
  const col = val<25?'#ef4444':val<45?'#f59e0b':val<55?'#94a3b8':val<75?'#22c55e':'#06b6d4';
  if (numEl) { numEl.textContent = Math.round(val); numEl.style.color = col; }
  if (lblEl) lblEl.textContent = val<25?'EXTREME FEAR':val<45?'FEAR':val<55?'NEUTRAL':val<75?'GREED':'EXTREME GREED';

  // Update VIX / 10Y / DXY from live prices
  const vixEl   = document.getElementById('vix-val');
  const us10yEl = document.getElementById('us10y-val');
  const dxyEl   = document.getElementById('dxy-val');
  const hVix    = document.getElementById('h-vix');
  const hDxy    = document.getElementById('h-dxy');

  if (STATE.prices['VIX']?.price) {
    const v = STATE.prices['VIX'].price.toFixed(1);
    if (vixEl) vixEl.textContent = v;
    if (hVix)  hVix.textContent  = v;
  }
  if (STATE.prices['US 10Y']?.price && us10yEl) {
    us10yEl.textContent = STATE.prices['US 10Y'].price.toFixed(2) + '%';
  }
  if (STATE.prices['DXY']?.price) {
    const d = STATE.prices['DXY'].price.toFixed(2);
    if (dxyEl) dxyEl.textContent = d;
    if (hDxy)  hDxy.textContent  = d;
  }
}

// ---------- MODAL ----------
function setupModalClose() {
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });
}
function handleModalClick(e) { if (e.target.id === 'analysis-modal') closeModal(); }
function closeModal() {
  document.getElementById('analysis-modal').style.display = 'none';
  document.body.style.overflow = '';
}
function openModal(title, subtitle) {
  document.getElementById('modal-title').textContent    = title;
  document.getElementById('modal-subtitle').textContent = subtitle || '';
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-loading">
      <div class="modal-spinner"></div>
      <div class="modal-loading-text">Analysing market conditions...</div>
    </div>`;
  document.getElementById('analysis-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// ---------- ANALYSIS TRIGGERS ----------
async function openAnalysis(id, prompt) {
  openModal('Market Analysis');
  await runAnalysis(prompt);
}

async function openNewsAnalysis(headline) {
  openModal('News Analysis', headline.substring(0, 80) + (headline.length > 80 ? '…' : ''));
  const prompt = `Analyse this macro/geopolitical news event as a professional trader:\n\n"${headline}"\n\nProvide:\n### Why This Matters\nExplain the macro significance and immediate market implications.\n\n### Asset Impacts\nWhich specific markets are affected and how (direction + magnitude).\n\n### Trade Ideas\nGive 2-3 specific trades: asset, LONG or SHORT, entry zone, stop loss, target, timeframe.\n\n### Key Risks\nWhat could invalidate these trades.\n\n### Watch Next\nSpecific data points or events to monitor.`;
  await runAnalysis(prompt);
}

async function openAssetAnalysis(asset) {
  openModal(`${asset} — Deep Analysis`, 'Live macro + technical breakdown');
  const priceData = STATE.prices[asset];
  const priceCtx  = priceData
    ? `Current price: ${fmtPrice(priceData)}, 24h change: ${priceData.chg?.toFixed(2)}%`
    : '';

  const prompt = `Provide a professional deep analysis of ${asset} for a macro trader. ${priceCtx}\n\n### Current Macro Backdrop\nKey macro forces driving this asset right now.\n\n### Technical Levels\nCurrent price context, key support levels, resistance levels, and important moving averages.\n\n### Trade Thesis\nClear directional bias: LONG or SHORT. Entry zone, stop loss, Target 1, Target 2, Target 3 with timeframes.\n\n### Fundamental Drivers (3-6 months)\nWhat drives this asset over the medium term.\n\n### Risk Factors\nTop 3 risks that would invalidate the thesis with specific trigger levels.\n\n### Correlation Trades\nWhat other assets move with it and how to hedge or amplify the position.`;
  await runAnalysis(prompt);
}

// ---------- API CALL ----------
async function runAnalysis(prompt) {
  const body = document.getElementById('modal-body');

  // Build context string from live prices
  const priceCtx = Object.entries(STATE.prices)
    .slice(0, 10)
    .map(([sym, d]) => `${sym}: ${fmtPrice(d)} (${d.chg?.toFixed(2)}%)`)
    .join(', ');

  try {
    const r = await fetch('/api/analyse', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt, context: `Live market snapshot — ${priceCtx}` }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${r.status}`);
    }

    const data = await r.json();
    body.innerHTML = `<div class="mc">${renderMd(data.text)}</div>`;
  } catch (err) {
    body.innerHTML = `
      <div class="modal-error">
        <p style="color:var(--text);margin-bottom:12px;font-size:13px">⚙️ Analysis Unavailable</p>
        <p>To enable AI analysis, add your Anthropic API key in Vercel:</p>
        <br>
        <p>1. Vercel project → Settings → Environment Variables</p>
        <p>2. Add: <code>ANTHROPIC_API_KEY</code> = your key</p>
        <p>3. Redeploy</p>
        <br>
        <p style="color:var(--text3)">Get your key at <strong style="color:var(--cyan)">console.anthropic.com</strong></p>
        <br>
        <p style="color:var(--text3);font-size:11px">Error: ${escHtml(err.message)}</p>
      </div>`;
  }
}

// ---------- MARKDOWN RENDERER ----------
function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^# (.+)$/gm,   '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm,  '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\b(LONG|BUY)\b/g,   '<span class="up">$1</span>')
    .replace(/\b(SHORT|SELL)\b/g,  '<span class="dn">$1</span>')
    .replace(/\b(WATCH|NEUTRAL)\b/g,'<span class="am">$1</span>')
    .replace(/(\$[\d,]+(?:\.\d+)?)/g,'<span class="tg">$1</span>');
}

// ---------- HELPERS ----------
function sleep(ms)  { return new Promise(r => setTimeout(r, ms)); }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
