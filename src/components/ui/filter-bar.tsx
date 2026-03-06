'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

// Status configuration matching ticket-card
const statusOptions = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
  { value: 'archived', label: 'Archived' },
] as const

const statusColors: Record<string, string> = {
  backlog: 'bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30',
  todo: 'bg-info/20 text-info hover:bg-info/30',
  'in-progress': 'bg-warning/20 text-warning hover:bg-warning/30',
  review: 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30',
  done: 'bg-success/20 text-success hover:bg-success/30',
  archived: 'bg-muted-foreground/10 text-muted-foreground/70 hover:bg-muted-foreground/20',
}

// Filter Bar Props
export interface FilterBarProps {
  // Status filter
  selectedStatuses?: string[]
  onStatusChange?: (statuses: string[]) => void
  
  // Agent filter
  agents?: string[]
  selectedAgents?: string[]
  onAgentChange?: (agents: string[]) => void
  
  // Search
  searchValue?: string
  onSearchChange?: (value: string) => void
  
  // Archived toggle
  showArchived?: boolean
  onArchivedToggle?: () => void
  
  // Clear filters
  onClearFilters?: () => void
  
  // Layout
  compact?: boolean
  className?: string
}

// Filter Chip Component for multi-select
interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  colorClass?: string
}

function FilterChip({ label, selected, onClick, colorClass }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        'border border-transparent',
        selected 
          ? cn(colorClass || 'bg-primary/20 text-primary', 'border-current/20')
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
    >
      {selected && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </button>
  )
}

// Status Filter Component
interface StatusFilterProps {
  selectedStatuses: string[]
  onChange: (statuses: string[]) => void
  showArchived?: boolean
  onArchivedToggle?: () => void
}

function StatusFilter({ selectedStatuses, onChange, showArchived, onArchivedToggle }: StatusFilterProps) {
  const toggleStatus = (status: string) => {
    // 'archived' status toggles showArchived instead of status filter
    if (status === 'archived') {
      onArchivedToggle?.()
      return
    }
    
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter(s => s !== status))
    } else {
      onChange([...selectedStatuses, status])
    }
  }

  const selectAll = () => {
    onChange(statusOptions.filter(s => s.value !== 'archived').map(s => s.value))
  }

  const clearAll = () => {
    onChange([])
  }

  const allSelected = selectedStatuses.length === statusOptions.length - 1 // -1 for 'archived'
  const hasActiveFilters = selectedStatuses.length > 0 || showArchived

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Status</label>
      <div className="flex flex-wrap items-center gap-1.5">
        {statusOptions.map((status) => (
          <FilterChip
            key={status.value}
            label={status.label}
            selected={status.value === 'archived' ? showArchived : selectedStatuses.includes(status.value)}
            onClick={() => toggleStatus(status.value)}
            colorClass={statusColors[status.value]}
          />
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { clearAll(); if (showArchived) onArchivedToggle?.(); }}
            className="text-xs text-muted-foreground hover:text-foreground ml-1"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// Agent Filter Component (Dropdown)
interface AgentFilterProps {
  agents: string[]
  selectedAgents: string[]
  onChange: (agents: string[]) => void
  compact?: boolean
}

function AgentFilter({ agents, selectedAgents, onChange, compact }: AgentFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleAgent = (agent: string) => {
    if (selectedAgents.includes(agent)) {
      onChange(selectedAgents.filter(a => a !== agent))
    } else {
      onChange([...selectedAgents, agent])
    }
  }

  const displayText = selectedAgents.length === 0 
    ? 'All agents' 
    : selectedAgents.length === 1 
      ? selectedAgents[0]
      : `${selectedAgents.length} agents`

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm',
            'border border-input bg-background hover:bg-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{displayText}</span>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-48 max-h-64 overflow-auto rounded-md border bg-popover shadow-md bg-background">
            {agents.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No agents available</div>
            ) : (
              agents.map((agent) => (
                <button
                  key={agent}
                  type="button"
                  onClick={() => toggleAgent(agent)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedAgents.includes(agent) && 'bg-accent/50'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 border rounded flex items-center justify-center',
                    selectedAgents.includes(agent) && 'bg-primary border-primary'
                  )}>
                    {selectedAgents.includes(agent) && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {agent}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-muted-foreground">Agent</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between gap-2 px-3 py-2 rounded-md text-sm',
            'border border-input bg-background hover:bg-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <span>{displayText}</span>
          <svg className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-popover shadow-md bg-background">
            {agents.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">No agents available</div>
            ) : (
              agents.map((agent) => (
                <button
                  key={agent}
                  type="button"
                  onClick={() => toggleAgent(agent)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    selectedAgents.includes(agent) && 'bg-accent/50'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 border rounded flex items-center justify-center',
                    selectedAgents.includes(agent) && 'bg-primary border-primary'
                  )}>
                    {selectedAgents.includes(agent) && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  {agent}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Search Input Component
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  compact?: boolean
}

function SearchInput({ value, onChange, placeholder = 'Search tickets...', compact }: SearchInputProps) {
  return (
    <div className="relative">
      <svg 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-md border border-input bg-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'text-sm placeholder:text-muted-foreground',
          compact ? 'pl-9 pr-3 py-1.5' : 'pl-10 pr-4 py-2'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Archived Toggle Component
interface ArchivedToggleProps {
  showArchived: boolean
  onToggle: () => void
  compact?: boolean
}

function ArchivedToggle({ showArchived, onToggle, compact }: ArchivedToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        'border',
        showArchived 
          ? 'bg-primary/20 text-primary border-primary/30' 
          : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      {showArchived ? 'Hide Archived' : 'Show Archived'}
    </button>
  )
}

// Filter Bar Component
export function FilterBar({
  selectedStatuses = [],
  onStatusChange,
  agents = [],
  selectedAgents = [],
  onAgentChange,
  searchValue = '',
  onSearchChange,
  showArchived = false,
  onArchivedToggle,
  onClearFilters,
  compact = false,
  className,
}: FilterBarProps) {
  const hasFilters = selectedStatuses.length > 0 || selectedAgents.length > 0 || searchValue.length > 0 || showArchived

  const handleClearAll = () => {
    onStatusChange?.([])
    onAgentChange?.([])
    onSearchChange?.('')
    if (showArchived) {
      onArchivedToggle?.()
    }
    onClearFilters?.()
  }

  if (compact) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <SearchInput
          value={searchValue}
          onChange={(v) => onSearchChange?.(v)}
          compact
        />
        
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.slice(0, 5).map((status) => (
            <FilterChip
              key={status.value}
              label={status.label}
              selected={status.value === 'archived' ? showArchived : selectedStatuses.includes(status.value)}
              onClick={() => {
                if (status.value === 'archived') {
                  onArchivedToggle?.()
                } else {
                  const newStatuses = selectedStatuses.includes(status.value)
                    ? selectedStatuses.filter(s => s !== status.value)
                    : [...selectedStatuses, status.value]
                  onStatusChange?.(newStatuses)
                }
              }}
              colorClass={statusColors[status.value]}
            />
          ))}
          {(selectedStatuses.length > 0 || showArchived) && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              Clear
            </button>
          )}
        </div>
        
        {agents.length > 0 && (
          <AgentFilter
            agents={agents}
            selectedAgents={selectedAgents}
            onChange={(a) => onAgentChange?.(a)}
            compact
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div>
        <SearchInput
          value={searchValue}
          onChange={(v) => onSearchChange?.(v)}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Status Filter */}
        <div className="flex-1">
          <StatusFilter
            selectedStatuses={selectedStatuses}
            onChange={(s) => onStatusChange?.(s)}
            showArchived={showArchived}
            onArchivedToggle={() => onArchivedToggle?.()}
          />
        </div>

        {/* Agent Filter */}
        {agents.length > 0 && (
          <div className="sm:w-48">
            <AgentFilter
              agents={agents}
              selectedAgents={selectedAgents}
              onChange={(a) => onAgentChange?.(a)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterBar