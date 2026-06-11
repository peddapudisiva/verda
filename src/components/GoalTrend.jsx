import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

function TrendChart({ data, goal }) {
  const [hover, setHover] = useState(null)
  if (!data || data.length < 2) return (
    <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
      <div className="empty-state-icon">📈</div>
      <p className="empty-state-text">Log at least 2 weeks to see your trend</p>
    </div>
  )

  const W = 500, H = 180
  const pad = { top: 20, right: 20, bottom: 36, left: 52 }
  const iW = W - pad.left - pad.right
  const iH = H - pad.top - pad.bottom
  const allVals = data.map(d => d.total)
  const maxVal = Math.max(...allVals, goal * 1.4, 1)

  const toX = i => pad.left + (i / (data.length - 1)) * iW
  const toY = v => pad.top + iH - (v / maxVal) * iH
  const goalY = toY(goal)

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.total), ...d }))

  const path = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`
    const prev = pts[i - 1]
    const cx1 = prev.x + (pt.x - prev.x) / 2.5
    const cx2 = pt.x  - (pt.x - prev.x) / 2.5
    return `${acc} C ${cx1},${prev.y} ${cx2},${pt.y} ${pt.x},${pt.y}`
  }, '')

  const areaPath = `${path} L ${pts[pts.length - 1].x},${pad.top + iH} L ${pts[0].x},${pad.top + iH} Z`

  return (
    <div className="trend-chart-wrap" style={{ position: 'relative' }}>
      {hover && (
        <div
          className="trend-tooltip"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          <strong>{hover.total} kg</strong> · goal {hover.goal} kg
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-chart">
        {/* Y axis labels */}
        {[0, Math.round(maxVal / 2), Math.round(maxVal)].map(v => (
          <text key={v} x={pad.left - 6} y={toY(v) + 4} textAnchor="end" fill="var(--c-text-3)" fontSize={11}>
            {v}
          </text>
        ))}
        {/* X axis labels */}
        {pts.map((pt, i) => (
          <text key={i} x={pt.x} y={H - 4} textAnchor="middle" fill="var(--c-text-3)" fontSize={10}>
            W{data.length - i}
          </text>
        ))}
        {/* Goal line */}
        <line x1={pad.left} y1={goalY} x2={W - pad.right} y2={goalY}
          stroke="var(--c-sage)" strokeDasharray="5,4" strokeWidth={1.5} />
        <text x={W - pad.right + 4} y={goalY + 4} fill="var(--c-sage)" fontSize={10}>goal</text>

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="var(--c-brand)" fillOpacity={0.08}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        {/* Line */}
        <motion.path
          d={path} fill="none"
          stroke="var(--c-brand)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
        {/* Points */}
        {pts.map((pt, i) => (
          <motion.circle
            key={i} cx={pt.x} cy={pt.y} r={5}
            fill={pt.total <= goal ? 'var(--c-sage)' : 'var(--c-brand)'}
            stroke="#fff" strokeWidth={2}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.06 }}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHover(pt)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
    </div>
  )
}

export default function GoalTrend({ goal, onSetGoal, weeklyHistory, netTotal, onLogWeek }) {
  const reduced = useReducedMotion()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(goal)

  function saveGoal() {
    const v = parseFloat(draft)
    if (v > 0) onSetGoal(v)
    setEditing(false)
  }

  return (
    <div className="stack stack-6">
      {/* Goal setter */}
      <motion.div
        className="card"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="card-title">Weekly goal</p>
        <div className="goal-row">
          {editing ? (
            <>
              <input
                type="number" className="form-input goal-input"
                value={draft} min={1} max={500}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                autoFocus
              />
              <span style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-lg)' }}>kg CO₂e / week</span>
              <button className="btn btn-primary btn-sm" onClick={saveGoal}>Save</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 700, color: 'var(--c-brand)' }}>{goal}</span>
              <span style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-lg)' }}>kg CO₂e / week</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(goal); setEditing(true) }}>Edit</button>
            </>
          )}
        </div>
        <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
          Default 38 kg = 1.5°C-aligned global budget
        </p>
      </motion.div>

      {/* Trend chart */}
      <motion.div
        className="card"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="card-title">Weekly trend</p>
        <TrendChart data={weeklyHistory} goal={goal} />
      </motion.div>

      {/* Log week & start fresh */}
      <motion.div
        className="card"
        style={{ textAlign: 'center' }}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--sp-2)' }}>
          End of week?
        </p>
        <p style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-5)' }}>
          Snapshot this week's {netTotal.toFixed(1)} kg and start fresh.
        </p>
        <button className="btn btn-secondary" onClick={onLogWeek}>
          📸 Log this week &amp; start fresh
        </button>
      </motion.div>
    </div>
  )
}
