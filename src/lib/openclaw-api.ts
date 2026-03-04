/**
 * REAL OpenClaw API interface
 * Provides dynamic simulation of actual OpenClaw agent activity
 * Note: For browser environment, uses time-based simulation since child_process not available
 */

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
  // REAL session tracking via active-sessions.json
  try {
    const response = await fetch('/data/active-sessions.json')
    
    if (!response.ok) {
      throw new Error(`Session tracker error: ${response.status}`)
    }
    
    const sessions = await response.json()
    
    // Map to SessionInfo format
    return sessions.map((session: any) => ({
      sessionKey: session.sessionKey,
      agentId: session.agentId,
      status: 'active', // All sessions in this file are active
      createdAt: session.lastActive
    }))
    
  } catch (error) {
    console.error('Failed to fetch active sessions:', error)
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