// In-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map()
const RATE_LIMIT = 10
const WINDOW_MS = 60_000

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + WINDOW_MS
  }
  entry.count++
  rateLimitMap.set(ip, entry)
  return entry.count <= RATE_LIMIT
}

function sanitizePrompt(raw) {
  // Strip control characters, limit length
  return String(raw).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, 2000)
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')

  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'AI Coach is not configured on this server.' })
  }

  const rawPrompt = req.body?.prompt
  if (!rawPrompt || typeof rawPrompt !== 'string') {
    return res.status(400).json({ error: 'Invalid request body.' })
  }

  const prompt = sanitizePrompt(rawPrompt)
  if (prompt.length < 10) {
    return res.status(400).json({ error: 'Prompt too short.' })
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
        messages: [
          {
            role: 'system',
            content: 'You are a helpful carbon footprint coach. Respond only with the 3 tips requested. No preamble or sign-off.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}))
      return res.status(groqRes.status).json({ error: err.error?.message || 'AI service error' })
    }

    const data = await groqRes.json()
    const text = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ text })
  } catch (e) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
