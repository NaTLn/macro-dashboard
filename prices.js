// ============================================
// Vercel Serverless Function — Live News
// Pulls RSS feeds from Reuters, FT, BBC Business
// Route: /api/news
// ============================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    const feeds = await Promise.allSettled([
      fetchRSS('https://feeds.reuters.com/reuters/businessNews',      'Reuters',    'macro'),
      fetchRSS('https://feeds.reuters.com/reuters/worldNews',         'Reuters',    'geo'),
      fetchRSS('https://feeds.bbci.co.uk/news/business/rss.xml',     'BBC',        'macro'),
      fetchRSS('https://www.ft.com/world/global-economy?format=rss', 'FT',         'macro'),
      fetchRSS('https://feeds.reuters.com/reuters/companyNews',      'Reuters',    'trade'),
    ]);

    let allItems = [];
    for (const f of feeds) {
      if (f.status === 'fulfilled') allItems.push(...f.value);
    }

    // Sort by date descending, deduplicate by title
    const seen = new Set();
    allItems = allItems
      .filter(item => {
        const key = item.headline.substring(0, 60);
        if (seen.has(key)) return false;
        seen.add(key); return true;
      })
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 20)
      .map(item => ({
        ...item,
        tag:      classifyTag(item.headline + ' ' + (item.summary || '')),
        hot:      isHot(item.headline),
        meta:     `${timeAgo(item.pubDate)} · ${item.source}`,
      }));

    res.status(200).json({ items: allItems, _updated: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message, items: [] });
  }
}

// ---------- RSS PARSER ----------
async function fetchRSS(url, source, defaultTag) {
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=10`;
  const r = await fetch(proxyUrl, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`RSS failed: ${url}`);
  const data = await r.json();
  if (data.status !== 'ok') throw new Error(`RSS error: ${data.message}`);

  return (data.items || []).map(item => ({
    headline: stripHtml(item.title || ''),
    summary:  stripHtml(item.description || '').substring(0, 200),
    link:     item.link || '',
    pubDate:  item.pubDate || new Date().toISOString(),
    source,
    defaultTag,
  }));
}

// ---------- CLASSIFY TAG ----------
function classifyTag(text) {
  const t = text.toLowerCase();
  if (/war|conflict|ukraine|russia|china|taiwan|iran|israel|hamas|nato|sanction|military|geopolit|election|trump|xi jinping/.test(t)) return 'geo';
  if (/fed|federal reserve|boe|ecb|bank of england|rate|inflation|cpi|pce|monetary|interest rate|powell|lagarde|bailey/.test(t)) return 'central';
  if (/tariff|trade war|export|import|supply chain|wto|sanction|customs|duty/.test(t)) return 'trade';
  if (/oil|gas|opec|energy|crude|barrel|petroleum|lng|shale|bp|shell/.test(t)) return 'energy';
  return 'macro';
}

function tagLabel(tag) {
  const labels = { geo:'Geopolitical', central:'Central Banks', trade:'Trade', energy:'Energy', macro:'Macro' };
  return labels[tag] || 'Macro';
}

// ---------- HOT DETECTOR ----------
function isHot(headline) {
  const h = headline.toLowerCase();
  return /breaking|urgent|crash|surge|plunge|crisis|collapse|record|emergency|shock|soar|tumble/.test(h);
}

// ---------- TIME AGO ----------
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---------- STRIP HTML ----------
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();
}
