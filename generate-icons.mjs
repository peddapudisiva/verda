import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size })
  const dataUrl = await page.evaluate((s) => {
    const c = document.createElement('canvas')
    c.width = c.height = s
    const ctx = c.getContext('2d')

    const r = s * 0.18  // corner radius
    ctx.beginPath()
    ctx.moveTo(r, 0); ctx.lineTo(s - r, 0)
    ctx.quadraticCurveTo(s, 0, s, r)
    ctx.lineTo(s, s - r); ctx.quadraticCurveTo(s, s, s - r, s)
    ctx.lineTo(r, s);  ctx.quadraticCurveTo(0, s, 0, s - r)
    ctx.lineTo(0, r);  ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()

    // warm earthy gradient background
    const grad = ctx.createLinearGradient(0, 0, s, s)
    grad.addColorStop(0, '#C4714A')
    grad.addColorStop(1, '#A05A39')
    ctx.fillStyle = grad
    ctx.fill()

    // leaf emoji
    ctx.font = `${s * 0.52}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🌿', s / 2, s / 2)

    return c.toDataURL('image/png')
  }, size)

  const base64 = dataUrl.replace('data:image/png;base64,', '')
  writeFileSync(`public/icon-${size}.png`, Buffer.from(base64, 'base64'))
  console.log(`✓ public/icon-${size}.png`)
}

await browser.close()
