import * as fs from 'fs'
import * as path from 'path'
import { getWorkspacePath, getAgentsPath, listAgents, getAgentSessionFile, parseAgentSession } from './file-monitor'

// Types for file monitoring
export interface FileEvent {
  type: 'add' | 'change' | 'unlink' | 'rename'
  path: string
  timestamp: number
}

export interface FileWatcherOptions {
  pollingInterval?: number
  recursive?: boolean
  ignoreInitial?: boolean
  depth?: number
}

export interface FileWatcherState {
  watchDirectory: string
  isWatching: boolean
  lastChange: string | null
  events: FileEvent[]
  error: string | null
}

// Map for tracking file watchers
const fileWatchers = new Map<string, fs.FSWatcher>()
const pollingTimers = new Map<string, NodeJS.Timeout>()

/**
 * Poll-based file monitoring fallback
 * Used when inotify limits are exceeded or for cross-platform compatibility
 */
export class PollingFileWatcher {
  private directory: string
  private interval: number
  private lastModified: Map<string, number> = new Map()
  private callbacks: ((event: FileEvent) => void)[] = []
  private timer: NodeJS.Timeout | null = null

  constructor(directory: string, options: { interval?: number } = {}) {
    this.directory = directory
    this.interval = options.interval || 2000 // Default 2 second polling
  }

  start() {
    if (this.timer) return // Already running

    const checkFiles = () => {
      try {
        if (!fs.existsSync(this.directory)) {
          this.callbacks.forEach(cb => ({
            type: 'unlink',
            path: this.directory,
            timestamp: Date.now()
          }))
          return
        }

        const files = this.walkDirectory(this.directory)
        const now = Date.now()

        // Check for new or modified files
        for (const [filePath, mtime] of files) {
          const lastMtime = this.lastModified.get(filePath)
          if (!lastMtime) {
            // New file
            this.callbacks.forEach(cb => cb({
              type: 'add',
              path: filePath,
              timestamp: now
            }))
          } else if (mtime > lastMtime) {
            // Modified file
            this.callbacks.forEach(cb => cb({
              type: 'change',
              path: filePath,
              timestamp: now
            }))
          }
          this.lastModified.set(filePath, mtime)
        }

        // Check for deleted files
        for (const [filePath] of this.lastModified) {
          if (!files.has(filePath)) {
            this.callbacks.forEach(cb => cb({
              type: 'unlink',
              path: filePath,
              timestamp: now
            }))
            this.lastModified.delete(filePath)
          }
        }
      } catch (error) {
        console.error('Error polling files:', error)
      }
    }

    // Initial scan
    checkFiles()
    this.timer = setInterval(checkFiles, this.interval)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.lastModified.clear()
  }

  onChange(callback: (event: FileEvent) => void) {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  private walkDirectory(dir: string, depth: number = 0, maxDepth: number = 10): Map<string, number> {
    const files = new Map<string, number>()
    
    if (depth >= maxDepth) {
      return files
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          const subFiles = this.walkDirectory(fullPath, depth + 1, maxDepth)
          for (const [filePath, mtime] of subFiles) {
            files.set(filePath, mtime)
          }
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath)
            files.set(fullPath, stats.mtime.getTime())
          } catch {
            // Skip files we can't stat
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error)
    }

    return files
  }
}

/**
 * Native FS watch-based file watcher
 * Uses Node.js fs.watch for efficient file monitoring
 */
export class NativeFileWatcher {
  private directory: string
  private watcher: fs.FSWatcher | null = null
  private callbacks: ((event: FileEvent) => void)[] = []
  private isRecursive: boolean

  constructor(directory: string, options: { recursive?: boolean } = {}) {
    this.directory = directory
    this.isRecursive = options.recursive || false
  }

  start() {
    if (this.watcher) return // Already running

    try {
      this.watcher = fs.watch(this.directory, { recursive: this.isRecursive }, (event, filename) => {
        if (!filename) return

        const filePath = path.join(this.directory, filename)
        this.callbacks.forEach(cb => cb({
          type: event as FileEvent['type'],
          path: filePath,
          timestamp: Date.now()
        }))
      })

      this.watcher.on('error', (error) => {
        console.error('File watcher error:', error)
        // Attempt to restart
        this.restart()
      })
    } catch (error) {
      console.error('Failed to start file watcher:', error)
      // Fall back to polling
      console.log('Falling back to polling file watcher')
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
  }

  restart() {
    this.stop()
    this.start()
  }

  onChange(callback: (event: FileEvent) => void) {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }
}

/**
 * Unified file watcher that automatically falls back to polling
 */
export class FileWatcher {
  private nativeWatcher: NativeFileWatcher | null = null
  private pollingWatcher: PollingFileWatcher | null = null
  private directory: string
  private options: FileWatcherOptions
  private isWatching: boolean = false
  private callbacks: ((event: FileEvent) => void)[] = []
  private currentWatcher: 'none' | 'native' | 'polling' = 'none'

  constructor(directory: string, options: FileWatcherOptions = {}) {
    this.directory = directory
    this.options = {
      pollingInterval: 2000,
      recursive: true,
      ignoreInitial: false,
      depth: 10,
      ...options
    }
  }

  start() {
    if (this.isWatching) return

    // Try native watcher first
    try {
      this.nativeWatcher = new NativeFileWatcher(this.directory, {
        recursive: this.options.recursive
      })
      
      this.nativeWatcher.onChange((event) => {
        this.callbacks.forEach(cb => cb(event))
      })

      this.nativeWatcher.start()
      this.currentWatcher = 'native'
      this.isWatching = true
      return
    } catch (error) {
      console.log('Native file watcher not available, falling back to polling')
    }

    // Fall back to polling
    this.pollingWatcher = new PollingFileWatcher(this.directory, {
      interval: this.options.pollingInterval
    })

    this.pollingWatcher.onChange((event) => {
      this.callbacks.forEach(cb => cb(event))
    })

    this.pollingWatcher.start()
    this.currentWatcher = 'polling'
    this.isWatching = true
  }

  stop() {
    this.nativeWatcher?.stop()
    this.pollingWatcher?.stop()
    this.isWatching = false
    this.currentWatcher = 'none'
  }

  onChange(callback: (event: FileEvent) => void) {
    this.callbacks.push(callback)
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  restart() {
    this.stop()
    this.start()
  }

  getWatchState(): FileWatcherState {
    return {
      watchDirectory: this.directory,
      isWatching: this.isWatching,
      lastChange: this.isWatching ? new Date().toISOString() : null,
      events: [],
      error: null
    }
  }
}

/**
 * Watch the agents directory for changes
 */
export function watchAgentsDirectory(
  callback: (event: FileEvent) => void,
  options?: FileWatcherOptions
): FileWatcher {
  const agentsPath = getAgentsPath()
  const watcher = new FileWatcher(agentsPath, options)
  watcher.start()
  watcher.onChange(callback)
  return watcher
}

/**
 * Watch a specific agent's session directory
 */
export function watchAgentSession(
  agentName: string,
  callback: (event: FileEvent) => void,
  options?: FileWatcherOptions
): FileWatcher | null {
  const agentPath = path.join(getAgentsPath(), agentName, 'sessions')
  
  if (!fs.existsSync(agentPath)) {
    return null
  }

  const watcher = new FileWatcher(agentPath, options)
  watcher.start()
  watcher.onChange(callback)
  return watcher
}

/**
 * Watch multiple agents and provide aggregated state
 */
export function watchMultipleAgents(
  agentNames: string[],
  callback: (event: FileEvent, agents: string[]) => void,
  options?: FileWatcherOptions
): Map<string, FileWatcher | null> {
  const watchers = new Map<string, FileWatcher | null>()

  for (const agentName of agentNames) {
    watchers.set(agentName, watchAgentSession(agentName, (event) => {
      callback(event, agentNames)
    }, options))
  }

  return watchers
}

/**
 * Get status of all watched agents
 */
export function getWatchedAgentsStatus(agentNames: string[]): Record<string, {
  isWatching: boolean
  lastChange: string | null
  sessionFile: string | null
  sessionData: any | null
}> {
  const status: Record<string, any> = {}

  for (const agentName of agentNames) {
    const sessionFile = getAgentSessionFile(agentName)
    let sessionData = null
    
    if (sessionFile) {
      try {
        const content = fs.readFileSync(sessionFile, 'utf-8')
        const line = content.split('\n')[0]
        sessionData = JSON.parse(line)
      } catch {
        // Ignore parse errors
      }
    }

    status[agentName] = {
      isWatching: true,
      lastChange: sessionData?.timestamp ? new Date(sessionData.timestamp).toISOString() : null,
      sessionFile,
      sessionData
    }
  }

  return status
}
