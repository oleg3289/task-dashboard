'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'

// ============================================================================
// Types
// ============================================================================

export interface StoryTicket {
  id: string
  title: string
  description?: string
  assignee?: string
  status: string
  priority: string
  storyId: string
  sprint?: number
  estimate?: string
  dependencies?: string[]
  completedAt?: string
  completedBy?: string
  resolution?: string
  resolutionNote?: string
}

export interface Story {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  assignee: string
  createdAt: string
  updatedAt: string
  tickets: StoryTicket[]
}

export interface StoriesTabProps {
  className?: string
  stories: Story[]
  onTicketClick?: (ticket: StoryTicket) => void
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<string, string> = {
  'todo': 'bg-blue-500/20 text-blue-600',
  'in-progress': 'bg-yellow-500/20 text-yellow-600',
  'review': 'bg-purple-500/20 text-purple-600',
  'done': 'bg-green-500/20 text-green-600',
  'backlog': 'bg-gray-500/20 text-gray-600',
}

const PRIORITY_COLORS: Record<string, string> = {
  'critical': 'bg-red-500/20 text-red-600',
  'high': 'bg-orange-500/20 text-orange-600',
  'medium': 'bg-yellow-500/20 text-yellow-600',
  'low': 'bg-gray-500/20 text-gray-600',
}

// ============================================================================
// Component
// ============================================================================

export function StoriesTab({
  className,
  stories,
  onTicketClick,
}: StoriesTabProps) {
  const [expandedStory, setExpandedStory] = React.useState<string | null>(null)

  const toggleStory = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId)
  }

  // Calculate progress for each story
  const getStoryProgress = (story: Story) => {
    const total = story.tickets?.length || 0
    if (total === 0) return { total: 0, done: 0, percent: 0 }
    
    const done = story.tickets.filter(t => t.status === 'done').length
    const inProgress = story.tickets.filter(t => t.status === 'in-progress').length
    const review = story.tickets.filter(t => t.status === 'review').length
    const todo = story.tickets.filter(t => t.status === 'todo').length
    const backlog = story.tickets.filter(t => t.status === 'backlog').length
    
    return {
      total,
      done,
      inProgress,
      review,
      todo,
      backlog,
      percent: Math.round((done / total) * 100),
    }
  }

  if (stories.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No stories available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stories List */}
      {stories.map((story) => {
        const progress = getStoryProgress(story)
        const isExpanded = expandedStory === story.id

        return (
          <Card 
            key={story.id} 
            className={cn(
              'cursor-pointer transition-all',
              isExpanded && 'ring-2 ring-primary/50'
            )}
          >
            <CardHeader 
              className="pb-3"
              onClick={() => toggleStory(story.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {story.id}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {story.type}
                    </Badge>
                    <Badge className={cn('text-xs', PRIORITY_COLORS[story.priority] || PRIORITY_COLORS.medium)}>
                      {story.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{story.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {story.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold">{progress.percent}%</div>
                  <div className="text-xs text-muted-foreground">
                    {progress.done}/{progress.total} done
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  {progress.done > 0 && (
                    <div 
                      className="bg-green-500 h-full" 
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                      title={`Done: ${progress.done}`}
                    />
                  )}
                  {progress.inProgress > 0 && (
                    <div 
                      className="bg-yellow-500 h-full" 
                      style={{ width: `${(progress.inProgress / progress.total) * 100}%` }}
                      title={`In Progress: ${progress.inProgress}`}
                    />
                  )}
                  {progress.review > 0 && (
                    <div 
                      className="bg-purple-500 h-full" 
                      style={{ width: `${(progress.review / progress.total) * 100}%` }}
                      title={`Review: ${progress.review}`}
                    />
                  )}
                </div>
              </div>

              {/* Ticket Summary */}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {progress.done} done
                </span>
                {progress.inProgress > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {progress.inProgress} in progress
                  </span>
                )}
                {progress.review > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    {progress.review} review
                  </span>
                )}
                {progress.todo > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {progress.todo} to do
                  </span>
                )}
                <span className="ml-auto">
                  {isExpanded ? '▼ Click to collapse' : '▶ Click to expand'}
                </span>
              </div>
            </CardHeader>

            {/* Expanded Ticket List */}
            {isExpanded && story.tickets && story.tickets.length > 0 && (
              <CardContent className="pt-0">
                <div className="border-t pt-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">Tickets</h4>
                    <span className="text-xs text-muted-foreground">
                      {progress.total} tickets
                    </span>
                  </div>
                  <div className="space-y-2">
                    {story.tickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onTicketClick?.(ticket)
                        }}
                        className={cn(
                          'flex items-start justify-between gap-3 p-3 rounded-lg',
                          'bg-muted/50 hover:bg-muted cursor-pointer transition-colors'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono">
                              {ticket.id}
                            </span>
                            <Badge className={cn('text-xs', STATUS_COLORS[ticket.status] || STATUS_COLORS.todo)}>
                              {ticket.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mt-1 truncate">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Assignee: {ticket.assignee || 'Unassigned'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">
                          Sprint {ticket.sprint || '?'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default StoriesTab