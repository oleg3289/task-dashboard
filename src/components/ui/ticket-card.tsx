'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import type { Ticket, TaskPriority } from '@/types/task'

// Ticket status configuration for badge colors
// Status colors: backlog(gray), todo(blue), in-progress(yellow), review(purple), done(green), archived(dim)
const ticketStatusConfig: Record<string, { 
  label: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'
  dotColor: string
}> = {
  backlog: { label: 'Backlog', badgeVariant: 'secondary', dotColor: 'bg-muted-foreground/50' },
  todo: { label: 'To Do', badgeVariant: 'info', dotColor: 'bg-info' },
  'in-progress': { label: 'In Progress', badgeVariant: 'warning', dotColor: 'bg-warning' },
  review: { label: 'Review', badgeVariant: 'outline', dotColor: 'bg-purple-500' },
  done: { label: 'Done', badgeVariant: 'success', dotColor: 'bg-success' },
  archived: { label: 'Archived', badgeVariant: 'secondary', dotColor: 'bg-muted-foreground/30' },
}

// Priority configuration
const priorityConfig: Record<TaskPriority, { label: string; dotClass: string; order: number }> = {
  low: { label: 'Low', dotClass: 'bg-muted-foreground', order: 1 },
  medium: { label: 'Medium', dotClass: 'bg-info', order: 2 },
  high: { label: 'High', dotClass: 'bg-warning', order: 3 },
  critical: { label: 'Critical', dotClass: 'bg-destructive animate-pulse', order: 4 },
}

// Ticket card container variants
const ticketCardVariants = cva(
  'rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-md cursor-pointer',
  {
    variants: {
      status: {
        backlog: 'border-l-4 border-l-muted-foreground/30',
        todo: 'border-l-4 border-l-info',
        'in-progress': 'border-l-4 border-l-warning',
        review: 'border-l-4 border-l-purple-500',
        done: 'border-l-4 border-l-success opacity-75',
        archived: 'border-l-4 border-l-muted-foreground/20 opacity-50',
      },
      selected: {
        true: 'ring-2 ring-primary ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      status: 'backlog',
      selected: false,
    },
  }
)

// Priority dot component
export function PriorityIndicator({ 
  priority, 
  className 
}: { priority: TaskPriority; className?: string }) {
  const config = priorityConfig[priority]
  return (
    <span 
      className={cn('w-2 h-2 rounded-full', config.dotClass, className)} 
      title={`${config.label} priority`}
    />
  )
}

// Status dot component
export function StatusIndicator({ 
  status, 
  className 
}: { status: string; className?: string }) {
  const config = ticketStatusConfig[status] || ticketStatusConfig.backlog
  return (
    <span 
      className={cn('w-2 h-2 rounded-full', config.dotColor, className)} 
      title={config.label}
    />
  )
}

// Avatar component for assignee
function AssigneeAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-red-500', 'bg-orange-500', 'bg-teal-500'
  ]
  
  // Generate consistent color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  
  return (
    <div 
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white',
        colors[colorIndex],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  )
}

// Ticket Card Props
export interface TicketCardProps extends VariantProps<typeof ticketCardVariants> {
  ticket: Ticket & {
    updatedAt?: string
    createdAt?: string
  }
  selected?: boolean
  compact?: boolean
  showAssignee?: boolean
  showTimestamps?: boolean
  onClick?: () => void
  className?: string
}

// Ticket Card Component
export function TicketCard({
  ticket,
  selected = false,
  compact = false,
  showAssignee = true,
  showTimestamps = true,
  onClick,
  className,
}: TicketCardProps) {
  const statusInfo = ticketStatusConfig[ticket.status] || ticketStatusConfig.backlog
  const priorityInfo = priorityConfig[ticket.priority]

  if (compact) {
    return (
      <div
        className={cn(
          ticketCardVariants({ status: ticket.status as any, selected }),
          'flex items-center gap-3 py-2 px-3',
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        <PriorityIndicator priority={ticket.priority} />
        <span className="flex-1 truncate text-sm font-medium">{ticket.title}</span>
        <Badge variant={statusInfo.badgeVariant} className="text-xs shrink-0">
          {statusInfo.label}
        </Badge>
      </div>
    )
  }

  return (
    <div
      className={cn(
        ticketCardVariants({ status: ticket.status as any, selected }),
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Header: Priority + Title + Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <PriorityIndicator priority={ticket.priority} />
          <h3 className="font-medium text-foreground truncate">{ticket.title}</h3>
        </div>
        <Badge variant={statusInfo.badgeVariant} className="shrink-0">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {ticket.description}
        </p>
      )}

      {/* Meta Row: Assignee + Timestamps */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {showAssignee && ticket.assignee && (
          <div className="flex items-center gap-1.5">
            <AssigneeAvatar name={ticket.assignee} className="w-5 h-5 text-[10px]" />
            <span>{ticket.assignee}</span>
          </div>
        )}
        
        {showTimestamps && ticket.createdAt && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Ticket Card Skeleton for loading state
export function TicketCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-lg border bg-card p-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="h-4 bg-muted rounded w-32 flex-1" />
          <div className="h-5 bg-muted rounded w-16" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="h-5 bg-muted rounded w-40" />
        </div>
        <div className="h-5 bg-muted rounded w-20" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
      <div className="flex gap-3">
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-24" />
      </div>
    </div>
  )
}

export { ticketCardVariants }