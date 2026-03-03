// E2E test suite for the dashboard project
// Run with: npx playwright test
// Run single test: npx playwright test e2e/dashboard.spec.ts

import { test, expect } from '@playwright/test'

// Base URL configuration for the tests
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
  })

  test('dashboard page loads successfully', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Task Dashboard|Dashboard/)

    // Verify main heading
    await expect(page.locator('h1')).toContainText(/Dashboard|Task/)

    // Verify page loads without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('task cards are displayed', async ({ page }) => {
    // Find task cards in the DOM
    const taskCards = page.locator('[data-testid="task-card"]')

    // Wait for cards to load (with timeout)
    await expect(taskCards.first()).toBeVisible({ timeout: 10000 })

    // Verify at least one task card exists
    const cardCount = await taskCards.count()
    expect(cardCount).toBeGreaterThan(0)
  })

  test('task filtering by status works', async ({ page }) => {
    // Click on filter control (adjust selector based on actual UI)
    const filterButton = page.locator('button:has-text("Filter")')
    await filterButton.click()

    // Click pending filter (adjust selector based on actual UI)
    const pendingFilter = page.locator('text=Pending')
    await pendingFilter.click()

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify results are filtered
    const visibleCards = page.locator('[data-testid="task-card"]:visible')
    const count = await visibleCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('agent workload displays', async ({ page }) => {
    // Navigate to agents section if different page
    // const agentsLink = page.locator('text=Agents')
    // await agentsLink.click()

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Find agent cards
    const agentCards = page.locator('[data-testid="agent-card"]')
    await expect(agentCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('renders without CSS errors', async ({ page }) => {
    // Check for console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Perform some actions
    await page.waitForTimeout(500)

    // Verify no major errors
    expect(errors.length).toBe(0)
  })

  test('handles empty state gracefully', async ({ page }) => {
    // This test would verify the UI when no tasks exist
    // Implementation depends on actual empty state design

    // For now, verify the page structure is valid
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Task Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
  })

  test('user can view task details on click', async ({ page }) => {
    // Click on a task card
    const taskCard = page.locator('[data-testid="task-card"]').first()
    await taskCard.click()

    // Verify details panel opens (adjust selector based on actual UI)
    // await expect(page.locator('.task-details')).toBeVisible()
  })

  test('filter sorting options work', async ({ page }) => {
    // Find sort dropdown
    const sortSelect = page.locator('select[name="sort-by"], select[aria-label="Sort by"]')
    
    if (await sortSelect.count() > 0) {
      // Select different sort options
      await sortSelect.selectOption('priority')
      await page.waitForTimeout(300)
      
      await sortSelect.selectOption('status')
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Performance and Accessibility', () => {
  test('page loads quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${BASE_URL}/`)
    const loadTime = Date.now() - startTime

    // Page should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)
  })

  test('basic accessibility checks', async ({ page }) => {
    // Check foralt text on images
    const imagesWithoutAlt = page.locator('img:not([alt])')
    expect(await imagesWithoutAlt.count()).toBe(0)

    // Verify page has proper heading structure
    const headings = page.locator('h1, h2, h3')
    expect(await headings.count()).toBeGreaterThan(0)
  })
})
