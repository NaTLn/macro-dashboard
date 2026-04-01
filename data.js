// ============================================
// MACRO·INTEL — Application Engine v3
// Static-first: renders immediately from data.js
// Live data layers on top when APIs respond
// ============================================

const STATE = {
  prices:         {},
  news:           [],
  newsFilter:     'all',
  fgValue:        32,
  lastPriceUpdate: null,
  lastNewsUpdate:  null,
};

const PRICE_INTERVAL = 30 * 1000;
const NEWS_INTERVAL  = 5  * 60 * 1000;
const FG_INTERVAL    = 6  * 1000;

// ============================================
// BOOT
// ============================================
window.addEventListener('DOMContentLoaded', () => bootSequence());

async function bootSequence() {
  const bar    = document.getElementById('loader-bar');
  const status = document.getElementById('loader-status');

  // Load static data into state immediately
  loadFallbackPrices();
  loadFallbackNews();

  const steps = [
    [30,  'Loading data...'],
    [60,  'Building dashboard...'],
    [85,  'Connecting live feeds...'],
    [100, 'Ready.'],
  ];
  for (const [pct, msg] of steps) {
    bar.style.width = pct + '%';
    status.textContent = msg;
    await sleep(200);
  }
  await sleep(150);

  document.getElementById('loading-screen').classList.add('fade-out');
  await sleep(400);
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Render immediately with static data
  initDashboard();

  // Then fetch live data silently in background
  fetchLivePrices();
  fetchLiveNews();
  startAutoRefresh();
}

function loadFallbackPrices() {
  for (const [sym, info] of Object.entries(FALLBACK_PRICES)) {
    STATE.prices[sym] = { ...info, sym };
  }
}

function loadFallbackNews() {
  if (STATE.news.length === 0) {
    STATE.news = FALLBACK_NEWS.map(n => ({ ...n, tagLabel: tagLabel(n.tag) }));
  }
}

// ============================================
// INIT
// ============================================
function initDashboard() {
  startClock();
  buildTickerStrip();
  buildNewsFeed();
  buildConvictionList();
  buildCycles();
  buildSignals();
  buildEvents();
  buildHeatmap();
  updateHeaderStats();
  drawFearGauge(STATE.fgValue);
  setupNewsTabs();
  setupModalClose();
  updateNewsTimestamp();
  updateHeatmapTimestamp();
}

// ============================================
// LIVE DATA FETCHING
// ============================================
async function fetchLivePrices() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const r = await fetch('/api/prices', { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    let updated = 0;
    for (const [sym, info] of Object.entries(data)) {
      if (sym.startsWith('_')) continue;
      if (info && info.price != null && info.chg != null) {
        STATE.prices[sym] = { ...info, sym };
        updated++;
      }
    }
    if (updated > 0) {
      STATE.lastPriceUpdate = new Date();
      buildTickerStrip();
      updateHeaderStats();
      buildHeatmap();
      updateHeatmapTimestamp();
    }
  } catch (err) {
    console.warn('Live prices unavailable:', err.message);
  }
}

async function fetchLiveNews() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const r = await fetch('/api/news', { signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    if (data.items && data.items.length > 0) {
      STATE.news = data.items.map(item => ({ ...item, tagLabel: tagLabel(item.tag) }));
      STATE.lastNewsUpdate = new Date();
      buildNewsFeed();
      updateNewsTimestamp();
    }
  } catch (err) {
    console.warn('Live news unavailable:', err.message);
  }
}

function startAutoRefresh() {
  setInterval(fetchLivePrices, PRICE_INTERVAL);
  setInterval(fetchLiveNews,   NEWS_INTERVAL);
  setInterval(() => {
    STATE.fgValue = Math.max(5, Math.min(95, STATE.fgValue + (Math.random() - 0.5) * 2.5));
    drawFearGauge(Math.round(STATE.fgValue));
  }, FG_INTERVAL);
}

async function refreshNews() {
  const btn = document.querySelector('.nrb-btn');
  const lbl = document.getElementById('news-updated');
  if (btn) { btn.textContent = 'Loading...'; btn.disabled = true; }
  if (lbl) lbl.textContent = 'Fetching...';
  await fetchLiveNews();
  if (btn) { btn.textContent = 'Refresh'; btn.disabled = false; }
}

function updateNewsTimestamp() {
  const el = document.getElementById('news-updated');
  if (el) el.textContent = STATE.lastNewsUpdate ? 'Live · ' + timeAgo(STATE.lastNewsUpdate) : 'Showing cached stories';
}
function updateHeatmapTimestamp() {
  const el = document.getElementById('heatmap-updated');
  if (el) el.textContent = STATE.lastPriceUpdate ? 'Live · ' + timeAgo(STATE.lastPriceUpdate) : 'Cached data';
}

// ============================================
// CLOCK
// ============================================
function startClock() {
  function tick() {
    const now = new Date();
    const t = document.getElementById('live-time');
    const d = document.getElementById('live-date');
    if (t) t.textContent = now.toUTCString().split(' ')[4] + ' UTC';
    if (d) d.textContent = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
  }
  tick();
  setInterval(tick, 1000);
}

// ============================================
// HEADER STATS
// ============================================
function updateHeaderStats() {
  const p = STATE.prices;
  const set = (id, sym, fmt) => {
    const el = document.getElementById(id);
    const val = p[sym] && p[sym].price;
    if (el && val != null) el.textContent = fmt(val);
  };
  set('h-vix',  'VIX',     v => v.toFixed(1));
  set('h-dxy',  'DXY',     v => v.toFixed(2));
  set('h-btc',  'BTC/USD', v => '$' + Math.round(v).toLocaleString());
  set('h-gold', 'GOLD',    v => '$' + v.toFixed(2));
  const vixEl   = document.getElementById('vix-val');
  const us10yEl = document.getElementById('us10y-val');
  const dxyEl   = document.getElementById('dxy-val');
  if (vixEl   && p['VIX']   && p['VIX'].price)    vixEl.textContent   = p['VIX'].price.toFixed(1);
  if (us10yEl && p['US 10Y']&& p['US 10Y'].price) us10yEl.textContent = p['US 10Y'].price.toFixed(2) + '%';
  if (dxyEl   && p['DXY']   && p['DXY'].price)    dxyEl.textContent   = p['DXY'].price.toFixed(2);
}

// ============================================
// TICKER STRIP
// ============================================
const TICKER_ORDER = ['S&P 500','NASDAQ','FTSE 100','DAX','GOLD','SILVER','OIL WTI','BTC/USD','ETH/USD','SOL/USD','EUR/USD','GBP/USD','USD/JPY','DXY','US 10Y','VIX','NAT GAS','COPPER'];

function buildTickerStrip() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const items = TICKER_ORDER.map(sym => STATE.prices[sym]).filter(Boolean);
  if (!items.length) { track.innerHTML = '<div class="ticker-loading">Loading prices...</div>'; return; }
  const html = [...items, ...items].map(t => {
    const up  = (t.chg || 0) >= 0;
    const chg = t.chg != null ? (up?'+':'') + t.chg.toFixed(2) + '%' : '—';
    return '<div class="ticker-item" onclick="openAssetAnalysis(' + JSON.stringify(t.sym) + ')">'
      + '<span class="ti-sym">' + t.sym + '</span>'
      + '<span class="ti-price ' + (up?'up':'down') + '">' + fmtPrice(t) + '</span>'
      + '<span class="ti-chg ' + (up?'up':'down') + '">' + chg + '</span>'
      + '</div>';
  }).join('');
  track.innerHTML = html;
}

function fmtPrice(t) {
  if (!t.price) return '—';
  if (t.price > 10000) return '$' + t.price.toLocaleString('en-GB', { maximumFractionDigits: 0 });
  if (t.price > 100)   return t.price.toFixed(2);
  if (t.price > 10)    return t.price.toFixed(3);
  return t.price.toFixed(4);
}

// ============================================
// NEWS FEED
// ============================================
function setupNewsTabs() {
  document.querySelectorAll('.ntab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.ntab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      STATE.newsFilter = btn.dataset.filter;
      buildNewsFeed();
    });
  });
}

function buildNewsFeed() {
  var list = document.getElementById('news-list');
  if (!list) return;
  var filtered = STATE.newsFilter === 'all' ? STATE.news : STATE.news.filter(function(n) { return n.tag === STATE.newsFilter; });
  if (!filtered.length) {
    list.innerHTML = '<div style="padding:20px;font-family:var(--mono);font-size:11px;color:var(--text3)">No stories in this category.</div>';
    return;
  }
  list.innerHTML = filtered.map(function(n) {
    return '<div class="news-item" onclick="openNewsAnalysis(' + JSON.stringify(n.headline) + ')">'
      + '<div class="news-tags">'
      + '<span class="ntag ntag-' + n.tag + '">' + (n.tagLabel || tagLabel(n.tag)) + '</span>'
      + (n.hot ? '<span class="ntag ntag-hot">Breaking</span>' : '')
      + '</div>'
      + '<div class="news-headline">' + escHtml(n.headline) + '</div>'
      + '<div class="news-meta">' + escHtml(n.meta || '') + ' · click for analysis</div>'
      + '</div>';
  }).join('');
}

// ============================================
// CONVICTION / CYCLES / SIGNALS / EVENTS
// ============================================
function buildConvictionList() {
  var list = document.getElementById('conviction-list');
  if (!list) return;
  list.innerHTML = CONVICTION_ASSETS.map(function(c) {
    return '<div class="conv-item" onclick="openAssetAnalysis(' + JSON.stringify(c.asset) + ')">'
      + '<span class="conv-sym" style="color:' + c.color + '">' + c.asset + '</span>'
      + '<span class="conv-dir dir-' + c.dir + '">' + c.dir.toUpperCase() + '</span>'
      + '<div class="conv-bar-wrap"><div class="conv-bar" style="width:0%;background:' + c.color + '" data-target="' + c.score + '"></div></div>'
      + '<span class="conv-score" style="color:' + c.color + '">' + c.score + '</span>'
      + '</div>';
  }).join('');
  requestAnimationFrame(function() {
    document.querySelectorAll('.conv-bar').forEach(function(bar) {
      setTimeout(function() { bar.style.width = bar.dataset.target + '%'; }, 200);
    });
  });
}

function buildCycles() {
  var el = document.getElementById('cycles-list');
  if (!el) return;
  el.innerHTML = CYCLES.map(function(c) {
    return '<div class="cycle-row"><span class="cycle-name">' + c.name + '</span><span class="cycle-phase ' + c.cls + '">' + c.phase + '</span></div>';
  }).join('');
}

function buildSignals() {
  var el = document.getElementById('signals-list');
  if (!el) return;
  el.innerHTML = SIGNALS.map(function(s) {
    return '<div class="signal-item">'
      + '<div class="signal-icon" style="background:' + s.col + '18">' + s.icon + '</div>'
      + '<div class="signal-body"><div class="signal-text">' + s.text + '</div>'
      + '<div class="signal-str" style="color:' + s.col + '">' + s.str + ' CONVICTION</div></div>'
      + '</div>';
  }).join('');
}

function buildEvents() {
  var el = document.getElementById('events-list');
  if (!el) return;
  el.innerHTML = EVENTS.map(function(e) {
    return '<div class="event-item" onclick="openAnalysis(\'event\', ' + JSON.stringify('How should a macro trader position around this event: ' + e.text + '? Cover key scenarios, which assets move most, and best positioning strategy.') + ')">'
      + '<div class="event-date">' + e.date + '</div>'
      + '<div class="event-imp imp-' + e.imp + '"></div>'
      + '<div class="event-text">' + e.text + '</div>'
      + '</div>';
  }).join('');
}

// ============================================
// HEATMAP
// ============================================
function buildHeatmap() {
  var wrap = document.getElementById('heatmap');
  if (!wrap) return;
  wrap.innerHTML = HEATMAP_CATEGORIES.map(function(cat) {
    return '<div><div class="hmap-row-label">' + cat.category + '</div><div class="hmap-row">'
      + cat.assets.map(function(a) {
          var live = a.key ? STATE.prices[a.key] : null;
          var val  = live ? (live.chg || 0) : (a.val || 0);
          return '<div class="hmap-cell" style="' + cellBg(val) + '" onclick="openAssetAnalysis(' + JSON.stringify(a.key || a.label) + ')">'
            + '<div class="hc-sym" style="color:' + cellTxt(val) + '">' + a.label + '</div>'
            + '<div class="hc-val" style="color:' + cellTxt(val) + '">' + (val>=0?'+':'') + val.toFixed(1) + '%</div>'
            + '</div>';
        }).join('')
      + '</div></div>';
  }).join('');
}

function cellBg(v) {
  if (v <= -3) return 'background:#7f1d1d';
  if (v <= -1) return 'background:#991b1b';
  if (v <= -.2)return 'background:#2d1f1f';
  if (v < .2)  return 'background:#1a2028';
  if (v < 1)   return 'background:#1a2a1a';
  if (v < 3)   return 'background:#14532d';
  return 'background:#166534';
}
function cellTxt(v) {
  if (v < -.5) return '#fca5a5';
  if (v > .5)  return '#86efac';
  return '#6b7280';
}

// ============================================
// FEAR & GREED GAUGE
// ============================================
function drawFearGauge(val) {
  var canvas = document.getElementById('fg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var cx = 100, cy = 100, r = 76;
  ctx.clearRect(0, 0, 200, 110);
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineWidth = 11; ctx.strokeStyle = '#1a2028'; ctx.stroke();
  var pct  = val / 100;
  var grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, '#ef4444'); grad.addColorStop(.33, '#f59e0b');
  grad.addColorStop(.66, '#22c55e'); grad.addColorStop(1, '#06b6d4');
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + pct * Math.PI, false);
  ctx.lineWidth = 11; ctx.strokeStyle = grad; ctx.lineCap = 'round'; ctx.stroke();
  var angle = Math.PI + pct * Math.PI;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r-18)*Math.cos(angle), cy + (r-18)*Math.sin(angle));
  ctx.lineWidth = 2; ctx.strokeStyle = '#e2e8f0'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fillStyle = '#e2e8f0'; ctx.fill();
  var col = val<25?'#ef4444':val<45?'#f59e0b':val<55?'#94a3b8':val<75?'#22c55e':'#06b6d4';
  var numEl = document.getElementById('fg-num');
  var lblEl = document.getElementById('fg-label');
  if (numEl) { numEl.textContent = Math.round(val); numEl.style.color = col; }
  if (lblEl) lblEl.textContent = val<25?'EXTREME FEAR':val<45?'FEAR':val<55?'NEUTRAL':val<75?'GREED':'EXTREME GREED';
  updateHeaderStats();
}

// ============================================
// MODAL
// ============================================
function setupModalClose() {
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
}
function handleModalClick(e) { if (e.target.id === 'analysis-modal') closeModal(); }
function closeModal() {
  document.getElementById('analysis-modal').style.display = 'none';
  document.body.style.overflow = '';
}
function openModal(title, subtitle) {
  document.getElementById('modal-title').textContent    = title;
  document.getElementById('modal-subtitle').textContent = subtitle || '';
  document.getElementById('modal-body').innerHTML = '<div class="modal-loading"><div class="modal-spinner"></div><div class="modal-loading-text">Analysing market conditions...</div></div>';
  document.getElementById('analysis-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// ============================================
// ANALYSIS
// ============================================
async function openAnalysis(id, prompt) {
  openModal('Market Analysis');
  await runAnalysis(prompt);
}
async function openNewsAnalysis(headline) {
  openModal('News Analysis', headline.substring(0, 80) + (headline.length > 80 ? '…' : ''));
  await runAnalysis('Analyse this macro news event as a professional trader:\n\n"' + headline + '"\n\n### Why This Matters\nMacro significance and market implications.\n\n### Asset Impacts\nWhich markets move and how.\n\n### Trade Ideas\n2-3 specific trades with asset, LONG/SHORT, entry, stop, target, timeframe.\n\n### Key Risks\nWhat invalidates the trades.\n\n### Watch Next\nData and events to monitor.');
}
async function openAssetAnalysis(asset) {
  openModal(asset + ' — Deep Analysis', 'Live macro + technical breakdown');
  var priceData = STATE.prices[asset];
  var priceCtx  = priceData ? 'Current: ' + fmtPrice(priceData) + ', 24h: ' + (priceData.chg||0).toFixed(2) + '%' : '';
  await runAnalysis('Deep analysis of ' + asset + '. ' + priceCtx + '\n\n### Macro Backdrop\nKey forces driving this asset.\n\n### Technical Levels\nSupport, resistance, key moving averages.\n\n### Trade Thesis\nLONG or SHORT. Entry zone, stop loss, Target 1, Target 2, Target 3 with timeframes.\n\n### Fundamental Drivers\nMedium-term (3-6 month) drivers.\n\n### Risk Factors\nTop 3 risks with specific trigger levels.\n\n### Correlated Trades\nRelated assets to hedge or amplify.');
}

async function runAnalysis(prompt) {
  var body = document.getElementById('modal-body');
  var priceCtx = Object.entries(STATE.prices).slice(0,10).map(function(e) {
    return e[0] + ': ' + fmtPrice(e[1]) + ' (' + (e[1].chg||0).toFixed(2) + '%)';
  }).join(', ');
  try {
    var r = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt, context: 'Market snapshot: ' + priceCtx }),
    });
    if (!r.ok) {
      var err = await r.json().catch(function() { return { error: 'HTTP ' + r.status }; });
      throw new Error(err.error || 'HTTP ' + r.status);
    }
    var data = await r.json();
    body.innerHTML = '<div class="mc">' + renderMd(data.text) + '</div>';
  } catch (err) {
    body.innerHTML = '<div class="modal-error">'
      + '<p style="color:var(--text);margin-bottom:12px">⚙️ AI Analysis Unavailable</p>'
      + '<p>Add your Anthropic API key to enable this:</p><br>'
      + '<p>1. Vercel → Settings → Environment Variables</p>'
      + '<p>2. Add: <code>ANTHROPIC_API_KEY</code></p>'
      + '<p>3. Redeploy</p><br>'
      + '<p style="color:var(--text3)">console.anthropic.com</p><br>'
      + '<p style="color:var(--text3);font-size:11px">Error: ' + escHtml(err.message) + '</p>'
      + '</div>';
  }
}

// ============================================
// MARKDOWN
// ============================================
function renderMd(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,   '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\- (.+)$/gm,  '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, function(s) { return '<ul>' + s + '</ul>'; })
    .replace(/\n\n/g, '</p><p>')
    .replace(/\b(LONG|BUY)\b/g,   '<span class="up">$1</span>')
    .replace(/\b(SHORT|SELL)\b/g,  '<span class="dn">$1</span>')
    .replace(/(\$[\d,]+(?:\.\d+)?)/g,'<span class="tg">$1</span>');
}

// ============================================
// HELPERS
// ============================================
function tagLabel(tag) {
  var map = { geo:'Geopolitical', central:'Central Banks', trade:'Trade', energy:'Energy', macro:'Macro' };
  return map[tag] || 'Macro';
}
function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function timeAgo(d) {
  var s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}
