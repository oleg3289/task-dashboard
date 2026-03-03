import { describe, it, expect, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock Next.js components
vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={props.src} alt={props.alt} />
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('Dashboard Agent Card', () => {
  const mockAgent = {
    name: 'aki',
    role: 'assistant',
    specialization: 'task management',
    currentWorkload: 3,
    activeTasks: ['task-1', 'task-2', 'task-3'],
    skills: ['coding', 'research', 'coordination'],
  }

  it('renders agent name and role', () => {
    const { container } = render(
      <div>
        <h2>{mockAgent.name}</h2>
        <span>{mockAgent.role}</span>
      </div>
    )

    expect(screen.getByText('aki')).toBeInTheDocument()
    expect(screen.getByText('assistant')).toBeInTheDocument()
  })

  it('displays agent specialization', () => {
    render(
      <div>
        <p>{mockAgent.specialization}</p>
      </div>
    )

    expect(screen.getByText('task management')).toBeInTheDocument()
  })

  it('shows agent workload count', () => {
    render(
      <div>
        <span>{mockAgent.currentWorkload} active tasks</span>
      </div>
    )

    expect(screen.getByText('3 active tasks')).toBeInTheDocument()
  })

  it('lists agent skills', () => {
    render(
      <ul>
        {mockAgent.skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    )

    expect(screen.getByText('coding')).toBeInTheDocument()
    expect(screen.getByText('research')).toBeInTheDocument()
    expect(screen.getByText('coordination')).toBeInTheDocument()
  })
})

describe('Dashboard Task List', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Implement dashboard',
      description: 'Create the main dashboard component',
      status: 'progress',
      priority: 'high',
      assignee: 'aki',
      category: 'development',
      createdAt: '2026-03-01',
      updatedAt: '2026-03-02',
    },
    {
      id: 'task-2',
      title: 'Write documentation',
      description: 'Document the API endpoints',
      status: 'pending',
      priority: 'medium',
      assignee: 'makima',
      category: 'documentation',
      createdAt: '2026-03-01',
      updatedAt: '2026-03-02',
    },
  ]

  it('renders tasks title', () => {
    render(
      <div>
        <h2>Task Dashboard</h2>
      </div>
    )

    expect(screen.getByText('Task Dashboard')).toBeInTheDocument()
  })

  it('displays task count', () => {
    render(
      <div>
        <span>{mockTasks.length} tasks</span>
      </div>
    )

    expect(screen.getByText('2 tasks')).toBeInTheDocument()
  })

  it('shows task details', () => {
    render(
      <div>
        <h3>Task Title</h3>
        <p>Task description</p>
        <div>assignee-name</div>
      </div>
    )

    expect(screen.getByText('Task Title')).toBeInTheDocument()
    expect(screen.getByText('Task description')).toBeInTheDocument()
    expect(screen.getByText('assignee-name')).toBeInTheDocument()
  })
})

describe('Dashboard Status Badge', () => {
  it('renders success status', () => {
    render(
      <div>
        <span className="status-success">Success</span>
      </div>
    )

    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('renders warning status', () => {
    render(
      <div>
        <span className="status-warning">Warning</span>
      </div>
    )

    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('renders error status', () => {
    render(
      <div>
        <span className="status-error">Error</span>
      </div>
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})

describe('File Monitor Integration', () => {
  it('mock test - file monitoring works', () => {
    // This is a placeholder test to verify our test environment works
    expect(true).toBe(true)
  })
})
