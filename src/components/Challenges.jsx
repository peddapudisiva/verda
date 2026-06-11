import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CHALLENGES } from '../utils/challenges.js'

export default function Challenges({ completedIds, onToggle }) {
  const reduced = useReducedMotion()
  const totalSaved = CHALLENGES
    .filter(c => completedIds.includes(c.id))
    .reduce((s, c) => s + c.savings, 0)

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Challenges</h1>
        <p className="section-sub">Tap a card to claim your savings</p>
      </div>

      {/* Trophy panel */}
      <motion.div
        className="trophy-panel"
        layout
        initial={reduced ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="card-label" style={{ marginBottom: 2 }}>Total saved this week</p>
          <p className="trophy-total">{totalSaved} <span style={{ fontSize: 'var(--text-xl)', fontWeight: 400, color: 'var(--c-gold)' }}>kg</span></p>
        </div>
        <span style={{ fontSize: '3rem' }}>🏆</span>
      </motion.div>

      <div className="challenge-grid">
        {CHALLENGES.map((ch, i) => {
          const done = completedIds.includes(ch.id)
          return (
            <motion.button
              key={ch.id}
              className={`challenge-card${done ? ' done' : ''}`}
              onClick={() => onToggle(ch.id)}
              whileHover={reduced ? {} : { scale: 1.01 }}
              whileTap={reduced ? {} : { scale: 0.98 }}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              aria-pressed={done}
            >
              <span className="challenge-icon">{ch.emoji}</span>
              <div className="challenge-info">
                <p className="challenge-title">{ch.title}</p>
                <p className="challenge-desc">{ch.description}</p>
              </div>
              <div className="challenge-savings">
                {done ? (
                  <span className="challenge-check">✅</span>
                ) : (
                  <>
                    <span className="challenge-kg">−{ch.savings}</span>
                    <span className="challenge-kg-label">kg saved</span>
                  </>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
