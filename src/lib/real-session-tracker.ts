// REAL session tracking via file system monitoring
import { promises as fs } from 'fs'
import path from 'path'

export interface RealSession {
  sessionKey: string
  agentId: string
  status: 'active' | 'idle'
  lastActive: string
  duration: number // minutes active
}

export async function getRealSessions(): Promise<RealSession[]> {
  try {
    // Track active subagents via work-tracker
    const trackerPath = path.join(process.cwd(), 'work-tracker', 'active-sessions.json')
    
    try {
      const data = await fs.readFile(trackerPath, 'utf-8')
      const sessions = JSON.parse(data)
      return sessions
    } catch {
      // File doesn't exist or invalid - create empty tracking
      return []
    }
    
  } catch (error) {
    console.error('Failed to read real sessions:', error)
    return []
  }
}

export async function updateSessionTracker() {
  try {
    const sessionsPath = path.join(process.cwd(), '../agents')
    const agents = ['makima', 'reze', 'aki', 'power', 'denji', 'kobeni', 'himeno', 'kishibe']
    
    const activeSessions: RealSession[] = []
    const now = Date.now()
    
    // Check each agent's session directory
    for (const agent of agents) {
      const agentPath = path.join(sessionsPath, agent, 'sessions')
      
      try {
        const sessionFiles = await fs.readdir(agentPath)
        
        for (const file of sessionFiles) {
          if (file.endsWith('.jsonl')) {
            const filePath = path.join(agentPath, file)
            const stats = await fs.stat(filePath)
            
            // Active if modified within last 30 minutes
            const minutesAgo = (now - stats.mtime.getTime()) / 60000
            if (minutesAgo < 30) {
              activeSessions.push({
                sessionKey: `agent:${agent}:session:${file.replace('.jsonl', '')}`,
                agentId: agent,
                status: 'active',
                lastActive: stats.mtime.toISOString(),
                duration: Math.round(minutesAgo)
              })
            }
          }
        }
      } catch {
        // Agent directory doesn't exist or empty
        continue
      }
    }
    
    // Save tracking data
    const trackerPath = path.join(process.cwd(), 'work-tracker', 'active-sessions.json')
    await fs.mkdir(path.dirname(trackerPath), { recursive: true })
    await fs.writeFile(trackerPath, JSON.stringify(activeSessions, null, 2))
    
    return activeSessions
    
  } catch (error) {
    console.error('Failed to update session tracker:', error)
    return []
  }
}