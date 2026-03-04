export type TaskStatus = 'pending' | 'progress' | 'in-progress' | 'completed' | 'blocked' | 'planning';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskCategory = 'development' | 'research' | 'design' | 'testing' | 'documentation' | 'planning' | 'monitoring';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate?: string;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
  dependencies?: string[];
  relatedFiles?: string[];
}

export interface Agent {
  name: string;
  role: string;
  specialization: string;
  currentWorkload: number;
  activeTasks: string[];
  skills: string[];
}

// Task assignment action types
export type AssignmentAction = 'assign' | 'reassign' | 'unassign';

// Task status transition
export interface StatusTransition {
  from: TaskStatus;
  to: TaskStatus;
  timestamp: string;
  changedBy?: string;
  reason?: string;
}

// Task assignment history entry
export interface AssignmentHistoryEntry {
  id: string;
  taskId: string;
  action: AssignmentAction;
  previousAssignee?: string;
  newAssignee?: string;
  timestamp: string;
  changedBy?: string;
  reason?: string;
}

// Task with full history
export interface TaskWithHistory extends Task {
  statusHistory: StatusTransition[];
  assignmentHistory: AssignmentHistoryEntry[];
}

// Workload metrics
export interface WorkloadMetrics {
  agentName: string;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  blockedTasks: number;
  averageCompletionTime?: number;
  workloadPercentage: number;
}

// Filter options for task list
export interface TaskFilterOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assignee?: string;
  search?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Sort options for task list
export type TaskSortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee' | 'updatedAt';
export type TaskSortDirection = 'asc' | 'desc';

export interface TaskSortOptions {
  field: TaskSortField;
  direction: TaskSortDirection;
}

// Story and Ticket interfaces for agile workflow
export interface Story {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'improvement' | 'documentation' | 'research';
  priority: TaskPriority;
  status: string; // Allow any string for flexibility
  assignee: string;
  createdAt: string;
  updatedAt: string;
  tickets: Ticket[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: string; // Allow any string for flexibility
  priority: TaskPriority;
  storyId: string;
}