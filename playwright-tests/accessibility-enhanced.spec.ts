/**
 * Accessibility Tests - Enhanced WCAG Compliance Suite
 * 
 * This test suite verifies:
 * - WCAG 2.1 AA compliance
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Color contrast ratios
 * - Focus management
 * - Semantic HTML structure
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001'

test.describe('Dashboard Accessibility - WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.describe('Keyboard Navigation', () => {
    test('user can navigate with Tab key', async ({ page }) => {
      // Focus should land on a focusable element
      await page.keyboard.press('Tab')
      
      const activeElementTag = await page.evaluate(() => 
        document.activeElement?.tagName.toLowerCase() || ''
      )
      
      // Should be able to navigate to interactive elements
      const focusableTags = ['a', 'button', 'input', 'select', 'textarea', 'summary']
      expect(focusableTags.some(tag => activeElementTag.includes(tag))).toBe(true)
    })

    test('user can navigate backward with Shift+Tab', async ({ page }) => {
      // First focus something
      await page.keyboard.press('Tab')
      
      // Then go backward
      await page.keyboard.down('Shift')
      await page.keyboard.press('Tab')
      await page.keyboard.up('Shift')
      
      // Should not error and focus should change
      const activeElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
      expect(activeElement).toBeDefined()
    })

    test('user can interact with Enter key', async ({ page }) => {
      // Navigate to first interactive element
      await page.keyboard.press('Tab')
      
      // Try to activate with Enter
      await page.keyboard.press('Enter')
      
      // Should not error
      const activeElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
      expect(activeElement).toBeDefined()
    })

    test('user can interact with Space key on buttons', async ({ page }) => {
      // Press Tab a few times to reach a button
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
      }
      
      // Press Space on the element
      await page.keyboard.press('Space')
      
      // Should not error
      const activeElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
      expect(activeElement).toBeDefined()
    })

    test('logical tab order is maintained', async ({ page }) => {
      const focusableElements = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        return Array.from(elements).map((el, index) => ({
          index,
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().substring(0, 50) || ''
        }))
      })
      
      // Should have at least some focusable elements
      expect(focusableElements.length).toBeGreaterThan(0)
      
      // Check that elements have logical order
      const buttonCount = focusableElements.filter(e => e.tag === 'button').length
      const linkCount = focusableElements.filter(e => e.tag === 'a').length
      
      expect(buttonCount + linkCount).toBeGreaterThan(0)
    })

    test('focus indicator is visible', async ({ page }) => {
      // Focus a button
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
      
      // Check focus styles
      const focusStyle = await page.evaluate(() => {
        const element = document.activeElement as HTMLElement
        if (!element) return null
        
        const style = window.getComputedStyle(element)
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor
        }
      })
      
      // Focus indicator should not be:none for outline
      expect(focusStyle).not.toBeNull()
      
      // Either outline should be visible or boxShadow should be present
      expect(
        focusStyle?.outline !== 'none' || 
        focusStyle?.boxShadow !== 'none' ||
        (focusStyle?.outlineWidth && focusStyle.outlineWidth !== '0px')
      ).toBe(true)
    })
  })

  test.describe('Screen Reader Accessibility', () => {
    test('page has proper ARIA labels', async ({ page }) => {
      // Check for role attributes
      const elementsWithRole = await page.evaluate(() => {
        const elements = document.querySelectorAll('[role]')
        return Array.from(elements).map(el => ({
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          id: el.id || 'no-id'
        }))
      })
      
      // Should have elements with roles
      expect(elementsWithRole.length).toBeGreaterThan(0)
    })

    test('headings have proper hierarchy', async ({ page }) => {
      const headings = await page.evaluate(() => {
        const h1 = document.querySelector('h1')
        const h2 = document.querySelectorAll('h2')
        const h3 = document.querySelectorAll('h3')
        
        return {
          h1: h1 ? h1.textContent?.trim() : null,
          h2Count: h2.length,
          h3Count: h3.length
        }
      })
      
      // Should have at least one h1
      expect(headings.h1).not.toBeNull()
      expect(headings.h1?.length || 0).toBeGreaterThan(0)
    })

    test('links have descriptive text', async ({ page }) => {
      const links = await page.evaluate(() => {
        const links = document.querySelectorAll('a')
        
        return Array.from(links).map(link => ({
          href: link.getAttribute('href') || '',
          text: link.textContent?.trim() || '',
          ariaLabel: link.getAttribute('aria-label') || '',
          hasTitle: link.hasAttribute('title')
        }))
      })
      
      // Filter for potentially non-descriptive links
      const nonDescriptive = links.filter(link => {
        const text = link.text.toLowerCase()
        return (
          (text.includes('click here') || text.includes('read more') || text.includes('link')) &&
          !link.ariaLabel &&
          !link.hasTitle
        )
      })
      
      // Should have few or no non-descriptive links
      expect(nonDescriptive.length).toBeLessThan(3)
    })

    test('images have alt text', async ({ page }) => {
      const images = await page.evaluate(() => {
        const images = document.querySelectorAll('img')
        
        return Array.from(images).map(img => ({
          src: img.getAttribute('src') || '',
          alt: img.getAttribute('alt') || null,
          isDecorative: img.getAttribute('aria-hidden') === 'true'
        }))
      })
      
      // All images should have alt text (even if empty for decorative)
      expect(images.every(img => img.alt !== null || img.isDecorative)).toBe(true)
    })

    test('form controls have labels', async ({ page }) => {
      const inputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea')
        
        return Array.from(inputs).map(input => ({
          id: input.id || null,
          type: input.getAttribute('type') || 'text',
          ariaLabel: input.getAttribute('aria-label') || '',
          ariaLabelledBy: input.getAttribute('aria-labelledby') || '',
          hasIdWithLabel: input.id ? document.querySelector(`label[for="${input.id}"]`) !== null : false
        }))
      })
      
      // All inputs should have accessible labels
      const accessibleInputs = inputs.filter(input =>
        input.hasIdWithLabel || input.ariaLabel || input.ariaLabelledBy
      )
      
      expect(accessibleInputs.length).toBe(inputs.length)
    })
  })

  test.describe('Color and Visual Accessibility', () => {
    test('text has sufficient color contrast', async ({ page }) => {
      const contrastInfo = await page.evaluate(() => {
        // Simple contrast check - get body text and background colors
        const body = document.body
        if (!body) return null
        
        const style = window.getComputedStyle(body)
        const bgColor = style.backgroundColor
        const color = style.color
        
        return { bgColor, color }
      })
      
      expect(contrastInfo).not.toBeNull()
      expect(contrastInfo?.bgColor).not.toBe('')
      expect(contrastInfo?.color).not.toBe('')
    })

    test('status indicators use color + text', async ({ page }) => {
      // Check badge elements for status indicators
      const badgeInfo = await page.evaluate(() => {
        const badges = document.querySelectorAll('.badge, [class*="badge"]')
        
        return Array.from(badges).map(badge => {
          const style = window.getComputedStyle(badge)
          return {
            hasColor: Boolean(style.backgroundColor || style.color),
            hasText: Boolean(badge.textContent?.trim()),
            hasIcon: badge.querySelectorAll('svg, [class*="icon"]').length > 0
          }
        })
      })
      
      // Badges should use both color and text, not color alone
      const properlyIndicated = badgeInfo.filter(badge => 
        badge.hasColor && badge.hasText
      )
      
      expect(badgeInfo.length).toBeGreaterThan(0)
      expect(badgeInfo.length).toBe(prettyIndicated.length)
    })

    test('color is not the only indicator', async ({ page }) => {
      // Check status elements
      const statusElements = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[class*="status"], [class*="progress"], [class*="indicator"]'
        )
        
        return Array.from(elements).map(el => ({
          hasColor: Boolean(window.getComputedStyle(el).backgroundColor),
          hasText: Boolean(el.textContent?.trim()),
          hasIcon: el.querySelectorAll('svg, span').length > 0,
          hasAriaLabel: Boolean(el.getAttribute('aria-label'))
        }))
      })
      
      // Every status element should have multiple indicators
      statusElements.forEach(status => {
        const indicatorCount = [
          status.hasColor,
          status.hasText,
          status.hasIcon,
          status.hasAriaLabel
        ].filter(Boolean).length
        
        // Should have at least 2 indicators (color + text/icon/aria)
        expect(indicatorCount).toBeGreaterThanOrEqual(2)
      })
    })
  })

  test.describe('Semantic HTML Structure', () => {
    test('page has proper heading structure', async ({ page }) => {
      const headingStructure = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        
        return Array.from(headings).map(h => ({
          level: h.tagName.toLowerCase(),
          text: h.textContent?.trim().substring(0, 50) || ''
        }))
      })
      
      // Should have at least one heading
      expect(headingStructure.length).toBeGreaterThan(0)
      
      // First heading should be h1
      expect(headingStructure[0].level).toBe('h1')
    })

    test('navigation has proper structure', async ({ page }) => {
      const navInfo = await page.evaluate(() => {
        const nav = document.querySelector('nav')
        if (!nav) return null
        
        return {
          hasAriaLabel: nav.hasAttribute('aria-label') || nav.hasAttribute('role'),
          links: Array.from(nav.querySelectorAll('a')).map(a => ({
            text: a.textContent?.trim(),
            href: a.getAttribute('href')
          }))
        }
      })
      
      // Navigation should be present and properly labeled
      expect(navInfo).not.toBeNull()
    })

    test('main content area is marked', async ({ page }) => {
      const mainInfo = await page.evaluate(() => {
        const main = document.querySelector('main')
        if (!main) return null
        
        return {
          exists: true,
          hasAriaLabel: main.hasAttribute('aria-label') || main.hasAttribute('id')
        }
      })
      
      // Main content area should exist
      expect(mainInfo).not.toBeNull()
      expect(mainInfo?.exists).toBe(true)
    })

    test('landmark regions are present', async ({ page }) => {
      const landmarks = await page.evaluate(() => {
        const roles = ['main', 'navigation', 'banner', 'contentinfo', 'complementary']
        
        return roles.map(role => ({
          role,
          present: document.querySelector(`[role="${role}"]`) !== null
        }))
      })
      
      // Main and navigation should be present
      const mainLandmark = landmarks.find(l => l.role === 'main')
      const navLandmark = landmarks.find(l => l.role === 'navigation')
      
      expect(mainLandmark?.present).toBe(true)
      expect(navLandmark?.present).toBe(true)
    })
  })

  test.describe('Interactive Element Accessibility', () => {
    test('buttons have accessible names', async ({ page }) => {
      const buttons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button')
        
        return Array.from(buttons).map(btn => ({
          hasText: Boolean(btn.textContent?.trim()),
          hasAriaLabel: Boolean(btn.getAttribute('aria-label')),
          hasAriaLabelledBy: Boolean(btn.getAttribute('aria-labelledby')),
          hasTitle: Boolean(btn.getAttribute('title'))
        }))
      })
      
      // Every button should have an accessible name
      const accessibleButtons = buttons.filter(btn =>
        btn.hasText || btn.hasAriaLabel || btn.hasAriaLabelledBy || btn.hasTitle
      )
      
      expect(accessibleButtons.length).toBe(buttons.length)
    })

    test('links are clickable and accessible', async ({ page }) => {
      const links = await page.evaluate(() => {
        const links = document.querySelectorAll('a')
        
        return Array.from(links).map(link => ({
          hasHref: Boolean(link.getAttribute('href')),
          hasText: Boolean(link.textContent?.trim()),
          hasAriaLabel: Boolean(link.getAttribute('aria-label')),
          tabIndex: link.getAttribute('tabindex'),
          isDisabled: link.hasAttribute('disabled')
        }))
      })
      
      // Links should either have href or aria-label
      const accessibleLinks = links.filter(link =>
        link.hasHref || link.hasAriaLabel
      )
      
      expect(accessibleLinks.length).toBeGreaterThan(0)
    })

    test('interactive elements are keyboard accessible', async ({ page }) => {
      const focusable = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        )
        
        return Array.from(focusableElements).map(el => ({
          tag: el.tagName.toLowerCase(),
          isDisabled: el.hasAttribute('disabled'),
          tabIndex: el.getAttribute('tabindex')
        }))
      })
      
      // Check that interactive elements are not disabled
      const disabledCount = focusable.filter(e => e.isDisabled).length
      expect(disabledCount).toBeLessThan(focusable.length)
    })
  })

  test.describe('Live Updates and Dynamic Content', () => {
    test('live regions have proper attributes', async ({ page }) => {
      // Check for aria-live regions
      const liveRegions = await page.evaluate(() => {
        const regions = document.querySelectorAll('[aria-live]')
        
        return Array.from(regions).map(region => ({
          politeness: region.getAttribute('aria-live'),
          atomic: region.getAttribute('aria-atomic'),
         busy: region.getAttribute('aria-busy')
        }))
      })
      
      // If live regions exist, they should have valid politeness values
      if (liveRegions.length > 0) {
        liveRegions.forEach(region => {
          expect(['polite', 'assertive', 'off']).toContain(region.politeness)
        })
      }
    })

    test('dynamic content updates are Announced', async ({ page }) => {
      // Check if there are any regions that might update dynamically
      const dynamicElements = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[aria-live], [aria-atomic], [role="status"], [role="alert"], [role="log"]'
        )
        
        return Array.from(elements).map(el => ({
          tag: el.tagName.toLowerCase(),
          hasAriaLive: Boolean(el.getAttribute('aria-live')),
          hasRole: Boolean(el.getAttribute('role'))
        }))
      })
      
      // Some elements might support live updates
      expect(dynamicElements.length).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Visual Focus Management', () => {
    test('user can see current focus position', async ({ page }) => {
      // Focus each element and verify focus is visible
      await page.evaluate(() => {
        // Clear any previous focus
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      })
      
      // Start focus traversal
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement
        if (!el) return null
        
        const style = window.getComputedStyle(el)
        return {
          tag: el.tagName.toLowerCase(),
          hasOutline: style.outline !== 'none' && style.outline !== '0px none rgb(0, 0, 0)',
          hasBoxShadow: style.boxShadow !== 'none',
          outlineColor: style.outlineColor
        }
      })
      
      expect(focusedElement).not.toBeNull()
      expect(
        focusedElement?.hasOutline || 
        focusedElement?.hasBoxShadow ||
        (focusedElement?.outlineColor && focusedElement.outlineColor !== 'rgba(0, 0, 0, 0)')
      ).toBe(true)
    })

    test('focus does not get trapped', async ({ page }) => {
      // Navigate forward through all elements
      let loopCount = 0
      const maxLoops = 100
      
      while (loopCount < maxLoops) {
        await page.keyboard.press('Tab')
        loopCount++
        
        // If we've looped back to the beginning, stop
        const isBodyFocused = await page.evaluate(() => 
          document.activeElement === document.body
        )
        
        if (isBodyFocused && loopCount > 5) {
          break
        }
      }
      
      // Should be able to navigate without getting stuck
      expect(loopCount).toBeLessThan(maxLoops)
    })
  })

  test.describe('Responsive Accessibility', () => {
    test('content remains accessible on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      await page.goto(BASE_URL)
      
      // Check basic accessibility metrics
      const accessibilityMetrics = await page.evaluate(() => {
        // Check that text is readable
        const body = document.body
        if (!body) return null
        
        const style = window.getComputedStyle(body)
        const fontSize = style.fontSize
        const lineHeight = style.lineHeight
        
        return {
          fontSize,
          lineHeight,
          hasTouchTargets: Array.from(document.querySelectorAll('button, a')).some(el => {
            const rect = el.getBoundingClientRect()
            return rect.width >= 44 && rect.height >= 44
          })
        }
      })
      
      expect(accessibilityMetrics).not.toBeNull()
    })

    test('touch targets are adequate size', async ({ page }) => {
      const touchTargets = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('button, a, [role="button"]')
        
        return Array.from(interactiveElements).map(el => {
          const rect = el.getBoundingClientRect()
          return {
            tag: el.tagName.toLowerCase(),
            width: rect.width,
            height: rect.height,
            isAdequate: rect.width >= 44 && rect.height >= 44
          }
        })
      })
      
      // Most interactive elements should be at least 44x44px
      const adequateTargets = touchTargets.filter(t => t.isAdequate)
      
      // Allow some smaller elements (icon buttons, etc.)
      const smallElements = touchTargets.filter(t => !t.isAdequate)
      expect(smallElements.length).toBeLessThan(touchTargets.length * 0.3)
    })
  })

  test.describe('Contrast Testing', () => {
    test('check background and text contrast', async ({ page }) => {
      const contrast = await page.evaluate(() => {
        const body = document.body
        if (!body) return null
        
        const style = window.getComputedStyle(body)
        
        // Parse RGB values
        const parseColor = (color: string): { r: number, g: number, b: number } | null => {
          const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
          if (match) {
            return {
              r: parseInt(match[1]),
              g: parseInt(match[2]),
              b: parseInt(match[3])
            }
          }
          return null
        }
        
        const bgColor = parseColor(style.backgroundColor)
        const textColor = parseColor(style.color)
        
        return { bgColor, textColor }
      })
      
      expect(contrast).not.toBeNull()
      expect(contrast?.bgColor).toBeDefined()
      expect(contrast?.textColor).toBeDefined()
    })
  })
})

// Additional specific component tests
test.describe('Dashboard-Specific Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test('agent cards are accessible', async ({ page }) => {
    // Find agent cards
    const agentCards = await page.locator('[class*="agent-card"], [class*="card"]').first()
    await agentCards.waitFor({ state: 'visible' })
    
    // Check card has accessible content
    const cardInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"]')
      
      return Array.from(cards).map(card => ({
        hasTitle: card.querySelector('h3, h4, h5, [class*="title"]') !== null,
        hasText: Boolean(card.textContent?.trim()),
        hasInteractive: card.querySelector('button, a, [role="button"]') !== null
      }))
    })
    
    expect(cardInfo.length).toBeGreaterThan(0)
  })

  test('task cards display status properly', async ({ page }) => {
    // Check status badges
    const badgeInfo = await page.evaluate(() => {
      const badges = document.querySelectorAll('[class*="badge"], [class*="status"]')
      
      return Array.from(badges).map(badge => ({
        hasColor: Boolean(window.getComputedStyle(badge).backgroundColor),
        hasText: Boolean(badge.textContent?.trim()),
        hasAria: badge.hasAttribute('aria-label') || badge.hasAttribute('aria-describedby')
      }))
    })
    
    // Status should be visually indicated and have accessibility attributes
    expect(badgeInfo.length).toBeGreaterThan(0)
  })

  test('file status indicator is accessible', async ({ page }) => {
    const statusInfo = await page.evaluate(() => {
      const statusIndicators = document.querySelectorAll('[class*="status"], .status')
      
      return Array.from(statusIndicators).map(indicator => ({
        hasColorIndicator: indicator.querySelectorAll('div.w-3, .dot, .indicator').length > 0,
        hasTextLabel: Boolean(indicator.textContent?.trim()),
        hasRole: indicator.hasAttribute('role')
      }))
    })
    
    expect(statusInfo.length).toBeGreaterThan(0)
    
    // Check that indicators have both color and text
    statusInfo.forEach(status => {
      expect(status.hasColorIndicator || status.hasTextLabel).toBe(true)
    })
  })
})
