import * as fs from 'fs'
import * as path from 'path'
import type { Agent, Story, TaskStatus } from '@/types/task'

export interface OpenClawWorkspace {
  version: string
  agents?: string[]
  workspacePath?: string
  [key: string]: any
}

export interface AgentSession {
  requestId: string
  timestamp?: number
  messages: Array<{ role: string; content: string }>
  [key: string]: any
}

/**
 * Read the OpenClaw workspace configuration
 * @param workspacePath - Path to the OpenClaw workspace
 * @returns OpenClawWorkspace object or null if not found
 */
export function readOpenClawWorkspace(workspacePath: string): OpenClawWorkspace | null {
  const configPath = path.join(workspacePath, 'openclaw.json')

  if (!fs.existsSync(configPath)) {
    return null
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    const data = JSON.parse(content) as OpenClawWorkspace
    const { version, agents, workspacePath: _, ...rest } = data
    return {
      version: version || 'unknown',
      agents: agents,
      workspacePath: workspacePath,
      ...rest,
    }
  } catch (error) {
    console.error('Error reading workspace config:', error)
    return null
  }
}

/**
 * Parse an agent session file
 * @param sessionPath - Path to the session JSONL file
 * @returns AgentSession object or null if not found
 */
export function parseAgentSession(sessionPath: string): AgentSession | null {
  if (!fs.existsSync(sessionPath)) {
    return null
  }

  try {
    const content = fs.readFileSync(sessionPath, 'utf-8')
    // Handle JSONL format (one JSON object per line)
    const lines = content.trim().split('\n')
    // Parse the first line as the session data
    const data = JSON.parse(lines[0]) as AgentSession
    const { requestId, timestamp, messages, ...rest } = data
    return {
      requestId: requestId,
      timestamp: timestamp,
      messages: messages || [],
      ...rest,
    }
  } catch (error) {
    console.error('Error parsing agent session:', error)
    return null
  }
}

/**
 * Monitor file changes in a directory
 * @param dirPath - Directory to watch
 * @param callback - Callback function that receives (event, filename)
 * @returns FSWatcher instance
 */
export function monitorFileChanges(
  dirPath: string,
  callback: (event: string, filename: string | null) => boolean | void
): fs.FSWatcher {
  const watcher = fs.watch(dirPath, (event, filename) => {
    const shouldStop = callback(event, filename)
    if (shouldStop === false) {
      watcher.close()
    }
  })

  return watcher
}

/**
 * Get the OpenClaw workspace path from environment or default
 * @returns Path to the workspace
 */
export function getWorkspacePath(): string {
  return process.env.OPENCLAW_WORKSPACE_PATH || '/home/olegs/.openclaw/workspace-company'
}

/**
 * Get the agents directory path
 * @returns Path to the agents directory
 */
export function getAgentsPath(): string {
  return path.join(getWorkspacePath(), 'agents')
}

/**
 * List all agent directories in the workspace
 * @returns Array of agent names
 */
export function listAgents(): string[] {
  const agentsPath = getAgentsPath()
  
  if (!fs.existsSync(agentsPath)) {
    return []
  }

  try {
    const entries = fs.readdirSync(agentsPath, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch (error) {
    console.error('Error listing agents:', error)
    return []
  }
}

/**
 * Get the most recent session file for an agent
 * @param agentName - Name of the agent
 * @returns Path to the most recent session file or null
 */
export function getAgentSessionFile(agentName: string): string | null {
  const agentPath = path.join(getAgentsPath(), agentName, 'sessions')
  
  if (!fs.existsSync(agentPath)) {
    return null
  }

  try {
    const entries = fs.readdirSync(agentPath)
    // Filter for .jsonl files
    const sessionFiles = entries.filter((file) => file.endsWith('.jsonl') && !file.endsWith('.lock'))
    
    if (sessionFiles.length === 0) {
      return null
    }

    // Sort by modification time (most recent first)
    const filesWithTime = sessionFiles
      .map((file) => {
        const fullPath = path.join(agentPath, file)
        const stats = fs.statSync(fullPath)
        return { file, mtime: stats.mtime }
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    return path.join(agentPath, filesWithTime[0].file)
  } catch (error) {
    console.error('Error getting agent session file:', error)
    return null
  }
}

/**
 * Read and parse the company roster from COMPANY_ROSTER.md
 * @param workspacePath - Path to the OpenClaw workspace
 * @returns Array of Agent objects or empty array on error
 */
export function readCompanyRoster(workspacePath: string = getWorkspacePath()): Promise<Agent[]> {
  return new Promise((resolve) => {
    const rosterPath = path.join(workspacePath, 'COMPANY_ROSTER.md')

    // Check if file exists
    if (!fs.existsSync(rosterPath)) {
      console.warn('COMPANY_ROSTER.md not found, using empty roster')
      resolve([])
      return
    }

    try {
      const content = fs.readFileSync(rosterPath, 'utf-8')
      
      // Find the JSON section starting with '## Dashboard Agent Configuration (JSON)'
      const jsonSectionStart = content.indexOf('## Dashboard Agent Configuration (JSON)')
      
      if (jsonSectionStart === -1) {
        console.warn('JSON configuration section not found in COMPANY_ROSTER.md')
        resolve([])
        return
      }

      // Extract everything after the JSON section header
      const sectionContent = content.slice(jsonSectionStart)
      
      // Find the JSON block (after the ```json code block)
      const jsonBlockStart = sectionContent.indexOf('```json')
      if (jsonBlockStart === -1) {
        console.warn('JSON code block not found in COMPANY_ROSTER.md')
        resolve([])
        return
      }

      // Get content after the ```json marker
      const afterJsonMarker = sectionContent.slice(jsonBlockStart + '```json'.length)
      
      // Find the closing ``` block
      const jsonBlockEnd = afterJsonMarker.indexOf('```')
      if (jsonBlockEnd === -1) {
        console.warn('JSON closing marker not found in COMPANY_ROSTER.md')
        resolve([])
        return
      }

      // Extract the JSON content
      const jsonString = afterJsonMarker.slice(0, jsonBlockEnd).trim()

      // Parse the JSON
      const parsedData = JSON.parse(jsonString)

      // Extract the agents array
      const agents = parsedData.agents || []

      // Validate and sanitize agents
      const validAgents: Agent[] = agents
        .filter((agent: any) => agent && typeof agent.name === 'string')
        .map((agent: any) => ({
          name: agent.name.toLowerCase(),
          role: agent.role || 'Unknown',
          specialization: agent.specialization || 'general',
          currentWorkload: 0, // Will be populated by task assignment
          activeTasks: [], // Will be populated by task assignment
          skills: Array.isArray(agent.skills) ? agent.skills : ['general']
        }))

      resolve(validAgents)
    } catch (error) {
      console.error('Error reading company roster:', error)
      resolve([])
    }
  })
}

/**
 * Read and parse workflow data (stories and tickets) from COMPANY_ROSTER.md
 * @param workspacePath - Path to the OpenClaw workspace
 * @returns Array of Story objects with nested tickets or empty array on error
 */
export function readWorkflowData(workspacePath: string = getWorkspacePath()): Story[] {
  const rosterPath = path.join(workspacePath, 'COMPANY_ROSTER.md')

  // Check if file exists
  if (!fs.existsSync(rosterPath)) {
    console.warn('COMPANY_ROSTER.md not found, using empty workflow data')
    return []
  }

  try {
    const content = fs.readFileSync(rosterPath, 'utf-8')
    
    // Find the JSON section starting with '## Dashboard Agent Configuration (JSON)'
    const jsonSectionStart = content.indexOf('## Dashboard Agent Configuration (JSON)')
    
    if (jsonSectionStart === -1) {
      console.warn('JSON configuration section not found in COMPANY_ROSTER.md')
      return []
    }

    // Extract everything after the JSON section header
    const sectionContent = content.slice(jsonSectionStart)
    
    // Find the JSON block (after the ```json code block)
    const jsonBlockStart = sectionContent.indexOf('```json')
    if (jsonBlockStart === -1) {
      console.warn('JSON code block not found in COMPANY_ROSTER.md')
      return []
    }

    // Get content after the ```json marker
    const afterJsonMarker = sectionContent.slice(jsonBlockStart + '```json'.length)
    
    // Find the closing ``` block
    const jsonBlockEnd = afterJsonMarker.indexOf('```')
    if (jsonBlockEnd === -1) {
      console.warn('JSON closing marker not found in COMPANY_ROSTER.md')
      return []
    }

    // Extract the JSON content
    const jsonString = afterJsonMarker.slice(0, jsonBlockEnd).trim()

    // Parse the JSON
    const parsedData = JSON.parse(jsonString)

    // Extract the currentStories array from parsed data
    // Support both formats: currentStories at root level OR inside workflow object
    const workflowData = parsedData.workflow || {}
    const storiesData = workflowData.currentStories || parsedData.currentStories || []
    
    // Validate and transform stories with nested tickets
    const validStories: Story[] = storiesData
      .filter((story: any) => story && typeof story.id === 'string')
      .map((story: any) => ({
        id: story.id,
        title: story.title || 'Untitled Story',
        description: story.description || '',
        type: ['feature', 'bug', 'improvement', 'documentation', 'research'].includes(story.type) 
          ? story.type 
          : 'feature',
        priority: ['low', 'medium', 'high', 'critical'].includes(story.priority)
          ? story.priority
          : 'medium',
        // Normalize status to TaskStatus type
        status: ((): TaskStatus => {
          const rawStatus = story.status || 'pending'
          if (rawStatus === 'in-progress') return 'progress'
          if (rawStatus === 'done') return 'completed'
          if (rawStatus === 'todo') return 'pending'
          if (['pending', 'progress', 'completed', 'blocked'].includes(rawStatus)) return rawStatus as TaskStatus
          return 'pending'
        })(),
        assignee: story.assignee || 'unassigned',
        createdAt: story.createdAt || new Date().toISOString(),
        updatedAt: story.updatedAt || new Date().toISOString(),
        tickets: story.tickets && Array.isArray(story.tickets)
          ? story.tickets
              .filter((ticket: any) => ticket && typeof ticket.id === 'string')
              .map((ticket: any) => ({
                id: ticket.id,
                title: ticket.title || 'Untitled Ticket',
                description: ticket.description || '',
                assignee: ticket.assignee || 'unassigned',
                // Normalize ticket status to TaskStatus type
                status: ((): TaskStatus => {
                  const rawStatus = ticket.status || 'pending'
                  if (rawStatus === 'in-progress') return 'progress'
                  if (rawStatus === 'done') return 'completed'
                  if (rawStatus === 'todo') return 'pending'
                  if (['pending', 'progress', 'completed', 'blocked'].includes(rawStatus)) return rawStatus as TaskStatus
                  return 'pending'
                })(),
                priority: ['low', 'medium', 'high', 'critical'].includes(ticket.priority)
                  ? ticket.priority
                  : 'medium',
                storyId: story.id
              }))
          : []
      }))

    return validStories
  } catch (error) {
    console.error('Error reading workflow data:', error)
    return []
  }
}
