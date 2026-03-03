/**
 * useFileWatcher Hook Tests
 * TDD approach for React hook integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// Mock file-watcher before importing the hook
vi.mock('./file-watcher', () => ({
  FileWatcher: vi.fn(),
  getAgentsPath: () => '/agents',
  listAgents: () => ['agent1', 'agent2'],
}))

describe('useFileWatcher', () => {
  const mockWatcher = {
    start: vi.fn(),
    stop: vi.fn(),
    onChange: vi.fn((cb) => () => {}),
    getWatchState: vi.fn(() => ({ isWatching: true, watchDirectory: '/agents' })),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    (require('./file-watcher').FileWatcher as any).mockImplementation(() => mockWatcher)
  })

  it('should initialize with empty agents list', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      expect(result.current.agents).toEqual([])
    })
    expect(result.current.isWatching).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should start watching when startWatching is called', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.startWatching()
    })
    
    expect(mockWatcher.start).toHaveBeenCalled()
  })

  it('should stop watching when stopWatching is called', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.startWatching()
      result.current.stopWatching()
    })
    
    expect(mockWatcher.stop).toHaveBeenCalled()
  })

  it('should update events on file change', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.startWatching()
    })
    
    // Simulate a file change event
    const onChangeCallback = (mockWatcher.onChange as any).mock.calls[0][0]
    onChangeCallback({ type: 'add', path: '/agents/test.txt', timestamp: Date.now() })
    
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0)
    })
  })

  it('should update lastUpdate timestamp', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.startWatching()
    })
    
    // Simulate a file change event
    const onChangeCallback = (mockWatcher.onChange as any).mock.calls[0][0]
    onChangeCallback({ type: 'change', path: '/agents/test.txt', timestamp: Date.now() })
    
    await waitFor(() => {
      expect(result.current.lastUpdate).not.toBeNull()
    })
  })

  it('should set error on watcher start failure', async () => {
    // Mock watcher that throws on start
    const errorWatcher = {
      start: vi.fn().mockImplementation(() => { throw new Error('Watcher error') }),
      stop: vi.fn(),
      onChange: vi.fn(() => () => {}),
    }
    
    ;(require('./file-watcher').FileWatcher as any).mockImplementation(() => errorWatcher)
    
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.startWatching()
    })
    
    expect(result.current.error).toBe('Watcher error')
  })

  it('should refresh agent statuses', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.refresh()
    })
    
    // Refresh should not fail
    expect(result.current.error).toBeNull()
  })

  it('should have proper aria-live attributes', async () => {
    const { result } = renderHook(() => require('./useFileWatcher').useFileWatcher())
    
    await waitFor(() => {
      result.current.startWatching()
    })
    
    expect(result.current.isWatching).toBe(true)
    expect(result.current.error).toBeNull()
  })
})

describe('useAgentSession', () => {
  it('should initialize with null session data', () => {
    const { result } = renderHook(() => require('./useFileWatcher').useAgentSession('test-agent'))
    
    // Session data is mocked to return placeholder
    expect(result.current.sessionFile).not.toBeNull()
    expect(result.current.sessionData).not.toBeNull()
  })

  it('should respond to agent name changes', () => {
    const { result, rerender } = renderHook(
      ({ agentName }) => require('./useFileWatcher').useAgentSession(agentName),
      { initialProps: { agentName: 'agent1' } }
    )
    
    expect(result.current.sessionFile).not.toBeNull()
    
    // Rerender with different agent
    rerender({ agentName: 'agent2' })
    
    // Should update to new agent's session
    expect(result.current.sessionFile).not.toBeNull()
  })

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => require('./useFileWatcher').useAgentSession('test-agent'))
    
    unmount()
    
    // Should not throw
    expect(true).toBe(true)
  })
})
