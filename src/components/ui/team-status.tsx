'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeamTracker, TeamMember } from '@/hooks/useTeamTracker'

interface TeamStatusProps {
  compact?: boolean
}

export function TeamStatus({ compact = false }: TeamStatusProps) {
  const { team, isLoading, error } = useTeamTracker()
  
  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'working': return 'bg-blue-500'  
      case 'idle': return 'bg-gray-400'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

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
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    const activeMembers = team.filter(m => m.status === 'active' || m.status === 'working')
    return (
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-6">
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
    <Card>
      <CardContent className="space-y-4 p-6">
        {team.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(member.status)}`}></div>
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.role}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium capitalize">{member.status}</div>
              {member.currentTask && (
                <div className="text-xs text-muted-foreground">{member.currentTask}</div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}