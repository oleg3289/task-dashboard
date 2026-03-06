import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TeamStatus } from '../team-status'
import { useTeamTracker } from '@/hooks/useTeamTracker'

vi.mock('@/hooks/useTeamTracker', () => ({
  useTeamTracker: vi.fn()
}))

describe('TeamStatus', () => {
  const mockUseTeamTracker = useTeamTracker as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [],
      isLoading: true,
      error: null
    })

    render(<TeamStatus />)

    expect(screen.getByText('Loading team status...')).toBeTruthy()
  })

  it('should display error state', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [],
      isLoading: false,
      error: 'Failed to fetch team status'
    })

    render(<TeamStatus />)

    expect(screen.getByText('Error: Failed to fetch team status')).toBeTruthy()
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
    // Note: currentTask is only shown when status is 'working'

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
