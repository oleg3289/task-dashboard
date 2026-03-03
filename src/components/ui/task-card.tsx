'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import type { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types/task'

// Task status indicator styles
const taskStatusVariants = cva(
  'flex items-center gap-2 text-sm font-medium',
  {
    variants: {
      status: {
        pending: 'text-muted-foreground',
        progress: 'text-info',
        completed: 'text-success',
        blocked: 'text-destructive',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

// Priority indicator styles
const priorityVariants = cva(
  'w-1.5 h-1.5 rounded-full',
  {
    variants: {
      priority: {
        low: 'bg-muted-foreground',
        medium: 'bg-info',
        high: 'bg-warning',
        critical: 'bg-destructive animate-pulse',
      },
    },
    defaultVariants: {
      priority: 'medium',
    },
  }
)

// Task card container styles
const taskCardVariants = cva(
  'rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-md',
  {
    variants: {
      status: {
        pending: 'border-l-4 border-l-muted-foreground/30',
        progress: 'border-l-4 border-l-info',
        completed: 'border-l-4 border-l-success opacity-75',
        blocked: 'border-l-4 border-l-destructive',
      },
      selected: {
        true: 'ring-2 ring-primary ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      status: 'pending',
      selected: false,
    },
  }
)

// Category badge variants
const categoryVariants: Record<TaskCategory, "default" | "secondary" | "outline"> = {
  development: 'default',
  research: 'secondary',
  design: 'outline',
  testing: 'secondary',
  documentation: 'outline',
  planning: 'secondary',
  monitoring: 'outline',
}

// Status display configuration
const statusConfig: Record<TaskStatus, { label: string; badgeVariant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" }> = {
  pending: { label: 'Pending', badgeVariant: 'secondary' },
  progress: { label: 'In Progress', badgeVariant: 'info' },
  completed: { label: 'Completed', badgeVariant: 'success' },
  blocked: { label: 'Blocked', badgeVariant: 'destructive' },
}

// Priority display configuration
const priorityConfig: Record<TaskPriority, { label: string; dotClass: string }> = {
  low: { label: 'Low', dotClass: 'bg-muted-foreground' },
  medium: { label: 'Medium', dotClass: 'bg-info' },
  high: { label: 'High', dotClass: 'bg-warning' },
  critical: { label: 'Critical', dotClass: 'bg-destructive animate-pulse' },
}

// Status Icon Component
export function TaskStatusIcon({ 
  status, 
  className 
}: { status: TaskStatus; className?: string }) {
  return (
    <span className={cn(taskStatusVariants({ status }), className)}>
      {status === 'pending' && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="4 2" />
        </svg>
      )}
      {status === 'progress' && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 0116 0" />
        </svg>
      )}
      {status === 'completed' && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'blocked' && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" />
        </svg>
      )}
    </span>
  )
}

// Priority Dot Component
export function PriorityDot({ 
  priority, 
  className 
}: { priority: TaskPriority; className?: string }) {
  return (
    <span className={cn(priorityVariants({ priority }), className)} />
  )
}

// Task Card Props
export interface TaskCardProps extends VariantProps<typeof taskCardVariants> {
  task: Task
  selected?: boolean
  compact?: boolean
  showAssignee?: boolean
  showDueDate?: boolean
  showCategory?: boolean
  onClick?: () => void
  className?: string
}

// Task Card Component
export function TaskCard({
  task,
  selected = false,
  compact = false,
  showAssignee = true,
  showDueDate = true,
  showCategory = true,
  onClick,
  className,
}: TaskCardProps) {
  const statusInfo = statusConfig[task.status]
  const priorityInfo = priorityConfig[task.priority]

  if (compact) {
    return (
      <div
        className={cn(
          taskCardVariants({ status: task.status, selected }),
          'flex items-center gap-3 cursor-pointer',
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        <PriorityDot priority={task.priority} />
        <span className="flex-1 truncate text-sm font-medium">{task.title}</span>
        <Badge variant={statusInfo.badgeVariant} className="text-xs">
          {statusInfo.label}
        </Badge>
      </div>
    )
  }

  return (
    <div
      className={cn(
        taskCardVariants({ status: task.status, selected }),
        'cursor-pointer',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Header: Title + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <PriorityDot priority={task.priority} />
          <h3 className="font-medium text-foreground truncate">{task.title}</h3>
        </div>
        <Badge variant={statusInfo.badgeVariant} className="shrink-0">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Meta Row: Category, Assignee, Due Date */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {showCategory && (
          <Badge variant={categoryVariants[task.category]} className="text-xs">
            {task.category}
          </Badge>
        )}
        
        {showAssignee && task.assignee && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{task.assignee}</span>
          </div>
        )}
        
        {showDueDate && task.dueDate && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Dependencies indicator */}
      {task.dependencies && task.dependencies.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>{task.dependencies.length} dependenc{task.dependencies.length === 1 ? 'y' : 'ies'}</span>
        </div>
      )}
    </div>
  )
}

// Task Card Skeleton for loading state
export function TaskCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-5 bg-muted rounded w-16 ml-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <div className="h-5 bg-muted rounded w-40" />
        </div>
        <div className="h-5 bg-muted rounded w-20" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 bg-muted rounded w-16" />
        <div className="h-4 bg-muted rounded w-20" />
        <div className="h-4 bg-muted rounded w-24" />
      </div>
    </div>
  )
}

// Export variants for use in other components
export { taskCardVariants, taskStatusVariants, priorityVariants }