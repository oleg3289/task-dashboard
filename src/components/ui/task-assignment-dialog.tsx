'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Badge } from './badge'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select'
import type { Task, Agent, TaskStatus, TaskPriority, TaskCategory } from '@/types/task'

// Task Assignment Dialog Props
interface TaskAssignmentDialogProps {
  task?: Task | null
  agents: Agent[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onAssign: (taskId: string, assignee: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void
  trigger?: React.ReactNode
  className?: string
}

// Status config
const statusOptions: { value: TaskStatus; label: string; description: string }[] = [
  { value: 'pending', label: 'Pending', description: 'Task is waiting to be started' },
  { value: 'progress', label: 'In Progress', description: 'Task is currently being worked on' },
  { value: 'completed', label: 'Completed', description: 'Task has been finished' },
  { value: 'blocked', label: 'Blocked', description: 'Task is blocked by dependencies' },
]

// Priority config
const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'bg-info' },
  { value: 'high', label: 'High', color: 'bg-warning' },
  { value: 'critical', label: 'Critical', color: 'bg-destructive' },
]

// Category config
const categoryOptions: { value: TaskCategory; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'research', label: 'Research' },
  { value: 'design', label: 'Design' },
  { value: 'testing', label: 'Testing' },
  { value: 'documentation', label: 'Documentation' },
]

export function TaskAssignmentDialog({
  task,
  agents,
  open: controlledOpen,
  onOpenChange,
  onAssign,
  onStatusChange,
  onPriorityChange,
  trigger,
  className,
}: TaskAssignmentDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (value: boolean) => {
    setUncontrolledOpen(value)
    onOpenChange?.(value)
  }

  // Form state
  const [selectedAgent, setSelectedAgent] = React.useState(task?.assignee || '')
  const [selectedStatus, setSelectedStatus] = React.useState<TaskStatus>(task?.status || 'pending')
  const [selectedPriority, setSelectedPriority] = React.useState<TaskPriority>(task?.priority || 'medium')
  const [notes, setNotes] = React.useState('')

  // Reset form when task changes
  React.useEffect(() => {
    if (task) {
      setSelectedAgent(task.assignee)
      setSelectedStatus(task.status)
      setSelectedPriority(task.priority)
    } else {
      setSelectedAgent('')
      setSelectedStatus('pending')
      setSelectedPriority('medium')
    }
    setNotes('')
  }, [task])

  // Get selected agent details
  const selectedAgentDetails = agents.find(a => a.name === selectedAgent)

  // Handle assign
  const handleAssign = () => {
    if (task && selectedAgent) {
      onAssign(task.id, selectedAgent)
      if (onStatusChange && selectedStatus !== task.status) {
        onStatusChange(task.id, selectedStatus)
      }
      if (onPriorityChange && selectedPriority !== task.priority) {
        onPriorityChange(task.id, selectedPriority)
      }
      setOpen(false)
    }
  }

  // Handle status change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as TaskStatus)
  }

  // Handle priority change
  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value as TaskPriority)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn('sm:max-w-[500px]', className)}>
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task Assignment' : 'Assign Task'}
          </DialogTitle>
          <DialogDescription>
            {task 
              ? `Update assignment for "${task.title}"`
              : 'Select an agent to assign this task'}
          </DialogDescription>
        </DialogHeader>

        {task && (
          <div className="space-y-4">
            {/* Task Info */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="font-medium text-foreground mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{task.category}</Badge>
                <Badge 
                  variant={
                    task.priority === 'critical' ? 'destructive' :
                    task.priority === 'high' ? 'warning' :
                    task.priority === 'medium' ? 'info' : 'secondary'
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Agent Selection */}
            <div className="space-y-2">
              <label htmlFor="agent-select" className="text-sm font-medium text-foreground">
                Assign to Agent
              </label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger id="agent-select">
                  <SelectValue placeholder="Select an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem 
                      key={agent.name} 
                      value={agent.name}
                      disabled={agent.currentWorkload >= 100}
                    >
                      <div className="flex items-center gap-2">
                        <span>{agent.name}</span>
                        <span className="text-muted-foreground text-xs">
                          ({agent.currentWorkload}% workload)
                        </span>
                        {agent.currentWorkload >= 100 && (
                          <Badge variant="destructive" className="text-xs">Full</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAgentDetails && (
                <p className="text-xs text-muted-foreground">
                  {selectedAgentDetails.role} • {selectedAgentDetails.specialization}
                </p>
              )}
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label htmlFor="status-select" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger id="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <label htmlFor="priority-select" className="text-sm font-medium text-foreground">
                Priority
              </label>
              <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger id="priority-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', option.color)} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                className={cn(
                  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2',
                  'text-sm ring-offset-background placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedAgent || selectedAgent === task?.assignee}
          >
            {task?.assignee ? 'Update Assignment' : 'Assign Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Quick Assign Button Component
interface QuickAssignButtonProps {
  task: Task
  agents: Agent[]
  onQuickAssign: (taskId: string, assignee: string) => void
  className?: string
}

export function QuickAssignButton({
  task,
  agents,
  onQuickAssign,
  className,
}: QuickAssignButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Filter available agents (not at full capacity)
  const availableAgents = agents.filter(a => a.currentWorkload < 100)
  
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="h-8"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Assign
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            className={cn(
              'absolute z-50 mt-1 w-56 rounded-md border bg-popover p-1 shadow-lg',
              'right-0 sm:left-0'
            )}
          >
            {availableAgents.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No agents available
              </div>
            ) : (
              availableAgents.map(agent => (
                <div
                  key={agent.name}
                  role="option"
                  tabIndex={0}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground'
                  )}
                  onClick={() => {
                    onQuickAssign(task.id, agent.name)
                    setIsOpen(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onQuickAssign(task.id, agent.name)
                      setIsOpen(false)
                    }
                  }}
                >
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {agent.currentWorkload}%
                    </span>
                  </div>
                  {agent.name === task.assignee && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}