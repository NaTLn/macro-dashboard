module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' }); return; }
  const { prompt, context } = req.body || {};
  if (!prompt) { res.status(400).json({ error: 'No prompt' }); return; }
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
        max_tokens: 1500,
        system: 'You are a professional macro trader with 20 years experience. Give sharp specific actionable analysis. Use ### for headings and bullet points for lists. Always include specific price levels and timeframes. Current market context: ' + (context || ''),
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!r.ok) throw new Error('Anthropic error ' + r.status);
    const data = await r.json();
    res.status(200).json({ text: data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

---

**Step 3 — Add your Anthropic API key in Vercel**

Vercel → your project → Settings → Environment Variables:
- Key: `ANTHROPIC_API_KEY`
- Value: your key from `console.anthropic.com`
- Click Save

---

**Step 4 — Add your Finnhub key to index.html**

In GitHub click `index.html` → pencil → find this line near the top of the script section:
```
var FINNHUB_KEY = d7716fpr01qtg3nf8ikgd7716fpr01qtg3nf8il0;
