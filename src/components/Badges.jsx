import { motion, useReducedMotion } from 'framer-motion'
import { BADGE_DEFINITIONS } from '../utils/badges.js'

export default function Badges({ unlockedBadges }) {
  const reduced = useReducedMotion()
  const unlockedIds = unlockedBadges.map(b => b.id)

  return (
    <div>
      <p className="card-title">Achievements</p>
      <div className="badges-grid">
        {BADGE_DEFINITIONS.map((def, i) => {
          const record = unlockedBadges.find(b => b.id === def.id)
          const unlocked = !!record
          return (
            <motion.div
              key={def.id}
              className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 20 }}
              title={def.description}
            >
              <span className="badge-icon">{def.emoji}</span>
              <p className="badge-name">{def.name}</p>
              {unlocked && record.unlockedAt && (
                <p className="badge-date">
                  {new Date(record.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              )}
              {!unlocked && (
                <p className="badge-date">Locked</p>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
