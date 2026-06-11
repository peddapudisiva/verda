import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

await page.goto('http://localhost:5173')
await page.waitForLoadState('networkidle')

// Sign in as Guest
await page.click('button:has-text("Continue as Guest")')
await page.waitForTimeout(900)

// Click the avatar button to open menu
await page.click('[aria-label="User menu"]')
await page.waitForTimeout(400)
await page.screenshot({ path: 'previews/fixed-dropdown.png' })
console.log('done')

await browser.close()
