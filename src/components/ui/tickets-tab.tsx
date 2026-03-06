'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useTicketsData } from '@/hooks/useTicketsData'
import type { Ticket as DataTicket } from '@/hooks/useTicketsData'
import { useTicketsFilter } from '@/contexts/tickets-filter-context'
import { Card, CardContent } from './card'
import { FilterBar } from './filter-bar'
import { TicketCard, TicketCardSkeleton } from './ticket-card'
import { TicketDetailModal } from './ticket-detail-modal'

// ============================================================================
// Types
// ============================================================================

export interface TicketsTabProps {
  /** Additional CSS classes */
  className?: string
  /** Show compact layout (fewer columns) */
  compact?: boolean
  /** Show archived tickets by default */
  defaultShowArchived?: boolean
  /** Initial status filter */
  defaultStatus?: string[]
  /** Initial agent filter */
  defaultAgents?: string[]
  /** Callback when ticket is clicked */
  onTicketClick?: (ticket: DataTicket) => void
}

interface SelectedTicket {
  id: string
  title: string
  description: string
  status: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee: string
  storyId: string
  createdAt: string
  updatedAt: string
  story?: {
    id: string
    title: string
  }
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_LABELS: Record<string, string> = {
  'backlog': 'Backlog',
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
  'archived': 'Archived',
}

// ============================================================================
// Component
// ============================================================================

export function TicketsTab({
  className,
  compact = false,
  defaultShowArchived = false,
  defaultStatus = [],
  defaultAgents = [],
  onTicketClick,
}: TicketsTabProps) {
  // Get data from hooks
  const { 
    tickets, 
    isLoading, 
    error, 
    statusStats, 
    agentStats 
  } = useTicketsData()
  
  const filter = useTicketsFilter()

  // Modal state
  const [selectedTicket, setSelectedTicket] = React.useState<SelectedTicket | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)

  // Apply filters using context - MUST be called before any conditional returns
  const filteredTickets = React.useMemo(() => {
    return filter.applyFilters(tickets)
  }, [filter, tickets])

  // Get unique agent names for filter dropdown - MUST be called before any conditional returns
  const agentNames = React.useMemo(() => {
    return agentStats
      .map(stat => stat.agentName)
      .filter(name => name && name.trim() !== '')
      .sort()
  }, [agentStats])

  // Group tickets by status for display - MUST be called before any conditional returns
  const ticketsByStatus = React.useMemo(() => {
    const grouped: Record<string, DataTicket[]> = {}
    const statuses = ['backlog', 'todo', 'in-progress', 'review', 'done']
    
    statuses.forEach(status => {
      grouped[status] = filteredTickets.filter(t => t.status === status)
    })
    
    if (filter.showArchived) {
      grouped['archived'] = filteredTickets.filter(t => t.isArchived)
    }
    
    return grouped
  }, [filteredTickets, filter.showArchived])

  // Calculate filtered stats - MUST be called before any conditional returns
  const filteredStats = React.useMemo(() => ({
    total: filteredTickets.length,
    totalAll: tickets.length,
    inProgress: filteredTickets.filter(t => t.status === 'in-progress').length,
    review: filteredTickets.filter(t => t.status === 'review').length,
    done: filteredTickets.filter(t => t.status === 'done').length,
  }), [filteredTickets, tickets.length])

  // Handle ticket click
  const handleTicketClick = React.useCallback((ticket: DataTicket) => {
    const ticketWithDetails: SelectedTicket = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignee: ticket.assignee || 'Unassigned',
      storyId: ticket.storyId,
      createdAt: ticket.createdAt || new Date().toISOString(),
      updatedAt: ticket.updatedAt || new Date().toISOString(),
      story: ticket.storyId ? {
        id: ticket.storyId,
        title: ticket.storyTitle || 'Unknown Story',
      } : undefined,
    }
    
    setSelectedTicket(ticketWithDetails)
    setModalOpen(true)
    onTicketClick?.(ticket)
  }, [onTicketClick])

  // Handle status filter toggle
  const handleStatusChange = React.useCallback((statuses: string[]) => {
    filter.setStatus(statuses as any)
  }, [filter])

  // Handle agent filter toggle  
  const handleAgentChange = React.useCallback((agents: string[]) => {
    filter.setAgents(agents)
  }, [filter])

  // Handle search change
  const handleSearchChange = React.useCallback((text: string) => {
    filter.setSearchText(text)
  }, [filter])

  // Handle archived toggle
  const handleArchivedToggle = React.useCallback(() => {
    filter.toggleShowArchived()
  }, [filter])

  // Handle clear filters
  const handleClearFilters = React.useCallback(() => {
    filter.resetFilters()
  }, [filter])

  // Clear modal state
  const handleCloseModal = React.useCallback(() => {
    setModalOpen(false)
    setSelectedTicket(null)
  }, [])

  // Loading state - AFTER all hooks are called
  if (isLoading && tickets.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-md mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <TicketCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state - AFTER all hooks are called
  if (error) {
    return (
      <Card className={cn('border-destructive', className)}>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Error loading tickets: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="text-muted-foreground">
          {filter.hasActiveFilters 
            ? `Showing ${filteredStats.total} of ${filteredStats.totalAll}`
            : `Total: ${filteredStats.totalAll}`
          }
        </span>
        {filteredStats.inProgress > 0 && (
          <span className="text-warning">• {filteredStats.inProgress} in progress</span>
        )}
        {filteredStats.review > 0 && (
          <span className="text-purple-500">• {filteredStats.review} in review</span>
        )}
        {filteredStats.done > 0 && (
          <span className="text-success">• {filteredStats.done} done</span>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        selectedStatuses={filter.status}
        onStatusChange={handleStatusChange}
        agents={agentNames}
        selectedAgents={filter.agents}
        onAgentChange={handleAgentChange}
        searchValue={filter.searchText}
        onSearchChange={handleSearchChange}
        showArchived={filter.showArchived}
        onArchivedToggle={handleArchivedToggle}
        onClearFilters={handleClearFilters}
        compact={compact}
      />

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {filter.hasActiveFilters 
                ? 'No tickets match the current filters.'
                : 'No tickets available.'}
            </p>
            {filter.hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          'grid gap-4',
          compact 
            ? 'grid-cols-1 md:grid-cols-2' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}>
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={{
                ...ticket,
                assignee: ticket.assignee || 'Unassigned',
                status: ticket.status as any,
                priority: ticket.priority,
              }}
              onClick={() => handleTicketClick(ticket)}
              selected={selectedTicket?.id === ticket.id}
            />
          ))}
        </div>
      )}

      {/* Status Summary Cards */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
          {['backlog', 'todo', 'in-progress', 'review', 'done'].map(status => (
            <Card key={status} className="p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {STATUS_LABELS[status]}
              </div>
              <div className="text-2xl font-bold">
                {ticketsByStatus[status]?.length || 0}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ticket={selectedTicket}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default TicketsTab