import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import BudgetBar from './BudgetBar.jsx'
import Forest from './Forest.jsx'

export default function WhatIf({ activities, goal, netTotal }) {
  const reduced = useReducedMotion()
  const [driveLess, setDriveLess]     = useState(0)    // % reduction
  const [switchEV, setSwitchEV]       = useState(false)
  const [meatSwap, setMeatSwap]       = useState(0)    // number of meat meals swapped to veggie
  const [skipFlights, setSkipFlights] = useState(false)

  const simulated = useMemo(() => {
    let saved = 0

    // Drive less
    if (driveLess > 0) {
      const carKg = activities
        .filter(a => a.activity === 'car_petrol' || a.activity === 'car_ev')
        .reduce((s, a) => s + a.kg, 0)
      saved += carKg * (driveLess / 100)
    }

    // Switch to EV (petrol → EV factor swap)
    if (switchEV) {
      activities.filter(a => a.activity === 'car_petrol').forEach(a => {
        const evKg = (a.quantity * 0.053)
        saved += a.kg - evKg
      })
    }

    // Swap meat meals to veggie
    if (meatSwap > 0) {
      const beefMeals = activities.filter(a => a.activity === 'beef').reduce((s, a) => s + a.quantity, 0)
      const actualSwap = Math.min(meatSwap, beefMeals)
      saved += actualSwap * (6.6 - 0.9) // beef → vegetarian delta
    }

    // Skip flights
    if (skipFlights) {
      saved += activities.filter(a => a.activity === 'flight').reduce((s, a) => s + a.kg, 0)
    }

    return Math.max(0, netTotal - saved)
  }, [activities, driveLess, switchEV, meatSwap, skipFlights, netTotal])

  const projected = Math.round((netTotal - simulated) * 10) / 10

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">What if…</h1>
        <p className="section-sub">See your savings before you commit</p>
      </div>

      <motion.div
        className="card"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="simulator-controls">
          {/* Drive less */}
          <div className="sim-control">
            <div className="sim-label">
              <span className="sim-label-text">🚗 Drive {driveLess}% less</span>
              <span className="sim-value">{driveLess}%</span>
            </div>
            <input
              type="range" className="sim-slider"
              min={0} max={100} step={5}
              value={driveLess}
              onChange={e => setDriveLess(Number(e.target.value))}
              aria-label="Drive less percentage"
            />
          </div>

          {/* Switch to EV */}
          <div className="sim-control">
            <div className="sim-label">
              <span className="sim-label-text">⚡ Switch car to EV</span>
              <button
                onClick={() => setSwitchEV(v => !v)}
                style={{
                  padding: '4px 16px', borderRadius: 'var(--r-full)',
                  background: switchEV ? 'var(--c-sage)' : 'var(--c-surface-raised)',
                  color: switchEV ? '#fff' : 'var(--c-text-2)',
                  fontWeight: 600, fontSize: 'var(--text-sm)',
                  transition: 'all var(--dur-fast) var(--ease)',
                }}
                aria-pressed={switchEV}
              >
                {switchEV ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* Swap meat meals */}
          <div className="sim-control">
            <div className="sim-label">
              <span className="sim-label-text">🥦 Swap {meatSwap} beef meal{meatSwap !== 1 ? 's' : ''} → veggie</span>
              <span className="sim-value">{meatSwap}</span>
            </div>
            <input
              type="range" className="sim-slider"
              min={0} max={14} step={1}
              value={meatSwap}
              onChange={e => setMeatSwap(Number(e.target.value))}
              aria-label="Meat meals to swap"
            />
          </div>

          {/* Skip flights */}
          <div className="sim-control">
            <div className="sim-label">
              <span className="sim-label-text">✈️ Skip all flights this week</span>
              <button
                onClick={() => setSkipFlights(v => !v)}
                style={{
                  padding: '4px 16px', borderRadius: 'var(--r-full)',
                  background: skipFlights ? 'var(--c-sage)' : 'var(--c-surface-raised)',
                  color: skipFlights ? '#fff' : 'var(--c-text-2)',
                  fontWeight: 600, fontSize: 'var(--text-sm)',
                  transition: 'all var(--dur-fast) var(--ease)',
                }}
                aria-pressed={skipFlights}
              >
                {skipFlights ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="sim-preview">
          <p className="card-label" style={{ marginBottom: 'var(--sp-3)' }}>Projected weekly total</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}>
            <motion.span
              className="sim-savings"
              key={simulated}
              animate={{ scale: [1.05, 1] }}
              transition={{ duration: 0.2 }}
            >
              {simulated.toFixed(1)}
            </motion.span>
            <span style={{ fontSize: 'var(--text-xl)', color: 'var(--c-sage-dark)' }}>kg CO₂e</span>
          </div>
          <BudgetBar netTotal={simulated} goal={goal} />
          {projected > 0 && (
            <p style={{ marginTop: 'var(--sp-4)', color: 'var(--c-sage-dark)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              That's {projected.toFixed(1)} kg less than your current week! 🎉
            </p>
          )}
        </div>

        {/* Forest preview */}
        <div className="divider" />
        <Forest netTotal={simulated} goal={goal} />
      </motion.div>
    </div>
  )
}
