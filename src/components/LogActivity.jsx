import { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { EMISSION_FACTORS, CATEGORY_META, calcKg } from '../utils/emissionFactors.js'

const STEPS = ['category', 'activity', 'quantity', 'confirm']

// ── Voice parsing ────────────────────────────────────────────────
const VOICE_EXAMPLES = [
  '"drove 20 kilometres"',
  '"ate a beef burger"',
  '"took the bus 10km"',
  '"flew to London"',
  '"used 30 kWh"',
  '"bought a shirt"',
]

function parseVoice(raw) {
  const t = raw.toLowerCase().replace(/kilometres?|kilometers?/, 'km').replace(/miles?/, 'mi')
  const num = () => { const m = t.match(/(\d+[\.,]?\d*)/); return m ? parseFloat(m[1].replace(',', '.')) : 1 }

  // Transport
  if (/fl(ew|ight|y|ying)|plane|airplane|air travel/.test(t))
    return { category: 'transport', activity: 'flight', quantity: num() || 1 }
  if (/\bev\b|electric car|electric vehicle|tesla/.test(t))
    return { category: 'transport', activity: 'car_ev', quantity: num() }
  if (/drove|driv|car|diesel|petrol|gasoline|road trip|motorway|highway/.test(t))
    return { category: 'transport', activity: 'car_petrol', quantity: num() }
  if (/\btrain\b|rail|intercity|tgv|eurostar/.test(t))
    return { category: 'transport', activity: 'train', quantity: num() }
  if (/\bbus\b|coach|transit|subway|metro|underground|tube/.test(t))
    return { category: 'transport', activity: 'bus', quantity: num() }
  if (/\bbike\b|cycl|bicycle|scooter/.test(t))
    return { category: 'transport', activity: 'cycling', quantity: num() }
  if (/walk|walked|on foot/.test(t))
    return { category: 'transport', activity: 'cycling', quantity: num() }
  if (/motorbike|motorcycle/.test(t))
    return { category: 'transport', activity: 'car_petrol', quantity: num() }

  // Food
  if (/beef|steak|burger|barbeque|bbq|red meat/.test(t))
    return { category: 'food', activity: 'beef', quantity: num() }
  if (/\bpork\b|\blamb\b|mutton|bacon/.test(t))
    return { category: 'food', activity: 'pork', quantity: num() }
  if (/chicken|turkey|duck|poultry|fish|seafood|salmon|tuna|prawn|shrimp/.test(t))
    return { category: 'food', activity: 'chicken', quantity: num() }
  if (/vegetarian|veggie|plant.based|salad|pasta|pizza|meatless|meat.free/.test(t))
    return { category: 'food', activity: 'vegetarian', quantity: num() }
  if (/vegan|tofu|tempeh|lentil/.test(t))
    return { category: 'food', activity: 'vegan', quantity: num() }

  // Home energy
  if (/kwh|kilowatt|electricity|electric bill|power/.test(t))
    return { category: 'home', activity: 'electricity', quantity: num() }
  if (/\bgas\b|natural gas|heating|boiler|furnace/.test(t))
    return { category: 'home', activity: 'gas', quantity: num() }

  // Shopping
  if (/clothes|shirt|jacket|jeans|shoe|dress|fashion|outfit|apparel/.test(t))
    return { category: 'shopping', activity: 'clothing', quantity: num() }
  if (/phone|laptop|computer|tablet|electronic|gadget|device/.test(t))
    return { category: 'shopping', activity: 'electronics', quantity: num() }

  return null
}

const slideVariants = {
  enter:  { x: 40,  opacity: 0 },
  center: { x: 0,   opacity: 1 },
  exit:   { x: -40, opacity: 0 },
}

export default function LogActivity({ onAddActivity }) {
  const reduced = useReducedMotion()
  const [step, setStep]         = useState(0)
  const [category, setCategory] = useState(null)
  const [activity, setActivity] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [added, setAdded]       = useState(false)

  // — Voice logging —
  const [voiceState, setVoiceState] = useState('idle') // idle | listening | error | parsed
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const recogRef = useRef(null)

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceState('error'); setVoiceTranscript('Voice input not supported in this browser.'); return }
    const recog = new SR()
    recog.continuous = false; recog.interimResults = false; recog.lang = 'en-US'
    recog.onstart = () => setVoiceState('listening')
    recog.onend   = () => { if (voiceState === 'listening') setVoiceState('idle') }
    recog.onerror = () => { setVoiceState('error'); setVoiceTranscript('Could not hear you. Please try again.') }
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript
      setVoiceTranscript(text)
      const parsed = parseVoice(text)
      if (parsed) {
        setCategory(parsed.category)
        setActivity(parsed.activity)
        setQuantity(String(parsed.quantity))
        setVoiceState('parsed')
        setTimeout(() => { setVoiceState('idle'); setStep(3) }, 1200)
      } else {
        setVoiceState('error')
      }
    }
    recog.start()
    recogRef.current = recog
  }

  function stopVoice() {
    recogRef.current?.stop()
    setVoiceState('idle')
  }

  const stepName = STEPS[step]
  const factor   = category && activity ? EMISSION_FACTORS[category][activity] : null
  const kg       = factor ? calcKg(category, activity, parseFloat(quantity) || 0) : 0

  function reset() {
    setStep(0); setCategory(null); setActivity(null); setQuantity(''); setAdded(false)
  }

  function handleAdd() {
    if (!category || !activity || !quantity) return
    const def = EMISSION_FACTORS[category][activity]
    onAddActivity({
      id: Math.random().toString(36).slice(2),
      category,
      activity,
      label: def.label,
      quantity: parseFloat(quantity),
      unit: def.unit,
      kg,
      date: new Date().toISOString(),
    })
    setAdded(true)
  }

  const stepProgress = (i) =>
    i < step ? 'done' : i === step ? 'active' : ''

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Log activity</h1>
        <p className="section-sub">What did you do this week?</p>
      </div>

      {/* Voice logging */}
      <motion.button
        onClick={voiceState === 'listening' ? stopVoice : startVoice}
        whileTap={{ scale: 0.93 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-3)',
          width: '100%', padding: 'var(--sp-4)',
          borderRadius: 'var(--r-lg)',
          border: `2px dashed ${voiceState === 'listening' ? 'var(--c-brand)' : voiceState === 'parsed' ? 'var(--c-sage)' : voiceState === 'error' ? 'var(--c-danger)' : 'var(--c-border)'}`,
          background: voiceState === 'listening' ? 'var(--c-brand-light)' : voiceState === 'parsed' ? 'var(--c-sage-light)' : 'var(--c-surface)',
          color: voiceState === 'listening' ? 'var(--c-brand-dark)' : voiceState === 'parsed' ? 'var(--c-sage-dark)' : voiceState === 'error' ? 'var(--c-danger)' : 'var(--c-text-2)',
          fontWeight: 500, fontSize: 'var(--text-sm)',
          cursor: 'pointer', transition: 'all var(--dur-base)',
          marginBottom: 'var(--sp-5)',
        }}
      >
        <motion.span
          animate={voiceState === 'listening' ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ fontSize: '1.3rem' }}
        >
          {voiceState === 'listening' ? '🔴' : voiceState === 'parsed' ? '✅' : voiceState === 'error' ? '❌' : '🎙️'}
        </motion.span>
        <span>
          {voiceState === 'listening' ? 'Listening… tap to stop' :
           voiceState === 'parsed'    ? `"${voiceTranscript}" ✓ jumping to confirm` :
           voiceState === 'error'     ? `Couldn't parse "${voiceTranscript}" — try e.g. ${VOICE_EXAMPLES[Math.floor(Math.random() * VOICE_EXAMPLES.length)]}` :
           `Log by voice — try ${VOICE_EXAMPLES[0]} or ${VOICE_EXAMPLES[1]}`}
        </span>
      </motion.button>

      {/* Step indicators */}
      <div className="log-steps" aria-label="Progress">
        {STEPS.map((_, i) => (
          <div key={i} className={`log-step ${stepProgress(i)}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {added ? (
          <motion.div
            key="done"
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ textAlign: 'center', padding: 'var(--sp-10)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>✅</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--c-sage-dark)', marginBottom: 'var(--sp-2)' }}>
              {kg.toFixed(2)} kg CO₂e logged
            </p>
            <p style={{ color: 'var(--c-text-3)', marginBottom: 'var(--sp-6)' }}>
              {factor?.label} · {quantity} {factor?.unitLabel}
            </p>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={reset}>Log another</button>
              <button className="btn btn-ghost" onClick={() => window.dispatchEvent(new CustomEvent('verda:nav', { detail: 'dashboard' }))}>
                View dashboard
              </button>
            </div>
          </motion.div>
        ) : stepName === 'category' ? (
          <motion.div key="cat" variants={reduced ? {} : slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <p className="card-label">Choose a category</p>
            <div className="category-grid">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  className={`category-btn${category === key ? ' selected' : ''}`}
                  onClick={() => { setCategory(key); setStep(1) }}
                  aria-pressed={category === key}
                >
                  <span className="category-btn-icon">{meta.emoji}</span>
                  <span className="category-btn-label">{meta.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : stepName === 'activity' ? (
          <motion.div key="act" variants={reduced ? {} : slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <p className="card-label">
              <button className="btn btn-sm btn-ghost" onClick={() => setStep(0)} style={{ marginRight: 'var(--sp-3)' }}>← Back</button>
              {CATEGORY_META[category]?.emoji} Choose an activity
            </p>
            <div className="activity-option-grid">
              {Object.entries(EMISSION_FACTORS[category] || {}).map(([key, def]) => (
                <button
                  key={key}
                  className={`activity-option${activity === key ? ' selected' : ''}`}
                  onClick={() => { setActivity(key); setStep(2) }}
                  aria-pressed={activity === key}
                >
                  <div className="activity-option-info">
                    <span style={{ fontSize: '1.25rem' }}>{def.emoji}</span>
                    <div>
                      <div className="activity-option-name">{def.label}</div>
                      <div className="activity-option-factor">
                        {def.factor > 0 ? `${def.factor} kg / ${def.unit}` : 'Zero emissions'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : stepName === 'quantity' ? (
          <motion.div key="qty" variants={reduced ? {} : slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <p className="card-label">
              <button className="btn btn-sm btn-ghost" onClick={() => setStep(1)} style={{ marginRight: 'var(--sp-3)' }}>← Back</button>
              {factor?.emoji} {factor?.label}
            </p>

            <div className="kg-preview">
              <span className="kg-preview-number">
                {kg > 0 ? kg.toFixed(2) : '—'}
              </span>
              <span className="kg-preview-unit">kg CO₂e</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="qty-input">
                How many {factor?.unitLabel}?
              </label>
              <input
                id="qty-input"
                type="number"
                className="form-input"
                min="0"
                step="any"
                placeholder={`e.g. 10 ${factor?.unitLabel}`}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && quantity > 0 && setStep(3)}
                autoFocus
              />
            </div>

            <button
              className="btn btn-primary btn-full"
              disabled={!quantity || parseFloat(quantity) < 0}
              onClick={() => setStep(3)}
            >
              Preview →
            </button>
          </motion.div>
        ) : (
          <motion.div key="confirm" variants={reduced ? {} : slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
            <p className="card-label">
              <button className="btn btn-sm btn-ghost" onClick={() => setStep(2)} style={{ marginRight: 'var(--sp-3)' }}>← Back</button>
              Confirm &amp; add
            </p>

            <div className="card" style={{ marginBottom: 'var(--sp-4)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-2)' }}>{factor?.emoji}</div>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: 4 }}>{factor?.label}</p>
              <p style={{ color: 'var(--c-text-3)', marginBottom: 'var(--sp-4)' }}>
                {quantity} {factor?.unitLabel}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: kg > 10 ? 'var(--c-danger)' : kg > 3 ? 'var(--c-gold)' : 'var(--c-sage-dark)' }}>
                {kg.toFixed(2)} <span style={{ fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--c-text-3)' }}>kg CO₂e</span>
              </p>
            </div>

            <button className="btn btn-primary btn-full" onClick={handleAdd}>
              ✓ Add to log
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
