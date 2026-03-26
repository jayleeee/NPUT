export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { system, content } = req.body;

  const MODEL = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  let parts;
  if (typeof content === 'string') {
    parts = [{ text: content }];
  } else {
    parts = content.map(c => {
      if (c.type === 'text') return { text: c.text };
      if (c.type === 'image') return { inline_data: { mime_type: c.source.media_type, data: c.source.data } };
      return { text: '' };
    });
  }

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
  };

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const e = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: e?.error?.message || `API 오류 ${geminiRes.status}` });
    }

    const data = await geminiRes.json();
    const text = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
