import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CATEGORY_META } from '../utils/emissionFactors.js'

function parseTips(text) {
  // Split on numbered list or double-newline patterns
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean)
  const tips = []
  let current = ''
  for (const line of lines) {
    if (/^[1-3][.)]\s/.test(line)) {
      if (current) tips.push(current)
      current = line.replace(/^[1-3][.)]\s/, '')
    } else {
      current += (current ? ' ' : '') + line
    }
  }
  if (current) tips.push(current)
  return tips.length >= 2 ? tips.slice(0, 3) : [text]
}

function extractEmoji(tip) {
  const match = tip.match(/^(\p{Emoji_Presentation}|\p{Emoji}️)/u)
  if (match) return { emoji: match[0], rest: tip.slice(match[0].length).trim() }
  return { emoji: '🌿', rest: tip }
}

export default function AIInsights({ activities, completedIds, netTotal, goal }) {
  const reduced = useReducedMotion()
  const [tips, setTips]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [fetched, setFetched] = useState(false)

  const categoryBreakdown = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const kg = activities.filter(a => a.category === key).reduce((s, a) => s + a.kg, 0)
    return `${meta.label}: ${kg.toFixed(1)} kg`
  }).join(', ')

  async function fetchTips() {
    setLoading(true)
    setError(null)
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      setError('Add VITE_GROQ_API_KEY to your .env file. Get a free key at console.groq.com (no credit card needed).')
      setLoading(false)
      return
    }

    const prompt = `You are a warm, encouraging Verda coach helping someone track their carbon footprint.
The user's carbon data this week:
- Net total: ${netTotal.toFixed(1)} kg CO₂e (budget: ${goal} kg)
- Breakdown: ${categoryBreakdown}
- Challenges completed: ${completedIds.length}

Give exactly 3 personalised tips to help them reduce their footprint. Format each tip as:
[emoji] **Bold action phrase** — One sentence explanation with rough kg savings.

Be warm, specific, and use their actual data. Start directly with tip 1.`

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      setTips(parseTips(text))
      setFetched(true)
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function renderTipText(raw) {
    // Convert **bold** markers to <strong>
    const parts = raw.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">AI Coach</h1>
        <p className="section-sub">I'm your Verda coach — let me read your week</p>
      </div>

      {!fetched && !loading && (
        <motion.div
          className="card"
          style={{ textAlign: 'center', padding: 'var(--sp-10)' }}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>🤖</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: 'var(--sp-2)' }}>
            Ready to analyse your week
          </p>
          <p style={{ color: 'var(--c-text-3)', marginBottom: 'var(--sp-6)', fontSize: 'var(--text-sm)' }}>
            I'll look at your {activities.length} logged activit{activities.length === 1 ? 'y' : 'ies'} and give you 3 tailored tips.
          </p>
          <button className="btn btn-primary" onClick={fetchTips} disabled={activities.length === 0}>
            ✨ Get my personalised tips
          </button>
          {activities.length === 0 && (
            <p style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
              Log some activities first so I have data to work with.
            </p>
          )}
        </motion.div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="loading-dots">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="loading-dot"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </div>
          <p style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}>Reading your footprint…</p>
        </div>
      )}

      {error && (
        <motion.div
          className="card"
          style={{ borderColor: 'var(--c-danger)', background: 'var(--c-danger-light)', textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p style={{ color: 'var(--c-danger)', marginBottom: 'var(--sp-4)' }}>⚠️ {error}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { setError(null); fetchTips() }}>Try again</button>
        </motion.div>
      )}

      {fetched && tips.length > 0 && (
        <AnimatePresence>
          <motion.div className="insights-card">
            {tips.map((tip, i) => {
              const { emoji, rest } = extractEmoji(tip)
              return (
                <motion.div
                  key={i}
                  className="insight-tip"
                  initial={reduced ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                >
                  <span className="insight-emoji">{emoji}</span>
                  <p className="insight-text">{renderTipText(rest)}</p>
                </motion.div>
              )
            })}
            <button className="btn btn-secondary btn-sm" onClick={() => { setFetched(false); setTips([]) }} style={{ alignSelf: 'flex-start', marginTop: 'var(--sp-2)' }}>
              ↺ Refresh tips
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
