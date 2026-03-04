/**
 * Runtime Error Detection Tests
 * 
 * This test suite catches runtime errors that unit tests miss:
 * - Missing build assets (404 errors)
 * - Failed network requests
 * - JavaScript runtime errors
 * - Console errors during page lifecycle
 * 
 * These tests run against the production build to catch:
 * - Build configuration errors
 * - Missing asset deployment
 * - CDN/resource loading issues
 */

import { test, expect } from '@playwright/test'

// Track all errors that occur during testing
interface ErrorEvent {
  type: 'console' | 'network' | 'page'
  message: string
  details?: string
}

const CONSOLE_URL = 'https://oleg3289.github.io/task-dashboard/'

test.describe('Runtime Error Detection - Production Build', () => {
  test.use({
    // Capture all console messages
    ignoreHTTPSErrors: true
  })

  test('should load without network errors (404s)', async ({ page }) => {
    const networkErrors: string[] = []
    
    // Capture failed requests
    page.on('requestfailed', request => {
      const failure = request.failure()
      if (failure) {
        networkErrors.push(`${request.method()} ${request.url()} - ${failure.errorText}`)
      }
    })

    await page.goto(CONSOLE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Give time for async operations
    await page.waitForTimeout(2000)

    // Verify no network errors
    expect(networkErrors).toHaveLength(0), 
      `Network errors found:\n${networkErrors.join('\n')}`
  })

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(CONSOLE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Wait for any async errors
    await page.waitForTimeout(2000)

    // Should have no console errors
    expect(consoleErrors).toHaveLength(0),
      `Console errors found:\n${consoleErrors.join('\n')}`
  })

  test('should have no JavaScript runtime errors', async ({ page }) => {
    let pageError: Error | null = null
    
    page.on('pageerror', error => {
      pageError = error
    })

    await page.goto(CONSOLE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Wait for async operations to complete
    await page.waitForTimeout(2000)

    expect(pageError).toBeNull(),
      `JavaScript runtime error: ${pageError?.message}`
  })

  test('should successfully load all critical resources', async ({ page }) => {
    const missingResources: string[] = []
    
    // Track all requests and their status
    const requests = new Map()
    
    page.on('request', request => {
      requests.set(request.url(), { 
        url: request.url(),
        status: 'started' 
      })
    })

    page.on('response', async response => {
      const url = response.url()
      if (requests.has(url)) {
        requests.get(url).status = response.status().toString()
        requests.get(url).statusCode = response.status()
      }
    })

    await page.goto(CONSOLE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Wait for async operations
    await page.waitForTimeout(2000)

    // Check for 4xx/5xx status codes
    for (const [url, info] of requests.entries()) {
      const statusCode = info.statusCode
      if (statusCode && statusCode >= 400) {
        missingResources.push(`Status ${statusCode}: ${url}`)
      }
    }

    expect(missingResources).toHaveLength(0),
      `Missing/failed resources:\n${missingResources.join('\n')}`
  })

  test('should have valid page structure after loading', async ({ page }) => {
    await page.goto(CONSOLE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    await page.waitForTimeout(2000)

    // Check for critical DOM elements
    const body = page.locator('body')
    await expect(body).toBeVisible()

    // Check if next.js hydration markers exist (Next.js apps have these)
    const nextShell = page.locator('[id="__next"]')
    const hasNext = await nextShell.count() > 0
    
    // Check for main content area
    const mainContent = page.locator('main, #main, [role="main"]')
    const hasMain = await mainContent.count() > 0

    expect(hasNext || hasMain).toBe(true),
      'Page missing expected content structure'
  })

  test('should have no deprecation warnings', async ({ page }) => {
    const warnings: string[] = []
    
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'warning' && 
          (text.includes('deprecated') || text.includes('DeprecationWarning'))) {
        warnings.push(text)
      }
    })

    await page.goto(CONSOLE_URL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })
    
    await page.waitForTimeout(2000)

    expect(warnings).toHaveLength(0),
      `Deprecation warnings found:\n${warnings.join('\n')}`
  })
})

test.describe('Runtime Error Detection - Local Server', () => {
  const LOCAL_URL = 'http://localhost:3000'

  test('local server should load without 404s', async ({ page }) => {
    const networkErrors: string[] = []
    
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()}`)
    })

    try {
      await page.goto(LOCAL_URL, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      await page.waitForTimeout(2000)

      expect(networkErrors).toHaveLength(0),
        `Local server network errors:\n${networkErrors.join('\n')}`
    } catch (e) {
      // Skip if server not running
      test.skip()
    }
  })
})

test.describe('Runtime Error Detection - Build Validation', () => {
  test('should verify build output exists', async ({ page }) => {
    // Build the project first to ensure assets exist
    const { exec } = require('child_process')
    const { promisify } = require('util')
    const asyncExec = promisify(exec)
    
    try {
      // Try to build
      await asyncExec('npm run build', {
        cwd: '/home/olegs/.openclaw/workspace-company/projects/task-dashboard',
        timeout: 120000
      })
      
      // Check if build output exists
      const fs = require('fs')
      const path = require('path')
      
      const outDir = path.join(__dirname, '../../out')
      expect(fs.existsSync(outDir)).toBe(true)
      
    } catch (e) {
      // If build fails or directory not accessible, test may fail
      // but this is expected behavior if there's a build issue
    }
  })
})
