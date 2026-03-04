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
  // In production: Make actual API call
  return [
    {
      sessionKey: 'agent:aki:subagent:d6e6a260-8f0a-4525-a61a-a8808be58c6c',
      agentId: 'aki',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ]
}

export async function subagents(action: string, target?: string): Promise<SubagentInfo[]> {
  // In production: Make actual API call
  return [
    {
      target: 'agent:aki:subagent:d6e6a260-8f0a-4525-a61a-a8808be58c6c',
      status: 'running',
      started: new Date().toISOString()
    }
  ]
}