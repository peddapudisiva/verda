import { motion, useReducedMotion } from 'framer-motion'

function barClass(pct) {
  if (pct >= 100) return 'budget-bar-over'
  if (pct >= 75)  return 'budget-bar-warn'
  return 'budget-bar-under'
}

export default function BudgetBar({ netTotal, goal }) {
  const reduced = useReducedMotion()
  const pct = goal > 0 ? Math.min((netTotal / goal) * 100, 100) : 0
  const overBy = netTotal > goal ? netTotal - goal : 0
  const remaining = Math.max(goal - netTotal, 0)

  return (
    <div className="budget-bar-wrap">
      <div className="budget-bar-labels">
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-2)', fontWeight: 500 }}>
          Weekly Budget
        </span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: pct >= 100 ? 'var(--c-danger)' : 'var(--c-text-2)' }}>
          {pct >= 100
            ? `${overBy.toFixed(1)} kg over`
            : `${remaining.toFixed(1)} kg left`}
        </span>
      </div>

      <div className="budget-bar-track" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Weekly carbon budget used">
        <motion.div
          className={`budget-bar-fill ${barClass(pct)}`}
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <div className="budget-bar-legend">
        <span>0 kg</span>
        <span>{goal} kg target</span>
      </div>
    </div>
  )
}
