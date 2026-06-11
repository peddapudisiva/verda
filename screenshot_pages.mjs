import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')

// Sign up with a real account
await page.click('button:has-text("Create account")')
await page.waitForTimeout(300)
await page.fill('#login-name', 'Alex Green')
await page.fill('#login-email', 'alex@verda.app')
await page.fill('#login-password', 'green123')
await page.click('button[type="submit"]')
await page.waitForTimeout(1200)

// Profile page
await page.click('button:has-text("Profile")')
await page.waitForTimeout(700)
await page.screenshot({ path: 'previews/page-profile.png', fullPage: false })

// Settings page
await page.click('button:has-text("Settings")')
await page.waitForTimeout(700)
await page.screenshot({ path: 'previews/page-settings.png', fullPage: false })

// Settings dark mode
await page.click('[aria-label="Switch to dark mode"]')
await page.waitForTimeout(400)
await page.screenshot({ path: 'previews/page-settings-dark.png', fullPage: false })

await browser.close()
console.log('Done.')
