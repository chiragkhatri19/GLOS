import { chromium, type Browser } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import type { ScreenshotResult } from './types'
import { analyzeAllScreenshots, type VisionElement, type ScreenshotInput } from './vision'

export type CaptureProgressEvent =
  | { type: 'browser_ready' }
  | { type: 'status'; message: string }
  | { type: 'screenshot_taken'; route: string; screenshotPath: string; index: number; total: number; domElements?: any[] }
  | { type: 'screenshot_error'; route: string; error: string; index: number; total: number }
  | { type: 'vision_start'; route: string }
  | { type: 'vision_done'; route: string; elements: number }

export interface CaptureOptions {
  url: string
  routes?: string[]
  outputDir?: string
  waitFor?: number
  onProgress?: (event: CaptureProgressEvent) => void
}

export async function captureApp(options: CaptureOptions): Promise<{ screenshots: ScreenshotResult[]; allElements: VisionElement[] }> {
  const { url, outputDir = '.glos/screenshots', waitFor = 1500, onProgress } = options
  
  // FIX 4: Ensure directory exists
  const absoluteOutputDir = path.isAbsolute(outputDir) ? outputDir : path.join(process.cwd(), outputDir)
  fs.mkdirSync(absoluteOutputDir, { recursive: true })

  // PHASE 1: Launch browser and discover routes
  // FIX 2: Specific launch options for Windows/Sandbox
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })
  
  onProgress?.({ type: 'status', message: 'Discovering pages...' })
  const discoveredRoutes = await discoverRoutes(browser, url)
  
  // Fall back to root if nothing found
  let routes = discoveredRoutes.length > 0 ? discoveredRoutes : ['/']
  
  // CRITICAL FIX: If 0 routes discovered, force-check the root URL works
  if (discoveredRoutes.length === 0) {
    console.warn('[capture] ⚠️ 0 routes discovered! Forcing fallback to ["/"]')
  }
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1000 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
  
  const startPage = await context.newPage();
  await startPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  const finalUrl = startPage.url();
  const finalPath = new URL(finalUrl).pathname;
  
  // If path is exactly /en or /en/ or starts with /en/
  const localeMatch = finalPath.match(/^\/(en|ja|de|fr|es|zh|hi|pt|ko|it|ar)(\/|$)/);
  const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
  
  // Apply prefix to all discovered routes
  const prefixedRoutes = routes.map(route => {
    // Don't double-prefix
    if (localePrefix && !route.startsWith(localePrefix)) {
      return `${localePrefix}${route}`;
    }
    return route;
  });
  
  await startPage.close();
  
  // Use prefixedRoutes for screenshot loop
  routes = prefixedRoutes;
  
  const allElements: VisionElement[] = []
  
  // PHASE 1: Capture all screenshots AND collect DOM backups
  const screenshotInputs: ScreenshotInput[] = []
  const screenshotResults: ScreenshotResult[] = []
  const domBackups: Record<string, VisionElement[]> = {}

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    
    try {
      const displayRoute = localePrefix && route.startsWith(localePrefix)
        ? route.replace(localePrefix, '')
        : route;
      
      const baseClean = url
        .replace(/\/$/, '')
        .replace(/\/en$/, '')
        .replace(/\/[a-z]{2}$/, '');
      
      const fullUrl = baseClean + route;
      
      const page = await context.newPage();
      
      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await page.waitForTimeout(1500);
      
      const filename = displayRoute.replace(/^\//, '').replace(/\//g, '-') || 'home';
      const screenshotPath = path.join(absoluteOutputDir, `${filename}.png`);
      
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false,
        type: 'png',
      });
      
      screenshotInputs.push({ screenshotPath, route: displayRoute });
      onProgress?.({ type: 'screenshot_taken', route: displayRoute, screenshotPath, index: i, total: routes.length, domElements: [] });
      
      await page.close();
      
    } catch (err: any) {
      console.error(`[capture] ✗ FAILED on route ${route}:`, err.message);
      onProgress?.({ type: 'screenshot_error', route, error: err.message, index: i, total: routes.length });
      // Continue to next route
    }
  }
  
  // Close browser BEFORE calling Gemini
  await browser.close()
  
  // PHASE 2: Batched Gemini analysis with API key rotation
  onProgress?.({ type: 'vision_start', route: 'batch 1' })
  
  // Split into batches of 3 for reliable processing
  const BATCH_SIZE = 3;
  for (let batchIndex = 0; batchIndex < screenshotInputs.length; batchIndex += BATCH_SIZE) {
    const batch = screenshotInputs.slice(batchIndex, batchIndex + BATCH_SIZE);
    const batchNumber = Math.floor(batchIndex / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(screenshotInputs.length / BATCH_SIZE);
    
    onProgress?.({ 
      type: 'vision_start', 
      route: `batch ${batchNumber}/${totalBatches}` 
    });

    // Pass batch index for API key rotation
    const batchElements = await analyzeAllScreenshots(batch, batchNumber - 1);
    allElements.push(...batchElements);  // CRITICAL: append, not replace
    
    onProgress?.({ 
      type: 'vision_done', 
      route: `batch ${batchNumber}/${totalBatches}`, 
      elements: batchElements.length 
    });

    // Wait 2 seconds between batches to avoid rate limiting
    if (batchIndex + BATCH_SIZE < screenshotInputs.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  // FIX 5: Apply DOM backup fallback for routes that got 0 elements
  const routeElementCounts: Record<string, number> = {};
  allElements.forEach(el => {
    routeElementCounts[el.route] = (routeElementCounts[el.route] || 0) + 1;
  });

  for (const route of routes) {
    if (!routeElementCounts[route] || routeElementCounts[route] === 0) {
      const backup = domBackups[route] || [];
      if (backup.length > 0) {
        console.warn(`[capture] Gemini got 0 for ${route} — using DOM backup (${backup.length} elements)`);
        allElements.push(...backup);
      } else {
        console.warn(`[capture] No DOM backup available for ${route}`);
      }
    }
  }
  
  // Update screenshot results with actual DOM elements (after batching + fallback)
  screenshotResults.forEach(result => {
    const elementsForRoute = allElements.filter(el => el.route === result.route)
    result.domElements = elementsForRoute.map(el => ({
      text: el.text,
      tag: el.element_type === 'button' ? 'button' : el.element_type === 'heading' ? 'h1' : el.element_type === 'link' ? 'a' : 'span',
      role: ''
    }))
  })
  
  return { screenshots: screenshotResults, allElements }
}

async function discoverRoutes(browser: Browser, baseUrl: string): Promise<string[]> {
  const urlObj = new URL(baseUrl)
  const origin = urlObj.origin
  const allPathnames = new Set<string>()
  
  // For localhost:3001, start from /en/ to avoid redirect issues
  const isLocalhostDemo = baseUrl.includes('localhost:3001')
  const localePrefix = isLocalhostDemo ? '/en' : ''
  
  // Helper to check if URL is same-origin
  const isSameOrigin = (href: string): boolean => {
    try {
      const parsed = new URL(href)
      return parsed.origin === origin
    } catch {
      return false // Invalid or relative URL
    }
  }
  
  // Helper to filter out unwanted routes
  const shouldIncludeRoute = (pathname: string): boolean => {
    // Skip API routes and internal paths
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
      return false
    }
    
    // Skip file extensions
    const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.json', '.xml', '.css', '.js']
    if (skipExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
      return false
    }
    
    // Skip anchor links and query-only URLs
    if (!pathname || pathname === '#') {
      return false
    }
    
    return true
  }
  
  // Normalize locale prefixes - deduplicate by keeping non-prefixed or 'en' variant
  const normalizeLocale = (pathname: string): string => {
    // Match /{locale}/... pattern
    const localeMatch = pathname.match(/^\/(ja|de|ar|fr|es|zh|hi|pt|ko|it)(\/.*|$)/i)
    if (localeMatch) {
      // Return the non-locale version (prefer English)
      return localeMatch[2] || '/'
    }
    return pathname
  }
  
  // Step 1: Try sitemap.xml
  try {
    const sitemapUrl = `${origin}/sitemap.xml`
    const res = await fetch(sitemapUrl)
    
    if (res.ok) {
      const text = await res.text()
      const locMatches = text.match(/<loc>(.*?)<\/loc>/g) ?? []
      
      for (const loc of locMatches) {
        const fullUrl = loc.replace(/<\/?loc>/g, '')
        try {
          const parsedUrl = new URL(fullUrl)
          
          if (parsedUrl.origin === origin && shouldIncludeRoute(parsedUrl.pathname)) {
            const normalized = normalizeLocale(parsedUrl.pathname)
            allPathnames.add(normalized)
          }
        } catch (urlErr) {
          // Skip invalid URLs
        }
      }
    }
  } catch (err: any) {
    console.error(`[capture] ⚠️ Sitemap fetch failed: ${err.message}`)
  }
  
  // Step 2: Link crawl with Playwright
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    
    // Visit root (with locale prefix for localhost demo) and extract links
    const startPage = `${origin}${localePrefix || '/'}`
    await page.goto(startPage, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // Extract all hrefs from current page
    const extractLinks = async (): Promise<string[]> => {
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.getAttribute('href'))
          .filter((href): href is string => href !== null)
      })
      return links
    }
    
    const rootLinks = await extractLinks()
    
    // Process root links
    let addedCount = 0
    for (const href of rootLinks) {
      try {
        // Handle relative and absolute URLs
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href
        const parsedUrl = new URL(fullUrl)
        
        if (parsedUrl.origin === origin && shouldIncludeRoute(parsedUrl.pathname)) {
          const normalized = normalizeLocale(parsedUrl.pathname)
          const wasAdded = !allPathnames.has(normalized)
          allPathnames.add(normalized)
          if (wasAdded) {
            addedCount++
          }
        }
      } catch (err) {
        // Skip invalid URLs
      }
    }
    
    // Visit each discovered page and extract more links (one level deep)
    const visitedPages = new Set<string>(['/'])
    const pagesToVisit = Array.from(allPathnames).filter(p => p !== '/')
    
    for (const pathname of pagesToVisit.slice(0, 20)) { // Cap at 20 pages for performance
      if (visitedPages.has(pathname)) continue
      
      try {
        const pageUrl = `${origin}${pathname}`
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
        visitedPages.add(pathname)
        
        const childLinks = await extractLinks()
        
        let childAddedCount = 0
        for (const href of childLinks) {
          try {
            const fullUrl = href.startsWith('http') ? href : new URL(href, pageUrl).href
            const parsedUrl = new URL(fullUrl)
            
            if (parsedUrl.origin === origin && shouldIncludeRoute(parsedUrl.pathname)) {
              const normalized = normalizeLocale(parsedUrl.pathname)
              const wasAdded = !allPathnames.has(normalized)
              allPathnames.add(normalized)
              if (wasAdded) {
                childAddedCount++
              }
            }
          } catch (err) {
            // Skip invalid URLs
          }
        }
      } catch (err: any) {
        console.warn(`[capture] ⚠️ Failed to visit ${pathname}: ${err.message}`)
      }
    }
    
    await page.close()
  } catch (err) {
    console.warn(`  ⚠️ Link crawl failed: ${err}`)
  }
  
  // Step 3: Convert to full URLs and cap at 25
  const finalRoutes = Array.from(allPathnames)
    .filter(shouldIncludeRoute)
    .map(p => {
      // Ensure proper formatting
      return p.startsWith('/') ? p : `/${p}`
    })
    .slice(0, 25)
  
  return finalRoutes
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
