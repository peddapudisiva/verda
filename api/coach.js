export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'AI Coach is not configured on this server.' })
  }

  const { prompt } = req.body
  if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
    return res.status(400).json({ error: 'Invalid prompt.' })
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}))
      return res.status(groqRes.status).json({ error: err.error?.message || 'Groq API error' })
    }

    const data = await groqRes.json()
    const text = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ text })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Something went wrong.' })
  }
}
