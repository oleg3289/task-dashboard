'use client'

import React, { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react'
import type { TicketStatus, TicketPriority, Ticket } from '@/hooks/useTicketsData'

// ============================================================================
// Types
// ============================================================================

export interface TicketsFilterState {
  /** Selected statuses to filter by (empty = all) */
  status: TicketStatus[]
  /** Selected agents to filter by (empty = all) */
  agents: string[]
  /** Search text for fuzzy matching */
  searchText: string
  /** Whether to include archived tickets */
  showArchived: boolean
  /** Selected priorities to filter by (empty = all) */
  priority: TicketPriority[]
  /** Sprint filter (null = all) */
  sprint: number | null
  /** Sort field */
  sortBy: SortField
  /** Sort direction */
  sortDirection: SortDirection
}

export type SortField = 'id' | 'title' | 'status' | 'priority' | 'assignee' | 'sprint' | 'updatedAt' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface TicketsFilterActions {
  /** Set status filter (replaces existing) */
  setStatus: (status: TicketStatus[]) => void
  /** Toggle a single status in the filter */
  toggleStatus: (status: TicketStatus) => void
  /** Set agents filter (replaces existing) */
  setAgents: (agents: string[]) => void
  /** Toggle a single agent in the filter */
  toggleAgent: (agent: string) => void
  /** Set search text */
  setSearchText: (text: string) => void
  /** Toggle archived visibility */
  toggleShowArchived: () => void
  /** Set priority filter (replaces existing) */
  setPriority: (priority: TicketPriority[]) => void
  /** Toggle a single priority in the filter */
  togglePriority: (priority: TicketPriority) => void
  /** Set sprint filter */
  setSprint: (sprint: number | null) => void
  /** Set sort field */
  setSortBy: (field: SortField) => void
  /** Toggle sort direction */
  toggleSortDirection: () => void
  /** Reset all filters to defaults */
  resetFilters: () => void
  /** Check if any filters are active */
  hasActiveFilters: boolean
  /** Get count of active filters */
  activeFilterCount: number
  /** Apply filters and sorting to a ticket list */
  applyFilters: (tickets: Ticket[]) => Ticket[]
}

export type TicketsFilterContextValue = TicketsFilterState & TicketsFilterActions

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STATE: TicketsFilterState = {
  status: [],
  agents: [],
  searchText: '',
  showArchived: true, // Show all tickets by default (including completed)
  priority: [],
  sprint: null,
  sortBy: 'updatedAt',
  sortDirection: 'desc',
}

const STORAGE_KEY = 'tickets-filter-state'
const STORAGE_VERSION = 2 // Increment to reset stored defaults

const STATUS_ORDER: Record<TicketStatus, number> = {
  'backlog': 0,
  'todo': 1,
  'in-progress': 2,
  'review': 3,
  'done': 4,
  'archived': 5,
}

const PRIORITY_ORDER: Record<TicketPriority, number> = {
  'critical': 0,
  'high': 1,
  'medium': 2,
  'low': 3,
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load filter state from localStorage
 */
function loadSavedState(): TicketsFilterState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      
      // Check if it's the new format with version
      if (parsed && typeof parsed === 'object') {
        // New format: { version, state }
        if (parsed.version !== undefined && parsed.version !== STORAGE_VERSION) {
          // Version mismatch - reset to defaults
          localStorage.removeItem(STORAGE_KEY)
          return DEFAULT_STATE
        }
        
        // Merge state with defaults
        const state = parsed.state || parsed
        return {
          ...DEFAULT_STATE,
          ...state,
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load saved filter state:', error)
  }

  return DEFAULT_STATE
}

/**
 * Save filter state to localStorage
 */
function saveState(state: TicketsFilterState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORAGE_VERSION,
      state: state,
    }))
  } catch (error) {
    console.warn('Failed to save filter state:', error)
  }
}

/**
 * Compare tickets for sorting
 */
function compareTickets(a: Ticket, b: Ticket, sortBy: SortField, direction: SortDirection): number {
  const multiplier = direction === 'asc' ? 1 : -1

  switch (sortBy) {
    case 'id':
      return a.id.localeCompare(b.id) * multiplier
    
    case 'title':
      return a.title.localeCompare(b.title) * multiplier
    
    case 'status':
      return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * multiplier
    
    case 'priority':
      return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * multiplier
    
    case 'assignee':
      const aAssignee = a.assignee || ''
      const bAssignee = b.assignee || ''
      return aAssignee.localeCompare(bAssignee) * multiplier
    
    case 'sprint':
      return (a.sprint - b.sprint) * multiplier
    
    case 'updatedAt':
      const aUpdated = new Date(a.updatedAt).getTime()
      const bUpdated = new Date(b.updatedAt).getTime()
      return (aUpdated - bUpdated) * multiplier
    
    case 'createdAt':
      const aCreated = new Date(a.createdAt).getTime()
      const bCreated = new Date(b.createdAt).getTime()
      return (aCreated - bCreated) * multiplier
    
    default:
      return 0
  }
}

// ============================================================================
// Context
// ============================================================================

const TicketsFilterContext = createContext<TicketsFilterContextValue | null>(null)

// ============================================================================
// Provider
// ============================================================================

interface TicketsFilterProviderProps {
  children: ReactNode
  initialState?: Partial<TicketsFilterState>
}

export function TicketsFilterProvider({ 
  children, 
  initialState 
}: TicketsFilterProviderProps) {
  // Initialize state from localStorage or defaults
  const [state, setState] = React.useState<TicketsFilterState>(() => ({
    ...loadSavedState(),
    ...initialState,
  }))

  // Save state changes to localStorage
  React.useEffect(() => {
    saveState(state)
  }, [state])

  // Actions
  const setStatus = useCallback((status: TicketStatus[]) => {
    setState(prev => ({ ...prev, status }))
  }, [])

  const toggleStatus = useCallback((status: TicketStatus) => {
    setState(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }))
  }, [])

  const setAgents = useCallback((agents: string[]) => {
    setState(prev => ({ ...prev, agents }))
  }, [])

  const toggleAgent = useCallback((agent: string) => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.includes(agent)
        ? prev.agents.filter(a => a !== agent)
        : [...prev.agents, agent],
    }))
  }, [])

  const setSearchText = useCallback((searchText: string) => {
    setState(prev => ({ ...prev, searchText }))
  }, [])

  const toggleShowArchived = useCallback(() => {
    setState(prev => ({ ...prev, showArchived: !prev.showArchived }))
  }, [])

  const setPriority = useCallback((priority: TicketPriority[]) => {
    setState(prev => ({ ...prev, priority }))
  }, [])

  const togglePriority = useCallback((priority: TicketPriority) => {
    setState(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority],
    }))
  }, [])

  const setSprint = useCallback((sprint: number | null) => {
    setState(prev => ({ ...prev, sprint }))
  }, [])

  const setSortBy = useCallback((sortBy: SortField) => {
    setState(prev => ({
      ...prev,
      sortBy,
      // Reset to desc when changing sort field
      sortDirection: 'desc',
    }))
  }, [])

  const toggleSortDirection = useCallback(() => {
    setState(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [])

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return (
      state.status.length > 0 ||
      state.agents.length > 0 ||
      state.searchText.trim() !== '' ||
      state.showArchived ||
      state.priority.length > 0 ||
      state.sprint !== null
    )
  }, [state])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (state.status.length > 0) count++
    if (state.agents.length > 0) count++
    if (state.searchText.trim() !== '') count++
    if (state.showArchived) count++
    if (state.priority.length > 0) count++
    if (state.sprint !== null) count++
    return count
  }, [state])

  const applyFilters = useCallback((tickets: Ticket[]): Ticket[] => {
    let result = [...tickets]

    // Filter by archived status
    if (!state.showArchived) {
      result = result.filter(ticket => !ticket.isArchived)
    }

    // Filter by status
    if (state.status.length > 0) {
      result = result.filter(ticket => state.status.includes(ticket.status))
    }

    // Filter by agents
    if (state.agents.length > 0) {
      result = result.filter(ticket => 
        ticket.assignee && state.agents.includes(ticket.assignee)
      )
    }

    // Filter by priority
    if (state.priority.length > 0) {
      result = result.filter(ticket => state.priority.includes(ticket.priority))
    }

    // Filter by sprint
    if (state.sprint !== null) {
      result = result.filter(ticket => ticket.sprint === state.sprint)
    }

    // Filter by search text
    if (state.searchText.trim()) {
      const searchLower = state.searchText.toLowerCase().trim()
      result = result.filter(ticket =>
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.id.toLowerCase().includes(searchLower) ||
        (ticket.storyTitle && ticket.storyTitle.toLowerCase().includes(searchLower)) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchLower))
      )
    }

    // Apply sorting
    result.sort((a, b) => compareTickets(a, b, state.sortBy, state.sortDirection))

    return result
  }, [state])

  const value = useMemo<TicketsFilterContextValue>(() => ({
    // State
    ...state,
    // Actions
    setStatus,
    toggleStatus,
    setAgents,
    toggleAgent,
    setSearchText,
    toggleShowArchived,
    setPriority,
    togglePriority,
    setSprint,
    setSortBy,
    toggleSortDirection,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters,
  }), [
    state,
    setStatus,
    toggleStatus,
    setAgents,
    toggleAgent,
    setSearchText,
    toggleShowArchived,
    setPriority,
    togglePriority,
    setSprint,
    setSortBy,
    toggleSortDirection,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters,
  ])

  return (
    <TicketsFilterContext.Provider value={value}>
      {children}
    </TicketsFilterContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the tickets filter context
 * Must be used within a TicketsFilterProvider
 */
export function useTicketsFilter(): TicketsFilterContextValue {
  const context = useContext(TicketsFilterContext)
  if (!context) {
    throw new Error('useTicketsFilter must be used within a TicketsFilterProvider')
  }
  return context
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook to get just the filter state without actions
 * Useful for components that only need to read the current filter
 */
export function useTicketsFilterState(): TicketsFilterState {
  const { 
    status, 
    agents, 
    searchText, 
    showArchived, 
    priority, 
    sprint, 
    sortBy, 
    sortDirection 
  } = useTicketsFilter()
  
  return {
    status,
    agents,
    searchText,
    showArchived,
    priority,
    sprint,
    sortBy,
    sortDirection,
  }
}

/**
 * Hook to get just the filter actions
 * Useful for components that only need to modify filters
 */
export function useTicketsFilterActions(): TicketsFilterActions {
  const context = useTicketsFilter()
  
  return {
    setStatus: context.setStatus,
    toggleStatus: context.toggleStatus,
    setAgents: context.setAgents,
    toggleAgent: context.toggleAgent,
    setSearchText: context.setSearchText,
    toggleShowArchived: context.toggleShowArchived,
    setPriority: context.setPriority,
    togglePriority: context.togglePriority,
    setSprint: context.setSprint,
    setSortBy: context.setSortBy,
    toggleSortDirection: context.toggleSortDirection,
    resetFilters: context.resetFilters,
    hasActiveFilters: context.hasActiveFilters,
    activeFilterCount: context.activeFilterCount,
    applyFilters: context.applyFilters,
  }
}

export { TicketsFilterContext }