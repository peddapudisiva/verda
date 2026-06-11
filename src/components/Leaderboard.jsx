import { motion } from 'framer-motion'

const COMMUNITY = [
  { name: 'Emma R.',    kg: 14.2, flag: '🇩🇪' },
  { name: 'Priya M.',   kg: 18.7, flag: '🇮🇳' },
  { name: 'James K.',   kg: 21.4, flag: '🇬🇧' },
  { name: 'Sofia L.',   kg: 24.1, flag: '🇧🇷' },
  { name: 'Hiroshi T.', kg: 26.8, flag: '🇯🇵' },
  { name: 'Amara N.',   kg: 29.3, flag: '🇳🇬' },
  { name: 'Lucas P.',   kg: 33.5, flag: '🇫🇷' },
]

const GOAL = 38

function placeUser(netTotal, name) {
  const all = [...COMMUNITY, { name: name || 'You', kg: netTotal, isYou: true }]
  return all.sort((a, b) => a.kg - b.kg)
}

function medalEmoji(rank) {
  if (rank === 0) return '🥇'
  if (rank === 1) return '🥈'
  if (rank === 2) return '🥉'
  return `#${rank + 1}`
}

export default function Leaderboard({ netTotal, userName }) {
  const board = placeUser(netTotal, userName)
  const userIdx = board.findIndex(e => e.isYou)
  const maxKg = Math.max(...board.map(e => e.kg), GOAL)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-4)' }}>
        <div>
          <p className="card-label" style={{ margin: 0 }}>Community this week</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 2 }}>
            {board.length} users • ranked by lowest CO₂e
          </p>
        </div>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--c-brand)',
          background: 'var(--c-brand-light)', padding: '2px 10px', borderRadius: 'var(--r-full)',
        }}>
          You're #{userIdx + 1}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {board.map((entry, i) => (
          <motion.div
            key={entry.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--r-md)',
              background: entry.isYou ? 'var(--c-brand-light)' : 'transparent',
              border: entry.isYou ? '1px solid var(--c-brand)' : '1px solid transparent',
            }}
          >
            <span style={{ width: 28, textAlign: 'center', fontSize: entry.isYou ? 'var(--text-sm)' : 'var(--text-xs)', fontWeight: 700, color: i < 3 ? 'var(--c-gold)' : 'var(--c-text-3)' }}>
              {medalEmoji(i)}
            </span>

            <span style={{ fontSize: '1rem' }}>{entry.flag || '🌿'}</span>

            <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: entry.isYou ? 700 : 500, color: entry.isYou ? 'var(--c-brand-dark)' : 'var(--c-text-1)' }}>
              {entry.isYou ? `${entry.name} (you)` : entry.name}
            </span>

            {/* Bar */}
            <div style={{ width: 80, height: 6, background: 'var(--c-border-light)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(entry.kg / maxKg) * 100}%` }}
                transition={{ delay: i * 0.04 + 0.1, duration: 0.5 }}
                style={{
                  height: '100%', borderRadius: 99,
                  background: entry.isYou ? 'var(--c-brand)' : entry.kg > GOAL ? 'var(--c-danger)' : 'var(--c-sage)',
                }}
              />
            </div>

            <span style={{ width: 52, textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, color: entry.kg > GOAL ? 'var(--c-danger)' : 'var(--c-sage-dark)' }}>
              {entry.kg.toFixed(1)} kg
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
