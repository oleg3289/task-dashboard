'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from 'react'
import type { 
  Task, 
  Agent, 
  TaskWithHistory, 
  StatusTransition, 
  AssignmentHistoryEntry,
  TaskFilterOptions,
  TaskSortOptions,
  TaskSortField,
  TaskSortDirection,
  WorkloadMetrics
} from '@/types/task'

// State shape
interface TaskState {
  tasks: Task[]
  agents: Agent[]
  selectedTaskId: string | null
  selectedAgentId: string | null
  filters: TaskFilterOptions
  sort: TaskSortOptions
  isLoading: boolean
  error: string | null
}

// Action types
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SELECT_TASK'; payload: string | null }
  | { type: 'SELECT_AGENT'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: TaskFilterOptions }
  | { type: 'SET_SORT'; payload: TaskSortOptions }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ASSIGN_TASK'; payload: { taskId: string; assignee: string; previousAssignee?: string } }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: Task['status'] } }

// Initial state
const initialState: TaskState = {
  tasks: [],
  agents: [],
  selectedTaskId: null,
  selectedAgentId: null,
  filters: {},
  sort: { field: 'updatedAt', direction: 'desc' },
  isLoading: false,
  error: null,
}

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false }
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
      }
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        selectedTaskId: state.selectedTaskId === action.payload ? null : state.selectedTaskId,
      }
    
    case 'SET_AGENTS':
      return { ...state, agents: action.payload }
    
    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.payload }
    
    case 'SELECT_AGENT':
      return { ...state, selectedAgentId: action.payload }
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload }
    
    case 'SET_SORT':
      return { ...state, sort: action.payload }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'ASSIGN_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.taskId 
            ? { ...t, assignee: action.payload.assignee, updatedAt: new Date().toISOString() }
            : t
        ),
        agents: state.agents.map(a => {
          if (a.name === action.payload.assignee) {
            return { ...a, activeTasks: [...a.activeTasks, action.payload.taskId] }
          }
          if (a.name === action.payload.previousAssignee) {
            return { ...a, activeTasks: a.activeTasks.filter(id => id !== action.payload.taskId) }
          }
          return a
        }),
      }
    
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === action.payload.taskId 
            ? { ...t, status: action.payload.status, updatedAt: new Date().toISOString() }
            : t
        ),
      }
    
    default:
      return state
  }
}

// Context type
interface TaskContextValue {
  state: TaskState
  // Task operations
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  deleteTask: (taskId: string) => void
  assignTask: (taskId: string, assignee: string) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  selectTask: (taskId: string | null) => void
  // Agent operations
  setAgents: (agents: Agent[]) => void
  selectAgent: (agentId: string | null) => void
  // Filtering and sorting
  setFilters: (filters: TaskFilterOptions) => void
  setSort: (sort: TaskSortOptions) => void
  // Computed
  getFilteredTasks: () => Task[]
  getTasksByAssignee: (assignee: string) => Task[]
  getAgentWorkload: (agentName: string) => WorkloadMetrics
  getWorkloadMetrics: () => WorkloadMetrics[]
  getTaskById: (taskId: string) => Task | undefined
  getAgentById: (agentName: string) => Agent | undefined
}

// Create context
const TaskContext = createContext<TaskContextValue | null>(null)

// Provider component
interface TaskProviderProps {
  children: ReactNode
  initialTasks?: Task[]
  initialAgents?: Agent[]
}

export function TaskProvider({ 
  children, 
  initialTasks = [], 
  initialAgents = [] 
}: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, {
    ...initialState,
    tasks: initialTasks,
    agents: initialAgents,
  })

  // Task operations
  const setTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', payload: tasks })
  }, [])

  const addTask = useCallback((task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task })
  }, [])

  const updateTask = useCallback((task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task })
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId })
  }, [])

  const assignTask = useCallback((taskId: string, assignee: string) => {
    const task = state.tasks.find(t => t.id === taskId)
    dispatch({ 
      type: 'ASSIGN_TASK', 
      payload: { 
        taskId, 
        assignee, 
        previousAssignee: task?.assignee 
      } 
    })
  }, [state.tasks])

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } })
  }, [])

  const selectTask = useCallback((taskId: string | null) => {
    dispatch({ type: 'SELECT_TASK', payload: taskId })
  }, [])

  // Agent operations
  const setAgents = useCallback((agents: Agent[]) => {
    dispatch({ type: 'SET_AGENTS', payload: agents })
  }, [])

  const selectAgent = useCallback((agentId: string | null) => {
    dispatch({ type: 'SELECT_AGENT', payload: agentId })
  }, [])

  // Filtering and sorting
  const setFilters = useCallback((filters: TaskFilterOptions) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }, [])

  const setSort = useCallback((sort: TaskSortOptions) => {
    dispatch({ type: 'SET_SORT', payload: sort })
  }, [])

  // Compute filtered tasks
  const getFilteredTasks = useCallback(() => {
    let filtered = [...state.tasks]

    // Apply filters
    if (state.filters.status?.length) {
      filtered = filtered.filter(t => state.filters.status!.includes(t.status))
    }
    if (state.filters.priority?.length) {
      filtered = filtered.filter(t => state.filters.priority!.includes(t.priority))
    }
    if (state.filters.category?.length) {
      filtered = filtered.filter(t => state.filters.category!.includes(t.category))
    }
    if (state.filters.assignee) {
      filtered = filtered.filter(t => t.assignee === state.filters.assignee)
    }
    if (state.filters.search) {
      const search = state.filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      )
    }
    if (state.filters.dateRange) {
      const from = new Date(state.filters.dateRange.from)
      const to = new Date(state.filters.dateRange.to)
      filtered = filtered.filter(t => {
        const date = new Date(t.createdAt)
        return date >= from && date <= to
      })
    }

    // Apply sorting
    const sortField = state.sort.field
    const sortDir = state.sort.direction === 'asc' ? 1 : -1

    filtered.sort((a, b) => {
      if (sortField === 'title') {
        return a.title.localeCompare(b.title) * sortDir
      }
      if (sortField === 'status') {
        const order = { pending: 0, progress: 1, 'in-progress': 1, planning: 0.5, blocked: 2, completed: 3 }
        return (order[a.status] - order[b.status]) * sortDir
      }
      if (sortField === 'priority') {
        const order = { low: 0, medium: 1, high: 2, critical: 3 }
        return (order[a.priority] - order[b.priority]) * sortDir
      }
      if (sortField === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * sortDir
      }
      if (sortField === 'assignee') {
        return a.assignee.localeCompare(b.assignee) * sortDir
      }
      if (sortField === 'updatedAt') {
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * sortDir
      }
      return 0
    })

    return filtered
  }, [state.tasks, state.filters, state.sort])

  const getTasksByAssignee = useCallback((assignee: string) => {
    return state.tasks.filter(t => t.assignee === assignee)
  }, [state.tasks])

  const getAgentWorkload = useCallback((agentName: string): WorkloadMetrics => {
    const agentTasks = state.tasks.filter(t => t.assignee === agentName)
    return {
      agentName,
      totalTasks: agentTasks.length,
      pendingTasks: agentTasks.filter(t => t.status === 'pending').length,
      inProgressTasks: agentTasks.filter(t => t.status === 'progress').length,
      completedTasks: agentTasks.filter(t => t.status === 'completed').length,
      blockedTasks: agentTasks.filter(t => t.status === 'blocked').length,
      workloadPercentage: Math.min(100, agentTasks.filter(t => t.status !== 'completed').length * 10),
    }
  }, [state.tasks])

  const getWorkloadMetrics = useCallback((): WorkloadMetrics[] => {
    return state.agents.map(agent => getAgentWorkload(agent.name))
  }, [state.agents, getAgentWorkload])

  const getTaskById = useCallback((taskId: string) => {
    return state.tasks.find(t => t.id === taskId)
  }, [state.tasks])

  const getAgentById = useCallback((agentName: string) => {
    return state.agents.find(a => a.name === agentName)
  }, [state.agents])

  const value = useMemo(() => ({
    state,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    selectTask,
    setAgents,
    selectAgent,
    setFilters,
    setSort,
    getFilteredTasks,
    getTasksByAssignee,
    getAgentWorkload,
    getWorkloadMetrics,
    getTaskById,
    getAgentById,
  }), [
    state,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    selectTask,
    setAgents,
    selectAgent,
    setFilters,
    setSort,
    getFilteredTasks,
    getTasksByAssignee,
    getAgentWorkload,
    getWorkloadMetrics,
    getTaskById,
    getAgentById,
  ])

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

// Hook
export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}

export { TaskContext }