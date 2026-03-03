'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Agent {
  name: string
  role: string
  specialization: string
  currentWorkload: number
  activeTasks: string[]
  skills: string[]
}

interface FileStatus {
  workspaceAvailable: boolean
  lastSync: string
  sessionCount: number
}

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">{agent.name}</CardTitle>
        <Badge variant="outline">{agent.role}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-2">
          {agent.specialization}
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="text-2xl font-bold text-card-foreground">
          {agent.currentWorkload} tasks
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {agent.activeTasks.length} active
        </p>
      </CardContent>
    </Card>
  )
}

export function FileStatus({ status }: { status: FileStatus }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${status.workspaceAvailable ? 'bg-success' : 'bg-destructive'}`} />
        <span className="text-sm font-medium text-foreground">
          {status.workspaceAvailable ? 'Workspace Connected' : 'Workspace Disconnected'}
        </span>
      </div>
      {status.sessionCount > 0 && (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-info" />
          <span className="text-sm font-medium text-foreground">
            {status.sessionCount} active sessions
          </span>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Last sync: {new Date(status.lastSync).toLocaleTimeString()}
        </span>
      </div>
    </div>
  )
}

export function TaskCountBadge({ count }: { count: number }) {
  return (
    <Badge variant="default" className="px-2 py-1 text-xs">
      {count} tasks
    </Badge>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border border-warning/20',
    progress: 'bg-info/10 text-info border border-info/20',
    completed: 'bg-success/10 text-success border border-success/20',
    blocked: 'bg-destructive/10 text-destructive border border-destructive/20',
  }

  const displayText = status.charAt(0).toUpperCase() + status.slice(1)

  return (
    <Badge className={variants[status] || 'bg-muted text-muted-foreground'}>
      {displayText}
    </Badge>
  )
}
