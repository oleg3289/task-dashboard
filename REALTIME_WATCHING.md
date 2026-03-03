# Real-time File Watching Integration

This feature implements live file monitoring for the Task Dashboard, providing automatic agent status updates when OpenClaw workspace files change.

## Features

### 1. Multi-Mode File Monitoring

The system supports both native and polling-based file monitoring:

- **Native FS Watch** - Uses Node.js `fs.watch` for efficient, event-driven monitoring
- **Polling Fallback** - Periodic file scanning (2s interval) when inotify limits are exceeded

### 2. Real-time Status Updates

- Live status indicators for agents
- Auto-refresh indicators in the UI
- File change detection with timestamps

### 3. Accessible Components

All components implement proper ARIA attributes:
- `aria-live` regions for screen readers
- Proper semantic HTML structure
- Keyboard navigation support

## Components

### `FileWatcher` (src/lib/file-watcher.ts)

Core file monitoring class with:

```typescript
class FileWatcher {
  constructor(directory: string, options?: FileWatcherOptions)
  
  start(): void
  stop(): void
  restart(): void
  
  onChange(callback: (event: FileEvent) => void): () => void
  getWatchState(): FileWatcherState
}
```

### `useFileWatcher` Hook (src/hooks/useFileWatcher.ts)

React hook for integrating file watching into components:

```typescript
export interface FileWatcherHook {
  isWatching: boolean
  agents: AgentStatus[]
  events: FileEvent[]
  lastUpdate: string | null
  error: string | null
  startWatching: () => void
  stopWatching: () => void
  refresh: () => void
}
```

Usage:
```typescript
const { isWatching, agents, startWatching, stopWatching } = useFileWatcher()

return (
  <div>
    <AutoRefreshIndicator isWatching={isWatching} />
    <button onClick={startWatching}>Start Watching</button>
    <button onClick={stopWatching}>Stop Watching</button>
  </div>
)
```

### `LiveStatusIndicator` UI Components (src/components/ui/live-status-indicator.tsx)

Accessible status indicators:

- `LiveStatusDot` - Small animated status indicator
- `LiveStatusPill` - Status badge with label
- `AutoRefreshIndicator` - Shows live/manual refresh state
- `LiveStatsCounter` - Counter with trend indicators
- `LiveIndicatorCard` - Card wrapper for live status

## File Event Types

```typescript
export interface FileEvent {
  type: 'add' | 'change' | 'unlink' | 'rename'
  path: string
  timestamp: number
}
```

## TDD Tests

Comprehensive unit tests for the file watch system:

- **File Watcher Tests** (src/lib/file-watcher.test.ts) - 11 tests
- **Hook Tests** (src/hooks/useFileWatcher.test.ts) - 12+ tests

## accessibility Standards

All components follow:
- WAI-ARIA guidelines
- Semantic HTML structure
- Proper contrast ratios
- Focus management
- Screen reader labels

## Configuration

Options for file watching:

```typescript
interface FileWatcherOptions {
  pollingInterval?: number    // Default: 2000ms
  recursive?: boolean         // Default: true
  ignoreInitial?: boolean     // Default: false
  depth?: number              // Default: 10
}
```

## Implementation Summary

- ✅ File watcher module with polling fallback
- ✅ React custom hook for file monitoring
- ✅ Live status indicator components with ARIA support
- ✅ TDD unit tests (11 passing tests)
- ✅ Accessibility standards compliance
- ✅ Error handling and recovery

## Files Changed

- `src/lib/file-watcher.ts` - Core file monitoring module
- `src/lib/file-watcher.test.ts` - TDD unit tests
- `src/hooks/useFileWatcher.ts` - React hook integration
- `src/hooks/useFileWatcher.test.ts` - Hook tests
- `src/components/ui/live-status-indicator.tsx` - Accessible UI components
- `src/components/ui/index.ts` - Component exports
