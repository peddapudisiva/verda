import { chromium } from 'playwright'
import { join } from 'path'

const OUT = 'C:/Users/user/VERDA 1/verda/previews'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

// Helper
async function shot(name) {
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`✓ ${name}.png`)
}

// ── 1. Login page ──────────────────────────────────────────────
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')
await shot('01-login')

// ── 2. Sign up ─────────────────────────────────────────────────
// Switch to Create Account tab
await page.click('button:has-text("Create account")')
await page.waitForTimeout(300)
await page.fill('#login-name', 'Alex Green')
await page.fill('#login-email', 'alex@verda.app')
await page.fill('#login-password', 'green123')
await shot('02-signup-filled')

// Submit
await page.click('button[type="submit"]')
await page.waitForTimeout(1200)
await shot('03-home-dashboard')

// ── 3. This Week ───────────────────────────────────────────────
await page.click('button:has-text("This Week")')
await page.waitForTimeout(600)
await shot('04-this-week')

// ── 4. Challenges ──────────────────────────────────────────────
await page.click('button:has-text("Challenges")')
await page.waitForTimeout(600)
await shot('05-challenges')

// ── 5. AI Coach ────────────────────────────────────────────────
await page.click('button:has-text("AI Coach")')
await page.waitForTimeout(600)
await shot('06-ai-coach')

// ── 6. Progress ────────────────────────────────────────────────
await page.click('button:has-text("Progress")')
await page.waitForTimeout(700)
await shot('07-progress')

// ── 7. Mobile view – login ─────────────────────────────────────
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://localhost:5173')
// Clear auth so login shows again
await page.evaluate(() => localStorage.removeItem('verda_user'))
await page.reload()
await page.waitForLoadState('networkidle')
await shot('08-mobile-login')

// Sign back in
await page.click('button:has-text("Continue as Guest")')
await page.waitForTimeout(800)
await shot('09-mobile-home')

await browser.close()
console.log('\nAll screenshots saved to previews/')
