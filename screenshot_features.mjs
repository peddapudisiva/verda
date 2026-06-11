import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')

// Login as guest
await page.click('button:has-text("Continue as Guest")')
await page.waitForTimeout(1000)

// 1. Home with leaderboard
await page.screenshot({ path: 'previews/feat-home-leaderboard.png', fullPage: false })

// 2. Scroll to leaderboard
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(500)
await page.screenshot({ path: 'previews/feat-leaderboard.png', fullPage: false })

// 3. Log page (voice button)
await page.evaluate(() => window.scrollTo(0, 0))
await page.click('button:has-text("Log")')
await page.waitForTimeout(600)
await page.screenshot({ path: 'previews/feat-voice-logging.png', fullPage: false })

// 4. Dark mode toggle
await page.click('[aria-label="Switch to dark mode"]')
await page.waitForTimeout(400)
await page.screenshot({ path: 'previews/feat-dark-mode.png', fullPage: false })

// 5. Dashboard with forecast (in dark mode)
await page.click('button:has-text("This Week")')
await page.waitForTimeout(600)
await page.screenshot({ path: 'previews/feat-forecast-dark.png', fullPage: false })

// 6. Back to light
await page.click('[aria-label="Switch to light mode"]')
await page.waitForTimeout(400)
await page.screenshot({ path: 'previews/feat-forecast-light.png', fullPage: false })

await browser.close()
console.log('All feature screenshots saved.')
