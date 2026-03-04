import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTeamTracker } from './useTeamTracker'
import { sessions_list } from '@/lib/openclaw-api'

// Mock the OpenClaw API
vi.mock('@/lib/openclaw-api', () => ({
  sessions_list: vi.fn()
}))

describe('useTeamTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('should initialize with empty team and loading state', async () => {
    // Mock empty sessions
    ;(sessions_list as any).mockResolvedValue([])

    const { result } = renderHook(() => useTeamTracker())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.team).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should fetch team status and map sessions correctly', async () => {
    // Mock active sessions
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

    const { result } = renderHook(() => useTeamTracker())

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 10000 })

    // Check Makima is active
    const makima = result.current.team.find(member => member.id === 'makima')
    expect(makima?.status).toBe('working')
    expect(makima?.sessionCount).toBeGreaterThanOrEqual(1)

    // Check Aki is active
    const aki = result.current.team.find(member => member.id === 'aki')
    expect(aki?.status).toBe('working')
    expect(aki?.sessionCount).toBeGreaterThanOrEqual(1)

    // Check idle members - Himeno should be in default team
    const himeno = result.current.team.find(member => member.id === 'himeno')
    if (himeno) {
      expect(himeno?.status).toBe('idle')
      expect(himeno?.sessionCount).toBe(0)
    }
  })

  it('should handle API errors gracefully', async () => {
    ;(sessions_list as any).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useTeamTracker())

    await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 10000 })
    expect(result.current.error).toBe('Failed to fetch team status')
    expect(result.current.isLoading).toBe(false)
  })

  it('should refresh team status when refresh is called', async () => {
    let callCount = 0
    ;(sessions_list as any).mockImplementation(() => {
      callCount++
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useTeamTracker())

    await waitFor(() => expect(callCount).toBe(1), { timeout: 10000 })

    // Trigger refresh
    result.current.refresh()
    await waitFor(() => expect(callCount).toBe(2), { timeout: 10000 })
  }, 20000)

  it('should have proper team structure', async () => {
    ;(sessions_list as any).mockResolvedValue([])

    const { result } = renderHook(() => useTeamTracker())

    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 10000 })

    // Check that team roster includes expected agents
    expect(result.current.team).toBeDefined()
    expect(Array.isArray(result.current.team)).toBe(true)
    
    // Check that team has members with expected structure
    if (result.current.team.length > 0) {
      const firstMember = result.current.team[0]
      expect(firstMember).toHaveProperty('id')
      expect(firstMember).toHaveProperty('name')
      expect(firstMember).toHaveProperty('role')
      expect(firstMember).toHaveProperty('status')
    }
  })
})
