// ============================================
// Vercel Serverless Function — AI Analysis
// Proxies Anthropic API — key stays server-side
// Route: /api/analyse
// ============================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables.' });
    return;
  }

  const { prompt, context } = req.body || {};
  if (!prompt) { res.status(400).json({ error: 'No prompt provided' }); return; }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: `You are a professional macro trader and financial analyst with 20 years of experience at a top hedge fund. You provide sharp, specific, actionable analysis. 

Format rules:
- Use ### for section headings
- Use bullet points for lists  
- Always include specific price levels, percentages, and timeframes
- Highlight LONG/SHORT/BUY/SELL in your recommendations
- Every sentence must add value — no generic filler
- When giving trade ideas always include: Entry zone, Stop loss, Target 1, Target 2, Timeframe
- Current market context: ${context || 'Standard macro environment, April 2026'}`,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || 'No response received.';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
