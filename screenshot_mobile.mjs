import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')

const shot = async (name) => {
  await page.waitForTimeout(500)
  await page.screenshot({ path: `previews/mob-${name}.png`, fullPage: false })
  console.log(`✓ mob-${name}.png`)
}

// Login
await shot('01-login')

// Sign in as guest
await page.click('button:has-text("Continue as Guest")')
await page.waitForTimeout(1000)
await shot('02-home')

// Scroll home
await page.evaluate(() => window.scrollTo(0, 400))
await page.waitForTimeout(400)
await shot('03-home-scroll')

// This Week
await page.evaluate(() => window.scrollTo(0, 0))
await page.click('button:has-text("This Week")')
await shot('04-thisweek')

// Log
await page.click('button:has-text("Log")')
await shot('05-log')

// Challenges
await page.click('button:has-text("Challenges")')
await shot('06-challenges')

// Profile
await page.click('button:has-text("Profile")')
await shot('07-profile')

// Settings
await page.click('button:has-text("Settings")')
await shot('08-settings')

// User menu dropdown
await page.click('[aria-label="User menu"]')
await page.waitForTimeout(400)
await shot('09-dropdown')

await browser.close()
console.log('\nAll mobile screenshots saved.')
