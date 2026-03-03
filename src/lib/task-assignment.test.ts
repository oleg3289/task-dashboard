/**
 * Task Assignment Tests - Unit Tests
 * 
 * This test suite verifies:
 * - Task assignment functionality
 * - Agent-task relationship management
 * - Workload distribution
 * - Task state transitions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Mock data structures
interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  createdAt: string
  dueDate?: string
  tags?: string[]
}

interface Agent {
  id: string
  name: string
  role: string
  currentTasks: string[]
  maxTasks: number
  skills: string[]
}

describe('Task Assignment - Unit Tests', () => {
  it('should create a new task with required fields', () => {
    const task: Task = {
      id: 'task-001',
      title: 'Review dashboard design',
      description: 'Review the new dashboard layout',
      status: 'pending' as const,
      priority: 'medium' as const,
      createdAt: new Date().toISOString()
    }

    expect(task.id).toBe('task-001')
    expect(task.title).toBe('Review dashboard design')
    expect(task.status).toBe('pending')
    expect(task.priority).toBe('medium')
  })

  it('should create a task with optional fields', () => {
    const task: Task = {
      id: 'task-002',
      title: 'Fix navigation bug',
      description: 'The navigation menu is not collapsing on mobile',
      status: 'progress' as const,
      priority: 'high' as const,
      assignee: 'aki',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['bug', 'frontend', 'mobile']
    }

    expect(task.assignee).toBe('aki')
    expect(task.dueDate).toBeDefined()
    expect(task.tags).toEqual(['bug', 'frontend', 'mobile'])
  })

  it('should create an agent with workload information', () => {
    const agent: Agent = {
      id: 'agent-001',
      name: 'Aki',
      role: 'developer',
      currentTasks: ['task-001', 'task-002'],
      maxTasks: 5,
      skills: ['typescript', 'react', 'nodejs']
    }

    expect(agent.name).toBe('Aki')
    expect(agent.currentTasks).toEqual(['task-001', 'task-002'])
    expect(agent.maxTasks).toBe(5)
  })

  describe('Task Assignment Logic', () => {
    it('should assign task to available agent', () => {
      const agent: Agent = {
        id: 'agent-001',
        name: 'Aki',
        role: 'developer',
        currentTasks: ['task-001'],
        maxTasks: 5,
        skills: ['typescript', 'react']
      }

      const task: Task = {
        id: 'task-002',
        title: 'Add new feature',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      }

      // Check if agent has available capacity
      const hasCapacity = agent.currentTasks.length < agent.maxTasks

      expect(hasCapacity).toBe(true)

      // Assign task
      if (hasCapacity) {
        agent.currentTasks.push(task.id)
      }

      expect(agent.currentTasks).toContain('task-002')
    })

    it('should not assign task to full agent', () => {
      const agent: Agent = {
        id: 'agent-001',
        name: 'Aki',
        role: 'developer',
        currentTasks: ['task-001', 'task-002', 'task-003', 'task-004', 'task-005'],
        maxTasks: 5,
        skills: ['typescript']
      }

      const task: Task = {
        id: 'task-006',
        title: 'New task',
        status: 'pending' as const,
        priority: 'low' as const,
        createdAt: new Date().toISOString()
      }

      // Check if agent has available capacity
      const hasCapacity = agent.currentTasks.length < agent.maxTasks

      expect(hasCapacity).toBe(false)

      // Task should not be assigned
      if (!hasCapacity) {
        // Task would be added to a queue or assigned to another agent
      }

      expect(agent.currentTasks).not.toContain('task-006')
      expect(agent.currentTasks).toHaveLength(5)
    })

    it('should assign task based on agent skills', () => {
      const agents: Agent[] = [
        {
          id: 'agent-001',
          name: 'Aki',
          role: 'developer',
          currentTasks: [],
          maxTasks: 5,
          skills: ['typescript', 'react']
        },
        {
          id: 'agent-002',
          name: 'Kobeni',
          role: 'developer',
          currentTasks: [],
          maxTasks: 5,
          skills: ['python', 'django']
        }
      ]

      const task: Task = {
        id: 'task-001',
        title: 'Build React component',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString(),
        tags: ['frontend', 'react']
      }

      // Find agent with matching skills
      const suitableAgent = agents.find(agent =>
        agent.skills.includes('react') &&
        agent.currentTasks.length < agent.maxTasks
      )

      expect(suitableAgent?.name).toBe('Aki')
    })

    it('should prioritize tasks by severity', () => {
      const tasks: Task[] = [
        {
          id: 'task-001',
          title: 'Low priority task',
          status: 'pending' as const,
          priority: 'low' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'task-002',
          title: 'Critical task',
          status: 'pending' as const,
          priority: 'critical' as const,
          createdAt: new Date(Date.now() - 1000).toISOString() // Older
        },
        {
          id: 'task-003',
          title: 'High priority task',
          status: 'pending' as const,
          priority: 'high' as const,
          createdAt: new Date().toISOString()
        }
      ]

      // Sort by priority (critical first)
      const priorityOrder: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      }

      const sortedTasks = [...tasks].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      )

      expect(sortedTasks[0].priority).toBe('critical')
      expect(sortedTasks[1].priority).toBe('high')
      expect(sortedTasks[2].priority).toBe('low')
    })
  })

  describe('Workload Distribution', () => {
    it('should balance workload across agents', () => {
      const agents: Agent[] = [
        {
          id: 'agent-001',
          name: 'Aki',
          role: 'developer',
          currentTasks: ['task-001', 'task-002'],
          maxTasks: 5,
          skills: ['typescript', 'react']
        },
        {
          id: 'agent-002',
          name: 'Kobeni',
          role: 'developer',
          currentTasks: ['task-003', 'task-004', 'task-005'],
          maxTasks: 5,
          skills: ['python', 'django']
        },
        {
          id: 'agent-003',
          name: 'Kazuma',
          role: 'developer',
          currentTasks: [],
          maxTasks: 5,
          skills: ['typescript', 'nodejs']
        }
      ]

      const newTask: Task = {
        id: 'task-006',
        title: 'New task',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      }

      // Find the agent with the least workload
      const leastWorkloadAgent = agents.reduce((least, agent) =>
        agent.currentTasks.length < least.currentTasks.length ? agent : least
      )

      expect(leastWorkloadAgent.name).toBe('Kazuma')
      expect(leastWorkloadAgent.currentTasks).toHaveLength(0)
    })

    it('should calculate agent utilization percentage', () => {
      const agent: Agent = {
        id: 'agent-001',
        name: 'Aki',
        role: 'developer',
        currentTasks: ['task-001', 'task-002'],
        maxTasks: 5,
        skills: ['typescript']
      }

      const utilization = (agent.currentTasks.length / agent.maxTasks) * 100

      expect(utilization).toBe(40)
    })

    it('should identify overloaded agents', () => {
      const agents: Agent[] = [
        {
          id: 'agent-001',
          name: 'Aki',
          role: 'developer',
          currentTasks: ['task-001', 'task-002', 'task-003'],
          maxTasks: 5,
          skills: ['typescript']
        },
        {
          id: 'agent-002',
          name: 'Kobeni',
          role: 'developer',
          currentTasks: ['task-004', 'task-005', 'task-006', 'task-007', 'task-008'],
          maxTasks: 5,
          skills: ['python']
        }
      ]

      // Find overloaded agents (100% or more utilization)
      const overloadedAgents = agents.filter(agent =>
        agent.currentTasks.length >= agent.maxTasks
      )

      expect(overloadedAgents).toHaveLength(1)
      expect(overloadedAgents[0].name).toBe('Kobeni')
    })
  })

  describe('Task State Transitions', () => {
    it('should transition task from pending to progress', () => {
      const task: Task = {
        id: 'task-001',
        title: 'Test task',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      }

      // Simulate starting work on task
      const updatedTask: Task = {
        ...task,
        status: 'progress' as const,
        updatedAt: new Date().toISOString()
      }

      expect(updatedTask.status).toBe('progress')
    })

    it('should transition task from progress to completed', () => {
      const task: Task = {
        id: 'task-001',
        title: 'Test task',
        status: 'progress' as const,
        priority: 'medium' as const,
        createdAt: new Date().toISOString()
      }

      // Simulate completing task
      const updatedTask: Task = {
        ...task,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      expect(updatedTask.status).toBe('completed')
      expect(updatedTask.completedAt).toBeDefined()
    })

    it('should transition task to blocked with reason', () => {
      const task: Task = {
        id: 'task-001',
        title: 'Test task',
        status: 'progress' as const,
        priority: 'high' as const,
        createdAt: new Date().toISOString()
      }

      // Simulate blocking task
      const updatedTask: Task = {
        ...task,
        status: 'blocked' as const,
        blockedReason: 'Waiting for API response',
        updatedAt: new Date().toISOString()
      }

      expect(updatedTask.status).toBe('blocked')
      expect(updatedTask.blockedReason).toBe('Waiting for API response')
    })

    it('should support task reassignment', () => {
      let task: Task = {
        id: 'task-001',
        title: 'Test task',
        status: 'pending' as const,
        priority: 'medium' as const,
        assignee: 'Aki',
        createdAt: new Date().toISOString()
      }

      // Reassign to different agent
      task = {
        ...task,
        assignee: 'Kobeni',
        reassignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      expect(task.assignee).toBe('Kobeni')
      expect(task.reassignedAt).toBeDefined()
    })
  })

  describe('Task Filtering and Search', () => {
    const tasks: Task[] = [
      { id: 't1', title: 'Bug fix', status: 'pending' as const, priority: 'high' as const, assignee: 'Aki', createdAt: new Date().toISOString() },
      { id: 't2', title: 'Feature add', status: 'progress' as const, priority: 'medium' as const, assignee: 'Kobeni', createdAt: new Date().toISOString() },
      { id: 't3', title: 'Documentation', status: 'completed' as const, priority: 'low' as const, assignee: 'Kazuma', createdAt: new Date().toISOString() },
      { id: 't4', title: 'Testing', status: 'pending' as const, priority: 'critical' as const, assignee: 'Aki', createdAt: new Date().toISOString() },
    ]

    it('should filter tasks by status', () => {
      const pendingTasks = tasks.filter(t => t.status === 'pending')

      expect(pendingTasks).toHaveLength(2)
      expect(pendingTasks.every(t => t.status === 'pending')).toBe(true)
    })

    it('should filter tasks by assignee', () => {
      const akiTasks = tasks.filter(t => t.assignee === 'Aki')

      expect(akiTasks).toHaveLength(2)
      expect(akiTasks.every(t => t.assignee === 'Aki')).toBe(true)
    })

    it('should filter tasks by priority', () => {
      const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'critical')

      expect(highPriorityTasks).toHaveLength(2)
    })

    it('should search tasks by title', () => {
      const searchTasks = tasks.filter(t =>
        t.title.toLowerCase().includes('task') || t.title.toLowerCase().includes('fix') || 
        t.title.toLowerCase().includes('add') || t.title.toLowerCase().includes('doc') ||
        t.title.toLowerCase().includes('testing')
      )

      expect(searchTasks.length).toBeGreaterThan(0)
    })
  })
})

describe('Task Assignment - Integration Tests', () => {
  it('should handle complete task assignment workflow', () => {
    // Initialize agents
    const agents: Agent[] = [
      {
        id: 'agent-001',
        name: 'Aki',
        role: 'developer',
        currentTasks: ['task-001'],
        maxTasks: 5,
        skills: ['typescript', 'react']
      },
      {
        id: 'agent-002',
        name: 'Kobeni',
        role: 'developer',
        currentTasks: [],
        maxTasks: 5,
        skills: ['python', 'django']
      }
    ]

    // Create tasks
    const newTasks: Task[] = [
      {
        id: 'task-002',
        title: 'Build dashboard',
        status: 'pending' as const,
        priority: 'critical' as const,
        createdAt: new Date().toISOString(),
        tags: ['frontend', 'dashboard']
      },
      {
        id: 'task-003',
        title: 'Create API endpoints',
        status: 'pending' as const,
        priority: 'high' as const,
        createdAt: new Date().toISOString(),
        tags: ['backend', 'api']
      }
    ]

    // Assign tasks to agents
    const assignedTasks: Array<{ task: Task; agent: Agent }> = []

    newTasks.forEach(task => {
      // Find suitable agent (least workload + matching skills)
      const suitableAgent = agents.find(agent =>
        agent.skills.some(skill => task.tags?.includes(skill)) &&
        agent.currentTasks.length < agent.maxTasks
      ) || agents.find(agent => agent.currentTasks.length < agent.maxTasks)

      if (suitableAgent) {
        // Assign task
        const assignedTask: Task = {
          ...task,
          assignee: suitableAgent.name,
          assignedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Update agent workload
        suitableAgent.currentTasks.push(task.id)

        assignedTasks.push({ task: assignedTask, agent: suitableAgent })
      }
    })

    // Verify assignments
    expect(assignedTasks).toHaveLength(2)
    // Tasks should be assigned to agents
    const totalTasks = agents.reduce((sum, agent) => sum + agent.currentTasks.length, 0)
    expect(totalTasks).toBe(3) // Initial task-001 + 2 new tasks
  })
})
