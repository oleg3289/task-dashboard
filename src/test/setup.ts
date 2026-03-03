/**
 * Test Setup for Task Dashboard Tests
 * 
 * This file configures the testing environment and provides common utilities
 */

import { vi, beforeEach, afterEach } from 'vitest'

// Mock the window.matchMedia API for responsiveness tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock ResizeObserver for components that use it
if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
}

// Mock fetch API for API tests
;(global as any).fetch = vi.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Headers()
  })
)

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock localStorage for state management tests
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Cleanup DOM after each test
afterEach(() => {
  document.body.innerHTML = ''
})

// Mock IntersectionObserver for lazy loading components
if (typeof window.IntersectionObserver === 'undefined') {
  window.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
}

// Mock requestAnimationFrame
const mockRaf = (callback: FrameRequestCallback) => {
  setTimeout(callback, 16)
}
window.requestAnimationFrame = mockRaf
window.cancelAnimationFrame = (id) => clearTimeout(id)
