'use client'

import * as React from 'react'
import { TaskAssignmentPanel } from '@/components/ui/task-assignment-panel'
import { TaskProvider, useTaskContext } from '@/contexts/task-context'
import { mockAgents, mockTasks } from '@/lib/mock-data'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

function TaskAssignmentDemo() {
  const { 
    state, 
    setTasks, 
    setAgents, 
    assignTask, 
    updateTaskStatus 
  } = useTaskContext()

  // Initialize with mock data
  React.useEffect(() => {
    setTasks(mockTasks)
    setAgents(mockAgents)
  }, [setTasks, setAgents])

  // Handle task assignment
  const handleAssign = (taskId: string, assignee: string) => {
    assignTask(taskId, assignee)
    console.log(`Assigned task ${taskId} to ${assignee}`)
  }

  // Handle status change
  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status)
    console.log(`Updated task ${taskId} status to ${status}`)
  }

  // Handle priority change (placeholder - would update state)
  const handlePriorityChange = (taskId: string, priority: TaskPriority) => {
    console.log(`Updated task ${taskId} priority to ${priority}`)
  }

  // Handle create task (placeholder)
  const handleCreateTask = () => {
    console.log('Create task clicked - would open create dialog')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Task Assignment</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Assign and manage tasks across your team
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {state.tasks.filter(t => t.status !== 'completed').length} active tasks
              </span>
              <span className="text-sm text-muted-foreground">
                {state.agents.length} agents
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-6">
        <TaskAssignmentPanel
          tasks={state.tasks}
          agents={state.agents}
          onAssign={handleAssign}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onCreateTask={handleCreateTask}
        />
      </main>
    </div>
  )
}

export default function TaskAssignmentPage() {
  return (
    <TaskProvider>
      <TaskAssignmentDemo />
    </TaskProvider>
  )
}