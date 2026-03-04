'use client'

import { useState, useEffect } from 'react'
import { sessions_list, subagents } from '@/lib/openclaw-api'

export interface Assignment {
  id: string
  task: string
  assignee: string
  status: string
  priority: string
  createdAt: string
  timeout: number | string
  [key: string]: any
}

export interface AssignmentsData {
  assignments: Assignment[]
  lastUpdated: string
}

export interface TeamMember {
  id: string
  name: string 
  role: string
  status: 'active' | 'idle' | 'working' | 'available' | 'error'
  currentTask: string | null
  sessionCount: number
  lastActive: string | null
  hasActiveAssignment: boolean
}

export interface TeamTrackerHook {
  team: TeamMember[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Get assignments for a specific agent
 */
async function getAgentAssignments(agentId: string): Promise<Assignment[]> {
  try {
    const response = await fetch('/data/current-assignments.json')
    
    if (!response.ok) {
      // Fallback: use relative path for development
      const response2 = await fetch('/work-tracker/current-assignments.json')
      if (!response2.ok) throw new Error('Failed to fetch assignments')
      const data: AssignmentsData = await response2.json()
      return data.assignments.filter(a => a.assignee === agentId)
    }
    
    const data: AssignmentsData = await response.json()
    return data.assignments.filter(a => a.assignee === agentId)
  } catch (error) {
    console.error(`Failed to fetch assignments for ${agentId}:`, error)
    return []
  }
}

/**
 * Get all active (non-completed) assignments
 */
async function getActiveAssignments(): Promise<Assignment[]> {
  try {
    const response = await fetch('/data/current-assignments.json')
    
    if (!response.ok) {
      // Fallback: use relative path for development
      const response2 = await fetch('/work-tracker/current-assignments.json')
      if (!response2.ok) throw new Error('Failed to fetch assignments')
      const data: AssignmentsData = await response2.json()
      return data.assignments.filter(a => a.status !== 'completed')
    }
    
    const data: AssignmentsData = await response.json()
    return data.assignments.filter(a => a.status !== 'completed')
  } catch (error) {
    console.error('Failed to fetch active assignments:', error)
    return []
  }
}

/**
 * Determine agent status based on sessions and assignments
 */
function determineAgentStatus(
  hasSession: boolean,
  hasActiveAssignment: boolean
): 'active' | 'idle' | 'working' | 'available' {
  if (!hasSession) return 'idle'
  if (hasActiveAssignment) return 'working'
  return 'available'
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
      
      // Get active assignments (non-completed)
      const activeAssignments = await getActiveAssignments()
      
      // Create a map of agent IDs to their active assignment count
      const agentAssignmentCount = activeAssignments.reduce((acc, assignment) => {
        acc[assignment.assignee] = (acc[assignment.assignee] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Map team roster with real status
      const teamStatus = teamRoster.map(member => {
        // Check if agent has active sessions
        const agentSessions = sessions.filter(session => 
          session.agentId === member.id || 
          session.sessionKey.toLowerCase().includes(member.id.toLowerCase())
        )
        
        const hasSession = agentSessions.length > 0
        const hasActiveAssignment = agentAssignmentCount[member.id] > 0
        const lastActivity = hasSession ? new Date().toISOString() : null
        const currentTask = hasActiveAssignment 
          ? activeAssignments.find(a => a.assignee === member.id)?.task 
          : hasSession ? 'Available (no active task)' : null
        
        return {
          ...member,
          status: determineAgentStatus(hasSession, hasActiveAssignment),
          currentTask: currentTask as string | null,
          sessionCount: agentSessions.length,
          lastActive: lastActivity,
          hasActiveAssignment
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