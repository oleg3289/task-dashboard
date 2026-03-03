'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { TaskStatus, TaskPriority } from '@/types/task'

// Status dot indicator - small colored dot
const statusDotVariants = cva(
  'relative inline-flex h-2.5 w-2.5 rounded-full',
  {
    variants: {
      status: {
        pending: 'bg-muted-foreground',
        progress: 'bg-info animate-pulse',
        completed: 'bg-success',
        blocked: 'bg-destructive',
      },
      size: {
        sm: 'h-1.5 w-1.5',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  }
)

// Animated ring around the dot for active states
const statusRingVariants = cva(
  'absolute inset-0 rounded-full animate-ping',
  {
    variants: {
      status: {
        pending: '',
        progress: 'bg-info/40',
        completed: '',
        blocked: 'bg-destructive/40',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

// Status pill variant
const statusPillVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
  {
    variants: {
      status: {
        pending: 'bg-muted text-muted-foreground',
        progress: 'bg-info/10 text-info border border-info/20',
        completed: 'bg-success/10 text-success border border-success/20',
        blocked: 'bg-destructive/10 text-destructive border border-destructive/20',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

// Progress bar for task completion
const progressBarVariants = cva(
  'h-2 rounded-full overflow-hidden bg-muted',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const progressFillVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Status Dot Component
export interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
  showRing?: boolean
  className?: string
}

export function StatusDot({ 
  status, 
  size = 'md',
  showRing = false, 
  className 
}: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      {showRing && status === 'progress' && (
        <span className={statusRingVariants({ status })} />
      )}
      <span className={statusDotVariants({ status, size })} />
    </span>
  )
}

// Status Pill Component
export interface StatusPillProps extends VariantProps<typeof statusPillVariants> {
  label?: string
  showIcon?: boolean
  className?: string
}

export function StatusPill({ 
  status, 
  label,
  showIcon = true,
  className 
}: StatusPillProps) {
  const labels: Record<TaskStatus, string> = {
    pending: 'Pending',
    progress: 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked',
  }

  return (
    <span className={cn(statusPillVariants({ status }), className)}>
      {showIcon && <StatusDot status={status} size="sm" />}
      {label ?? labels[status ?? 'pending']}
    </span>
  )
}

// Progress Bar Component
export interface ProgressBarProps extends VariantProps<typeof progressBarVariants> {
  value: number
  max?: number
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  // Auto-determine variant based on percentage
  const autoVariant = variant ?? (
    percentage >= 100 ? 'success' :
    percentage >= 70 ? 'default' :
    percentage >= 30 ? 'warning' :
    'danger'
  )

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
          <span>{label}</span>
          {showLabel && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={progressBarVariants({ size })}>
        <div 
          className={progressFillVariants({ variant: autoVariant })}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

// Circular Progress Component
export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  showValue = true,
  variant = 'default',
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colors = {
    default: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    danger: 'stroke-destructive',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors[variant]}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      {showValue && (
        <span className="absolute text-xs font-medium text-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

// Status Summary Component
export interface StatusSummaryProps {
  counts: {
    pending: number
    progress: number
    completed: number
    blocked: number
  }
  showLabels?: boolean
  className?: string
}

export function StatusSummary({ 
  counts, 
  showLabels = true,
  className 
}: StatusSummaryProps) {
  const total = counts.pending + counts.progress + counts.completed + counts.blocked
  
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-1.5">
        <StatusDot status="pending" />
        {showLabels && <span className="text-xs text-muted-foreground">{counts.pending} pending</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <StatusDot status="progress" showRing />
        {showLabels && <span className="text-xs text-muted-foreground">{counts.progress} in progress</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <StatusDot status="completed" />
        {showLabels && <span className="text-xs text-muted-foreground">{counts.completed} completed</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <StatusDot status="blocked" />
        {showLabels && <span className="text-xs text-muted-foreground">{counts.blocked} blocked</span>}
      </div>
    </div>
  )
}

// Export all variants
export { 
  statusDotVariants, 
  statusPillVariants, 
  progressBarVariants, 
  progressFillVariants 
}