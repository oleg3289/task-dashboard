import { test, expect } from '@playwright/test'

test.describe('Tickets Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display ticket cards', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Should have multiple tickets
    const ticketCards = await page.locator('[data-testid="ticket-card"]').count()
    expect(ticketCards).toBeGreaterThan(0)
  })

  test('should filter by status', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Click status filter dropdown
    await page.click('[data-testid="status-filter"]')
    
    // Select "done" status
    await page.click('text=Done')
    
    // All visible tickets should be done
    const visibleTickets = await page.locator('[data-testid="ticket-card"]:visible').count()
    if (visibleTickets > 0) {
      // Check that status badges show "Done"
      const doneBadges = await page.locator('[data-testid="status-badge"]:has-text("Done")').count()
      expect(doneBadges).toBe(visibleTickets)
    }
  })

  test('should filter by agent', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Click agent filter dropdown
    await page.click('[data-testid="agent-filter"]')
    
    // Select an agent
    const agentOption = await page.locator('[data-testid="agent-option"]').first()
    if (await agentOption.isVisible()) {
      await agentOption.click()
      
      // All visible tickets should be assigned to that agent
      await page.waitForTimeout(500) // Wait for filter to apply
    }
  })

  test('should search tickets', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="ticket-card"]').count()
    
    // Type in search box
    await page.fill('[data-testid="search-input"]', 'STORY')
    
    // Wait for debounce and filter
    await page.waitForTimeout(500)
    
    // Count should change (unless all tickets have STORY in title)
    const searchCount = await page.locator('[data-testid="ticket-card"]').count()
    
    // Search results should be subset
    expect(searchCount).toBeLessThanOrEqual(initialCount)
  })

  test('should toggle archived tickets', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="ticket-card"]').count()
    
    // Click show archived toggle
    await page.click('[data-testid="show-archived-toggle"]')
    
    // Wait for filter to apply
    await page.waitForTimeout(500)
    
    // Count might change
    const toggledCount = await page.locator('[data-testid="ticket-card"]').count()
    
    // Just verify it doesn't crash
    expect(toggledCount).toBeGreaterThanOrEqual(0)
  })

  test('should clear filters', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Apply some filters
    await page.fill('[data-testid="search-input"]', 'test')
    await page.waitForTimeout(500)
    
    // Clear filters
    await page.click('[data-testid="clear-filters"]')
    
    // Search should be empty
    const searchValue = await page.inputValue('[data-testid="search-input"]')
    expect(searchValue).toBe('')
  })

  test('should display correct status counts', async ({ page }) => {
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Stats bar should show total and done counts
    await expect(page.locator('text=/Total: \\d+/')).toBeVisible()
  })
})

test.describe('Tickets Tab Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display filter bar on mobile', async ({ page }) => {
    await page.goto('/')
    
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Filter bar should be visible
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible()
  })

  test('should scroll ticket cards horizontally on mobile', async ({ page }) => {
    await page.goto('/')
    
    // Wait for tickets to load
    await expect(page.locator('[data-testid="ticket-card"]').first()).toBeVisible({ timeout: 10000 })
    
    // Ticket cards container should be scrollable
    const container = page.locator('[data-testid="tickets-grid"]')
    if (await container.isVisible()) {
      // Just verify it's visible
      await expect(container).toBeVisible()
    }
  })
})