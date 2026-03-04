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
  // Mock data - no active sessions currently
  return []
}

export async function subagents(action: string, target?: string): Promise<SubagentInfo[]> {
  // Mock data - no active subagents currently
  return []
}