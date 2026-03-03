/**
 * File Watcher Tests
 * TDD approach for real-time file monitoring integration
 */

import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest'
import * as fs from 'fs'
import { watchAgentsDirectory, watchAgentSession, getAgentsPath } from './file-watcher'

// Mock fs module first
vi.mock('fs', () => {
  const actualFs = vi.importActual('fs')
  return {
    ...actualFs,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    watch: vi.fn(),
  }
})

// Mock getAgentsPath from file-monitor
vi.mock('./file-monitor', () => ({
  getAgentsPath: () => '/agents',
  getWorkspacePath: () => '/workspace',
}))

// Import after mocking
import { PollingFileWatcher, NativeFileWatcher, FileWatcher } from './file-watcher'

describe('PollingFileWatcher', () => {
  let watcher: PollingFileWatcher | null = null
  const mockDirectory = '/test/directory'

  afterEach(() => {
    if (watcher) {
      watcher.stop()
      watcher = null
    }
  })

  it('should create watcher instance', () => {
    watcher = new PollingFileWatcher(mockDirectory, { interval: 1000 })
    expect(watcher).toBeDefined()
    expect(watcher['directory']).toBe(mockDirectory)
    expect(watcher['interval']).toBe(1000)
  })

  it('should add and remove callbacks', () => {
    watcher = new PollingFileWatcher(mockDirectory, { interval: 1000 })
    
    const callback = () => {}
    const remove = watcher.onChange(callback)
    
    expect(typeof remove).toBe('function')
    
    // Remove callback
    remove()
  })
})

describe('NativeFileWatcher', () => {
  let watcher: NativeFileWatcher | null = null
  const mockDirectory = '/test/directory'

  afterEach(() => {
    if (watcher) {
      watcher.stop()
      watcher = null
    }
  })

  it('should create watcher instance', () => {
    watcher = new NativeFileWatcher(mockDirectory, { recursive: true })
    expect(watcher).toBeDefined()
    expect(watcher['directory']).toBe(mockDirectory)
  })

  it('should add and remove callbacks', () => {
    watcher = new NativeFileWatcher(mockDirectory)
    
    const callback = () => {}
    const remove = watcher.onChange(callback)
    
    expect(typeof remove).toBe('function')
    
    remove()
  })
})

describe('FileWatcher', () => {
  let watcher: FileWatcher | null = null
  const mockDirectory = '/test/directory'

  afterEach(() => {
    if (watcher) {
      watcher.stop()
      watcher = null
    }
  })

  it('should create watcher instance', () => {
    watcher = new FileWatcher(mockDirectory, { pollingInterval: 2000 })
    expect(watcher).toBeDefined()
  })

  it('should return correct initial state', () => {
    watcher = new FileWatcher(mockDirectory)
    const state = watcher.getWatchState()
    
    expect(state.watchDirectory).toBe(mockDirectory)
    expect(state.isWatching).toBe(false)
  })

  it('should add and remove callbacks', () => {
    watcher = new FileWatcher(mockDirectory)
    
    const callback = () => {}
    const remove = watcher.onChange(callback)
    
    expect(typeof remove).toBe('function')
    
    remove()
  })

  it('should start and stop', () => {
    watcher = new FileWatcher(mockDirectory)
    
    // Mock fs.watch to avoid errors
    vi.spyOn(fs, 'watch').mockReturnValue({ 
      close: vi.fn(), 
      on: vi.fn() 
    })
    
    // Start - should not throw even if watcher fails
    expect(() => watcher.start()).not.toThrow()
    expect(watcher.getWatchState().isWatching).toBe(true)
    
    // Stop
    watcher.stop()
    expect(watcher.getWatchState().isWatching).toBe(false)
  })

  it('should restart watcher', () => {
    watcher = new FileWatcher(mockDirectory)
    
    vi.spyOn(fs, 'watch').mockReturnValue({ 
      close: vi.fn(), 
      on: vi.fn() 
    })
    
    watcher.start()
    watcher.restart()
    
    expect(watcher.getWatchState().isWatching).toBe(true)
  })
})

describe('FileWatcher Utility Functions', () => {
  it('should export watchAgentsDirectory', () => {
    expect(typeof watchAgentsDirectory).toBe('function')
  })

  it('should export watchAgentSession', () => {
    expect(typeof watchAgentSession).toBe('function')
  })
})
