'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Button } from './button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './dialog'
import type { Ticket, TaskPriority } from '@/types/task'

// Status configuration
const ticketStatusConfig: Record<string, { 
  label: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'
  description: string
}> = {
  backlog: { label: 'Backlog', badgeVariant: 'secondary', description: 'Not yet started' },
  todo: { label: 'To Do', badgeVariant: 'info', description: 'Ready to be picked up' },
  'in-progress': { label: 'In Progress', badgeVariant: 'warning', description: 'Currently being worked on' },
  review: { label: 'Review', badgeVariant: 'outline', description: 'Awaiting review' },
  done: { label: 'Done', badgeVariant: 'success', description: 'Completed' },
  archived: { label: 'Archived', badgeVariant: 'secondary', description: 'No longer active' },
}

// Priority configuration
const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-info' },
  high: { label: 'High', color: 'text-warning' },
  critical: { label: 'Critical', color: 'text-destructive' },
}

// Assignment history entry type (extends the one from types for full modal display)
export interface AssignmentHistoryDisplay {
  id: string
  assignee: string
  assignedBy?: string
  assignedAt: string
  unassignedAt?: string
  reason?: string
}

// Extended ticket type for detail modal
export interface TicketDetail extends Ticket {
  createdAt: string
  updatedAt: string
  story?: {
    id: string
    title: string
  }
  assignmentHistory?: AssignmentHistoryDisplay[]
}

// Avatar component for assignee
function AssigneeAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
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
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  }
  
  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        colors[colorIndex],
        sizeClasses[size]
      )}
      title={name}
    >
      {initials}
    </div>
  )
}

// Priority dot
function PriorityIndicator({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority]
  const dotColors = {
    low: 'bg-muted-foreground',
    medium: 'bg-info',
    high: 'bg-warning',
    critical: 'bg-destructive animate-pulse'
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className={cn('w-2 h-2 rounded-full', dotColors[priority])} />
      <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
    </div>
  )
}

// Ticket Detail Modal Props
export interface TicketDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: TicketDetail | null
  onClose?: () => void
}

// Ticket Detail Modal Component
export function TicketDetailModal({
  open,
  onOpenChange,
  ticket,
  onClose,
}: TicketDetailModalProps) {
  if (!ticket) return null

  const statusInfo = ticketStatusConfig[ticket.status] || ticketStatusConfig.backlog

  const handleClose = () => {
    onOpenChange(false)
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{ticket.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusInfo.badgeVariant}>{statusInfo.label}</Badge>
                <PriorityIndicator priority={ticket.priority} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {ticket.id}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {ticket.description || 'No description provided.'}
            </p>
          </div>

          {/* Assignment Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Assignee</h4>
            <div className="flex items-center gap-3">
              <AssigneeAvatar name={ticket.assignee} size="md" />
              <div>
                <p className="font-medium">{ticket.assignee}</p>
                <p className="text-xs text-muted-foreground">Current assignee</p>
              </div>
            </div>
          </div>

          {/* Assignment History */}
          {ticket.assignmentHistory && ticket.assignmentHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Assignment History</h4>
              <div className="space-y-3">
                {ticket.assignmentHistory.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="flex flex-col items-center">
                      <AssigneeAvatar name={entry.assignee} size="sm" />
                      {index < ticket.assignmentHistory!.length - 1 && (
                        <div className="w-px h-4 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.assignee}</span>
                        {entry.unassignedAt && (
                          <span className="text-xs text-muted-foreground">(unassigned)</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Assigned {new Date(entry.assignedAt).toLocaleDateString()}
                        {entry.assignedBy && ` by ${entry.assignedBy}`}
                      </p>
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {entry.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Story */}
          {ticket.story && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Related Story</h4>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ticket.story.title}</p>
                  <p className="text-xs text-muted-foreground">{ticket.story.id}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogDescription className="sr-only">
            Ticket detail modal showing information for {ticket.title}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TicketDetailModal