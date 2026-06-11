import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')

const shot = async (name) => {
  await page.waitForTimeout(600)
  await page.screenshot({ path: `previews/m2-${name}.png`, fullPage: false })
  console.log(`✓ m2-${name}.png`)
}

// Login
await shot('01-login')

// Guest login
await page.click('button:has-text("Continue as Guest")')
await page.waitForTimeout(1000)
await shot('02-home')

// This Week (use mobile nav)
await page.locator('.bottom-nav-mobile button:has-text("This Week")').click()
await shot('03-thisweek')

// Log — stacked animations need extra time (page exit + enter + step slide = ~650ms)
await page.locator('.bottom-nav-mobile button:has-text("Log")').click()
await page.waitForTimeout(900)
await page.screenshot({ path: 'previews/m2-04-log.png', fullPage: false })
console.log('✓ m2-04-log.png (extended wait)')

// Challenges
await page.locator('.bottom-nav-mobile button:has-text("Challenges")').click()
await shot('05-challenges')

// Open More sheet
await page.locator('.bottom-nav-mobile button:has-text("More")').click()
await shot('06-more-sheet')

// Profile from More sheet
await page.click('.more-sheet-btn:has-text("Profile")')
await shot('07-profile')

// Settings — More button is last nav-btn regardless of label
await page.locator('.bottom-nav-mobile .nav-btn').last().click()
await page.waitForTimeout(400)
await page.click('.more-sheet-btn:has-text("Settings")')
await shot('08-settings')

// Dark mode on mobile
await page.click('[aria-label="Switch to dark mode"]')
await page.waitForTimeout(400)
await shot('09-dark-settings')

// Home in dark
await page.locator('.bottom-nav-mobile button:has-text("Home")').click()
await shot('10-dark-home')

await browser.close()
console.log('\nAll screenshots saved.')
