# Design Specifications for Task Dashboard Implementation

**Prepared by:** Power (Designer)  
**For:** Aki (Developer)  
**Date:** 2026-03-02  
**Status:** Ready for Implementation

---

## Executive Summary

The project is already configured with **Tailwind CSS v4** (verified in `package.json`). This document provides complete design specifications aligned with our `tailwind-design-system` and `shadcn-ui` skills.

---

## Current Project Setup

### Already Installed
- ✅ Next.js 16.1.6 with React 19
- ✅ Tailwind CSS v4
- ✅ TypeScript
- ✅ PostCSS with `@tailwindcss/postcss`

### To Install
```bash
# shadcn/ui
npx shadcn@latest init

# Required components
npx shadcn@latest add button card input select badge dropdown-menu
npx shadcn@latest add skeleton separator scroll-area avatar progress

# CVA for component variants
npm install class-variance-authority clsx tailwind-merge
```

---

## Color System (OKLCH Semantic Tokens)

The `globals.css` needs to be updated with the complete theme:

```css
@import "tailwindcss";

:root {
  /* === Base Colors === */
  --background: oklch(100% 0 0);
  --foreground: oklch(14.5% 0.025 264);
  
  /* === Card === */
  --card: oklch(100% 0 0);
  --card-foreground: oklch(14.5% 0.025 264);
  
  /* === Primary (Brand Blue) === */
  --primary: oklch(55% 0.25 264);
  --primary-foreground: oklch(98% 0.01 264);
  
  /* === Secondary === */
  --secondary: oklch(96% 0.01 264);
  --secondary-foreground: oklch(14.5% 0.025 264);
  
  /* === Muted === */
  --muted: oklch(96% 0.01 264);
  --muted-foreground: oklch(46% 0.02 264);
  
  /* === Accent === */
  --accent: oklch(96% 0.01 264);
  --accent-foreground: oklch(14.5% 0.025 264);
  
  /* === Destructive === */
  --destructive: oklch(53% 0.22 27);
  --destructive-foreground: oklch(98% 0.01 264);
  
  /* === Status Colors (Dashboard-specific) === */
  --success: oklch(65% 0.2 145);
  --success-foreground: oklch(98% 0.01 145);
  
  --warning: oklch(75% 0.18 85);
  --warning-foreground: oklch(20% 0.02 85);
  
  --info: oklch(65% 0.2 240);
  --info-foreground: oklch(98% 0.01 240);
  
  /* === Borders & Rings === */
  --border: oklch(91% 0.01 264);
  --input: oklch(91% 0.01 264);
  --ring: oklch(55% 0.25 264);
  --ring-offset: oklch(100% 0 0);
  
  /* === Radius === */
  --radius: 0.5rem;
}

.dark {
  --background: oklch(14.5% 0.025 264);
  --foreground: oklch(98% 0.01 264);
  
  --card: oklch(18% 0.02 264);
  --card-foreground: oklch(98% 0.01 264);
  
  --primary: oklch(70% 0.2 264);
  --primary-foreground: oklch(14.5% 0.025 264);
  
  --secondary: oklch(22% 0.02 264);
  --secondary-foreground: oklch(98% 0.01 264);
  
  --muted: oklch(22% 0.02 264);
  --muted-foreground: oklch(65% 0.02 264);
  
  --accent: oklch(22% 0.02 264);
  --accent-foreground: oklch(98% 0.01 264);
  
  --destructive: oklch(50% 0.18 27);
  --destructive-foreground: oklch(98% 0.01 264);
  
  --success: oklch(70% 0.18 145);
  --success-foreground: oklch(10% 0.02 145);
  
  --warning: oklch(80% 0.15 85);
  --warning-foreground: oklch(20% 0.02 85);
  
  --info: oklch(70% 0.18 240);
  --info-foreground: oklch(10% 0.02 240);
  
  --border: oklch(25% 0.02 264);
  --input: oklch(25% 0.02 264);
  --ring: oklch(70% 0.2 264);
  --ring-offset: oklch(14.5% 0.025 264);
}

@theme inline {
  /* Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ring-offset: var(--ring-offset);
  
  /* Radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  /* Font */
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
  
  /* Animations */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(0.5rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
}

/* Dark mode variant for class-based toggle */
@custom-variant dark (&:where(.dark, .dark *));

/* Base styles */
@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

---

## Component Specifications

### 1. Status Badge (Custom with CVA)

**File:** `src/components/ui/status-badge.tsx`

```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        pending: 'bg-warning/15 text-warning border-warning/20',
        progress: 'bg-info/15 text-info border-info/20',
        completed: 'bg-success/15 text-success border-success/20',
        blocked: 'bg-destructive/15 text-destructive border-destructive/20',
      },
      size: {
        sm: 'text-[10px] px-2 py-0',
        default: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'pending',
      size: 'default',
    },
  }
)

const statusIcons = {
  pending: '⏳',
  progress: '🔄',
  completed: '✓',
  blocked: '⚠',
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean
}

export function StatusBadge({
  className,
  variant,
  size,
  showIcon = true,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant, size, className }))} {...props}>
      {showIcon && variant && <span aria-hidden="true">{statusIcons[variant]}</span>}
      {children}
    </span>
  )
}
```

### 2. Task Card

**File:** `src/components/dashboard/task-card.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee: string
  dueDate?: string
  category: string
}

interface TaskCardProps {
  task: Task
  className?: string
  onClick?: () => void
}

const priorityBorders = {
  low: 'border-l-border',
  medium: 'border-l-info',
  high: 'border-l-warning',
  critical: 'border-l-destructive',
}

export function TaskCard({ task, className, onClick }: TaskCardProps) {
  return (
    <Card
      className={cn(
        'border-l-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:border-ring',
        priorityBorders[task.priority],
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}, Status: ${task.status}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base line-clamp-1">{task.title}</CardTitle>
          <StatusBadge variant={task.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary/50" />
            {task.assignee}
          </span>
          {task.dueDate && (
            <span>Due: {task.dueDate}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Task Grid

**File:** `src/components/dashboard/task-grid.tsx`

```typescript
import { TaskCard, type Task } from './task-card'
import { cn } from '@/lib/utils'

interface TaskGridProps {
  tasks: Task[]
  className?: string
  onTaskClick?: (task: Task) => void
}

export function TaskGrid({ tasks, className, onTaskClick }: TaskGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      className
    )}>
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onClick={() => onTaskClick?.(task)}
        />
      ))}
    </div>
  )
}
```

### 4. Stats Card

**File:** `src/components/dashboard/stats-card.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && trendValue && (
              <p className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground',
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="size-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 5. Dashboard Layout

**File:** `src/components/dashboard/dashboard-layout.tsx`

```typescript
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold">Company Dashboard</h1>
        </div>
      </header>
      <main className={cn('container px-4 py-6', className)}>
        {children}
      </main>
    </div>
  )
}
```

### 6. Utility Helper

**File:** `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 7. Task Types

**File:** `src/types/task.ts`

```typescript
export type TaskStatus = 'pending' | 'progress' | 'completed' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskCategory = 'development' | 'research' | 'design' | 'testing' | 'documentation'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate?: string
  category: TaskCategory
  createdAt: string
  updatedAt: string
  dependencies?: string[]
  relatedFiles?: string[]
}

export interface Agent {
  name: string
  role: string
  specialization: string
  currentWorkload: number
  activeTasks: string[]
  skills: string[]
}
```

---

## File Structure to Create

```
src/
├── app/
│   ├── globals.css          # UPDATE with theme tokens
│   ├── layout.tsx           # Update metadata
│   └── page.tsx             # Dashboard page
├── components/
│   ├── ui/
│   │   ├── button.tsx       # shadcn init
│   │   ├── card.tsx         # shadcn add card
│   │   ├── input.tsx        # shadcn add input
│   │   ├── select.tsx       # shadcn add select
│   │   ├── badge.tsx        # shadcn add badge
│   │   └── status-badge.tsx # Custom (create)
│   └── dashboard/
│       ├── dashboard-layout.tsx  # Create
│       ├── task-card.tsx         # Create
│       ├── task-grid.tsx         # Create
│       ├── stats-card.tsx        # Create
│       └── filter-bar.tsx        # Create
├── lib/
│   └── utils.ts             # Create cn() helper
└── types/
    └── task.ts              # Create Task types
```

---

## Implementation Order

### Phase 1: Setup (Day 1)
1. Install dependencies: `npm install class-variance-authority clsx tailwind-merge lucide-react`
2. Initialize shadcn: `npx shadcn@latest init`
3. Add components: `npx shadcn@latest add button card input select badge dropdown-menu skeleton separator`
4. Update `globals.css` with theme tokens (above)
5. Create `src/lib/utils.ts`

### Phase 2: Core Components (Day 2)
1. Create `src/types/task.ts`
2. Create `src/components/ui/status-badge.tsx`
3. Create dashboard components:
   - `dashboard-layout.tsx`
   - `stats-card.tsx`
   - `task-card.tsx`
   - `task-grid.tsx`

### Phase 3: Dashboard Page (Day 3)
1. Update `page.tsx` with dashboard layout
2. Add mock data for testing
3. Implement filtering/sorting

### Phase 4: Integration (Day 4+)
1. Connect to OpenClaw file data
2. Implement 5-second polling
3. Add loading states
4. Test dark mode

---

## Accessibility Checklist

- [ ] All interactive elements have visible focus states
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Status badges include icons + text (not color only)
- [ ] Task cards are keyboard navigable (tab, enter)
- [ ] ARIA labels on interactive elements
- [ ] Dark mode tested for contrast

---

## Notes for Aki

1. **Tailwind v4 is already configured** - use `@theme inline` in globals.css
2. **Use semantic tokens** - `bg-primary` not `bg-blue-500`
3. **CVA for variants** - Type-safe component variants
4. **Test dark mode early** - Toggle with `.dark` class on `<html>`
5. **React 19** - No `forwardRef` needed, ref is a regular prop

---

*Design Specifications v1.0 - Ready for Implementation*