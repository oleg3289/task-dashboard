import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, waitFor as waitForResult } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTeamTracker } from './useTeamTracker'
import { sessions_list } from '@/lib/openclaw-api'
import { TeamStatus } from '../team-status'

// Mock the OpenClaw API
vi.mock('@/lib/openclaw-api', () => ({
  sessions_list: vi.fn()
}))

// Mock fetch for assignments
const mockFetchAssignments = (assignments: any[]) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ assignments, lastUpdated: new Date().toISOString() })
    })
  ) as any
}

describe('useTeamTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    if (global.fetch) {
      vi.restoreAllMocks()
    }
  })

  it('should initialize with empty team and loading state', async () => {
    ;(sessions_list as any).mockResolvedValue([])
    mockFetchAssignments([])

    const { result } = renderHook(() => useTeamTracker())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.team).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should fetch team status and map sessions correctly', async () => {
    ;(sessions_list as any).mockResolvedValue([
      {
        sessionKey: 'agent:makima:telegram:direct:548498854',
        agentId: 'makima',
        status: 'active',
        createdAt: '2026-03-04T12:00:00Z'
      },
      {
        sessionKey: 'agent:aki:subagent:development',
        agentId: 'aki',
        status: 'active',
        createdAt: '2026-03-04T12:05:00Z'
      }
    ])

    mockFetchAssignments([
      {
        id: 'task-001',
        task: 'Review dashboard design',
        assignee: 'makima',
        status: 'assigned',
        priority: 'high',
        createdAt: '2026-03-04T10:00:00Z',
        timeout: 3600000
      }
    ])

    const { result } = renderHook(() => useTeamTracker())

    await waitForResult(() => expect(result.current.isLoading).toBe(false), { timeout: 10000 })

    const makima = result.current.team.find(member => member.id === 'makima')
    expect(makima?.status).toBe('working')
    expect(makima?.hasActiveAssignment).toBe(true)
    expect(makima?.sessionCount).toBeGreaterThanOrEqual(1)

    const aki = result.current.team.find(member => member.id === 'aki')
    expect(aki?.status).toBe('available')
    expect(aki?.hasActiveAssignment).toBe(false)
    expect(aki?.sessionCount).toBeGreaterThanOrEqual(1)

    const himeno = result.current.team.find(member => member.id === 'himeno')
    if (himeno) {
      expect(himeno?.status).toBe('idle')
      expect(himeno?.sessionCount).toBe(0)
    }
  })

  it('should handle API errors gracefully', async () => {
    ;(sessions_list as any).mockRejectedValue(new Error('API Error'))
    mockFetchAssignments([])

    const { result } = renderHook(() => useTeamTracker())

    await waitForResult(() => expect(result.current.error).not.toBeNull(), { timeout: 10000 })
    expect(result.current.error).toBe('Failed to fetch team status')
    expect(result.current.isLoading).toBe(false)
  })

  it('should refresh team status when refresh is called', async () => {
    let callCount = 0
    ;(sessions_list as any).mockImplementation(() => {
      callCount++
      return Promise.resolve([])
    })
    mockFetchAssignments([])

    const { result } = renderHook(() => useTeamTracker())

    await waitForResult(() => expect(callCount).toBe(1), { timeout: 10000 })

    result.current.refresh()
    await waitForResult(() => expect(callCount).toBe(2), { timeout: 10000 })
  }, 20000)

  it('should have proper team structure', async () => {
    ;(sessions_list as any).mockResolvedValue([])
    mockFetchAssignments([])

    const { result } = renderHook(() => useTeamTracker())

    await waitForResult(() => expect(result.current.isLoading).toBe(false), { timeout: 10000 })

    expect(result.current.team).toBeDefined()
    expect(Array.isArray(result.current.team)).toBe(true)
    
    if (result.current.team.length > 0) {
      const firstMember = result.current.team[0]
      expect(firstMember).toHaveProperty('id')
      expect(firstMember).toHaveProperty('name')
      expect(firstMember).toHaveProperty('role')
      expect(firstMember).toHaveProperty('status')
      expect(firstMember).toHaveProperty('hasActiveAssignment')
    }
  })
})

describe('TeamStatus Component', () => {
  const mockUseTeamTracker = useTeamTracker as any

  beforeEach(() => {
    vi.clearAllMocks()
    if (global.fetch) {
      vi.restoreAllMocks()
    }
  })

  it('should display team members with their status', async () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'makima',
          name: 'Makima',
          role: 'CEO Orchestrator',
          status: 'working' as const,
          currentTask: 'Active session with assignment',
          sessionCount: 1,
          lastActive: new Date().toISOString(),
          hasActiveAssignment: true
        },
        {
          id: 'himeno',
          name: 'Himeno',
          role: 'Reviewer',
          status: 'available' as const,
          currentTask: 'Available (no active task)',
          sessionCount: 1,
          lastActive: new Date().toISOString(),
          hasActiveAssignment: false
        },
        {
          id: 'kobeni',
          name: 'Kobeni',
          role: 'Tester',
          status: 'idle' as const,
          currentTask: null,
          sessionCount: 0,
          lastActive: null,
          hasActiveAssignment: false
        }
      ],
      isLoading: false,
      error: null
    })

    render(<TeamStatus />)

    expect(screen.getByText('Makima')).toBeInTheDocument()
    expect(screen.getByText('CEO Orchestrator')).toBeInTheDocument()
    expect(screen.getByText('working')).toBeInTheDocument()
    expect(screen.getByText('Active session with assignment')).toBeInTheDocument()

    expect(screen.getByText('Himeno')).toBeInTheDocument()
    expect(screen.getByText('Reviewer')).toBeInTheDocument()
    expect(screen.getByText('available')).toBeInTheDocument()
    expect(screen.getByText('Available (no active task)').toBeInTheDocument())

    expect(screen.getByText('Kobeni')).toBeInTheDocument()
    expect(screen.getByText('Tester')).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('should display compact version when compact prop is true', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'aki',
          name: 'Aki',
          role: 'Developer',
          status: 'working' as const,
          currentTask: 'Development work',
          sessionCount: 2,
          lastActive: new Date().toISOString(),
          hasActiveAssignment: true
        }
      ],
      isLoading: false,
      error: null
    })

    render(<TeamStatus compact={true} />)

    expect(screen.getByText('Aki')).toBeInTheDocument()
  })

  it('should show status indicators with correct colors', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'makima',
          name: 'Makima',
          role: 'CEO',
          status: 'working' as const,
          currentTask: 'Active',
          sessionCount: 1,
          lastActive: new Date().toISOString(),
          hasActiveAssignment: true
        }
      ],
      isLoading: false,
      error: null
    })

    render(<TeamStatus />)

    const statusDot = screen.getByText('working').closest('div')
    expect(statusDot).toBeInTheDocument()
  })

  it('should handle empty team state', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [],
      isLoading: false,
      error: null
    })

    render(<TeamStatus />)

    expect(screen.queryByText('Makima')).not.toBeInTheDocument()
    expect(screen.queryByText('Aki')).not.toBeInTheDocument()
  })
})
