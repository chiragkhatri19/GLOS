import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import type { ScreenshotResult } from './types'

export interface CaptureOptions {
  url: string
  routes?: string[]
  outputDir?: string
  waitFor?: number
}

export async function captureApp(options: CaptureOptions): Promise<ScreenshotResult[]> {
  const { url, outputDir = '.glos/screenshots', waitFor = 1500 } = options
  const routes = options.routes ?? await autoDiscoverRoutes(url)
  fs.mkdirSync(outputDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const results: ScreenshotResult[] = []

  for (const route of routes) {
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
      const fullUrl = `${url.replace(/\/$/, '')}${route}`
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(waitFor)
      const filename = route.replace(/\//g, '_').replace(/^_/, '') || 'home'
      const screenshotPath = path.join(outputDir, `${filename}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: false })
      await page.close()
      results.push({ route, screenshotPath, timestamp: new Date().toISOString() })
      console.log(`  ✓ Captured ${route}`)
    } catch (err: any) {
      console.warn(`  ⚠ Skipped ${route}: ${err.message}`)
    }
  }

  await browser.close()
  return results
}

async function autoDiscoverRoutes(url: string): Promise<string[]> {
  try {
    const res = await fetch(`${url}/sitemap.xml`)
    if (res.ok) {
      const text = await res.text()
      const matches = text.match(/<loc>(.*?)<\/loc>/g) ?? []
      const routes = matches
        .map(m => m.replace(/<\/?loc>/g, '').replace(url, ''))
        .filter(r => r.startsWith('/'))
        .slice(0, 15)
      if (routes.length > 0) return routes
    }
  } catch {}
  return ['/', '/dashboard', '/settings', '/pricing', '/checkout', '/account']
}
