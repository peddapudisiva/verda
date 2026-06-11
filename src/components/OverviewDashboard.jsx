import { motion, useReducedMotion } from 'framer-motion'
import BudgetBar from './BudgetBar.jsx'
import Forest from './Forest.jsx'
import Leaderboard from './Leaderboard.jsx'
import { CHALLENGES } from '../utils/challenges.js'

function StatCard({ icon, value, unit, label, color, delay, onClick }) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      className="stat-card"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={reduced ? {} : { y: -2, boxShadow: 'var(--shadow-md)' }}
      whileTap={reduced ? {} : { scale: 0.97 }}
    >
      <span className="stat-card-icon">{icon}</span>
      <p className="stat-card-value" style={{ color }}>
        {value}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </p>
      <p className="stat-card-label">{label}</p>
    </motion.button>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function statusColor(netTotal, goal) {
  const pct = goal > 0 ? netTotal / goal : 0
  if (pct >= 1)    return 'var(--c-danger)'
  if (pct >= 0.75) return 'var(--c-gold)'
  return 'var(--c-sage-dark)'
}

export default function OverviewDashboard({ user, netTotal, goal, streak, completedIds, activities, unlockedBadges, onNavigate }) {
  const reduced = useReducedMotion()
  const pct       = goal > 0 ? Math.round((netTotal / goal) * 100) : 0
  const remaining = Math.max(goal - netTotal, 0)
  const chalDone  = completedIds.length
  const dispName  = user?.name === 'Guest' ? 'there' : (user?.name?.split(' ')[0] || 'there')

  const quickActions = [
    { icon: '➕', label: 'Log Activity',   id: 'log',        color: 'var(--c-brand-light)',  textColor: 'var(--c-brand-dark)' },
    { icon: '🎯', label: 'Challenges',     id: 'challenges', color: 'var(--c-sage-light)',   textColor: 'var(--c-sage-dark)' },
    { icon: '✨', label: 'AI Coach',       id: 'coach',      color: 'var(--c-gold-light)',   textColor: 'var(--c-gold)' },
    { icon: '🎛️', label: 'Simulator',      id: 'simulator',  color: 'var(--c-purple-light)', textColor: 'var(--c-purple)' },
  ]

  return (
    <div className="stack stack-6">
      {/* Welcome header */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="section-title">
          {getGreeting()}, {dispName}! <span style={{ fontStyle: 'normal' }}>🌿</span>
        </h1>
        <p className="section-sub">
          {netTotal <= goal
            ? `You have ${remaining.toFixed(1)} kg left in your budget this week.`
            : `You're ${(netTotal - goal).toFixed(1)} kg over budget — let's bring it down.`}
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="stat-grid">
        <StatCard
          icon="🌡️"
          value={netTotal.toFixed(1)}
          unit=" kg"
          label="CO₂e this week"
          color={statusColor(netTotal, goal)}
          delay={0.05}
          onClick={() => onNavigate('dashboard')}
        />
        <StatCard
          icon="📊"
          value={`${Math.min(pct, 999)}%`}
          label="of budget used"
          color={pct >= 100 ? 'var(--c-danger)' : pct >= 75 ? 'var(--c-gold)' : 'var(--c-sage-dark)'}
          delay={0.1}
          onClick={() => onNavigate('dashboard')}
        />
        <StatCard
          icon="🔥"
          value={streak}
          unit={streak === 1 ? ' day' : ' days'}
          label="logging streak"
          color="var(--c-gold)"
          delay={0.15}
          onClick={() => onNavigate('progress')}
        />
        <StatCard
          icon="🎯"
          value={`${chalDone}/5`}
          label="challenges done"
          color="var(--c-sage-dark)"
          delay={0.2}
          onClick={() => onNavigate('challenges')}
        />
      </div>

      {/* Budget bar card */}
      <motion.div
        className="card card-raised"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <BudgetBar netTotal={netTotal} goal={goal} />
      </motion.div>

      {/* Forest */}
      <motion.div
        className="card"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Forest netTotal={netTotal} goal={goal} />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="card-label" style={{ marginBottom: 'var(--sp-3)' }}>Quick actions</p>
        <div className="quick-action-grid">
          {quickActions.map((a, i) => (
            <motion.button
              key={a.id}
              className="quick-action-btn"
              style={{ background: a.color, color: a.textColor }}
              onClick={() => onNavigate(a.id)}
              initial={reduced ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
            >
              <span className="quick-action-icon">{a.icon}</span>
              <span className="quick-action-label">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Badges teaser */}
      {unlockedBadges.length > 0 && (
        <motion.button
          className="card"
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 16 }}
          viewport={{ once: true }}
          onClick={() => onNavigate('progress')}
          whileHover={reduced ? {} : { boxShadow: 'var(--shadow-md)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="card-label" style={{ marginBottom: 4 }}>Achievements</p>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--c-text-1)' }}>
                {unlockedBadges.length} badge{unlockedBadges.length > 1 ? 's' : ''} earned
              </p>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {unlockedBadges.slice(0, 4).map(b => {
                const def = [
                  { id: 'first_week_under', emoji: '🏆' },
                  { id: 'streak_7', emoji: '🔥' },
                  { id: 'plant_powered', emoji: '🌱' },
                  { id: 'grounded', emoji: '🌍' },
                  { id: 'challenger', emoji: '⚡' },
                ].find(d => d.id === b.id)
                return <span key={b.id} style={{ fontSize: '1.75rem' }}>{def?.emoji}</span>
              })}
            </div>
          </div>
        </motion.button>
      )}

      {/* Community leaderboard */}
      <motion.div
        className="card"
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Leaderboard netTotal={netTotal} userName={user?.name} />
      </motion.div>
    </div>
  )
}
