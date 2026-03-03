'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'
import { CircularProgress, ProgressBar } from './status-indicator'
import type { Agent, Task, WorkloadMetrics } from '@/types/task'

// Utility to calculate workload metrics
function calculateWorkloadMetrics(agents: Agent[], tasks: Task[]): WorkloadMetrics[] {
  return agents.map(agent => {
    const agentTasks = tasks.filter(t => t.assignee === agent.name)
    const activeTasks = agentTasks.filter(t => t.status !== 'completed')
    
    return {
      agentName: agent.name,
      totalTasks: agentTasks.length,
      pendingTasks: agentTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: agentTasks.filter(t => t.status === 'progress').length,
      completedTasks: agentTasks.filter(t => t.status === 'completed').length,
      blockedTasks: agentTasks.filter(t => t.status === 'blocked').length,
      workloadPercentage: Math.min(100, activeTasks.length * 20), // 20% per active task
    }
  })
}

// Workload Bar Chart
interface WorkloadBarChartProps {
  metrics: WorkloadMetrics[]
  onSelectAgent?: (agentName: string) => void
  selectedAgent?: string
  className?: string
}

export function WorkloadBarChart({
  metrics,
  onSelectAgent,
  selectedAgent,
  className,
}: WorkloadBarChartProps) {
  const maxTasks = Math.max(...metrics.map(m => m.totalTasks), 1)
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Task Distribution</h3>
        <span className="text-xs text-muted-foreground">
          {metrics.reduce((sum, m) => sum + m.totalTasks, 0)} total tasks
        </span>
      </div>
      
      <div className="space-y-3">
        {metrics.map((metric) => (
          <button
            key={metric.agentName}
            onClick={() => onSelectAgent?.(metric.agentName)}
            className={cn(
              'w-full text-left p-3 rounded-lg border transition-all',
              'hover:bg-accent/50',
              selectedAgent === metric.agentName 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border'
            )}
            aria-pressed={selectedAgent === metric.agentName}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{metric.agentName}</span>
                <Badge variant="secondary" className="text-xs">
                  {metric.totalTasks} tasks
                </Badge>
              </div>
              <span className={cn(
                'text-sm font-medium',
                metric.workloadPercentage >= 80 ? 'text-destructive' :
                metric.workloadPercentage >= 50 ? 'text-warning' :
                'text-success'
              )}>
                {metric.workloadPercentage}%
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    metric.workloadPercentage >= 80 ? 'bg-destructive' :
                    metric.workloadPercentage >= 50 ? 'bg-warning' :
                    'bg-success'
                  )}
                  style={{ width: `${metric.workloadPercentage}%` }}
                />
              </div>
              
              {/* Task breakdown */}
              <div className="flex gap-1 text-xs">
                {metric.pendingTasks > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground">
                    {metric.pendingTasks} pending
                  </span>
                )}
                {metric.inProgressTasks > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-info/10 text-info">
                    {metric.inProgressTasks} active
                  </span>
                )}
                {metric.blockedTasks > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                    {metric.blockedTasks} blocked
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Status Distribution Pie Chart (CSS-based)
interface StatusDistributionProps {
  tasks: Task[]
  className?: string
}

export function StatusDistribution({ tasks, className }: StatusDistributionProps) {
  const counts = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  
  const total = tasks.length
  const pending = counts['pending'] || 0
  const progress = counts['progress'] || 0
  const completed = counts['completed'] || 0
  const blocked = counts['blocked'] || 0
  
  // Calculate angles for conic gradient
  const pendingEnd = (pending / total) * 360
  const progressEnd = pendingEnd + (progress / total) * 360
  const completedEnd = progressEnd + (completed / total) * 360
  
  const gradient = total > 0
    ? `conic-gradient(
      hsl(var(--muted-foreground)) 0deg ${pendingEnd}deg,
      hsl(var(--info)) ${pendingEnd}deg ${progressEnd}deg,
      hsl(var(--success)) ${progressEnd}deg ${completedEnd}deg,
      hsl(var(--destructive)) ${completedEnd}deg 360deg
    )`
    : 'conic-gradient(hsl(var(--muted)) 0deg 360deg)'
  
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {/* Pie chart */}
      <div 
        className="relative w-32 h-32 rounded-full"
        style={{ background: gradient }}
        role="img"
        aria-label={`Task status distribution: ${pending} pending, ${progress} in progress, ${completed} completed, ${blocked} blocked`}
      >
        <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground">Tasks</div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-muted-foreground" />
          <span className="text-sm text-muted-foreground">Pending</span>
          <span className="text-sm font-medium text-foreground ml-auto">{pending}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-info" />
          <span className="text-sm text-muted-foreground">In Progress</span>
          <span className="text-sm font-medium text-foreground ml-auto">{progress}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Completed</span>
          <span className="text-sm font-medium text-foreground ml-auto">{completed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Blocked</span>
          <span className="text-sm font-medium text-foreground ml-auto">{blocked}</span>
        </div>
      </div>
    </div>
  )
}

// Workload Grid - Visual grid showing workload per agent
interface WorkloadGridProps {
  agents: Agent[]
  tasks: Task[]
  onSelectAgent?: (agentName: string) => void
  selectedAgent?: string
  className?: string
}

export function WorkloadGrid({
  agents,
  tasks,
  onSelectAgent,
  selectedAgent,
  className,
}: WorkloadGridProps) {
  const metrics = calculateWorkloadMetrics(agents, tasks)
  
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {metrics.map((metric) => (
        <button
          key={metric.agentName}
          onClick={() => onSelectAgent?.(metric.agentName)}
          className={cn(
            'p-4 rounded-lg border text-left transition-all',
            'hover:bg-accent/50',
            selectedAgent === metric.agentName
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : 'border-border'
          )}
          aria-pressed={selectedAgent === metric.agentName}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-foreground">{metric.agentName}</span>
            <CircularProgress
              value={metric.workloadPercentage}
              size={48}
              strokeWidth={4}
              variant={
                metric.workloadPercentage >= 80 ? 'danger' :
                metric.workloadPercentage >= 50 ? 'warning' : 'default'
              }
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-1.5 rounded bg-muted-foreground/10">
              <div className="font-medium text-foreground">{metric.pendingTasks}</div>
              <div className="text-muted-foreground">Pending</div>
            </div>
            <div className="p-1.5 rounded bg-info/10">
              <div className="font-medium text-info">{metric.inProgressTasks}</div>
              <div className="text-muted-foreground">Active</div>
            </div>
            <div className="p-1.5 rounded bg-success/10">
              <div className="font-medium text-success">{metric.completedTasks}</div>
              <div className="text-muted-foreground">Done</div>
            </div>
            <div className="p-1.5 rounded bg-destructive/10">
              <div className="font-medium text-destructive">{metric.blockedTasks}</div>
              <div className="text-muted-foreground">Blocked</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// Team Workload Summary Card
interface TeamWorkloadCardProps {
  agents: Agent[]
  tasks: Task[]
  className?: string
}

export function TeamWorkloadCard({ agents, tasks, className }: TeamWorkloadCardProps) {
  const metrics = calculateWorkloadMetrics(agents, tasks)
  
  const stats = metrics.reduce(
    (acc, m) => {
      acc.totalTasks += m.totalTasks
      acc.pendingTasks += m.pendingTasks
      acc.inProgressTasks += m.inProgressTasks
      acc.completedTasks += m.completedTasks
      acc.blockedTasks += m.blockedTasks
      acc.avgWorkload += m.workloadPercentage
      if (m.workloadPercentage > 80) acc.overloadedAgents++
      if (m.totalTasks === 0) acc.idleAgents++
      return acc
    },
    {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      blockedTasks: 0,
      avgWorkload: 0,
      overloadedAgents: 0,
      idleAgents: 0,
    }
  )
  
  stats.avgWorkload = metrics.length > 0 ? Math.round(stats.avgWorkload / metrics.length) : 0
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Team Workload</CardTitle>
        <CardDescription>
          {agents.length} agents • {stats.totalTasks} tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Workload */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Average Workload</span>
            <span className={cn(
              'font-medium',
              stats.avgWorkload >= 80 ? 'text-destructive' :
              stats.avgWorkload >= 50 ? 'text-warning' : 'text-success'
            )}>
              {stats.avgWorkload}%
            </span>
          </div>
          <ProgressBar 
            value={stats.avgWorkload} 
            variant={
              stats.avgWorkload >= 80 ? 'danger' :
              stats.avgWorkload >= 50 ? 'warning' : 'default'
            }
          />
        </div>
        
        {/* Status Breakdown */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-foreground">{stats.pendingTasks}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div>
            <div className="text-xl font-bold text-info">{stats.inProgressTasks}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div>
            <div className="text-xl font-bold text-success">{stats.completedTasks}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-xl font-bold text-destructive">{stats.blockedTasks}</div>
            <div className="text-xs text-muted-foreground">Blocked</div>
          </div>
        </div>
        
        {/* Agent Status */}
        <div className="flex gap-4 text-sm">
          {stats.overloadedAgents > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">
                {stats.overloadedAgents} overloaded
              </span>
            </div>
          )}
          {stats.idleAgents > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">
                {stats.idleAgents} idle
              </span>
            </div>
          )}
          {stats.overloadedAgents === 0 && stats.idleAgents === 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">All agents balanced</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Workload Timeline - Shows task completion over time
interface WorkloadTimelineProps {
  tasks: Task[]
  days?: number
  className?: string
}

export function WorkloadTimeline({ tasks, days = 7, className }: WorkloadTimelineProps) {
  // Generate daily data
  const dailyData = React.useMemo(() => {
    const data: { date: string; completed: number; created: number }[] = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const completed = tasks.filter(t => {
        if (t.status !== 'completed') return false
        // Use updatedAt as completion date
        return t.updatedAt.split('T')[0] === dateStr
      }).length
      
      const created = tasks.filter(t => {
        return t.createdAt.split('T')[0] === dateStr
      }).length
      
      data.push({
        date: dateStr,
        completed,
        created,
      })
    }
    
    return data
  }, [tasks, days])
  
  const maxValue = Math.max(
    ...dailyData.map(d => Math.max(d.completed, d.created)),
    1
  )
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Task Activity</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-info" />
            <span className="text-muted-foreground">Created</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Completed</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end gap-1 h-24">
        {dailyData.map((day, index) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex flex-col gap-0.5 h-20">
              {/* Created bar */}
              <div 
                className="w-full bg-info/60 rounded-t"
                style={{ height: `${(day.created / maxValue) * 100}%`, minHeight: day.created > 0 ? '4px' : '0' }}
                title={`Created: ${day.created}`}
              />
              {/* Completed bar */}
              <div 
                className="w-full bg-success/60 rounded-b"
                style={{ height: `${(day.completed / maxValue) * 100}%`, minHeight: day.completed > 0 ? '4px' : '0' }}
                title={`Completed: ${day.completed}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}