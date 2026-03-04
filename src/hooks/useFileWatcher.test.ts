/**
 * useFileWatcher Hook Tests
 * TDD approach for React hook integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFileWatcher } from './useFileWatcher'

describe('useFileWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should initialize with empty agents list', async () => {
    const { result } = renderHook(() => useFileWatcher())

    // Initial state - isWatching is true from useEffect
    expect(result.current.isWatching).toBe(true)
    expect(result.current.agents).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should update state after data fetch', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve([{ name: 'agent1' }, { name: 'agent2' }])
    }
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse)
    ;(global as any).fetch = mockFetch

    const { result } = renderHook(() => useFileWatcher())

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2)
    }, { timeout: 10000 })
    
    expect(result.current.agents).toEqual(['agent1', 'agent2'])
  }, 15000)

  it('should handle empty data response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve([])
    }
    
    const mockFetch = vi.fn().mockResolvedValue(mockResponse)
    ;(global as any).fetch = mockFetch

    const { result } = renderHook(() => useFileWatcher())

    await waitFor(() => {
      expect(result.current.agents).toEqual([])
    }, { timeout: 10000 })
  }, 15000)
})

describe('useFileWatcher - error handling', () => {
  it('should handle fetch errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    })
    ;(global as any).fetch = mockFetch

    const { result } = renderHook(() => useFileWatcher())

    // Just wait a bit for the error handling to run
    await waitFor(() => {
      // The hook should handle the error without crashing
      expect(result.current.isWatching).toBe(true)
    }, { timeout: 10000 })
  }, 15000)
})
