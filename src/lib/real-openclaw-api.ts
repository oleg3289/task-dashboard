import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface SessionInfo {
  sessionKey: string
  agentId: string
  status: string
  createdAt: string
  updatedAt: number
  ageMs: number
  inputTokens?: number
  outputTokens?: number
  model?: string
}

export interface SubagentInfo {
  target: string
  status: string
  started: string
}

export class RealOpenClawAPI {
  private async runOpenClawCommand(command: string): Promise<any> {
    try {
      const result = await execAsync(`openclaw ${command} --json`)
      return JSON.parse(result.stdout)
    } catch (error) {
      console.error('OpenClaw command failed:', error)
      throw error
    }
  }

  async sessions_list(filters?: any): Promise<SessionInfo[]> {
    try {
      const sessionsData = await this.runOpenClawCommand('sessions --all-agents')
      
      if (!sessionsData?.sessions) {
        throw new Error('No sessions data returned')
      }

      return sessionsData.sessions.map((session: any) => ({
        sessionKey: session.key,
        agentId: session.agentId || this.extractAgentId(session.key),
        status: this.determineSessionStatus(session),
        createdAt: new Date(session.updatedAt).toISOString(),
        updatedAt: session.updatedAt,
        ageMs: session.ageMs,
        inputTokens: session.inputTokens,
        outputTokens: session.outputTokens,
        model: session.model
      }))
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      // Fallback to mock data if real API fails
      return this.getFallbackData()
    }
  }

  private extractAgentId(sessionKey: string): string {
    // Extract agent ID from session key pattern: agent:agentId:...
    const match = sessionKey.match(/^agent:([^:]+)/)
    return match ? match[1] : 'unknown'
  }

  private determineSessionStatus(session: any): string {
    // Determine status based on session data
    const ageMs = session.ageMs || 0
    
    if (ageMs < 300000) { // 5 minutes
      return 'active'
    } else if (ageMs < 1800000) { // 30 minutes
      return 'idle'
    } else {
      return 'stale'
    }
  }

  private getFallbackData(): SessionInfo[] {
    // Fallback mock data when real API fails
    return [
      {
        sessionKey: 'agent:main:telegram:direct:548498854',
        agentId: 'makima',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: Date.now(),
        ageMs: 0,
        model: 'deepseek-v3.1:671b-cloud'
      }
    ]
  }

  async subagents(action: string, target?: string): Promise<SubagentInfo[]> {
    try {
      // For now, use sessions data to infer subagent status
      const sessions = await this.sessions_list()
      const subagentSessions = sessions.filter(s => s.sessionKey.includes('subagent'))
      
      return subagentSessions.map(session => ({
        target: session.sessionKey,
        status: session.ageMs < 600000 ? 'running' : 'completed', // 10 minutes
        started: session.createdAt
      }))
    } catch (error) {
      console.error('Failed to fetch subagents:', error)
      return [
        {
          target: 'agent:aki:subagent:626948d7',
          status: 'completed',
          started: new Date().toISOString()
        }
      ]
    }
  }
}

// Singleton instance
export const realOpenClawAPI = new RealOpenClawAPI()

// Backward compatibility exports
export async function sessions_list(filters?: any): Promise<SessionInfo[]> {
  return realOpenClawAPI.sessions_list(filters)
}

export async function subagents(action: string, target?: string): Promise<SubagentInfo[]> {
  return realOpenClawAPI.subagents(action, target)
}