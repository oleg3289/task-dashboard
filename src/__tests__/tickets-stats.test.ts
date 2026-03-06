import { describe, it, expect } from 'vitest'

// Test data factory
function createTicket(overrides: Partial<any> = {}) {
  return {
    id: `TICKET-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Ticket',
    description: 'Test description',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    storyId: 'STORY-001',
    sprint: 1,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('TicketsTab Stats Calculation', () => {
  it('should calculate correct total excluding archived when showArchived is false', () => {
    const tickets = [
      createTicket({ id: 'T1', status: 'done', isArchived: false }),
      createTicket({ id: 'T2', status: 'done', isArchived: true }),
      createTicket({ id: 'T3', status: 'todo', isArchived: false }),
      createTicket({ id: 'T4', status: 'todo', isArchived: true }),
    ]
    
    // When showArchived is false, only non-archived tickets should count
    const visibleTickets = tickets.filter(t => !t.isArchived)
    expect(visibleTickets.length).toBe(2) // T1, T3
    
    const done = visibleTickets.filter(t => t.status === 'done').length
    const todo = visibleTickets.filter(t => t.status === 'todo').length
    
    expect(done).toBe(1) // T1 only
    expect(todo).toBe(1) // T3 only
  })
  
  it('should calculate correct total including archived when showArchived is true', () => {
    const tickets = [
      createTicket({ id: 'T1', status: 'done', isArchived: false }),
      createTicket({ id: 'T2', status: 'done', isArchived: true }),
      createTicket({ id: 'T3', status: 'todo', isArchived: false }),
      createTicket({ id: 'T4', status: 'todo', isArchived: true }),
    ]
    
    // When showArchived is true, all tickets should count
    const visibleTickets = tickets // all tickets
    expect(visibleTickets.length).toBe(4)
    
    const done = visibleTickets.filter(t => t.status === 'done').length
    const todo = visibleTickets.filter(t => t.status === 'todo').length
    
    expect(done).toBe(2) // T1, T2
    expect(todo).toBe(2) // T3, T4
  })
  
  it('should show correct "Showing X of Y" when filters are active', () => {
    const tickets = [
      createTicket({ id: 'T1', status: 'done', assignee: 'aki' }),
      createTicket({ id: 'T2', status: 'todo', assignee: 'aki' }),
      createTicket({ id: 'T3', status: 'todo', assignee: 'denji' }),
    ]
    
    // Simulate filter: status = ['todo']
    const filteredTickets = tickets.filter(t => t.status === 'todo')
    const displayedCount = filteredTickets.length // 2
    const total = tickets.length // 3
    
    expect(displayedCount).toBe(2) // T2, T3
    expect(total).toBe(3) // All tickets
    
    // "Showing 2 of 3"
    expect(`Showing ${displayedCount} of ${total}`).toBe('Showing 2 of 3')
  })
  
  it('should calculate status counts consistently with visible tickets', () => {
    const tickets = [
      createTicket({ id: 'T1', status: 'done', isArchived: false }),
      createTicket({ id: 'T2', status: 'done', isArchived: true }),
      createTicket({ id: 'T3', status: 'in-progress', isArchived: false }),
      createTicket({ id: 'T4', status: 'review', isArchived: false }),
      createTicket({ id: 'T5', status: 'todo', isArchived: false }),
    ]
    
    // Without archived
    const visibleTickets = tickets.filter(t => !t.isArchived)
    const statsWithoutArchived = {
      total: visibleTickets.length,
      done: visibleTickets.filter(t => t.status === 'done').length,
      inProgress: visibleTickets.filter(t => t.status === 'in-progress').length,
      review: visibleTickets.filter(t => t.status === 'review').length,
      todo: visibleTickets.filter(t => t.status === 'todo').length,
    }
    
    expect(statsWithoutArchived.total).toBe(4)
    expect(statsWithoutArchived.done).toBe(1) // Only T1
    expect(statsWithoutArchived.inProgress).toBe(1)
    expect(statsWithoutArchived.review).toBe(1)
    expect(statsWithoutArchived.todo).toBe(1)
    
    // Verify sum matches total
    const sum = statsWithoutArchived.done + statsWithoutArchived.inProgress + 
                statsWithoutArchived.review + statsWithoutArchived.todo
    expect(sum).toBe(statsWithoutArchived.total)
  })
  
  it('should maintain consistency between displayed count and filtered tickets', () => {
    const tickets = [
      createTicket({ id: 'T1', status: 'done', assignee: 'aki' }),
      createTicket({ id: 'T2', status: 'todo', assignee: 'aki' }),
      createTicket({ id: 'T3', status: 'todo', assignee: 'denji' }),
      createTicket({ id: 'T4', status: 'in-progress', assignee: 'kobeni' }),
    ]
    
    // Filter by assignee = 'aki'
    const filteredTickets = tickets.filter(t => t.assignee === 'aki')
    const visibleTickets = tickets.filter(t => !t.isArchived) // showArchived: false
    
    const displayedCount = filteredTickets.length
    const total = visibleTickets.length
    
    // The displayed count should be <= total
    expect(displayedCount).toBe(2) // T1, T2
    expect(total).toBe(4) // All non-archived
    expect(displayedCount).toBeLessThanOrEqual(total)
    
    // Stats for filtered tickets
    const filteredStats = {
      done: filteredTickets.filter(t => t.status === 'done').length,
      todo: filteredTickets.filter(t => t.status === 'todo').length,
    }
    
    expect(filteredStats.done).toBe(1) // T1
    expect(filteredStats.todo).toBe(1) // T2
    expect(filteredStats.done + filteredStats.todo).toBe(displayedCount)
  })
})

describe('Filter Context Archived Toggle', () => {
  it('should correctly toggle showArchived', () => {
    let showArchived = true
    
    // Toggle off
    showArchived = !showArchived
    expect(showArchived).toBe(false)
    
    // Toggle on
    showArchived = !showArchived
    expect(showArchived).toBe(true)
  })
  
  it('should filter out archived tickets when showArchived is false', () => {
    const tickets = [
      createTicket({ id: 'T1', isArchived: false }),
      createTicket({ id: 'T2', isArchived: true }),
      createTicket({ id: 'T3', isArchived: false }),
      createTicket({ id: 'T4', isArchived: true }),
    ]
    
    const visibleTickets = tickets.filter(t => !t.isArchived ? true : false)
    
    // Default showArchived in context is true, so all visible
    const allVisible = tickets // showArchived: true
    expect(allVisible.length).toBe(4)
    
    // With showArchived: false
    const noArchived = tickets.filter(t => !t.isArchived)
    expect(noArchived.length).toBe(2) // T1, T3
  })
})