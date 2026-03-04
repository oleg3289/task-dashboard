'use client'

import { useState, useEffect } from 'react'
import { sessions_list, subagents } from '@/lib/openclaw-api'

export interface TeamMember {
  id: string
  name: string 
  role: string
  status: 'active' | 'idle' | 'working' | 'error'
  currentTask: string | null
  sessionCount: number
  lastActive: string | null
}

export interface TeamTrackerHook {
  team: TeamMember[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Real team tracking hook
 * Monitors actual OpenClaw agent activity
 */
export function useTeamTracker(): TeamTrackerHook {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Team roster with roles
  const teamRoster = [
    { id: 'makima', name: 'Makima', role: 'CEO Orchestrator' },
    { id: 'reze', name: 'Reze', role: 'Planner' },
    { id: 'aki', name: 'Aki', role: 'Developer' },
    { id: 'power', name: 'Power', role: 'Designer' },
    { id: 'denji', name: 'Denji', role: 'Researcher' },
    { id: 'kobeni', name: 'Kobeni', role: 'Tester' },
    { id: 'himeno', name: 'Himeno', role: 'Reviewer' },
    { id: 'kishibe', name: 'Kishibe', role: 'Archivist' }
  ]

  const fetchTeamStatus = async () => {
    try {
      setIsLoading(true)
      
      // Get actual OpenClaw session data
      const sessions = await sessions_list()
      
      // Map team roster with real status
      const teamStatus = teamRoster.map(member => {
        // Check if agent has active sessions
        const agentSessions = sessions.filter(session => 
          session.agentId === member.id || 
          session.sessionKey.toLowerCase().includes(member.id.toLowerCase())
        )
        
        const isActive = agentSessions.length > 0
        const lastActivity = agentSessions.length > 0 
          ? new Date().toISOString() 
          : null
        
        return {
          ...member,
          status: agentSessions.length > 0 ? 'working' as const : 'idle' as const,
          currentTask: agentSessions.length > 0 ? 'Active session' : null,
          sessionCount: agentSessions.length,
          lastActive: agentSessions.length > 0 ? new Date().toISOString() : null
        }
      })
      
      setTeam(teamStatus)
      setError(null)
    } catch (err) {
      setError('Failed to fetch team status')
      console.error('Team tracker error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamStatus()
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchTeamStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    team,
    isLoading,
    error,
    refresh: fetchTeamStatus
  }
}