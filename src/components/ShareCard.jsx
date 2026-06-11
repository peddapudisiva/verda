import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const CW = 600, CH = 360

function drawCard(canvas, { netTotal, goal, weeklyHistory, userName }) {
  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  canvas.width  = CW * dpr
  canvas.height = CH * dpr
  canvas.style.width  = CW + 'px'
  canvas.style.height = CH + 'px'
  ctx.scale(dpr, dpr)

  // Background
  ctx.fillStyle = '#FAF7F2'
  ctx.fillRect(0, 0, CW, CH)

  // Top accent bar
  const grad = ctx.createLinearGradient(0, 0, CW, 0)
  grad.addColorStop(0, '#C4714A')
  grad.addColorStop(1, '#6B8C5A')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CW, 6)

  // Brand name
  ctx.font = 'bold 36px Georgia, serif'
  ctx.fillStyle = '#C4714A'
  ctx.fillText('Verda', 40, 58)

  // Tagline
  ctx.font = '14px DM Sans, system-ui, sans-serif'
  ctx.fillStyle = '#9B8070'
  ctx.fillText('Your footprint, on a budget.', 40, 80)

  // Divider
  ctx.strokeStyle = '#EAE3D6'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(40, 96); ctx.lineTo(CW - 40, 96); ctx.stroke()

  // Big number
  const pct = goal > 0 ? ((goal - netTotal) / goal * 100) : 0
  const under = netTotal <= goal
  ctx.font = 'bold 72px Georgia, serif'
  ctx.fillStyle = under ? '#4A6741' : '#C0452A'
  ctx.fillText(netTotal.toFixed(1), 40, 188)

  ctx.font = '20px DM Sans, system-ui, sans-serif'
  ctx.fillStyle = '#9B8070'
  ctx.fillText('kg CO₂e this week', 40, 216)

  // Status badge
  const badgeX = 40, badgeY = 234
  const badgeW = 200, badgeH = 36
  ctx.fillStyle = under ? '#D8E8CF' : '#F5D5CC'
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 18)
  ctx.fill()
  ctx.font = 'bold 14px DM Sans, system-ui, sans-serif'
  ctx.fillStyle = under ? '#4A6741' : '#C0452A'
  const statusText = under
    ? `✓ ${Math.abs(pct).toFixed(0)}% under budget`
    : `${Math.abs(pct).toFixed(0)}% over budget`
  ctx.fillText(statusText, badgeX + 14, badgeY + 24)

  // Forest visual
  const trees = goal > 0 ? Math.round(Math.max(0, Math.min(1, 1 - netTotal / goal) * 12)) : 0
  ctx.font = '28px serif'
  for (let i = 0; i < 12; i++) {
    ctx.globalAlpha = i < trees ? 1 : 0.2
    ctx.fillText('🌳', CW - 280 + (i % 6) * 38, i < 6 ? 160 : 210)
  }
  ctx.globalAlpha = 1

  // Share message
  ctx.font = 'italic 16px Georgia, serif'
  ctx.fillStyle = '#6B4F35'
  ctx.fillText(
    `"I cut my footprint ${under ? Math.abs(pct).toFixed(0) + '% under' : 'this week'} with Verda"`,
    40, CH - 48
  )

  // Footer
  ctx.font = '11px DM Sans, system-ui, sans-serif'
  ctx.fillStyle = '#9B8070'
  ctx.fillText('verda.app  ·  ' + new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }), 40, CH - 20)

  // Right side mini-chart if history
  if (weeklyHistory.length >= 2) {
    const chartX = CW - 220, chartY = 110, chartW = 170, chartH = 80
    const maxV = Math.max(...weeklyHistory.map(d => d.total), goal)
    const pts = weeklyHistory.slice(-6).map((d, i, arr) => ({
      x: chartX + (i / (arr.length - 1)) * chartW,
      y: chartY + chartH - (d.total / maxV) * chartH,
    }))
    ctx.strokeStyle = '#C4714A'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.stroke()
    // Goal line
    const gY = chartY + chartH - (goal / maxV) * chartH
    ctx.setLineDash([4, 3])
    ctx.strokeStyle = '#6B8C5A'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(chartX, gY); ctx.lineTo(chartX + chartW, gY); ctx.stroke()
    ctx.setLineDash([])
    ctx.font = '10px DM Sans, system-ui, sans-serif'
    ctx.fillStyle = '#9B8070'
    ctx.fillText('6-week trend', chartX, chartY - 8)
  }
}

export default function ShareCard({ netTotal, goal, weeklyHistory }) {
  const canvasRef = useRef(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    if (canvasRef.current) {
      drawCard(canvasRef.current, { netTotal, goal, weeklyHistory })
    }
  }, [netTotal, goal, weeklyHistory])

  function download() {
    const a = document.createElement('a')
    a.download = 'verda-week.png'
    a.href = canvasRef.current.toDataURL('image/png')
    a.click()
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">Share</h1>
        <p className="section-sub">Download your weekly summary card</p>
      </div>

      <motion.div
        className="share-preview"
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <canvas ref={canvasRef} className="share-canvas" />
      </motion.div>

      <button className="btn btn-primary btn-full" onClick={download}>
        ⬇ Download PNG
      </button>

      <p style={{ marginTop: 'var(--sp-3)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>
        Share to Instagram, WhatsApp, or wherever you inspire others 🌿
      </p>
    </div>
  )
}
