'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { apiFetch } from '@/lib/api-path'

// ============================================================================
// Types
// ============================================================================

export type TicketStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'archived'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type TicketResolution = 'completed' | 'wont-fix' | 'duplicate' | 'cant-reproduce'

export interface AgentMetadata {
  id: string
  name: string
  role: string
  specialization: string
  skills: string[]
  workload: number
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assignee: string | null
  assigneeMetadata?: AgentMetadata | null
  storyId: string
  storyTitle?: string
  sprint: number
  estimate: string
  dependencies: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
  completedBy?: string
  resolution?: TicketResolution
  resolutionNote?: string
  isArchived: boolean
}

export interface TicketFilter {
  status: TicketStatus[]
  agents: string[]
  search: string
  showArchived: boolean
  priority: TicketPriority[]
  sprint: number | null
}

export interface TicketsDataHook {
  tickets: Ticket[]
  filteredTickets: Ticket[]
  isLoading: boolean
  error: string | null
  filter: TicketFilter
  setFilter: (filter: Partial<TicketFilter>) => void
  resetFilter: () => void
  getTicketById: (id: string) => Ticket | undefined
  getTicketsByAssignee: (assignee: string) => Ticket[]
  getTicketsByStory: (storyId: string) => Ticket[]
  getTicketsByStatus: (status: TicketStatus) => Ticket[]
  getAgentMetadata: (agentName: string) => AgentMetadata | undefined
  statusStats: StatusStats
  agentStats: AgentStats[]
  refresh: () => void
}

export interface StatusStats {
  total: number
  backlog: number
  todo: number
  inProgress: number
  review: number
  done: number
  archived: number
}

export interface AgentStats {
  agentId: string
  agentName: string
  role: string
  totalTickets: number
  activeTickets: number
  completedTickets: number
  workloadPercentage: number
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FILTER: TicketFilter = {
  status: [],
  agents: [],
  search: '',
  showArchived: false,
  priority: [],
  sprint: null,
}

const STATUS_NORMALIZATION_MAP: Record<string, TicketStatus> = {
  // Standard mappings
  'backlog': 'backlog',
  'todo': 'todo',
  'to-do': 'todo',
  'to do': 'todo',
  'in-progress': 'in-progress',
  'in progress': 'in-progress',
  'progress': 'in-progress',
  'pending': 'todo',
  'planning': 'backlog',
  'review': 'review',
  'in-review': 'review',
  'done': 'done',
  'completed': 'done',
  'complete': 'done',
  'finished': 'done',
  'archived': 'archived',
  'blocked': 'in-progress',
  'wont-fix': 'archived',
  'wontfix': 'archived',
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize various status strings to the standard TicketStatus enum
 */
export function normalizeStatus(rawStatus: string): TicketStatus {
  const normalized = rawStatus.toLowerCase().trim()
  return STATUS_NORMALIZATION_MAP[normalized] || 'backlog'
}

/**
 * Determine if a ticket should be considered archived
 * Note: 'done' is a valid status, not archived. Only explicit archive status
 * or tickets from archived-tickets.json should be marked as archived.
 */
export function isArchivedStatus(status: string, _resolution?: string): boolean {
  const normalizedStatus = normalizeStatus(status)
  // Only 'archived' status is truly archived
  // 'done', 'completed', 'wont-fix' are valid statuses, not archived
  return normalizedStatus === 'archived'
}

/**
 * Parse estimate string to minutes for sorting
 */
export function parseEstimate(estimate: string): number {
  const match = estimate.match(/^(\d+)(h|m)?$/i)
  if (!match) return 0
  const value = parseInt(match[1], 10)
  const unit = (match[2] || 'h').toLowerCase()
  return unit === 'm' ? value : value * 60
}

// ============================================================================
// Data Fetching Functions
// ============================================================================

interface RawStory {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  assignee: string
  createdAt: string
  updatedAt: string
  tickets: RawTicket[]
}

interface RawTicket {
  id: string
  title: string
  description?: string
  assignee: string
  status: string
  priority: string
  storyId: string
  sprint?: number
  estimate?: string
  dependencies?: string[]
  completedAt?: string
  completedBy?: string
  resolution?: TicketResolution
  resolutionNote?: string
}

interface RawAgent {
  name: string
  role: string
  specialization: string
  currentWorkload: number
  activeTasks: string[]
  skills: string[]
}

interface ArchivedTicket extends RawTicket {
  completedAt: string
  completedBy: string
  resolution: TicketResolution
  resolutionNote?: string
}

/**
 * Fetch stories data
 */
async function fetchStories(): Promise<RawStory[]> {
  try {
    const response = await apiFetch('/data/stories.json?t=' + Date.now(), {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching stories:', error)
    return []
  }
}

/**
 * Fetch archived tickets data
 */
async function fetchArchivedTickets(): Promise<ArchivedTicket[]> {
  try {
    const response = await apiFetch('/data/archived-tickets.json?t=' + Date.now(), {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch archived tickets: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching archived tickets:', error)
    return []
  }
}

/**
 * Fetch agents data for metadata
 */
async function fetchAgents(): Promise<RawAgent[]> {
  try {
    const response = await apiFetch('/data/agents.json?t=' + Date.now(), {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching agents:', error)
    return []
  }
}

/**
 * Fetch active sessions for workload data
 */
interface ActiveSession {
  sessionKey: string
  agentId: string
  status: string
  lastActive: string
  duration: number
  task: string
}

async function fetchActiveSessions(): Promise<ActiveSession[]> {
  try {
    const response = await apiFetch('/data/active-sessions.json?t=' + Date.now(), {
      cache: 'no-store',
    })
    if (!response.ok) {
      // Fallback: try alternative location
      const fallbackResponse = await apiFetch('/active-status.json?t=' + Date.now(), {
        cache: 'no-store',
      })
      if (!fallbackResponse.ok) {
        return []
      }
      const fallbackData = await fallbackResponse.json()
      // Convert object format to array format
      if (fallbackData && typeof fallbackData === 'object' && !Array.isArray(fallbackData)) {
        return Object.entries(fallbackData).map(([agentId, data]: [string, any]) => ({
          sessionKey: `agent:${agentId}:status`,
          agentId,
          status: data.status || 'idle',
          lastActive: data.lastActive || new Date().toISOString(),
          duration: 0,
          task: data.currentTask || '',
        }))
      }
      return Array.isArray(fallbackData) ? fallbackData : []
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching active sessions:', error)
    return []
  }
}

// ============================================================================
// Main Hook
// ============================================================================

export function useTicketsData(): TicketsDataHook {
  const [rawTickets, setRawTickets] = useState<Ticket[]>([])
  const [agents, setAgents] = useState<Map<string, AgentMetadata>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilterState] = useState<TicketFilter>(DEFAULT_FILTER)
  const [refreshKey, setRefreshKey] = useState(0)

  /**
   * Fetch and merge all ticket data
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all data sources in parallel
      const [stories, archivedTickets, agentsData, sessionsData] = await Promise.all([
        fetchStories(),
        fetchArchivedTickets(),
        fetchAgents(),
        fetchActiveSessions(),
      ])

      // Build agent metadata map
      const agentMap = new Map<string, AgentMetadata>()
      const sessionMap = new Map<string, ActiveSession>()
      
      sessionsData.forEach(session => {
        sessionMap.set(session.agentId, session)
      })

      agentsData.forEach(agent => {
        const session = sessionMap.get(agent.name)
        agentMap.set(agent.name, {
          id: agent.name,
          name: agent.name,
          role: agent.role,
          specialization: agent.specialization,
          skills: agent.skills,
          workload: session?.duration || agent.currentWorkload || 0,
        })
      })

      setAgents(agentMap)

      // Process tickets from stories
      const ticketsFromStories: Ticket[] = []
      
      stories.forEach(story => {
        if (story.tickets && Array.isArray(story.tickets)) {
          story.tickets.forEach(ticket => {
            const normalizedStatus = normalizeStatus(ticket.status)
            const archived = isArchivedStatus(ticket.status, ticket.resolution)
            
            ticketsFromStories.push({
              id: ticket.id,
              title: ticket.title,
              description: ticket.description || '',
              status: normalizedStatus === 'done' && archived ? 'done' : normalizedStatus,
              priority: (ticket.priority as TicketPriority) || 'medium',
              assignee: ticket.assignee || null,
              assigneeMetadata: ticket.assignee ? agentMap.get(ticket.assignee) : null,
              storyId: story.id,
              storyTitle: story.title,
              sprint: ticket.sprint || 0,
              estimate: ticket.estimate || '1h',
              dependencies: ticket.dependencies || [],
              createdAt: story.createdAt,
              updatedAt: story.updatedAt,
              isArchived: archived,
            })
          })
        }
      })

      // Process archived tickets
      const ticketsFromArchive: Ticket[] = archivedTickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description || '',
        status: 'done' as TicketStatus,
        priority: (ticket.priority as TicketPriority) || 'medium',
        assignee: ticket.assignee || null,
        assigneeMetadata: ticket.assignee ? agentMap.get(ticket.assignee) : null,
        storyId: ticket.storyId,
        storyTitle: undefined,
        sprint: ticket.sprint || 0,
        estimate: ticket.estimate || '1h',
        dependencies: ticket.dependencies || [],
        createdAt: ticket.completedAt || new Date().toISOString(),
        updatedAt: ticket.completedAt || new Date().toISOString(),
        completedAt: ticket.completedAt,
        completedBy: ticket.completedBy,
        resolution: ticket.resolution,
        resolutionNote: ticket.resolutionNote,
        isArchived: true,
      }))

      // Merge tickets, archived ones take precedence (by id)
      const ticketMap = new Map<string, Ticket>()
      
      // Add story tickets first
      ticketsFromStories.forEach(ticket => {
        ticketMap.set(ticket.id, ticket)
      })
      
      // Override with archived tickets (they have more complete data)
      ticketsFromArchive.forEach(ticket => {
        ticketMap.set(ticket.id, ticket)
      })

      setRawTickets(Array.from(ticketMap.values()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
      console.error('Tickets data fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Initial fetch and polling
   */
  useEffect(() => {
    fetchData()
    
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData, refreshKey])

  /**
   * Update filter state
   */
  const setFilter = useCallback((partialFilter: Partial<TicketFilter>) => {
    setFilterState(prev => ({
      ...prev,
      ...partialFilter,
    }))
  }, [])

  /**
   * Reset filter to defaults
   */
  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER)
  }, [])

  /**
   * Get ticket by ID
   */
  const getTicketById = useCallback((id: string): Ticket | undefined => {
    return rawTickets.find(ticket => ticket.id === id)
  }, [rawTickets])

  /**
   * Get tickets by assignee
   */
  const getTicketsByAssignee = useCallback((assignee: string): Ticket[] => {
    return rawTickets.filter(ticket => ticket.assignee === assignee)
  }, [rawTickets])

  /**
   * Get tickets by story
   */
  const getTicketsByStory = useCallback((storyId: string): Ticket[] => {
    return rawTickets.filter(ticket => ticket.storyId === storyId)
  }, [rawTickets])

  /**
   * Get tickets by status
   */
  const getTicketsByStatus = useCallback((status: TicketStatus): Ticket[] => {
    return rawTickets.filter(ticket => ticket.status === status)
  }, [rawTickets])

  /**
   * Get agent metadata
   */
  const getAgentMetadata = useCallback((agentName: string): AgentMetadata | undefined => {
    return agents.get(agentName)
  }, [agents])

  /**
   * Apply filters to tickets
   */
  const filteredTickets = useMemo(() => {
    let result = [...rawTickets]

    // Filter by archived status
    if (!filter.showArchived) {
      result = result.filter(ticket => !ticket.isArchived)
    }

    // Filter by status
    if (filter.status.length > 0) {
      result = result.filter(ticket => filter.status.includes(ticket.status))
    }

    // Filter by agents
    if (filter.agents.length > 0) {
      result = result.filter(ticket => 
        ticket.assignee && filter.agents.includes(ticket.assignee)
      )
    }

    // Filter by priority
    if (filter.priority.length > 0) {
      result = result.filter(ticket => filter.priority.includes(ticket.priority))
    }

    // Filter by sprint
    if (filter.sprint !== null) {
      result = result.filter(ticket => ticket.sprint === filter.sprint)
    }

    // Filter by search text
    if (filter.search.trim()) {
      const searchLower = filter.search.toLowerCase().trim()
      result = result.filter(ticket =>
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.id.toLowerCase().includes(searchLower) ||
        (ticket.storyTitle && ticket.storyTitle.toLowerCase().includes(searchLower)) ||
        (ticket.assignee && ticket.assignee.toLowerCase().includes(searchLower))
      )
    }

    return result
  }, [rawTickets, filter])

  /**
   * Compute status statistics
   */
  const statusStats = useMemo<StatusStats>(() => {
    return {
      total: rawTickets.length,
      backlog: rawTickets.filter(t => t.status === 'backlog').length,
      todo: rawTickets.filter(t => t.status === 'todo').length,
      inProgress: rawTickets.filter(t => t.status === 'in-progress').length,
      review: rawTickets.filter(t => t.status === 'review').length,
      done: rawTickets.filter(t => t.status === 'done').length,
      archived: rawTickets.filter(t => t.isArchived).length,
    }
  }, [rawTickets])

  /**
   * Compute agent statistics
   */
  const agentStats = useMemo<AgentStats[]>(() => {
    const stats = new Map<string, AgentStats>()

    // Initialize stats for all agents
    agents.forEach((agent, id) => {
      stats.set(id, {
        agentId: id,
        agentName: agent.name,
        role: agent.role,
        totalTickets: 0,
        activeTickets: 0,
        completedTickets: 0,
        workloadPercentage: 0,
      })
    })

    // Count tickets per agent
    rawTickets.forEach(ticket => {
      if (!ticket.assignee) return
      
      const current = stats.get(ticket.assignee)
      if (!current) return

      current.totalTickets++
      
      if (ticket.isArchived || ticket.status === 'done') {
        current.completedTickets++
      } else if (['todo', 'in-progress', 'review'].includes(ticket.status)) {
        current.activeTickets++
      }
    })

    // Calculate workload percentage
    stats.forEach(stat => {
      stat.workloadPercentage = Math.min(100, stat.activeTickets * 20)
    })

    return Array.from(stats.values())
  }, [rawTickets, agents])

  /**
   * Force refresh
   */
  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return {
    tickets: rawTickets,
    filteredTickets,
    isLoading,
    error,
    filter,
    setFilter,
    resetFilter,
    getTicketById,
    getTicketsByAssignee,
    getTicketsByStory,
    getTicketsByStatus,
    getAgentMetadata,
    statusStats,
    agentStats,
    refresh,
  }
}

export default useTicketsData