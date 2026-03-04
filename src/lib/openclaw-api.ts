/**
 * Mock OpenClaw API interface
 * In production, this would connect to actual OpenClaw backend
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

// Mock API functions that would connect to real OpenClaw
export async function sessions_list(filters?: any): Promise<SessionInfo[]> {
  // Mock data - simulate Makima CEO activity
  return [
    {
      sessionKey: 'agent:makima:telegram:direct:548498854',
      agentId: 'makima',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ]
}

export async function subagents(action: string, target?: string): Promise<SubagentInfo[]> {
  // Mock data - simulate active subagents
  return [
    {
      target: 'agent:aki:subagent:626948d7',
      status: 'completed',
      started: new Date().toISOString()
    }
  ]
}