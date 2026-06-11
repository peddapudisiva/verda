import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })
await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')

// Sign in as guest
await page.click('button:has-text("Continue as Guest")')
await page.waitForTimeout(1200)

// Open user menu dropdown
await page.click('[aria-label="User menu"]')
await page.waitForTimeout(500)

await page.screenshot({ path: 'previews/dropdown-fixed.png', fullPage: false })
console.log('Screenshot saved: previews/dropdown-fixed.png')

await browser.close()
