import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AVATAR_COLORS = [
  '#C4714A','#6B8C5A','#C8973A','#8B6CA8',
  '#3A7CB8','#C05A7A','#4A9B8E','#8B4513',
]

function Avatar({ user, size = 72 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: user?.avatarColor || '#C4714A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.42,
      fontFamily: 'var(--font-display)', userSelect: 'none', flexShrink: 0,
      boxShadow: 'var(--shadow-md)',
    }}>
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

export default function ProfilePage({ user, onUpdateUser, onLogout, activities, weeklyHistory }) {
  const [editingName, setEditingName]   = useState(false)
  const [nameInput,   setNameInput]     = useState(user?.name || '')
  const [pickerOpen,  setPickerOpen]    = useState(false)
  const [saved,       setSaved]         = useState(false)

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'This session'

  const totalKg    = activities.reduce((s, a) => s + a.kg, 0)
  const weeksLogged = weeklyHistory.length

  function saveName() {
    if (nameInput.trim()) {
      onUpdateUser({ ...user, name: nameInput.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setEditingName(false)
  }

  function pickColor(color) {
    onUpdateUser({ ...user, avatarColor: color })
    setPickerOpen(false)
  }

  return (
    <div className="stack stack-6">
      <div className="section-header">
        <h1 className="section-title">Profile</h1>
        <p className="section-sub">Your account &amp; stats</p>
      </div>

      {/* Avatar + name card */}
      <motion.div
        className="card card-raised"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-4)', paddingTop: 'var(--sp-2)', paddingBottom: 'var(--sp-4)' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <Avatar user={user} size={80} />
            <button
              onClick={() => setPickerOpen(p => !p)}
              aria-label="Change avatar colour"
              style={{
                position: 'absolute', bottom: 0, right: -4,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--c-bg)', border: '2px solid var(--c-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
              }}
            >
              🎨
            </button>
          </div>

          {/* Colour picker */}
          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', justifyContent: 'center' }}
              >
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => pickColor(c)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: c,
                      border: user?.avatarColor === c ? '3px solid var(--c-text-1)' : '2px solid transparent',
                      cursor: 'pointer', transition: 'border var(--dur-fast)',
                    }}
                    aria-label={`Pick colour ${c}`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name */}
          {editingName ? (
            <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', width: '100%', maxWidth: 280 }}>
              <input
                className="form-input"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                autoFocus
                style={{ flex: 1, textAlign: 'center' }}
              />
              <button className="btn btn-primary btn-sm" onClick={saveName}>Save</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', justifyContent: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--c-text-1)' }}>
                  {user?.name}
                </h2>
                {!user?.isGuest && (
                  <button
                    onClick={() => { setEditingName(true); setNameInput(user?.name || '') }}
                    style={{ fontSize: '0.9rem', color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label="Edit name"
                  >✏️</button>
                )}
              </div>
              {user?.email
                ? <p style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)' }}>{user.email}</p>
                : <p style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>Guest session</p>
              }
              {saved && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--c-sage-dark)', fontSize: 'var(--text-xs)', marginTop: 4 }}>
                  ✓ Name updated
                </motion.p>
              )}
            </div>
          )}

          <p style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}>Member since {memberSince}</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-3)' }}>
        {[
          { icon: '📋', value: activities.length, label: 'Activities logged' },
          { icon: '📅', value: weeksLogged,        label: 'Weeks tracked' },
          { icon: '⚖️', value: `${totalKg.toFixed(0)} kg`, label: 'Total CO₂e logged' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="card"
            style={{ textAlign: 'center', padding: 'var(--sp-4) var(--sp-3)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <div style={{ fontSize: '1.4rem', marginBottom: 'var(--sp-1)' }}>{stat.icon}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--c-brand)', lineHeight: 1.1 }}>{stat.value}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', marginTop: 4 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Sign out */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          className="btn btn-full"
          onClick={onLogout}
          style={{
            color: 'var(--c-danger)', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-2)',
            border: '1px solid var(--c-danger-light)',
            background: 'var(--c-danger-light)', borderRadius: 'var(--r-md)',
            padding: 'var(--sp-3) var(--sp-4)',
          }}
        >
          🚪 Sign out
        </button>
      </motion.div>
    </div>
  )
}
