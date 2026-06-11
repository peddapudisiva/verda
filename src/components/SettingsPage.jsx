import { useState } from 'react'
import { motion } from 'framer-motion'

// Request browser notification permission and send a test notification
async function requestNotifications() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  const result = await Notification.requestPermission()
  return result
}

function sendTestNotification() {
  if (Notification.permission !== 'granted') return
  new Notification('Verda reminder 🌿', {
    body: "Don't forget to log today's activities and stay within your carbon budget!",
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  })
}

function Row({ icon, title, sub, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 'var(--sp-4)', padding: 'var(--sp-4) 0',
      borderBottom: '1px solid var(--c-border-light)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)', margin: 0 }}>{title}</p>
          {sub && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: 0, marginTop: 2 }}>{sub}</p>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--c-sage)' : 'var(--c-border)',
        position: 'relative', transition: 'background var(--dur-base)',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  )
}

export default function SettingsPage({ goal, onSetGoal, theme, onToggleTheme, onClearData, activities, weeklyHistory }) {
  const [goalInput, setGoalInput]   = useState(String(goal))
  const [goalSaved, setGoalSaved]   = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [notifications, setNotifications] = useState(Notification?.permission === 'granted')
  const [notifStatus,   setNotifStatus]   = useState('')   // '', 'denied', 'unsupported'
  const [weeklyDigest,  setWeeklyDigest]  = useState(false)

  function saveGoal() {
    const v = parseFloat(goalInput)
    if (v > 0) {
      onSetGoal(v)
      setGoalSaved(true)
      setTimeout(() => setGoalSaved(false), 2000)
    }
  }

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      activities,
      weeklyHistory,
      goal,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `verda-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="stack stack-6">
      <div className="section-header">
        <h1 className="section-title">Settings</h1>
        <p className="section-sub">Preferences &amp; data</p>
      </div>

      {/* Preferences */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="card-label" style={{ marginBottom: 'var(--sp-2)' }}>Preferences</p>

        <Row icon="🌙" title="Dark mode" sub="Easy on the eyes at night">
          <Toggle checked={theme === 'dark'} onChange={() => onToggleTheme()} label="Toggle dark mode" />
        </Row>

        <Row
          icon="🔔"
          title="Daily reminder"
          sub={notifStatus === 'denied' ? '⚠️ Permission blocked — enable in browser settings' : notifStatus === 'unsupported' ? 'Not supported in this browser' : 'Nudge to log your activities'}
        >
          <Toggle
            checked={notifications}
            onChange={async (val) => {
              if (val) {
                const result = await requestNotifications()
                if (result === 'granted') {
                  setNotifications(true)
                  setNotifStatus('')
                  sendTestNotification()
                } else {
                  setNotifStatus(result)
                }
              } else {
                setNotifications(false)
              }
            }}
            label="Toggle daily reminder"
          />
        </Row>

        <Row icon="📧" title="Weekly digest" sub="Summary email every Monday">
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} label="Toggle weekly digest" />
        </Row>

        <div style={{ paddingTop: 'var(--sp-4)' }}>
          <Row icon="🎯" title="Weekly budget goal" sub="kg CO₂e you aim to stay under">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <input
                type="number"
                className="form-input"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                onBlur={saveGoal}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                min="1"
                style={{ width: 72, textAlign: 'center', padding: 'var(--sp-2)' }}
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>kg</span>
              {goalSaved && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--c-sage-dark)', fontSize: 'var(--text-xs)' }}>
                  ✓
                </motion.span>
              )}
            </div>
          </Row>
        </div>
      </motion.div>

      {/* Data */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <p className="card-label" style={{ marginBottom: 'var(--sp-2)' }}>Your data</p>

        <Row icon="📦" title={`${activities.length} activities`} sub={`${weeklyHistory.length} weeks of history stored locally`}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>localStorage</span>
        </Row>

        <Row icon="⬇️" title="Export data" sub="Download your activity log as JSON">
          <button
            className="btn btn-sm"
            onClick={exportData}
            style={{ background: 'var(--c-sage-light)', color: 'var(--c-sage-dark)', border: 'none', borderRadius: 'var(--r-md)', padding: 'var(--sp-2) var(--sp-3)', fontWeight: 600, fontSize: 'var(--text-xs)' }}
          >
            Export
          </button>
        </Row>

        <div style={{ paddingTop: 'var(--sp-4)', borderBottom: 'none' }}>
          {!confirmClear ? (
            <Row icon="🗑️" title="Clear all data" sub="Remove activities, history &amp; badges — cannot be undone">
              <button
                onClick={() => setConfirmClear(true)}
                style={{
                  background: 'var(--c-danger-light)', color: 'var(--c-danger)',
                  border: 'none', borderRadius: 'var(--r-md)', padding: 'var(--sp-2) var(--sp-3)',
                  fontWeight: 600, fontSize: 'var(--text-xs)', cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </Row>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: 'var(--sp-4)', background: 'var(--c-danger-light)',
                borderRadius: 'var(--r-md)', textAlign: 'center',
              }}
            >
              <p style={{ fontWeight: 600, color: 'var(--c-danger)', marginBottom: 'var(--sp-3)', fontSize: 'var(--text-sm)' }}>
                This will delete all your activities and history. Are you sure?
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center' }}>
                <button
                  onClick={() => { onClearData(); setConfirmClear(false) }}
                  style={{ background: 'var(--c-danger)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: 'var(--sp-2) var(--sp-4)', fontWeight: 700, cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                >
                  Yes, clear everything
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        style={{ textAlign: 'center', padding: 'var(--sp-6)' }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--c-brand)', marginBottom: 'var(--sp-1)' }}>Verda</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>Your footprint, on a budget.</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 'var(--sp-2)' }}>v1.0 · Built with React + Framer Motion + Claude</p>
      </motion.div>
    </div>
  )
}
