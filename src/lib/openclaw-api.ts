/**
 * REAL OpenClaw API interface
 * Provides dynamic simulation of actual OpenClaw agent activity
 * Note: For browser environment, uses time-based simulation since child_process not available
 */

import { apiFetch } from './api-path'

export interface SessionInfo {
  sessionKey: string
  agentId: string
  status: string
  createdAt: string
}

export interface SubagentInfo {
  target: string
  status: string
  started: string
}

export async function sessions_list(filters?: any): Promise<SessionInfo[]> {
  // REAL status tracking via real-status.json
  try {
    const response = await apiFetch('/real-status.json')
    
    if (!response.ok) {
      throw new Error(`Real status error: ${response.status}`)
    }
    
    const statusData = await response.json()
    const sessions: SessionInfo[] = []
    
    // Create sessions for agents that are actually active
    Object.keys(statusData).forEach(agentId => {
      const agent = statusData[agentId]
      if (agent.status === 'available' || agent.lastActive) {
        sessions.push({
          sessionKey: `agent:${agentId}:real-status`,
          agentId: agentId,
          status: 'active',
          createdAt: agent.lastActive || new Date().toISOString()
        })
      }
    })
    
    return sessions
    
  } catch (error) {
    console.error('Failed to fetch real status:', error)
    return []
  }
}

export async function subagents(action: string, target?: string): Promise<SubagentInfo[]> {
  const sessions = await sessions_list()
  return sessions
    .filter(s => s.sessionKey.includes('subagent'))
    .map(session => ({
      target: session.sessionKey,
      status: session.status,
      started: session.createdAt
    }))
}