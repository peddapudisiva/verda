import { motion, useReducedMotion } from 'framer-motion'

const TOTAL_TREES = 12

export default function Forest({ netTotal, goal }) {
  const reduced = useReducedMotion()
  const treesAlive = goal > 0
    ? Math.round(Math.max(0, Math.min(1, 1 - netTotal / goal) * TOTAL_TREES))
    : 0

  return (
    <div>
      <p className="card-label">Your forest this week</p>
      <div className="forest-grid" role="img" aria-label={`${treesAlive} of 12 trees alive`}>
        {Array.from({ length: TOTAL_TREES }).map((_, i) => {
          const alive = i < treesAlive
          return (
            <motion.span
              key={i}
              className={`forest-tree${alive ? '' : ' dead'}`}
              animate={reduced ? undefined : {
                scale: alive ? 1 : 0.75,
                opacity: alive ? 1 : 0.25,
                filter: alive ? 'saturate(1)' : 'saturate(0)',
              }}
              initial={false}
              transition={{ duration: 0.4, delay: reduced ? 0 : i * 0.04 }}
              aria-hidden="true"
            >
              🌳
            </motion.span>
          )
        })}
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', textAlign: 'center' }}>
        {treesAlive === TOTAL_TREES
          ? 'Full forest — you\'re crushing it! 🎉'
          : treesAlive === 0
            ? 'Log less to bring your forest back'
            : `${treesAlive} / ${TOTAL_TREES} trees thriving`}
      </p>
    </div>
  )
}
