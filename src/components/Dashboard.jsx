import { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import BudgetBar from './BudgetBar.jsx'
import Forest from './Forest.jsx'
import { CATEGORY_META } from '../utils/emissionFactors.js'
import { getEquivalencies } from '../utils/equivalencies.js'

function CountUp({ value, decimals = 1 }) {
  const reduced = useReducedMotion()
  const spring = useSpring(reduced ? value : 0, { stiffness: 60, damping: 18 })
  const display = useTransform(spring, v => v.toFixed(decimals))

  useEffect(() => { spring.set(value) }, [value, spring])

  return <motion.span>{display}</motion.span>
}

function statusClass(netTotal, goal) {
  const pct = goal > 0 ? netTotal / goal : 0
  if (pct >= 1) return 'big-number-over'
  if (pct >= 0.75) return 'big-number-warn'
  return 'big-number-under'
}

function WeekForecast({ totalEmissions, goal }) {
  const dayOfWeek = new Date().getDay() // 0=Sun … 6=Sat
  const daysElapsed = dayOfWeek === 0 ? 7 : dayOfWeek
  const projected = daysElapsed > 0 ? (totalEmissions / daysElapsed) * 7 : 0
  const diff = projected - goal
  const over = diff > 0
  const color = over ? 'var(--c-danger)' : 'var(--c-sage-dark)'

  if (totalEmissions === 0) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'var(--sp-3) var(--sp-4)',
      background: over ? 'var(--c-danger-light)' : 'var(--c-sage-light)',
      borderRadius: 'var(--r-md)', gap: 'var(--sp-3)',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{over ? '⚠️' : '🎯'}</span>
      <p style={{ flex: 1, fontSize: 'var(--text-sm)', color, fontWeight: 500, margin: 0 }}>
        At this pace you'll end the week at <strong>{projected.toFixed(1)} kg</strong> —{' '}
        {over ? `${diff.toFixed(1)} kg over budget` : `${(-diff).toFixed(1)} kg under budget`}
      </p>
    </div>
  )
}

export default function Dashboard({ activities, completedIds, goal, netTotal, totalEmissions, challengeSavings, onDelete, streak }) {
  const equivs = getEquivalencies(netTotal)
  const recent = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  const categoryTotals = Object.entries(CATEGORY_META).map(([key, meta]) => {
    const kg = activities.filter(a => a.category === key).reduce((s, a) => s + a.kg, 0)
    return { key, meta, kg }
  })
  const maxCatKg = Math.max(...categoryTotals.map(c => c.kg), 0.1)

  if (activities.length === 0) {
    return (
      <div className="stack stack-6">
        <div className="section-header">
          <h1 className="section-title">This week</h1>
          <p className="section-sub">Your carbon budget at a glance</p>
        </div>
        <motion.div
          className="card card-raised"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: 'var(--sp-12) var(--sp-6)' }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--sp-4)' }}>🌱</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: 'var(--sp-2)' }}>
            Nothing logged yet
          </h2>
          <p style={{ color: 'var(--c-text-3)', marginBottom: 'var(--sp-6)', maxWidth: 280, margin: '0 auto var(--sp-6)' }}>
            Start tracking your footprint — log a trip, a meal, or your energy use.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('verda:nav', { detail: 'log' }))}
          >
            Log your first activity →
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="stack stack-6">
      <div className="section-header" style={{ marginBottom: 0 }}>
        <h1 className="section-title">This week</h1>
        <p className="section-sub">Your carbon budget at a glance</p>
      </div>

      {/* Big number */}
      <motion.div
        className="card card-raised"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="card-label">Net CO₂e this week</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
          <span className={`big-number ${statusClass(netTotal, goal)}`}>
            <CountUp value={netTotal} />
          </span>
          <span className="big-number-unit">kg CO₂e</span>
        </div>

        <BudgetBar netTotal={netTotal} goal={goal} />

        <div style={{ marginTop: 'var(--sp-3)' }}>
          <WeekForecast totalEmissions={totalEmissions} goal={goal} />
        </div>

        {/* Equivalencies */}
        {netTotal > 0 && (
          <div className="equiv-row">
            {equivs.map((e, i) => (
              <span key={i} className="equiv-chip">{e.emoji} {e.label}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Challenge savings banner */}
      {challengeSavings > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', background: 'var(--c-sage-light)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-sage)' }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--c-sage-dark)' }}>
            Challenges saving you <strong>{challengeSavings} kg</strong> this week
          </span>
        </motion.div>
      )}

      {/* Forest */}
      <motion.div
        className="card"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Forest netTotal={netTotal} goal={goal} />
      </motion.div>

      {/* Category breakdown */}
      <motion.div
        className="card"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="card-title">By category</p>
        <div className="category-bars">
          {categoryTotals.map(({ key, meta, kg }) => (
            <div key={key} className="cat-bar-row">
              <span className="cat-bar-label">{meta.emoji} {meta.label}</span>
              <div className="cat-bar-track">
                <motion.div
                  className="cat-bar-fill"
                  style={{ background: meta.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(kg / maxCatKg) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <span className="cat-bar-val">{kg.toFixed(1)} kg</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        className="card"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <p className="card-title">Recent activity</p>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">Nothing logged yet — add your first activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {recent.map((a, i) => {
              const meta = CATEGORY_META[a.category]
              return (
                <motion.div
                  key={a.id}
                  className="activity-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.04 }}
                  layout
                >
                  <span className="activity-emoji">{meta?.emoji}</span>
                  <div className="activity-info">
                    <p className="activity-label">{a.label}</p>
                    <p className="activity-meta">{a.quantity} {a.unit} · {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="activity-kg">{a.kg.toFixed(2)} kg</span>
                  <button
                    className="activity-delete"
                    onClick={() => onDelete(a.id)}
                    aria-label={`Delete ${a.label}`}
                  >
                    ×
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
