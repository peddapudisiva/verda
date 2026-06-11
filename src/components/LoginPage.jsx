import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const AVATAR_COLORS = ['#C4714A', '#6B8C5A', '#C8973A', '#8B6CA8', '#4A6741']

function pickColor(name) {
  if (!name) return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function validate({ mode, name, email, password }) {
  const errs = {}
  if (mode === 'signup' && !name.trim()) errs.name = 'Please enter your name'
  if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address'
  if (password.length < 6) errs.password = 'Password must be at least 6 characters'
  return errs
}

export default function LoginPage({ onLogin }) {
  const reduced = useReducedMotion()
  const [mode, setMode]         = useState('signin') // 'signin' | 'signup'
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate({ mode, name, email, password })
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    // Simulate tiny async (looks intentional, not broken)
    setTimeout(() => {
      const accounts = JSON.parse(localStorage.getItem('verda_accounts') || '[]')

      if (mode === 'signup') {
        if (accounts.find(a => a.email === email)) {
          setErrors({ email: 'An account with this email already exists' })
          setLoading(false)
          return
        }
        const user = { name: name.trim(), email, password, avatarColor: pickColor(name), createdAt: new Date().toISOString() }
        localStorage.setItem('verda_accounts', JSON.stringify([...accounts, user]))
        onLogin({ name: user.name, email: user.email, avatarColor: user.avatarColor, isGuest: false })
      } else {
        const match = accounts.find(a => a.email === email && a.password === password)
        if (!match) {
          // For demo: if no account exists yet, sign them in anyway (magic demo sign-in)
          const demoUser = accounts.find(a => a.email === email)
          if (demoUser) {
            setErrors({ password: 'Incorrect password' })
            setLoading(false)
            return
          }
          onLogin({ name: email.split('@')[0], email, avatarColor: pickColor(email), isGuest: false })
        } else {
          onLogin({ name: match.name, email: match.email, avatarColor: match.avatarColor, isGuest: false })
        }
      }
      setLoading(false)
    }, 600)
  }

  function continueAsGuest() {
    onLogin({ name: 'Guest', email: '', avatarColor: '#9B8070', isGuest: true })
  }

  const formSlide = {
    enter:  { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit:   { opacity: 0, x: -20 },
  }

  return (
    <div className="login-page">
      {/* — LEFT PANEL (branding) — */}
      <div className="login-brand-panel">
        <motion.div
          className="login-brand-inner"
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="login-logo-lockup">
            <span className="login-logo">Verda</span>
            <span className="login-logo-leaf">🌿</span>
          </div>
          <p className="login-brand-tagline">Your footprint, on a budget.</p>

          <div className="login-features">
            {[
              ['📊', 'Track your weekly carbon budget like a spending account'],
              ['🌳', 'Watch your personal forest grow as you cut emissions'],
              ['✨', 'Get AI-powered tips tailored to your actual habits'],
              ['🎯', 'Complete challenges and earn achievements'],
            ].map(([icon, text], i) => (
              <motion.div
                key={i}
                className="login-feature"
                initial={reduced ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="login-feature-icon">{icon}</span>
                <span className="login-feature-text">{text}</span>
              </motion.div>
            ))}
          </div>

          {/* Mini forest */}
          <div className="login-forest">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.span
                key={i}
                style={{ fontSize: '1.8rem' }}
                initial={reduced ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05, type: 'spring', stiffness: 260 }}
              >
                🌳
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* — RIGHT PANEL (form) — */}
      <div className="login-form-panel">
        <motion.div
          className="login-form-inner"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo (hidden on desktop) */}
          <div className="login-mobile-logo">
            <span className="header-logo">Verda 🌿</span>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--c-text-3)', fontStyle: 'italic', marginTop: 4 }}>
              Your footprint, on a budget.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="login-tabs">
            <button
              className={`login-tab${mode === 'signin' ? ' active' : ''}`}
              onClick={() => { setMode('signin'); setErrors({}) }}
            >
              Sign in
            </button>
            <button
              className={`login-tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => { setMode('signup'); setErrors({}) }}
            >
              Create account
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              variants={reduced ? {} : formSlide}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="login-form"
              noValidate
            >
              <h2 className="login-form-title">
                {mode === 'signin' ? 'Welcome back' : 'Start your journey'}
              </h2>

              {mode === 'signup' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="login-name">Your name</label>
                  <input
                    id="login-name"
                    type="text"
                    className={`form-input${errors.name ? ' input-error' : ''}`}
                    placeholder="Alex Green"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  className={`form-input${errors.email ? ' input-error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className={`form-input${errors.password ? ' input-error' : ''}`}
                  placeholder="6+ characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: 'var(--sp-2)', padding: 'var(--sp-4)' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>⟳</motion.span>
                    {mode === 'signup' ? 'Creating account…' : 'Signing in…'}
                  </span>
                ) : mode === 'signup' ? 'Create my account →' : 'Sign in →'}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button className="btn btn-ghost btn-full" onClick={continueAsGuest} style={{ color: 'var(--c-text-3)' }}>
            Continue as Guest
          </button>

          <p style={{ marginTop: 'var(--sp-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
            Your data stays on your device — we never store it on servers.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
