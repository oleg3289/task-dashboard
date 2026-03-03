'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'
import { TaskCard, TaskCardSkeleton } from './task-card'
import { AgentCard, AgentCardSkeleton } from './agent-workload'
import { TaskAssignmentDialog, QuickAssignButton } from './task-assignment-dialog'
import { TaskStatusTracker, StatusChangeButtons } from './task-status-tracker'
import { 
  WorkloadGrid, 
  TeamWorkloadCard, 
  StatusDistribution, 
  WorkloadTimeline 
} from './workload-distribution'
import type { Task, Agent, TaskStatus, TaskPriority, TaskCategory, TaskFilterOptions } from '@/types/task'

// View mode types
type ViewMode = 'list' | 'board' | 'workload'
type FilterView = 'all' | 'unassigned' | 'assigned' | 'blocked'

// Task Assignment Panel Props
interface TaskAssignmentPanelProps {
  tasks: Task[]
  agents: Agent[]
  onAssign: (taskId: string, assignee: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void
  onCreateTask?: () => void
  className?: string
}

export function TaskAssignmentPanel({
  tasks,
  agents,
  onAssign,
  onStatusChange,
  onPriorityChange,
  onCreateTask,
  className,
}: TaskAssignmentPanelProps) {
  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>('list')
  const [filterView, setFilterView] = React.useState<FilterView>('all')
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | 'all'>('all')

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks]
    
    // Apply view filter
    switch (filterView) {
      case 'unassigned':
        result = result.filter(t => !t.assignee || t.assignee === '')
        break
      case 'assigned':
        result = result.filter(t => t.assignee && t.assignee !== '')
        break
      case 'blocked':
        result = result.filter(t => t.status === 'blocked')
        break
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter)
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.assignee.toLowerCase().includes(query)
      )
    }
    
    // Apply agent filter
    if (selectedAgent) {
      result = result.filter(t => t.assignee === selectedAgent)
    }
    
    return result
  }, [tasks, filterView, statusFilter, searchQuery, selectedAgent])

  // Get counts for filter pills
  const filterCounts = React.useMemo(() => ({
    all: tasks.length,
    unassigned: tasks.filter(t => !t.assignee || t.assignee === '').length,
    assigned: tasks.filter(t => t.assignee && t.assignee !== '').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  }), [tasks])

  // Handle task selection
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
    setIsAssignDialogOpen(true)
  }

  // Handle assignment
  const handleAssign = (taskId: string, assignee: string) => {
    onAssign(taskId, assignee)
    setIsAssignDialogOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Task Assignment</h2>
          <p className="text-sm text-muted-foreground">
            Assign and manage tasks across your team
          </p>
        </div>
        
        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={viewMode === 'list'}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'board' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={viewMode === 'board'}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('workload')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'workload' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={viewMode === 'workload'}
            >
              Workload
            </button>
          </div>
          
          {onCreateTask && (
            <Button onClick={onCreateTask}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background',
              'text-sm ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          />
        </div>

        {/* View filter pills */}
        <div className="flex gap-2">
          {(['all', 'unassigned', 'assigned', 'blocked'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterView(filter)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
                filterView === filter
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              )}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              <span className={cn(
                'ml-1.5 px-1.5 py-0.5 text-xs rounded-full',
                filterView === filter
                  ? 'bg-primary-foreground/20'
                  : 'bg-muted'
              )}>
                {filterCounts[filter]}
              </span>
            </button>
          ))}
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
          className={cn(
            'h-10 px-3 rounded-md border border-input bg-background',
            'text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Main content area */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Agent sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team</CardTitle>
              <CardDescription className="text-xs">
                {agents.length} agents available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setSelectedAgent(null)}
                className={cn(
                  'w-full text-left p-2 rounded-md transition-colors',
                  !selectedAgent
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                All Agents
              </button>
              <div className="space-y-1 mt-2">
                {agents.map((agent) => {
                  const agentTasks = tasks.filter(t => t.assignee === agent.name)
                  const isActive = selectedAgent === agent.name
                  
                  return (
                    <button
                      key={agent.name}
                      onClick={() => setSelectedAgent(isActive ? null : agent.name)}
                      className={cn(
                        'w-full text-left p-2 rounded-md transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{agent.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {agentTasks.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {agent.role}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <TeamWorkloadCard agents={agents} tasks={tasks} />
        </div>

        {/* Task list/board */}
        <div className="lg:col-span-3">
          {viewMode === 'list' && (
            <TaskListView
              tasks={filteredTasks}
              agents={agents}
              onTaskSelect={handleTaskSelect}
              onQuickAssign={handleAssign}
              onStatusChange={onStatusChange}
            />
          )}
          
          {viewMode === 'board' && (
            <TaskBoardView
              tasks={filteredTasks}
              agents={agents}
              onTaskSelect={handleTaskSelect}
              onQuickAssign={handleAssign}
              onStatusChange={onStatusChange}
            />
          )}
          
          {viewMode === 'workload' && (
            <WorkloadView
              agents={agents}
              tasks={tasks}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
          )}
        </div>
      </div>

      {/* Assignment Dialog */}
      <TaskAssignmentDialog
        task={selectedTask}
        agents={agents}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onAssign={handleAssign}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
      />
    </div>
  )
}

// Task List View
interface TaskListViewProps {
  tasks: Task[]
  agents: Agent[]
  onTaskSelect: (task: Task) => void
  onQuickAssign: (taskId: string, assignee: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

function TaskListView({
  tasks,
  agents,
  onTaskSelect,
  onQuickAssign,
  onStatusChange,
}: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-muted-foreground">No tasks found</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group relative rounded-lg border border-border bg-card p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onTaskSelect(task)}
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground">{task.title}</h3>
                <Badge variant={
                  task.priority === 'critical' ? 'destructive' :
                  task.priority === 'high' ? 'warning' :
                  task.priority === 'medium' ? 'info' : 'secondary'
                }>
                  {task.priority}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {task.category}
                </span>
                {task.assignee && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {task.assignee}
                  </span>
                )}
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={
                task.status === 'completed' ? 'success' :
                task.status === 'progress' ? 'info' :
                task.status === 'blocked' ? 'destructive' : 'secondary'
              }>
                {task.status === 'progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
              
              <QuickAssignButton
                task={task}
                agents={agents}
                onQuickAssign={onQuickAssign}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Task Board View (Kanban style)
interface TaskBoardViewProps {
  tasks: Task[]
  agents: Agent[]
  onTaskSelect: (task: Task) => void
  onQuickAssign: (taskId: string, assignee: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

function TaskBoardView({
  tasks,
  agents,
  onTaskSelect,
  onQuickAssign,
  onStatusChange,
}: TaskBoardViewProps) {
  const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: 'pending', title: 'Pending', color: 'border-l-muted-foreground' },
    { status: 'progress', title: 'In Progress', color: 'border-l-info' },
    { status: 'blocked', title: 'Blocked', color: 'border-l-destructive' },
    { status: 'completed', title: 'Completed', color: 'border-l-success' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter(t => t.status === column.status)
        
        return (
          <div key={column.status} className="space-y-3">
            <div className="flex items-center justify-between p-2">
              <h3 className="font-medium text-foreground">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {columnTasks.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {columnTasks.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    showAssignee
                    showDueDate={false}
                    showCategory={false}
                    onClick={() => onTaskSelect(task)}
                    className={column.color}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Workload View
interface WorkloadViewProps {
  agents: Agent[]
  tasks: Task[]
  selectedAgent?: string | null
  onSelectAgent?: (agentName: string | null) => void
}

function WorkloadView({
  agents,
  tasks,
  selectedAgent,
  onSelectAgent,
}: WorkloadViewProps) {
  return (
    <div className="space-y-6">
      {/* Workload grid */}
      <WorkloadGrid
        agents={agents}
        tasks={tasks}
        selectedAgent={selectedAgent ?? undefined}
        onSelectAgent={onSelectAgent}
      />
      
      {/* Status distribution and timeline */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistribution tasks={tasks} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkloadTimeline tasks={tasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}