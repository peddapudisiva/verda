import { motion, useReducedMotion } from 'framer-motion'

const GLOBAL_AVG = 120  // kg CO2e/week
const TARGET_15C = 38   // kg CO2e/week (1.5°C aligned)

export default function Comparison({ netTotal }) {
  const reduced = useReducedMotion()
  const max = Math.max(netTotal, GLOBAL_AVG, 1) * 1.1

  const rows = [
    { label: 'Your week',     kg: netTotal,   color: netTotal > TARGET_15C ? 'var(--c-brand)' : 'var(--c-sage)' },
    { label: 'Global average', kg: GLOBAL_AVG, color: 'var(--c-danger)' },
    { label: '1.5°C target',  kg: TARGET_15C, color: 'var(--c-sage)' },
  ]

  return (
    <div>
      <p className="card-title">How you compare</p>
      <div className="comparison-bars">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            className="comp-row"
            initial={reduced ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="comp-row-header">
              <span className="comp-label">{row.label}</span>
              <span className="comp-kg">{row.kg.toFixed(1)} kg</span>
            </div>
            <div className="comp-track">
              <motion.div
                className="comp-fill"
                style={{ background: row.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(row.kg / max) * 100}%` }}
                transition={{ duration: reduced ? 0 : 0.7, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: 'var(--sp-4)', padding: 'var(--sp-4)', background: 'var(--c-surface)', borderRadius: 'var(--r-md)' }}>
        {netTotal <= TARGET_15C ? (
          <p style={{ color: 'var(--c-sage-dark)', fontSize: 'var(--text-sm)' }}>
            🎉 You're at or below the <strong>1.5°C target</strong>. You're {(GLOBAL_AVG - netTotal).toFixed(1)} kg below the global average.
          </p>
        ) : (
          <p style={{ color: 'var(--c-text-2)', fontSize: 'var(--text-sm)' }}>
            The 1.5°C target is <strong>{(netTotal - TARGET_15C).toFixed(1)} kg away</strong>. You're {netTotal < GLOBAL_AVG ? `${(GLOBAL_AVG - netTotal).toFixed(1)} kg below` : `${(netTotal - GLOBAL_AVG).toFixed(1)} kg above`} the global average.
          </p>
        )}
      </div>
    </div>
  )
}
