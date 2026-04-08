module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables' });
    return;
  }

  const { prompt, context, max_tokens } = req.body || {};
  if (!prompt) { res.status(400).json({ error: 'No prompt provided' }); return; }

  const MACRO_FRAMEWORK = `
MACRO REGIME — APRIL 2026 (apply consistently to ALL analysis):

GROWTH:     Late cycle. US GDP slowing. Germany in technical recession (-0.3% Q1). Global PMIs contracting.
INFLATION:  Sticky. US PCE 2.8%. UK CPI 3.1%. Services inflation persistent. Above target everywhere.
POLICY:     On hold. Fed 4.5%, BoE 4.5%, ECB considering cuts. Higher for longer is the base case.
RISK:       Risk-off. Credit spreads widening. EM currencies under pressure. Volatility elevated.
DOLLAR:     Structurally bid. Tariff flight-to-safety. Rate differential vs EUR/GBP. DXY above 104.
GEOPOLITICS:Elevated. US-EU 25% tariff war. Red Sea disruption. BRICS de-dollarisation accelerating.

HOUSE DIRECTIONAL VIEW — be consistent with this unless live data clearly contradicts:
GOLD:       BULLISH. De-dollarisation + CB accumulation + safe haven demand. Dips are buying opportunities.
BTC/USD:    BULLISH BIAS. Post-halving cycle. Institutional ETF flows. Needs risk-on catalyst.
EUR/USD:    BEARISH. Germany recession + ECB forced to cut while Fed holds. Rate differential widening.
GBP/USD:    MILDLY BEARISH. UK stagflation risk. Weak growth + sticky CPI. Sell rallies.
USD/JPY:    BULLISH. BOJ ultra-loose policy vs Fed hold. Carry trade bid. Watch BoJ intervention risk.
SILVER:     BULLISH. Lagging gold. Gold/silver ratio historically elevated. Industrial + monetary demand.
US 10Y:     BEARISH (price, bullish yield). Fiscal pressure. Debt supply glut. Sticky inflation.
OIL:        NEUTRAL/WATCH. OPEC uncertainty vs demand slowdown. No strong directional view.
EQUITIES:   CAUTIOUS. Late cycle. Valuations stretched. Earnings risk rising. Prefer defensives.
COPPER:     WATCH. China slowdown vs green capex. Data-dependent.

CONSISTENCY RULE: Never give a BEARISH call on GOLD or BULLISH call on EUR/USD without explicitly 
stating you are going against the house view and giving a specific technical reason. All analysis 
must flow from this macro framework unless hard technical evidence contradicts it.`;

  const systemPrompt = `You are the chief macro strategist at a top global macro hedge fund with 25 years of experience. You manage positions across FX, rates, commodities, equities and crypto.

${MACRO_FRAMEWORK}

LIVE MARKET DATA: ${context || 'prices loading'}

FORMAT RULES:
- Use ### for headings. Bullet points for lists.
- Always give specific price levels, entry zones, stop losses, targets with timeframes.
- Highlight LONG and SHORT clearly.
- Every sentence adds analytical value — zero filler.
- Trade format: Entry / Stop / Target 1 / Target 2 / Timeframe
- If contradicting house view flag it explicitly: ⚠️ COUNTER-TREND TRADE: [reason]`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      throw new Error('Anthropic error ' + r.status + ': ' + errText);
    }

    const data = await r.json();
    const text = data.content && data.content[0] && data.content[0].text;
    if (!text) throw new Error('Empty response');
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
