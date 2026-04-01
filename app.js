// ============================================
// MACRO·INTEL — Application Core
// ============================================

// ---------- CONFIG ----------
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
// API key is handled by Vercel environment — set ANTHROPIC_API_KEY in your Vercel project settings
// For direct use, replace the empty string below with your key (never commit to public repos)
const API_KEY = window.ANTHROPIC_API_KEY || '';

// ---------- STATE ----------
let activeNewsFilter = 'all';
let fgValue = 32;
let tickerData = [...TICKERS];
let currentModalId = null;

// ---------- INIT ----------
window.addEventListener('DOMContentLoaded', () => {
  bootSequence();
});

async function bootSequence() {
  const bar    = document.getElementById('loader-bar');
  const status = document.getElementById('loader-status');
  const steps  = [
    [15,  'Connecting to data feeds...'],
    [35,  'Loading macro signals...'],
    [55,  'Calibrating conviction matrix...'],
    [75,  'Building heatmap...'],
    [90,  'Initialising live prices...'],
    [100, 'Ready.'],
  ];
  for (const [pct, msg] of steps) {
    bar.style.width = pct + '%';
    status.textContent = msg;
    await sleep(280);
  }
  await sleep(200);
  document.getElementById('loading-screen').classList.add('fade-out');
  await sleep(500);
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  initDashboard();
}

function initDashboard() {
  buildTickerStrip();
  buildNewsFeed();
  buildConvictionList();
  buildCycles();
  buildSignals();
  buildEvents();
  buildHeatmap();
  drawFearGauge(fgValue);
  startClock();
  startPriceFlicker();
  startFGPulse();
  setupNewsTabs();
}

// ---------- CLOCK ----------
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('live-time').textContent =
      now.toUTCString().split(' ')[4] + ' UTC';
    document.getElementById('live-date').textContent =
      now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- TICKER STRIP ----------
function buildTickerStrip() {
  const track = document.getElementById('ticker-track');
  // Duplicate for seamless loop
  const items = [...tickerData, ...tickerData];
  track.innerHTML = items.map((t, i) => {
    const up = t.chg >= 0;
    return `<div class="ticker-item" id="ti-${i}" onclick="openAssetAnalysis('${t.sym}')">
      <span class="ti-sym">${t.sym}</span>
      <span class="ti-price ${up ? 'up' : 'down'}">${formatPrice(t)}</span>
      <span class="ti-chg ${up ? 'up' : 'down'}">${up ? '+' : ''}${t.chg.toFixed(2)}%</span>
    </div>`;
  }).join('');
}

function formatPrice(t) {
  if (t.price > 10000) return '$' + t.price.toLocaleString();
  if (t.price > 100)   return t.price.toFixed(2);
  if (t.price > 10)    return t.price.toFixed(3);
  return t.price.toFixed(4);
}

// ---------- PRICE FLICKER ----------
function startPriceFlicker() {
  setInterval(() => {
    const idx = Math.floor(Math.random() * tickerData.length);
    const t   = tickerData[idx];
    const drift = (Math.random() - 0.48) * 0.06;
    t.price = parseFloat((t.price * (1 + drift / 100)).toFixed(t.price > 100 ? 2 : 4));
    t.chg   = parseFloat((t.chg + (Math.random() - 0.5) * 0.05).toFixed(2));

    // Update header stats
    if (t.sym === 'GOLD')    { const el = document.getElementById('h-gold'); if(el) { el.textContent = '$' + t.price.toFixed(2); flashEl(el, t.chg >= 0); } }
    if (t.sym === 'BTC/USD') { const el = document.getElementById('h-btc');  if(el) { el.textContent = '$' + Math.round(t.price).toLocaleString(); flashEl(el, t.chg >= 0); } }
    if (t.sym === 'DXY')     { const el = document.getElementById('h-dxy');  if(el) { el.textContent = t.price.toFixed(2); } }

    // Rebuild ticker strip
    buildTickerStrip();
  }, 1800);
}

function flashEl(el, up) {
  el.classList.remove('flash-up', 'flash-down');
  void el.offsetWidth;
  el.classList.add(up ? 'flash-up' : 'flash-down');
}

// ---------- NEWS FEED ----------
function setupNewsTabs() {
  document.querySelectorAll('.ntab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ntab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeNewsFilter = btn.dataset.filter;
      buildNewsFeed();
    });
  });
}

function buildNewsFeed() {
  const list = document.getElementById('news-list');
  const filtered = activeNewsFilter === 'all'
    ? NEWS_DATA
    : NEWS_DATA.filter(n => n.tag === activeNewsFilter);

  list.innerHTML = filtered.map(n => `
    <div class="news-item" onclick="openNewsAnalysis('${escStr(n.headline)}')">
      <div class="news-tags">
        <span class="ntag ntag-${n.tag}">${n.tagLabel}</span>
        ${n.hot ? '<span class="ntag ntag-hot">Breaking</span>' : ''}
      </div>
      <div class="news-headline">${n.headline}</div>
      <div class="news-meta">${n.meta} · click for analysis ↗</div>
    </div>`).join('');
}

// ---------- CONVICTION LIST ----------
function buildConvictionList() {
  const list = document.getElementById('conviction-list');
  list.innerHTML = CONVICTION_ASSETS.map(c => `
    <div class="conv-item" onclick="openAssetAnalysis('${c.asset}')">
      <span class="conv-sym" style="color:${c.color}">${c.asset}</span>
      <span class="conv-dir dir-${c.dir}">${c.dir.toUpperCase()}</span>
      <div class="conv-bar-wrap">
        <div class="conv-bar" style="width:${c.score}%;background:${c.color}" data-target="${c.score}"></div>
      </div>
      <span class="conv-score" style="color:${c.color}">${c.score}</span>
    </div>`).join('');
}

// ---------- CYCLES ----------
function buildCycles() {
  document.getElementById('cycles-list').innerHTML =
    CYCLES.map(c => `
      <div class="cycle-row">
        <span class="cycle-name">${c.name}</span>
        <span class="cycle-phase ${c.cls}">${c.phase}</span>
      </div>`).join('');
}

// ---------- SIGNALS ----------
function buildSignals() {
  document.getElementById('signals-list').innerHTML =
    SIGNALS.map(s => `
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
  document.getElementById('events-list').innerHTML =
    EVENTS.map(e => `
      <div class="event-item" onclick="openAnalysis('event-${escStr(e.text)}', 'Analyse this upcoming macro event and how to trade it: ${escStr(e.text)}. What are the key scenarios, which assets move the most, and what is the best positioning strategy?')">
        <div class="event-date">${e.date}</div>
        <div class="event-imp imp-${e.imp}"></div>
        <div class="event-text">${e.text}</div>
      </div>`).join('');
}

// ---------- HEATMAP ----------
function buildHeatmap() {
  const wrap = document.getElementById('heatmap');
  wrap.innerHTML = HEATMAP_DATA.map(cat => `
    <div>
      <div class="hmap-row-label">${cat.category}</div>
      <div class="hmap-row">
        ${cat.assets.map(a => `
          <div class="hmap-cell" style="${cellStyle(a.val)}"
            onclick="openAssetAnalysis('${a.label}')">
            <div class="hc-sym" style="color:${cellTextColor(a.val)}">${a.label}</div>
            <div class="hc-val" style="color:${cellTextColor(a.val)}">${a.val > 0 ? '+' : ''}${a.val.toFixed(1)}%</div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function cellStyle(v) {
  if (v <= -2)   return 'background:#7f1d1d';
  if (v <= -0.5) return 'background:#991b1b';
  if (v < 0)     return 'background:#2d1f1f';
  if (v === 0)   return 'background:#1a2028';
  if (v < 0.5)   return 'background:#1a2a1a';
  if (v < 2)     return 'background:#14532d';
  return 'background:#166534';
}
function cellTextColor(v) {
  if (v < -0.5) return '#fca5a5';
  if (v > 0.5)  return '#86efac';
  return '#9ca3af';
}

// ---------- FEAR & GREED GAUGE ----------
function drawFearGauge(val) {
  const canvas = document.getElementById('fg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 75;

  ctx.clearRect(0, 0, 200, 110);

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.lineWidth = 12; ctx.strokeStyle = '#1a2028'; ctx.stroke();

  // Gradient fill
  const pct = val / 100;
  const startAngle = Math.PI;
  const endAngle   = Math.PI + pct * Math.PI;
  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0,   '#ef4444');
  grad.addColorStop(0.35,'#f59e0b');
  grad.addColorStop(0.65,'#22c55e');
  grad.addColorStop(1,   '#06b6d4');
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle, false);
  ctx.lineWidth = 12; ctx.strokeStyle = grad;
  ctx.lineCap = 'round'; ctx.stroke();

  // Needle
  const angle = Math.PI + pct * Math.PI;
  const nx = cx + (r - 20) * Math.cos(angle);
  const ny = cy + (r - 20) * Math.sin(angle);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.lineWidth = 2; ctx.strokeStyle = '#e2e8f0'; ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0'; ctx.fill();

  // Update number and label
  const numEl = document.getElementById('fg-num');
  const lblEl = document.getElementById('fg-label');
  if (numEl) {
    numEl.textContent = val;
    const col = val < 25 ? '#ef4444' : val < 45 ? '#f59e0b' : val < 55 ? '#94a3b8' : val < 75 ? '#22c55e' : '#06b6d4';
    numEl.style.color = col;
  }
  if (lblEl) {
    lblEl.textContent = val < 25 ? 'EXTREME FEAR' : val < 45 ? 'FEAR' : val < 55 ? 'NEUTRAL' : val < 75 ? 'GREED' : 'EXTREME GREED';
  }
}

function startFGPulse() {
  setInterval(() => {
    fgValue = Math.max(5, Math.min(95, fgValue + (Math.random() - 0.5) * 1.5));
    drawFearGauge(Math.round(fgValue));
  }, 4000);
}

// ---------- ANALYSIS MODAL ----------
function openModal(title) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-loading">
      <div class="modal-spinner"></div>
      <div class="modal-loading-text">Analysing market conditions...</div>
    </div>`;
  document.getElementById('analysis-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('analysis-modal').style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('analysis-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ---------- OPEN ANALYSIS ----------
async function openAnalysis(id, prompt) {
  currentModalId = id;
  openModal('Market Analysis');
  await runAnalysis(prompt);
}

async function openNewsAnalysis(headline) {
  openModal('News Analysis');
  const prompt = `You are a professional macro trader and analyst. Analyse this news event in detail:\n\n"${headline}"\n\nProvide:\n1. Why this matters to markets right now\n2. Immediate asset impacts (which markets are affected and how)\n3. Trade ideas: Give 2-3 specific actionable trades with asset, direction (long/short), reasoning, entry zone, stop loss, and target\n4. Key risks to the thesis\n5. What to watch next\n\nBe specific, quantitative where possible, and concise.`;
  await runAnalysis(prompt);
}

async function openAssetAnalysis(asset) {
  openModal(`${asset} — Full Analysis`);
  const prompt = `You are a professional macro trader. Provide a comprehensive analysis of ${asset} right now including:\n\n1. Current macro backdrop affecting this asset\n2. Key technical levels (support, resistance, key moving averages)\n3. Full trade thesis: direction bias, entry zone, stop loss, and 3 price targets with timeframes\n4. Fundamental drivers for the next 3-6 months\n5. Key risks that would invalidate the thesis\n6. Correlation trades — what other assets move with it and how to hedge\n\nBe specific, practical, and actionable. Format clearly.`;
  await runAnalysis(prompt);
}

async function runAnalysis(prompt) {
  const body = document.getElementById('modal-body');
  if (!API_KEY) {
    body.innerHTML = `
      <div class="modal-error">
        <p style="margin-bottom:12px;color:#e2e8f0;font-size:13px">⚙️ API Key Required</p>
        <p style="font-size:11px;line-height:1.6">To enable live AI analysis, add your Anthropic API key to your Vercel project:<br><br>
        1. Go to your Vercel project → Settings → Environment Variables<br>
        2. Add: <code style="background:#1a2028;padding:2px 6px;border-radius:3px">ANTHROPIC_API_KEY</code> = your key<br>
        3. Redeploy the project<br><br>
        Get your key at <strong>console.anthropic.com</strong></p>
      </div>`;
    return;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: 'You are a professional macro trader and financial analyst with 20 years of experience. You provide sharp, specific, actionable analysis. Format your responses with clear sections using ### headings. Use bullet points for lists. Always include specific price levels, percentages, and timeframes. Avoid generic commentary — every sentence should add value.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    const text = data.content?.[0]?.text || 'No response received.';
    body.innerHTML = `<div class="modal-content">${renderMarkdown(text)}</div>`;
  } catch (err) {
    body.innerHTML = `<div class="modal-error">Error: ${err.message}<br><br>Check your API key and network connection.</div>`;
  }
}

// ---------- MARKDOWN RENDERER ----------
function renderMarkdown(text) {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^# (.+)$/gm,   '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#1a2028;padding:1px 5px;border-radius:3px;font-family:var(--mono);font-size:11px">$1</code>')
    .replace(/^\- (.+)$/gm,  '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup]|<li|<ul)(.+)$/gm, (m) => m.trim() ? m : '')
    .replace(/(<p><\/p>)/g, '')
    .replace(/(LONG|BUY)/g,  '<span class="tag-green">$1</span>')
    .replace(/(SHORT|SELL)/g,'<span class="tag-red">$1</span>')
    .replace(/(\$[\d,]+(?:\.\d+)?)/g, '<span class="tag-gold">$1</span>')
    .replace(/(Stop[- ]loss|Stop):?\s*(\$[\d,.]+)/gi, 'Stop Loss: <span class="tag-red">$2</span>')
    .replace(/(Target\s*\d*|Take[- ]profit):?\s*(\$[\d,.]+)/gi, '$1: <span class="tag-green">$2</span>');
}

// ---------- HELPERS ----------
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function escStr(s) { return s.replace(/'/g, "\\'").replace(/"/g, '\\"').substring(0, 120); }
