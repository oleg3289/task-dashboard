'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { CircularProgress, ProgressBar } from './status-indicator'
import { Badge } from './badge'
import type { Agent } from '@/types/task'

// Agent card container
const agentCardVariants = cva(
  'rounded-lg border bg-card p-4 transition-all duration-200',
  {
    variants: {
      status: {
        idle: 'border-muted-foreground/20',
        active: 'border-info/50 shadow-sm shadow-info/10',
        overloaded: 'border-warning/50 shadow-sm shadow-warning/10',
        offline: 'border-muted-foreground/10 opacity-60',
      },
      selected: {
        true: 'ring-2 ring-primary ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      status: 'idle',
      selected: false,
    },
  }
)

// Workload level indicator
const workloadVariants = cva(
  'text-sm font-medium',
  {
    variants: {
      level: {
        low: 'text-success',
        medium: 'text-info',
        high: 'text-warning',
        critical: 'text-destructive',
      },
    },
    defaultVariants: {
      level: 'low',
    },
  }
)

// Agent avatar placeholder
const avatarVariants = cva(
  'flex items-center justify-center rounded-full font-medium text-white',
  {
    variants: {
      size: {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
      },
      status: {
        idle: 'bg-muted-foreground',
        active: 'bg-info',
        overloaded: 'bg-warning',
        offline: 'bg-muted',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'idle',
    },
  }
)

// Skill tag styles
const skillTagVariants = cva(
  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
)

// Get agent status from workload
function getAgentStatus(workload: number): 'idle' | 'active' | 'overloaded' | 'offline' {
  if (workload === 0) return 'idle'
  if (workload <= 50) return 'active'
  if (workload <= 80) return 'overloaded'
  return 'offline'
}

// Get workload level
function getWorkloadLevel(workload: number): 'low' | 'medium' | 'high' | 'critical' {
  if (workload <= 25) return 'low'
  if (workload <= 50) return 'medium'
  if (workload <= 75) return 'high'
  return 'critical'
}

// Agent Avatar Component
export interface AgentAvatarProps extends VariantProps<typeof avatarVariants> {
  name: string
  className?: string
}

export function AgentAvatar({ 
  name, 
  size = 'md', 
  status = 'idle',
  className 
}: AgentAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn(avatarVariants({ size, status }), 'text-white')}>
      {initials}
    </div>
  )
}

// Skill Tag Component
export interface SkillTagProps extends VariantProps<typeof skillTagVariants> {
  skill: string
  className?: string
}

export function SkillTag({ skill, variant = 'outline', className }: SkillTagProps) {
  return (
    <span className={cn(skillTagVariants({ variant }), className)}>
      {skill}
    </span>
  )
}

// Agent Card Props
export interface AgentCardProps {
  agent: Agent
  selected?: boolean
  compact?: boolean
  showSkills?: boolean
  showActiveTasks?: boolean
  onClick?: () => void
  className?: string
}

// Agent Card Component
export function AgentCard({
  agent,
  selected = false,
  compact = false,
  showSkills = true,
  showActiveTasks = true,
  onClick,
  className,
}: AgentCardProps) {
  const status = getAgentStatus(agent.currentWorkload)
  const workloadLevel = getWorkloadLevel(agent.currentWorkload)

  if (compact) {
    return (
      <div
        className={cn(
          agentCardVariants({ status, selected }),
          'flex items-center gap-3 cursor-pointer',
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        <AgentAvatar name={agent.name} size="sm" status={status} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{agent.name}</div>
          <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
        </div>
        <CircularProgress 
          value={agent.currentWorkload} 
          size={36} 
          variant={workloadLevel === 'critical' ? 'danger' : workloadLevel === 'high' ? 'warning' : 'default'}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        agentCardVariants({ status, selected }),
        'cursor-pointer',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Header: Avatar + Name + Role */}
      <div className="flex items-start gap-3 mb-4">
        <AgentAvatar name={agent.name} size="lg" status={status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{agent.name}</h3>
            {status === 'active' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-info opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-info"></span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{agent.role}</p>
          <p className="text-xs text-muted-foreground/70">{agent.specialization}</p>
        </div>
      </div>

      {/* Workload Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-muted-foreground">Workload</span>
          <span className={workloadVariants({ level: workloadLevel })}>
            {agent.currentWorkload}%
          </span>
        </div>
        <ProgressBar 
          value={agent.currentWorkload} 
          variant={workloadLevel === 'critical' ? 'danger' : workloadLevel === 'high' ? 'warning' : 'default'}
        />
      </div>

      {/* Active Tasks */}
      {showActiveTasks && agent.activeTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Tasks</span>
            <Badge variant="secondary" className="text-xs">
              {agent.activeTasks.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {agent.activeTasks.slice(0, 3).map((taskId, i) => (
              <div 
                key={taskId} 
                className="text-xs text-muted-foreground truncate bg-muted/50 px-2 py-1 rounded"
              >
                {taskId}
              </div>
            ))}
            {agent.activeTasks.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{agent.activeTasks.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {showSkills && agent.skills.length > 0 && (
        <div>
          <span className="text-sm text-muted-foreground block mb-2">Skills</span>
          <div className="flex flex-wrap gap-1">
            {agent.skills.slice(0, 5).map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
            {agent.skills.length > 5 && (
              <span className="text-xs text-muted-foreground px-2">
                +{agent.skills.length - 5}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Agent Workload Grid Component
export interface AgentWorkloadGridProps {
  agents: Agent[]
  selectedAgentId?: string
  onAgentSelect?: (agentId: string) => void
  className?: string
}

export function AgentWorkloadGrid({
  agents,
  selectedAgentId,
  onAgentSelect,
  className,
}: AgentWorkloadGridProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {agents.map((agent) => (
        <AgentCard
          key={agent.name}
          agent={agent}
          selected={agent.name === selectedAgentId}
          onClick={() => onAgentSelect?.(agent.name)}
        />
      ))}
    </div>
  )
}

// Team Workload Summary Component
export interface TeamWorkloadSummaryProps {
  agents: Agent[]
  className?: string
}

export function TeamWorkloadSummary({ agents, className }: TeamWorkloadSummaryProps) {
  const stats = agents.reduce(
    (acc, agent) => {
      const status = getAgentStatus(agent.currentWorkload)
      acc[status]++
      acc.totalWorkload += agent.currentWorkload
      if (agent.activeTasks.length > 0) acc.totalActiveTasks += agent.activeTasks.length
      return acc
    },
    { idle: 0, active: 0, overloaded: 0, offline: 0, totalWorkload: 0, totalActiveTasks: 0 }
  )

  const avgWorkload = agents.length > 0 ? Math.round(stats.totalWorkload / agents.length) : 0

  return (
    <div className={cn('bg-card rounded-lg border p-4', className)}>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Team Overview</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground">{stats.idle}</div>
          <div className="text-xs text-muted-foreground">Idle</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-info">{stats.active}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{stats.overloaded}</div>
          <div className="text-xs text-muted-foreground">Overloaded</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-muted-foreground/50">{stats.offline}</div>
          <div className="text-xs text-muted-foreground">Offline</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Avg Workload</span>
            <span className="font-medium text-foreground">{avgWorkload}%</span>
          </div>
          <ProgressBar value={avgWorkload} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Active Tasks</span>
          <span className="font-medium text-foreground">{stats.totalActiveTasks}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Team Size</span>
          <span className="font-medium text-foreground">{agents.length} agents</span>
        </div>
      </div>
    </div>
  )
}

// Agent Card Skeleton for loading state
export function AgentCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-16" />
          </div>
          <div className="w-9 h-9 rounded-full bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-28" />
          <div className="h-3 bg-muted rounded w-20" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <div className="h-3 bg-muted rounded w-16" />
          <div className="h-3 bg-muted rounded w-8" />
        </div>
        <div className="h-2 bg-muted rounded w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="flex gap-1">
          <div className="h-5 bg-muted rounded w-12" />
          <div className="h-5 bg-muted rounded w-14" />
          <div className="h-5 bg-muted rounded w-10" />
        </div>
      </div>
    </div>
  )
}

// Export variants
export { agentCardVariants, workloadVariants, avatarVariants, skillTagVariants }