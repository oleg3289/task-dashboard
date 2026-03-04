'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import type { Task, TaskStatus } from '@/types/task'

// Status step configuration
const statusSteps: { status: TaskStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Pending', description: 'Task created, waiting to start' },
  { status: 'progress', label: 'In Progress', description: 'Work has begun' },
  { status: 'in-progress', label: 'In Progress', description: 'Work has begun' },
  { status: 'planning', label: 'Planning', description: 'Planning phase' },
  { status: 'completed', label: 'Completed', description: 'Task finished successfully' },
]

// Blocked status configuration
const blockedStep = { status: 'blocked', label: 'Blocked', description: 'Impediment detected' }

// Status Step Props
interface StatusStepProps {
  status: TaskStatus
  label: string
  description: string
  isCurrent: boolean
  isCompleted: boolean
  isBlocked: boolean
  stepNumber: number
  onClick?: () => void
  className?: string
}

function StatusStep({
  status,
  label,
  description,
  isCurrent,
  isCompleted,
  isBlocked,
  stepNumber,
  onClick,
  className,
}: StatusStepProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex flex-col items-center text-center',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        !onClick && 'cursor-default',
        className
      )}
      aria-current={isCurrent ? 'step' : undefined}
    >
      {/* Step Circle */}
      <div
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold border-2 transition-all',
          isCompleted && 'bg-success border-success text-success-foreground',
          isCurrent && !isBlocked && 'bg-info border-info text-info-foreground ring-4 ring-info/20',
          isCurrent && isBlocked && 'bg-destructive border-destructive text-destructive-foreground ring-4 ring-destructive/20',
          !isCompleted && !isCurrent && 'bg-muted border-muted-foreground/30 text-muted-foreground'
        )}
      >
        {isCompleted ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          stepNumber
        )}
        
        {/* Blocked indicator */}
        {isBlocked && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            !
          </span>
        )}
      </div>
      
      {/* Step Label */}
      <div className="mt-2">
        <div className={cn(
          'text-sm font-medium',
          isCurrent && 'text-foreground',
          isCompleted && 'text-success',
          !isCompleted && !isCurrent && 'text-muted-foreground'
        )}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">
          {description}
        </div>
      </div>
    </button>
  )
}

// Status Connector Props
interface StatusConnectorProps {
  isCompleted: boolean
  isActive: boolean
  className?: string
}

function StatusConnector({ isCompleted, isActive, className }: StatusConnectorProps) {
  return (
    <div className={cn('flex-1 h-0.5 mx-2', className)}>
      <div
        className={cn(
          'h-full transition-all',
          isCompleted && 'bg-success',
          isActive && 'bg-info',
          !isCompleted && !isActive && 'bg-muted-foreground/30'
        )}
      />
    </div>
  )
}

// Task Status Tracker Props
interface TaskStatusTrackerProps {
  task: Task
  onStatusChange?: (status: TaskStatus) => void
  showLabels?: boolean
  className?: string
}

export function TaskStatusTracker({
  task,
  onStatusChange,
  showLabels = true,
  className,
}: TaskStatusTrackerProps) {
  const statusIndex = task.status === 'blocked' 
    ? 1 // Blocked shows at progress position
    : statusSteps.findIndex(s => s.status === task.status)
  
  const isCompleted = task.status === 'completed'
  const isBlocked = task.status === 'blocked'

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const stepNumber = index + 1
          const isStepCompleted = isCompleted || index < statusIndex
          const isStepCurrent = !isCompleted && index === statusIndex
          const isStepBlocked = isBlocked && index === 1

          return (
            <React.Fragment key={step.status}>
              <StatusStep
                status={step.status}
                label={step.label}
                description={step.description}
                isCurrent={isStepCurrent || isStepBlocked}
                isCompleted={isStepCompleted}
                isBlocked={isStepBlocked}
                stepNumber={stepNumber}
                onClick={onStatusChange && !isStepCompleted ? () => onStatusChange(step.status) : undefined}
              />
              {index < statusSteps.length - 1 && (
                <StatusConnector
                  isCompleted={isCompleted || index < statusIndex}
                  isActive={!isCompleted && !isBlocked && index === statusIndex - 1}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Blocked status indicator */}
      {isBlocked && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium text-destructive">Task is blocked</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            This task cannot proceed until blockers are resolved.
          </p>
        </div>
      )}
    </div>
  )
}

// Compact Status Progress Bar
interface StatusProgressBarProps {
  task: Task
  className?: string
}

export function StatusProgressBar({ task, className }: StatusProgressBarProps) {
  const progressMap: Record<TaskStatus, number> = {
    pending: 0,
    progress: 50,
    'in-progress': 50,
    planning: 25,
    blocked: 50,
    completed: 100,
  }
  
  const progress = progressMap[task.status]
  const isBlocked = task.status === 'blocked'
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">Progress</span>
        <span className={cn(
          'text-sm font-medium',
          isBlocked ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {progress}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isBlocked ? 'bg-destructive' : 'bg-success'
          )}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Task progress: ${progress}%`}
        />
      </div>
    </div>
  )
}

// Status Change Buttons
interface StatusChangeButtonsProps {
  task: Task
  onStatusChange: (status: TaskStatus) => void
  className?: string
}

export function StatusChangeButtons({
  task,
  onStatusChange,
  className,
}: StatusChangeButtonsProps) {
  const transitions: Record<TaskStatus, { next?: TaskStatus; label: string; icon: React.ReactNode }[]> = {
    pending: [
      { next: 'progress', label: 'Start Work', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )},
    ],
    progress: [
      { next: 'completed', label: 'Complete', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )},
      { next: 'blocked', label: 'Block', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )},
    ],
    'in-progress': [
      { next: 'completed', label: 'Complete', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )},
      { next: 'blocked', label: 'Block', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )},
    ],
    planning: [
      { next: 'progress', label: 'Start Work', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )},
    ],
    blocked: [
      { next: 'progress', label: 'Unblock', icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )},
    ],
    completed: [],
  }
  
  const availableTransitions = transitions[task.status]
  
  if (availableTransitions.length === 0) {
    return null
  }
  
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {availableTransitions.map((transition) => (
        <button
          key={transition.next}
          onClick={() => transition.next && onStatusChange(transition.next)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
            'transition-colors focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            transition.next === 'completed' && 'bg-success/10 text-success hover:bg-success/20',
            transition.next === 'blocked' && 'bg-destructive/10 text-destructive hover:bg-destructive/20',
            transition.next === 'progress' && 'bg-info/10 text-info hover:bg-info/20',
          )}
        >
          {transition.icon}
          {transition.label}
        </button>
      ))}
    </div>
  )
}

// Status History Timeline
interface StatusHistoryEntry {
  status: TaskStatus
  timestamp: string
  changedBy?: string
  reason?: string
}

interface StatusHistoryProps {
  history: StatusHistoryEntry[]
  className?: string
}

export function StatusHistory({ history, className }: StatusHistoryProps) {
  const statusLabels: Record<TaskStatus, string> = {
    pending: 'Pending',
    progress: 'In Progress',
    'in-progress': 'In Progress',
    completed: 'Completed',
    blocked: 'Blocked',
    planning: 'Planning',
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-foreground">Status History</h4>
      <div className="relative pl-6 space-y-4">
        {history.map((entry, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute left-[-1.5rem] top-1.5 w-3 h-3 rounded-full bg-muted-foreground/30" />
            {/* Timeline connector */}
            {index < history.length - 1 && (
              <div className="absolute left-[-1.125rem] top-4 w-0.5 h-4 bg-muted-foreground/20" />
            )}
            {/* Content */}
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {statusLabels[entry.status]}
                </Badge>
                <span className="text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              {entry.changedBy && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  by {entry.changedBy}
                </p>
              )}
              {entry.reason && (
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.reason}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}