import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Avatar({ user, size = 34 }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: user?.avatarColor || 'var(--c-brand)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700,
        fontSize: size * 0.42,
        flexShrink: 0,
        fontFamily: 'var(--font-display)',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  )
}

export default function Header({ streak, user, onLogout, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const btnRef  = useRef(null)
  const [dropPos, setDropPos] = useState({ top: 64, right: 16 })

  // Recalculate drop position whenever the menu opens
  function openMenu() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      let topPos = r.bottom + 8
      // On desktop the nav bar sits directly below the header — open below it
      if (window.innerWidth >= 768) {
        const nav = document.querySelector('nav.bottom-nav')
        if (nav) topPos = nav.getBoundingClientRect().bottom + 8
      }
      setDropPos({ top: topPos, right: window.innerWidth - r.right })
    }
    setMenuOpen(true)
  }

  // Close on scroll / resize
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close); window.removeEventListener('resize', close) }
  }, [menuOpen])

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <div className="header-brand">
          <span className="header-logo">Verda</span>
          <span className="header-tagline">Your footprint, on a budget.</span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          {/* Theme toggle */}
          <motion.button
            onClick={onToggleTheme}
            whileTap={{ scale: 0.85 }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 34, height: 34, borderRadius: 'var(--r-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--c-surface)', border: '1px solid var(--c-border-light)',
              fontSize: '1rem', cursor: 'pointer', transition: 'background var(--dur-fast)',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </motion.button>

          {streak > 0 && (
            <motion.div
              className="header-streak"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              🔥 {streak}
            </motion.div>
          )}

          {user && (
            <button
              ref={btnRef}
              onClick={menuOpen ? () => setMenuOpen(false) : openMenu}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 6px', borderRadius: 'var(--r-full)',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface-raised)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <Avatar user={user} size={34} />
              {!user.isGuest && (
                <span className="user-name-desktop" style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--c-text-2)', display: 'none' }}>
                  {user.name.split(' ')[0]}
                </span>
              )}
              <span style={{ fontSize: '0.6rem', color: 'var(--c-text-3)', marginLeft: -4 }}>▾</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown — rendered via fixed positioning to escape sticky/backdrop-filter clipping */}
      <AnimatePresence>
        {menuOpen && user && (
          <>
            {/* Backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 998 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: dropPos.top,
                right: dropPos.right,
                zIndex: 999,
                background: 'var(--c-bg)',
                border: '1px solid var(--c-border-light)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 220,
                overflow: 'hidden',
              }}
            >
              {/* User info row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                padding: 'var(--sp-4)',
                borderBottom: '1px solid var(--c-border-light)',
                background: 'var(--c-surface)',
              }}>
                <Avatar user={user} size={40} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--c-text-1)', margin: 0 }}>
                    {user.name}
                  </p>
                  {user.email
                    ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    : <p style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)', margin: 0 }}>Guest session</p>
                  }
                </div>
              </div>

              {/* Sign out */}
              <button
                onClick={() => { setMenuOpen(false); onLogout() }}
                style={{
                  width: '100%', padding: 'var(--sp-3) var(--sp-4)',
                  textAlign: 'left', fontSize: 'var(--text-sm)',
                  color: 'var(--c-danger)', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  transition: 'background var(--dur-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--c-danger-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>🚪</span> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
