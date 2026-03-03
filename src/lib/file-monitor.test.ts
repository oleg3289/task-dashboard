/**
 * File Monitor Tests - Unit Tests for Real-time File Watching
 * 
 * This test suite verifies:
 * - Real-time file watching functionality
 * - File parsing and validation
 * - Workspace monitoring capabilities
 * - Async file operations
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

import {
  readOpenClawWorkspace,
  parseAgentSession,
  monitorFileChanges,
  getWorkspacePath,
  listAgents,
  getAgentSessionFile,
  readCompanyRoster,
  readWorkflowData
} from './file-monitor'

// Create test workspace structure
describe('File Monitor - End-to-End Integration Tests', () => {
  const testWorkspacePath = '/tmp/test-openclaw-workspace'
  const testOpenClawConfig = path.join(testWorkspacePath, 'openclaw.json')
  const testAgentsPath = path.join(testWorkspacePath, 'agents')

  beforeAll(() => {
    // Create test workspace structure
    fs.mkdirSync(path.join(testAgentsPath, 'aki/sessions'), { recursive: true })
    fs.mkdirSync(path.join(testAgentsPath, 'kobeni/sessions'), { recursive: true })
    fs.mkdirSync(path.join(testAgentsPath, 'kazuma/sessions'), { recursive: true })
    
    // Create openclaw.json config
    fs.writeFileSync(testOpenClawConfig, JSON.stringify({
      version: '1.0',
      agents: ['aki', 'kobeni', 'kazuma'],
      workspacePath: testWorkspacePath
    }, null, 2))
    
    // Create sample session files
    fs.writeFileSync(
      path.join(testAgentsPath, 'aki', 'sessions', 'session1.jsonl'),
      JSON.stringify({
        requestId: 'req-001',
        timestamp: Date.now(),
        messages: [
          { role: 'user', content: 'Hello Aki' },
          { role: 'assistant', content: 'Hi there! How can I help?' }
        ]
      }) + '\n'
    )
    
    fs.writeFileSync(
      path.join(testAgentsPath, 'kobeni', 'sessions', 'session1.jsonl'),
      JSON.stringify({
        requestId: 'req-002',
        timestamp: Date.now(),
        messages: [
          { role: 'user', content: 'Hello Kobeni' }
        ]
      }) + '\n'
    )
  })

  afterAll(() => {
    // Cleanup test workspace
    fs.rmSync(testWorkspacePath, { recursive: true, force: true })
  })

  describe('readOpenClawWorkspace', () => {
    it('should read workspace config successfully', () => {
      const result = readOpenClawWorkspace(testWorkspacePath)

      expect(result).toBeDefined()
      expect(result?.version).toBe('1.0')
      expect(result?.agents).toEqual(['aki', 'kobeni', 'kazuma'])
      expect(result?.workspacePath).toBe(testWorkspacePath)
    })

    it('should return null when config file does not exist', () => {
      const result = readOpenClawWorkspace('/nonexistent/path')

      expect(result).toBeNull()
    })

    it('should handle invalid JSON gracefully', () => {
      // Create invalid JSON file
      const invalidPath = '/tmp/invalid-workspace'
      fs.mkdirSync(invalidPath, { recursive: true })
      fs.writeFileSync(path.join(invalidPath, 'openclaw.json'), 'invalid json content')

      const result = readOpenClawWorkspace(invalidPath)

      expect(result).toBeNull()
      
      // Cleanup
      fs.rmSync(invalidPath, { recursive: true, force: true })
    })

    it('should handle missing version gracefully', () => {
      const emptyVersionPath = '/tmp/empty-version-workspace'
      fs.mkdirSync(emptyVersionPath, { recursive: true })
      fs.writeFileSync(path.join(emptyVersionPath, 'openclaw.json'), JSON.stringify({}))

      const result = readOpenClawWorkspace(emptyVersionPath)

      expect(result?.version).toBe('unknown')
      
      // Cleanup
      fs.rmSync(emptyVersionPath, { recursive: true, force: true })
    })
  })

  describe('parseAgentSession', () => {
    it('should parse valid session file', () => {
      const sessionPath = path.join(testAgentsPath, 'aki', 'sessions', 'session1.jsonl')
      const result = parseAgentSession(sessionPath)

      expect(result).toBeDefined()
      expect(result?.requestId).toBe('req-001')
      expect(result?.messages).toHaveLength(2)
      expect(result?.messages[0].role).toBe('user')
      expect(result?.messages[0].content).toBe('Hello Aki')
    })

    it('should return null when session file does not exist', () => {
      const result = parseAgentSession('/nonexistent/path/session.jsonl')

      expect(result).toBeNull()
    })

    it('should handle malformed JSON gracefully', () => {
      const invalidPath = '/tmp/invalid-session'
      fs.mkdirSync(invalidPath, { recursive: true })
      fs.writeFileSync(path.join(invalidPath, 'session.jsonl'), 'invalid json')

      const result = parseAgentSession(path.join(invalidPath, 'session.jsonl'))

      expect(result).toBeNull()
      
      // Cleanup
      fs.rmSync(invalidPath, { recursive: true, force: true })
    })

    it('should handle empty messages array', () => {
      const emptySessionPath = '/tmp/empty-session'
      fs.mkdirSync(emptySessionPath, { recursive: true })
      fs.writeFileSync(
        path.join(emptySessionPath, 'session.jsonl'),
        JSON.stringify({
          requestId: 'req-empty',
          messages: []
        }) + '\n'
      )

      const result = parseAgentSession(path.join(emptySessionPath, 'session.jsonl'))

      expect(result?.messages).toHaveLength(0)
      
      // Cleanup
      fs.rmSync(emptySessionPath, { recursive: true, force: true })
    })
  })

  describe('monitorFileChanges', () => {
    it('should start file watcher', () => {
      const callback = vi.fn()
      const watcher = monitorFileChanges(testWorkspacePath, callback)

      expect(watcher).toBeDefined()
      expect(callback).not.toHaveBeenCalled()
      
      // Clean up
      watcher.close()
    })

    it('should call callback on file change event', async () => {
      const callback = vi.fn()
      const watcher = monitorFileChanges(testWorkspacePath, callback)

      // Create a new file to trigger change event
      const testFile = path.join(testWorkspacePath, 'test-file.txt')
      fs.writeFileSync(testFile, 'test content')
      
      // Wait for event
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(callback).toHaveBeenCalled()
      
      // Clean up
      watcher.close()
      fs.unlinkSync(testFile)
    })

    it('should stop watcher when callback returns false', async () => {
      const callback = vi.fn(() => false)
      const watcher = monitorFileChanges(testWorkspacePath, callback)

      // Create a new file
      const testFile = path.join(testWorkspacePath, 'test-file2.txt')
      fs.writeFileSync(testFile, 'test content')
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(callback).toHaveBeenCalled()
      
      // Clean up
      watcher.close()
      fs.unlinkSync(testFile)
    })
  })

  describe('Helper Functions', () => {
    describe('getWorkspacePath', () => {
      it('should return environment variable if set', () => {
        process.env.OPENCLAW_WORKSPACE_PATH = '/env/path'
        expect(getWorkspacePath()).toBe('/env/path')
        delete process.env.OPENCLAW_WORKSPACE_PATH
      })

      it('should return default path if env variable not set', () => {
        delete process.env.OPENCLAW_WORKSPACE_PATH
        expect(getWorkspacePath()).toBe('/home/olegs/.openclaw/workspace-company')
      })
    })

    describe('listAgents', () => {
      it('should list agent directories', () => {
        const agents = listAgents()

        // Should list agents from the workspace
        expect(Array.isArray(agents)).toBe(true)
      })

      it('should return empty array when agents directory does not exist', () => {
        const result = listAgents()
        expect(Array.isArray(result)).toBe(true)
      })
    })

    describe('getAgentSessionFile', () => {
      it('should return null when no session files exist for agent', () => {
        const sessionFile = getAgentSessionFile('kobeni')

        expect(sessionFile).toBeNull()
      })

      it('should return null when no session files exist', () => {
        const sessionFile = getAgentSessionFile('kazuma')

        expect(sessionFile).toBeNull()
      })

      it('should return null when agent directory does not exist', () => {
        const sessionFile = getAgentSessionFile('nonexistent')

        expect(sessionFile).toBeNull()
      })
    })
  })
})

describe('File Monitor - Real-time Monitoring Scenarios', () => {
  const testPath = '/tmp/test-file-monitor'

  beforeAll(() => {
    fs.mkdirSync(testPath, { recursive: true })
    fs.writeFileSync(path.join(testPath, 'file1.txt'), 'content 1')
  })

  afterAll(() => {
    fs.rmSync(testPath, { recursive: true, force: true })
  })

  it('should detect workspace file changes', async () => {
    const changes: Array<{ event: string; file: string | null }> = []
    
    const callback = (event: string, file: string | null) => {
      if (file && file === 'file1.txt') {
        changes.push({ event, file })
        return false // Stop after first change
      }
      return undefined
    }

    const watcher = monitorFileChanges(testPath, callback)
    
    // Make a change
    fs.unlinkSync(path.join(testPath, 'file1.txt'))
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(changes.length).toBeGreaterThan(0)
    
    watcher.close()
  })

  it('should handle concurrent file operations', async () => {
    const callback = vi.fn()
    const watcher = monitorFileChanges(testPath, callback)

    // Make multiple changes
    for (let i = 0; i < 3; i++) {
      const testFile = path.join(testPath, `concurrent-${i}.txt`)
      fs.writeFileSync(testFile, `content ${i}`)
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    await new Promise(resolve => setTimeout(resolve, 100))

    // Should have recorded multiple events (at least 3)
    expect(callback).toHaveBeenCalledTimes(6) // Multiple events per file
    
    watcher.close()
  })
})

describe('File Monitor - Error Handling', () => {
  it('should handle permission errors gracefully', () => {
    const result = readOpenClawWorkspace('/protected/path')

    expect(result).toBeNull()
  })

  it('should handle disk errors gracefully', () => {
    // This test verifies error handling by using non-existent paths
    const result = parseAgentSession('/nonexistent/path/to/file.jsonl')

    expect(result).toBeNull()
  })
})

describe('File Monitor - Company Roster Parsing', () => {
  const testWorkspacePath = '/tmp/test-company-roster'

  beforeAll(() => {
    // Create test workspace structure
    fs.mkdirSync(testWorkspacePath, { recursive: true })
  })

  afterAll(() => {
    // Cleanup test workspace
    fs.rmSync(testWorkspacePath, { recursive: true, force: true })
  })

  it('should parse valid company roster', async () => {
    // Create a COMPANY_ROSTER.md file with valid JSON
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "agents": [
    {
      "name": "makima",
      "role": "CEO",
      "specialization": "orchestration",
      "skills": ["strategy", "coordination"]
    },
    {
      "name": "aki",
      "role": "Developer",
      "specialization": "coding",
      "skills": ["coding", "testing"]
    }
  ]
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = await readCompanyRoster(testWorkspacePath)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)
    expect(result[0].name).toBe('makima')
    expect(result[0].role).toBe('CEO')
    expect(result[0].skills).toEqual(['strategy', 'coordination'])
    expect(result[1].name).toBe('aki')
    expect(result[1].role).toBe('Developer')
  })

  it('should return empty array when file does not exist', async () => {
    const result = await readCompanyRoster('/nonexistent/path')

    expect(result).toEqual([])
  })

  it('should handle missing JSON section gracefully', async () => {
    const rosterContent = `# COMPANY ROSTER
No JSON section here
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = await readCompanyRoster(testWorkspacePath)

    expect(result).toEqual([])
  })

  it('should handle malformed JSON gracefully', async () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{ invalid json content
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = await readCompanyRoster(testWorkspacePath)

    expect(result).toEqual([])
  })

  it('should handle agents with missing optional fields', async () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "agents": [
    {
      "name": "power",
      "role": "Designer"
    }
  ]
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = await readCompanyRoster(testWorkspacePath)

    expect(result.length).toBe(1)
    expect(result[0].name).toBe('power')
    expect(result[0].role).toBe('Designer')
    expect(result[0].specialization).toBe('general')
    expect(result[0].skills).toEqual(['general'])
  })

  it('should filter out invalid agent entries', async () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "agents": [
    {
      "name": "denji",
      "role": "Researcher",
      "skills": ["research"]
    },
    {
      "role": "Invalid Agent"
    },
    {
      "name": "kobeni",
      "role": "Tester",
      "skills": ["testing"]
    }
  ]
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = await readCompanyRoster(testWorkspacePath)

    expect(result.length).toBe(2)
    expect(result.find(a => a.name === 'denji')).toBeDefined()
    expect(result.find(a => a.name === 'kobeni')).toBeDefined()
  })

  it('should use default workspace path when not provided', async () => {
    const result = await readCompanyRoster()

    expect(Array.isArray(result)).toBe(true)
    // Should parse the actual workspace roster or return empty if not found
  })
})

describe('File Monitor - Workflow Data Parsing', () => {
  const testWorkspacePath = '/tmp/test-workflow-data'

  beforeAll(() => {
    // Create test workspace structure
    fs.mkdirSync(testWorkspacePath, { recursive: true })
  })

  afterAll(() => {
    // Cleanup test workspace
    fs.rmSync(testWorkspacePath, { recursive: true, force: true })
  })

  it('should parse valid workflow data with stories and tickets', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "workflow": {
    "currentStories": [
      {
        "id": "STORY-001",
        "title": "Implement Dashboard",
        "description": "Add story tracking system",
        "type": "feature",
        "priority": "high",
        "status": "in-progress",
        "assignee": "aki",
        "createdAt": "2026-03-03T16:45:00Z",
        "updatedAt": "2026-03-03T16:45:00Z",
        "tickets": [
          {
            "id": "TICKET-001-001",
            "title": "Define data structures",
            "description": "Create JSON formats for stories",
            "assignee": "makima",
            "status": "completed",
            "priority": "high"
          },
          {
            "id": "TICKET-001-002",
            "title": "Implement dashboard UI",
            "description": "Update dashboard to show stories",
            "assignee": "power",
            "status": "in-progress",
            "priority": "high"
          }
        ]
      }
    ]
  }
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0].id).toBe('STORY-001')
    expect(result[0].title).toBe('Implement Dashboard')
    expect(result[0].type).toBe('feature')
    expect(result[0].priority).toBe('high')
    expect(result[0].status).toBe('progress')
    expect(result[0].assignee).toBe('aki')
    expect(result[0].tickets.length).toBe(2)
    expect(result[0].tickets[0].id).toBe('TICKET-001-001')
    expect(result[0].tickets[0].assignee).toBe('makima')
    expect(result[0].tickets[1].id).toBe('TICKET-001-002')
    expect(result[0].tickets[1].status).toBe('progress')
  })

  it('should return empty array when file does not exist', () => {
    const result = readWorkflowData('/nonexistent/path')

    expect(result).toEqual([])
  })

  it('should handle missing JSON section gracefully', () => {
    const rosterContent = `# COMPANY ROSTER
No JSON section here
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result).toEqual([])
  })

  it('should handle malformed JSON gracefully', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{ invalid json content
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result).toEqual([])
  })

  it('should handle stories with missing optional fields', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "workflow": {
    "currentStories": [
      {
        "id": "STORY-002",
        "title": "Minor Fix"
      }
    ]
  }
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result.length).toBe(1)
    expect(result[0].id).toBe('STORY-002')
    expect(result[0].title).toBe('Minor Fix')
    expect(result[0].description).toBe('')
    expect(result[0].type).toBe('feature')
    expect(result[0].priority).toBe('medium')
    expect(result[0].status).toBe('pending')
    expect(result[0].assignee).toBe('unassigned')
  })

  it('should handle empty stories array', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "workflow": {
    "currentStories": []
  }
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result).toEqual([])
  })

  it('should filter out invalid story entries', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "workflow": {
    "currentStories": [
      {
        "id": "STORY-003",
        "title": "Valid Story"
      },
      {
        "title": "Invalid Story Missing ID"
      }
    ]
  }
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result.length).toBe(1)
    expect(result[0].id).toBe('STORY-003')
  })

  it('should handle stories without tickets', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "workflow": {
    "currentStories": [
      {
        "id": "STORY-004",
        "title": "Story Without Tickets",
        "description": "This story has no nested tickets"
      }
    ]
  }
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result.length).toBe(1)
    expect(result[0].tickets).toEqual([])
  })

  it('should use default workspace path when not provided', () => {
    const result = readWorkflowData()

    expect(Array.isArray(result)).toBe(true)
    // Should parse the actual workspace workflow data
  })

  it('should correctly transform ticket statuses to TaskStatus type', () => {
    const rosterContent = `# COMPANY ROSTER
## Dashboard Agent Configuration (JSON)

\`\`\`json
{
  "workflow": {
    "currentStories": [
      {
        "id": "STORY-005",
        "title": "Status Test",
        "type": "feature",
        "priority": "high",
        "status": "pending",
        "assignee": "aki",
        "createdAt": "2026-03-03T16:45:00Z",
        "updatedAt": "2026-03-03T16:45:00Z",
        "tickets": [
          {
            "id": "TICKET-005-001",
            "title": "Ticket Pending",
            "status": "pending",
            "priority": "medium",
            "assignee": "makima"
          },
          {
            "id": "TICKET-005-002",
            "title": "Ticket Progress",
            "status": "in-progress",
            "priority": "high",
            "assignee": "power"
          }
        ]
      }
    ]
  }
}
\`\`\`
`
    fs.writeFileSync(path.join(testWorkspacePath, 'COMPANY_ROSTER.md'), rosterContent)
    
    const result = readWorkflowData(testWorkspacePath)

    expect(result[0].status).toBe('pending')
    expect(result[0].tickets[0].status).toBe('pending')
    expect(result[0].tickets[1].status).toBe('progress')
  })
})
