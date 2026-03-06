'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTeamTracker, TeamMember } from '@/hooks/useTeamTracker'

interface TeamStatusProps {
  compact?: boolean
}

function getStatusColor(status: TeamMember['status']) {
  switch (status) {
    case 'working': return 'bg-blue-500'
    case 'active': return 'bg-green-500'
    case 'available': return 'bg-emerald-400'
    case 'idle': return 'bg-gray-400'
    case 'error': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}

function getStatusBadge(status: TeamMember['status']) {
  switch (status) {
    case 'working': return 'default'
    case 'active': return 'default'
    case 'available': return 'secondary'
    case 'idle': return 'outline'
    case 'error': return 'destructive'
    default: return 'outline'
  }
}

function formatLastActive(lastActive: string | null): string {
  if (!lastActive) return 'Never'
  
  const date = new Date(lastActive)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleDateString()
}

export function TeamStatus({ compact = false }: TeamStatusProps) {
  const { team, isLoading, error, refresh } = useTeamTracker()
  
  // Summary stats
  const working = team.filter(m => m.status === 'working').length
  const available = team.filter(m => m.status === 'available').length
  const active = team.filter(m => m.status === 'active').length
  const idle = team.filter(m => m.status === 'idle').length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading team status...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={refresh}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Team Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 p-4 pt-0">
          {team.map(member => (
            <div key={member.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(member.status)}`}></div>
              <span className="text-sm font-medium">{member.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Team Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm"><strong>{working}</strong> Working</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm"><strong>{active}</strong> Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-400"></div>
            <span className="text-sm"><strong>{available}</strong> Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="text-sm"><strong>{idle}</strong> Idle</span>
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {team.map(member => (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant={getStatusBadge(member.status)} className="capitalize">
                  {member.status}
                </Badge>
              </div>
              
              {member.status === 'working' && member.currentTask && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-300 truncate">
                    {member.currentTask}
                  </p>
                </div>
              )}
              
              {member.lastTask && member.status !== 'working' && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Last:</span> {member.lastTask}
                  </p>
                </div>
              )}
              
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--muted-foreground)' }}></span>
                <span>Last active: {formatLastActive(member.lastActive)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}