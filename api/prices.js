// ============================================
// Vercel Serverless Function — Live Prices
// Proxies CoinGecko (crypto) + Yahoo Finance
// Route: /api/prices
// ============================================

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const [crypto, traditional] = await Promise.allSettled([
      fetchCrypto(),
      fetchTraditional(),
    ]);

    const prices = {
      ...(crypto.status === 'fulfilled' ? crypto.value : {}),
      ...(traditional.status === 'fulfilled' ? traditional.value : {}),
      _updated: new Date().toISOString(),
      _sources: {
        crypto:      crypto.status === 'fulfilled' ? 'coingecko' : 'failed',
        traditional: traditional.status === 'fulfilled' ? 'yahoo' : 'failed',
      }
    };

    res.status(200).json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ---------- COINGECKO (free, no key needed) ----------
async function fetchCrypto() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,binancecoin,cardano&vs_currencies=usd&include_24hr_change=true';
  const r   = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('CoinGecko failed');
  const d = await r.json();
  return {
    'BTC/USD': { price: d.bitcoin?.usd,       chg: d.bitcoin?.usd_24h_change,       sym: 'BTC/USD',  category: 'crypto'    },
    'ETH/USD': { price: d.ethereum?.usd,      chg: d.ethereum?.usd_24h_change,      sym: 'ETH/USD',  category: 'crypto'    },
    'SOL/USD': { price: d.solana?.usd,        chg: d.solana?.usd_24h_change,        sym: 'SOL/USD',  category: 'crypto'    },
    'XRP/USD': { price: d.ripple?.usd,        chg: d.ripple?.usd_24h_change,        sym: 'XRP/USD',  category: 'crypto'    },
    'BNB/USD': { price: d.binancecoin?.usd,   chg: d.binancecoin?.usd_24h_change,   sym: 'BNB/USD',  category: 'crypto'    },
  };
}

// ---------- YAHOO FINANCE (free unofficial) ----------
async function fetchTraditional() {
  const symbols = [
    '^GSPC',   // S&P 500
    '^IXIC',   // NASDAQ
    '^FTSE',   // FTSE 100
    '^GDAXI',  // DAX
    '^N225',   // Nikkei
    'GC=F',    // Gold futures
    'SI=F',    // Silver futures
    'CL=F',    // WTI Crude
    'NG=F',    // Natural Gas
    'HG=F',    // Copper
    'EURUSD=X',// EUR/USD
    'GBPUSD=X',// GBP/USD
    'JPY=X',   // USD/JPY
    'DX-Y.NYB',// DXY
    '^TNX',    // US 10Y yield
    '^VIX',    // VIX
  ];

  const qs  = symbols.join('%2C');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${qs}&fields=regularMarketPrice,regularMarketChangePercent,shortName`;

  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
    }
  });

  if (!r.ok) throw new Error('Yahoo Finance failed');
  const data = await r.json();
  const quotes = data?.quoteResponse?.result || [];

  const MAP = {
    '^GSPC':    { sym: 'S&P 500',  category: 'equity'    },
    '^IXIC':    { sym: 'NASDAQ',   category: 'equity'    },
    '^FTSE':    { sym: 'FTSE 100', category: 'equity'    },
    '^GDAXI':   { sym: 'DAX',      category: 'equity'    },
    '^N225':    { sym: 'Nikkei',   category: 'equity'    },
    'GC=F':     { sym: 'GOLD',     category: 'commodity' },
    'SI=F':     { sym: 'SILVER',   category: 'commodity' },
    'CL=F':     { sym: 'OIL WTI', category: 'commodity' },
    'NG=F':     { sym: 'NAT GAS', category: 'commodity' },
    'HG=F':     { sym: 'COPPER',  category: 'commodity' },
    'EURUSD=X': { sym: 'EUR/USD', category: 'fx'        },
    'GBPUSD=X': { sym: 'GBP/USD', category: 'fx'        },
    'JPY=X':    { sym: 'USD/JPY', category: 'fx'        },
    'DX-Y.NYB': { sym: 'DXY',    category: 'fx'        },
    '^TNX':     { sym: 'US 10Y',  category: 'bonds'     },
    '^VIX':     { sym: 'VIX',    category: 'volatility' },
  };

  const result = {};
  for (const q of quotes) {
    const info = MAP[q.symbol];
    if (!info) continue;
    result[info.sym] = {
      price:    q.regularMarketPrice,
      chg:      q.regularMarketChangePercent,
      sym:      info.sym,
      category: info.category,
    };
  }
  return result;
}
