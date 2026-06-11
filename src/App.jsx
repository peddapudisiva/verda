import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useLocalStorage } from './hooks/useLocalStorage.js'
import { CHALLENGES } from './utils/challenges.js'
import { BADGE_DEFINITIONS } from './utils/badges.js'
import { buildSampleActivities, buildSampleHistory } from './utils/sampleData.js'

import LoginPage         from './components/LoginPage.jsx'
import Header            from './components/Header.jsx'
import OverviewDashboard from './components/OverviewDashboard.jsx'
import Dashboard         from './components/Dashboard.jsx'
import LogActivity       from './components/LogActivity.jsx'
import Challenges        from './components/Challenges.jsx'
import AIInsights        from './components/AIInsights.jsx'
import WhatIf            from './components/WhatIf.jsx'
import Comparison        from './components/Comparison.jsx'
import GoalTrend         from './components/GoalTrend.jsx'
import Badges            from './components/Badges.jsx'
import ShareCard         from './components/ShareCard.jsx'
import ProfilePage       from './components/ProfilePage.jsx'
import SettingsPage      from './components/SettingsPage.jsx'

const DEFAULT_GOAL = 38

// Primary = always visible in mobile bottom bar (max 4 + More button)
const PRIMARY_NAV = [
  { id: 'home',       label: 'Home',       icon: '🏠' },
  { id: 'dashboard',  label: 'This Week',  icon: '🌿' },
  { id: 'log',        label: 'Log',        icon: '➕' },
  { id: 'challenges', label: 'Challenges', icon: '🎯' },
]

// Secondary = shown in "More" sheet on mobile, all visible on desktop
const MORE_NAV = [
  { id: 'coach',      label: 'AI Coach',   icon: '✨' },
  { id: 'simulator',  label: 'Simulator',  icon: '🎛️' },
  { id: 'progress',   label: 'Progress',   icon: '📈' },
  { id: 'share',      label: 'Share',      icon: '📤' },
  { id: 'profile',    label: 'Profile',    icon: '👤' },
  { id: 'settings',   label: 'Settings',   icon: '⚙️' },
]

const NAV = [...PRIMARY_NAV, ...MORE_NAV]

const pageVariants = {
  enter:  { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -8 },
}

export default function App() {
  const [page, setPage]     = useState('home')
  const [moreOpen, setMoreOpen] = useState(false)

  // Reset scroll to top on every page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  // — Theme —
  const [theme, setTheme] = useLocalStorage('verda_theme', 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  function handleToggleTheme() { setTheme(t => t === 'light' ? 'dark' : 'light') }

  // — Auth —
  const [user, setUser] = useLocalStorage('verda_user', null)

  // — Persisted app state —
  const [activities,     setActivities]     = useLocalStorage('verda_activities', [])
  const [completedIds,   setCompletedIds]   = useLocalStorage('verda_challenges', [])
  const [goal,           setGoal]           = useLocalStorage('verda_goal', DEFAULT_GOAL)
  const [weeklyHistory,  setWeeklyHistory]  = useLocalStorage('verda_history', [])
  const [unlockedBadges, setUnlockedBadges] = useLocalStorage('verda_badges', [])
  const [streak,         setStreak]         = useLocalStorage('verda_streak', { count: 0, lastLogDate: null })
  const [seeded,         setSeeded]         = useLocalStorage('verda_seeded', false)

  // — Seed sample data on first visit —
  useEffect(() => {
    if (!seeded) {
      setActivities(buildSampleActivities())
      setWeeklyHistory(buildSampleHistory(goal))
      setSeeded(true)
    }
  }, []) // eslint-disable-line

  // — Listen for nav events from sub-components —
  useEffect(() => {
    const handler = (e) => setPage(e.detail)
    window.addEventListener('verda:nav', handler)
    return () => window.removeEventListener('verda:nav', handler)
  }, [])

  // — Derived values —
  const totalEmissions   = activities.reduce((s, a) => s + a.kg, 0)
  const challengeSavings = CHALLENGES
    .filter(c => completedIds.includes(c.id))
    .reduce((s, c) => s + c.savings, 0)
  const netTotal = Math.max(0, totalEmissions - challengeSavings)

  // — Streak —
  const updateStreak = useCallback(() => {
    const today = new Date().toDateString()
    setStreak(prev => {
      if (prev.lastLogDate === today) return prev
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const isConsecutive = prev.lastLogDate === yesterday.toDateString()
      return { count: isConsecutive ? prev.count + 1 : 1, lastLogDate: today }
    })
  }, [setStreak])

  // — Badge checking —
  useEffect(() => {
    const vegMealCount = activities
      .filter(a => a.category === 'food' && ['vegetarian', 'vegan'].includes(a.activity))
      .reduce((s, a) => s + a.quantity, 0)
    const weekNoFlight = !activities.some(a => a.activity === 'flight' && a.kg > 0)
    const data = {
      netTotal, goal,
      streakCount:         streak.count,
      vegMealCount,
      weekNoFlight,
      challengesCompleted: completedIds.length,
      activitiesLogged:    activities.length,
    }
    BADGE_DEFINITIONS.forEach(def => {
      if (!unlockedBadges.find(b => b.id === def.id) && def.condition(data)) {
        setUnlockedBadges(prev => [...prev, { id: def.id, unlockedAt: new Date().toISOString() }])
      }
    })
  }, [netTotal, goal, streak.count, activities, completedIds, unlockedBadges]) // eslint-disable-line

  // — Handlers —
  function handleAddActivity(activity) {
    setActivities(prev => [...prev, activity])
    updateStreak()
  }

  function handleDeleteActivity(id) {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  function handleToggleChallenge(id) {
    setCompletedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function handleLogWeek() {
    setWeeklyHistory(prev => [...prev, { week: new Date().toISOString(), total: netTotal, goal }])
    setActivities([])
    setCompletedIds([])
    setPage('home')
  }

  function handleLogin(userData) {
    setUser(userData)
    setPage('home')
  }

  function handleLogout() {
    setUser(null)
    setPage('home')
  }

  function handleUpdateUser(updated) {
    setUser(updated)
  }

  function handleClearData() {
    setActivities([])
    setCompletedIds([])
    setWeeklyHistory([])
    setUnlockedBadges([])
    setStreak({ count: 0, lastLogDate: null })
    setSeeded(true)   // stay true so refresh doesn't re-seed sample data
    setPage('home')
  }

  // — Show login if not authenticated —
  if (!user) {
    return (
      <AnimatePresence>
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginPage onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="verda-app">
      <Header streak={streak.count} user={user} onLogout={handleLogout} theme={theme} onToggleTheme={handleToggleTheme} />

      {/* ── Desktop nav: all items in a single scrollable row ── */}
      <nav className="bottom-nav bottom-nav-desktop" aria-label="Main navigation">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-btn${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
            aria-current={page === item.id ? 'page' : undefined}
          >
            <span className="nav-btn-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Mobile nav: 4 primary items + More button ── */}
      <nav className="bottom-nav bottom-nav-mobile" aria-label="Main navigation">
        {PRIMARY_NAV.map(item => (
          <button
            key={item.id}
            className={`nav-btn${page === item.id ? ' active' : ''}`}
            onClick={() => setPage(item.id)}
            aria-current={page === item.id ? 'page' : undefined}
          >
            <span className="nav-btn-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <button
          className={`nav-btn${MORE_NAV.some(n => n.id === page) ? ' active' : ''}`}
          onClick={() => setMoreOpen(o => !o)}
          aria-expanded={moreOpen}
        >
          <span className="nav-btn-icon" aria-hidden="true">
            {MORE_NAV.some(n => n.id === page)
              ? MORE_NAV.find(n => n.id === page).icon
              : '⋯'}
          </span>
          <span>{MORE_NAV.some(n => n.id === page) ? MORE_NAV.find(n => n.id === page).label : 'More'}</span>
        </button>
      </nav>

      {/* ── More sheet (mobile) ── */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="more-backdrop"
              className="more-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="more-sheet"
              className="more-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <div className="more-sheet-handle" />
              <p className="more-sheet-title">More</p>
              <div className="more-sheet-grid">
                {MORE_NAV.map(item => (
                  <button
                    key={item.id}
                    className={`more-sheet-btn${page === item.id ? ' active' : ''}`}
                    onClick={() => { setPage(item.id); setMoreOpen(false) }}
                  >
                    <span className="more-sheet-btn-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="page-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {page === 'home' && (
              <OverviewDashboard
                user={user}
                netTotal={netTotal}
                goal={goal}
                streak={streak.count}
                completedIds={completedIds}
                activities={activities}
                unlockedBadges={unlockedBadges}
                onNavigate={setPage}
              />
            )}

            {page === 'dashboard' && (
              <Dashboard
                activities={activities}
                completedIds={completedIds}
                goal={goal}
                netTotal={netTotal}
                totalEmissions={totalEmissions}
                challengeSavings={challengeSavings}
                onDelete={handleDeleteActivity}
                streak={streak.count}
              />
            )}

            {page === 'log' && (
              <LogActivity onAddActivity={handleAddActivity} />
            )}

            {page === 'challenges' && (
              <Challenges
                completedIds={completedIds}
                onToggle={handleToggleChallenge}
              />
            )}

            {page === 'coach' && (
              <AIInsights
                activities={activities}
                completedIds={completedIds}
                netTotal={netTotal}
                goal={goal}
              />
            )}

            {page === 'simulator' && (
              <WhatIf
                activities={activities}
                goal={goal}
                netTotal={netTotal}
              />
            )}

            {page === 'progress' && (
              <div className="stack stack-6">
                <div className="section-header">
                  <h1 className="section-title">Progress</h1>
                  <p className="section-sub">Trends, goals &amp; achievements</p>
                </div>
                <div className="card">
                  <Comparison netTotal={netTotal} />
                </div>
                <GoalTrend
                  goal={goal}
                  onSetGoal={setGoal}
                  weeklyHistory={weeklyHistory}
                  netTotal={netTotal}
                  onLogWeek={handleLogWeek}
                />
                <div className="card">
                  <Badges unlockedBadges={unlockedBadges} />
                </div>
              </div>
            )}

            {page === 'share' && (
              <ShareCard
                netTotal={netTotal}
                goal={goal}
                weeklyHistory={weeklyHistory}
              />
            )}

            {page === 'profile' && (
              <ProfilePage
                user={user}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                activities={activities}
                weeklyHistory={weeklyHistory}
              />
            )}

            {page === 'settings' && (
              <SettingsPage
                goal={goal}
                onSetGoal={setGoal}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onClearData={handleClearData}
                activities={activities}
                weeklyHistory={weeklyHistory}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
