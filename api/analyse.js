module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in Vercel environment variables' });
    return;
  }

  const { prompt, context } = req.body || {};
  if (!prompt) { res.status(400).json({ error: 'No prompt provided' }); return; }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: 'You are a professional macro trader with 20 years experience. Give sharp, specific, actionable analysis. Use ### for headings, bullet points for lists. Always include specific price levels and timeframes. Highlight LONG/SHORT calls clearly. Current context: ' + (context || ''),
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error('Anthropic error ' + response.status + ': ' + err);
    }

    const data = await response.json();
    const text = data.content && data.content[0] && data.content[0].text;
    res.status(200).json({ text: text || 'No response received.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
