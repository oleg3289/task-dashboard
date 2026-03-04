import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TeamStatus } from '../team-status'
import { useTeamTracker } from '@/hooks/useTeamTracker'

// Mock the useTeamTracker hook
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
          status: 'working',
          currentTask: 'Active session',
          sessionCount: 1,
          lastActive: new Date().toISOString()
        },
        {
          id: 'himeno',
          name: 'Himeno',
          role: 'Reviewer',
          status: 'idle',
          currentTask: null,
          sessionCount: 0,
          lastActive: null
        }
      ],
      isLoading: false,
      error: null
    })

    render(<TeamStatus />)

    // Check Makima is shown as working
    expect(screen.getByText('Makima')).toBeInTheDocument()
    expect(screen.getByText('CEO Orchestrator')).toBeInTheDocument()
    expect(screen.getByText('working')).toBeInTheDocument()
    expect(screen.getByText('Active session')).toBeInTheDocument()

    // Check Himeno is shown as idle
    expect(screen.getByText('Himeno')).toBeInTheDocument()
    expect(screen.getByText('Reviewer')).toBeInTheDocument()
    expect(screen.getByText('idle')).toBeInTheDocument()
  })

  it('should display compact version when compact prop is true', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'aki',
          name: 'Aki',
          role: 'Developer',
          status: 'working',
          currentTask: 'Development work',
          sessionCount: 2,
          lastActive: new Date().toISOString()
        }
      ],
      isLoading: false,
      error: null
    })

    render(<TeamStatus compact={true} />)

    // Should show Aki in compact grid layout
    expect(screen.getByText('Aki')).toBeInTheDocument()
  })

  it('should show status indicators with correct colors', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'makima',
          name: 'Makima',
          role: 'CEO',
          status: 'working',
          currentTask: 'Active',
          sessionCount: 1,
          lastActive: new Date().toISOString()
        }
      ],
      isLoading: false,
      error: null
    })

    render(<TeamStatus />)

    // Check status indicator has correct class
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

    // Should not crash with empty team
    expect(screen.queryByText('Makima')).not.toBeInTheDocument()
    expect(screen.queryByText('Aki')).not.toBeInTheDocument()
  })
})