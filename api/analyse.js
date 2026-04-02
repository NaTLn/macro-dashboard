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
        system: 'You are a professional macro trader with 20 years of experience at a top hedge fund. Give sharp, specific, actionable analysis. Use ### for section headings. Use bullet points for lists. Always include specific price levels, percentages, and timeframes. Highlight LONG and SHORT calls clearly. Every sentence must add value. Current live market data: ' + (context || ''),
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      throw new Error('Anthropic error ' + r.status + ': ' + errText);
    }

    const data = await r.json();
    const text = data.content && data.content[0] && data.content[0].text;
    if (!text) throw new Error('Empty response from Anthropic');
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
