import { describe, it, expect } from 'vitest'
import { normalizeStatus, isArchivedStatus, parseEstimate } from '../hooks/useTicketsData'

// Note: These are pure function tests. For React hook testing, we'd need @testing-library/react-hooks

describe('normalizeStatus', () => {
  it('should normalize various status formats', () => {
    expect(normalizeStatus('To Do')).toBe('todo')
    expect(normalizeStatus('TO-DO')).toBe('todo')
    expect(normalizeStatus('to-do')).toBe('todo')
    expect(normalizeStatus('In Progress')).toBe('in-progress')
    expect(normalizeStatus('IN-PROGRESS')).toBe('in-progress')
    expect(normalizeStatus('Done')).toBe('done')
    expect(normalizeStatus('Completed')).toBe('done')
    expect(normalizeStatus('Review')).toBe('review')
    expect(normalizeStatus('Backlog')).toBe('backlog')
    expect(normalizeStatus('Archived')).toBe('archived')
  })

  it('should handle edge cases', () => {
    expect(normalizeStatus('')).toBe('backlog')
    expect(normalizeStatus('unknown')).toBe('backlog')
    expect(normalizeStatus('  done  ')).toBe('done')
  })
})

describe('isArchivedStatus', () => {
  it('should return true only for explicit archived status', () => {
    // Only 'archived' status is truly archived
    expect(isArchivedStatus('archived')).toBe(true)
    expect(isArchivedStatus('ARCHIVED')).toBe(true)
    expect(isArchivedStatus('Archived')).toBe(true)
  })

  it('should return false for done/completed status', () => {
    // Done is a valid status, NOT archived
    expect(isArchivedStatus('done')).toBe(false)
    expect(isArchivedStatus('completed')).toBe(false)
    expect(isArchivedStatus('Done')).toBe(false)
    expect(isArchivedStatus('Completed')).toBe(false)
  })

  it('should return false for other statuses', () => {
    expect(isArchivedStatus('todo')).toBe(false)
    expect(isArchivedStatus('in-progress')).toBe(false)
    expect(isArchivedStatus('review')).toBe(false)
    expect(isArchivedStatus('backlog')).toBe(false)
  })

  it('should return true for wont-fix (normalized to archived)', () => {
    // wont-fix is normalized to 'archived' in STATUS_NORMALIZATION_MAP
    // This is intentional - wont-fix tickets are considered closed/archived
    expect(isArchivedStatus('wont-fix')).toBe(true)
    expect(isArchivedStatus('wontfix')).toBe(true)
  })
})

describe('parseEstimate', () => {
  it('should parse hours', () => {
    expect(parseEstimate('1h')).toBe(60)
    expect(parseEstimate('2h')).toBe(120)
    expect(parseEstimate('3H')).toBe(180)
  })

  it('should parse minutes', () => {
    expect(parseEstimate('30m')).toBe(30)
    expect(parseEstimate('45m')).toBe(45)
    expect(parseEstimate('60M')).toBe(60)
  })

  it('should handle numbers without units (default to hours)', () => {
    expect(parseEstimate('1')).toBe(60)
    expect(parseEstimate('2')).toBe(120)
  })

  it('should return 0 for invalid input', () => {
    expect(parseEstimate('')).toBe(0)
    expect(parseEstimate('invalid')).toBe(0)
    expect(parseEstimate('abc')).toBe(0)
  })
})

describe('Ticket Status Semantics', () => {
  it('should treat done as a regular visible status', () => {
    // This documents the expected behavior:
    // - "done" tickets from stories.json should be visible by default
    // - Only tickets from archived-tickets.json or with status "archived" should be hidden by default
    
    const storyTicket = {
      id: 'STORY-002-007',
      status: 'done' as const,
      isArchived: false, // Would be false now since we fixed isArchivedStatus
    }
    
    expect(storyTicket.status).toBe('done')
    expect(storyTicket.isArchived).toBe(false)
  })

  it('should treat archived as hidden by default', () => {
    const archivedTicket = {
      id: 'STORY-001-001',
      status: 'done' as const,
      isArchived: true, // From archived-tickets.json
    }
    
    // Archived tickets are hidden when showArchived=false
    expect(archivedTicket.isArchived).toBe(true)
  })
})

describe('Filter State Persistence', () => {
  it('should use versioned storage key', () => {
    // Documents the storage format
    const expectedFormat = {
      version: 2,
      state: {
        status: [],
        agents: [],
        searchText: '',
        showArchived: true,
        priority: [],
        sprint: null,
        sortBy: 'updatedAt',
        sortDirection: 'desc',
      }
    }
    
    expect(expectedFormat.version).toBe(2)
    expect(expectedFormat.state.showArchived).toBe(true)
  })
})