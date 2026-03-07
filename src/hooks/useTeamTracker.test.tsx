import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TeamStatus } from '../components/ui/team-status'

// Mock the useTeamTracker hook
vi.mock('../hooks/useTeamTracker', () => ({
  useTeamTracker: vi.fn()
}))

import { useTeamTracker } from '../hooks/useTeamTracker'

const mockUseTeamTracker = useTeamTracker as vi.MockedFunction<typeof useTeamTracker>

describe('TeamStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [],
      isLoading: true,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    expect(screen.getByText('Loading team status...')).toBeTruthy()
  })

  it('should display error state', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [],
      isLoading: false,
      error: 'Failed to fetch',
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    expect(screen.getByText(/Error:/)).toBeTruthy()
  })

  it('should display team members with their status', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'makima',
          name: 'Makima',
          role: 'CEO Orchestrator',
          status: 'working',
          currentTask: 'Active task',
          lastTask: 'Previous task',
          lastActive: new Date().toISOString()
        },
        {
          id: 'aki',
          name: 'Aki',
          role: 'Developer',
          status: 'available',
          currentTask: null,
          lastTask: 'Code review',
          lastActive: new Date().toISOString()
        },
        {
          id: 'kobeni',
          name: 'Kobeni',
          role: 'Tester',
          status: 'idle',
          currentTask: null,
          lastTask: null,
          lastActive: null
        }
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    expect(screen.getByText('Makima')).toBeTruthy()
    expect(screen.getByText('CEO Orchestrator')).toBeTruthy()
    expect(screen.getByText('working')).toBeTruthy()
    expect(screen.getByText('Active task')).toBeTruthy()

    expect(screen.getByText('Aki')).toBeTruthy()
    expect(screen.getByText('Developer')).toBeTruthy()
    expect(screen.getByText('available')).toBeTruthy()

    expect(screen.getByText('Kobeni')).toBeTruthy()
    expect(screen.getByText('Tester')).toBeTruthy()
    expect(screen.getByText('idle')).toBeTruthy()
  })

  it('should display compact version when compact prop is true', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'aki',
          name: 'Aki',
          role: 'Developer',
          status: 'working',
          currentTask: 'Development',
          lastTask: 'Development',
          lastActive: new Date().toISOString()
        }
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus compact={true} />)

    expect(screen.getByText('Aki')).toBeTruthy()
    // Compact view should still show team overview
    expect(screen.getByText('Team Overview')).toBeTruthy()
  })

  it('should handle empty team state', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [],
      isLoading: false,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    // Should still render the card structure
    expect(screen.getByText('Team Status')).toBeTruthy()
  })

  it('should show correct status counts', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        { id: '1', name: 'A', role: 'R1', status: 'working', currentTask: 'T1', lastTask: 'T1', lastActive: new Date().toISOString() },
        { id: '2', name: 'B', role: 'R2', status: 'working', currentTask: 'T2', lastTask: 'T2', lastActive: new Date().toISOString() },
        { id: '3', name: 'C', role: 'R3', status: 'available', currentTask: null, lastTask: 'L3', lastActive: new Date().toISOString() },
        { id: '4', name: 'D', role: 'R4', status: 'idle', currentTask: null, lastTask: null, lastActive: null }
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    // Should show "2 Working"
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('Working')).toBeTruthy()
  })

  it('should show current task for working agents', () => {
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'aki',
          name: 'Aki',
          role: 'Developer',
          status: 'working',
          currentTask: 'Building unit tests',
          lastTask: 'Code review',
          lastActive: new Date().toISOString()
        }
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    expect(screen.getByText('Building unit tests')).toBeTruthy()
  })

  it('should show last active time', () => {
    const recentTime = new Date()
    recentTime.setMinutes(recentTime.getMinutes() - 5) // 5 minutes ago
    
    mockUseTeamTracker.mockReturnValue({
      team: [
        {
          id: 'aki',
          name: 'Aki',
          role: 'Developer',
          status: 'available',
          currentTask: null,
          lastTask: 'Code review',
          lastActive: recentTime.toISOString()
        }
      ],
      isLoading: false,
      error: null,
      refresh: vi.fn()
    })

    render(<TeamStatus />)

    expect(screen.getByText(/Last active:/)).toBeTruthy()
  })
})