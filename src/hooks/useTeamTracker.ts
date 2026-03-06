'use client'

import { useState, useEffect } from 'react'

export interface TeamMember {
  id: string
  name: string 
  role: string
  status: 'active' | 'idle' | 'working' | 'available' | 'error'
  currentTask: string | null
  lastTask: string | null
  lastActive: string | null
}

export interface TeamTrackerHook {
  team: TeamMember[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

const AGENT_ROSTER = [
  { id: 'makima', name: 'Makima', role: 'CEO Orchestrator' },
  { id: 'reze', name: 'Reze', role: 'Planner' },
  { id: 'aki', name: 'Aki', role: 'Developer' },
  { id: 'power', name: 'Power', role: 'Designer' },
  { id: 'denji', name: 'Denji', role: 'Researcher' },
  { id: 'kobeni', name: 'Kobeni', role: 'Tester' },
  { id: 'himeno', name: 'Himeno', role: 'Reviewer' },
  { id: 'kishibe', name: 'Kishibe', role: 'Archivist' }
]

interface StatusData {
  [agentId: string]: {
    status: 'active' | 'idle' | 'working' | 'available'
    lastTask: string | null
    lastActive: string | null
    currentTask: string | null
  }
}

/**
 * Real team tracking hook
 * Reads from real-status.json which is updated by poll-agent-status.js
 */
export function useTeamTracker(): TeamTrackerHook {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamStatus = async () => {
    try {
      setIsLoading(true)
      
      // Fetch the real status data
      const response = await fetch('/real-status.json?t=' + Date.now(), {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`)
      }
      
      const statusData: StatusData = await response.json()
      
      // Map team roster with real status
      const teamStatus: TeamMember[] = AGENT_ROSTER.map(member => {
        const agentStatus = statusData[member.id] || {
          status: 'idle' as const,
          lastTask: null,
          lastActive: null,
          currentTask: null
        }
        
        return {
          ...member,
          status: agentStatus.status,
          currentTask: agentStatus.currentTask,
          lastTask: agentStatus.lastTask,
          lastActive: agentStatus.lastActive
        }
      })
      
      setTeam(teamStatus)
      setError(null)
    } catch (err) {
      setError('Failed to fetch team status')
      console.error('Team tracker error:', err)
      
      // Fallback to idle status for all agents
      setTeam(AGENT_ROSTER.map(member => ({
        ...member,
        status: 'idle' as const,
        currentTask: null,
        lastTask: null,
        lastActive: null
      })))
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