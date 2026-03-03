# Design System Specification

**Project:** Internal Task Status Dashboard  
**Version:** 1.0.0  
**Last Updated:** 2026-03-02

---

## Overview

This design system provides a comprehensive set of UI components and design tokens for the Task Dashboard. Built on Tailwind CSS v4 with shadcn/ui patterns, it ensures consistency, accessibility, and maintainability across the application.

---

## Design Tokens

### Color Palette

All colors use CSS custom properties with HSL values for easy theming and dark mode support.

#### Base Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--background` | `0 0% 100%` | `222.2 84% 4.9%` | Page backgrounds |
| `--foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Primary text |
| `--card` | `0 0% 100%` | `222.2 84% 4.9%` | Card backgrounds |
| `--card-foreground` | `222.2 84% 4.9%` | `210 40% 98%` | Card text |

#### Semantic Colors

| Token | Light Mode | Usage |
|-------|-----------|-------|
| `--primary` | `222.2 47.4% 11.2%` | Primary actions, buttons |
| `--secondary` | `210 40% 96.1%` | Secondary backgrounds |
| `--muted` | `210 40% 96.1%` | Disabled, placeholder |
| `--accent` | `210 40% 96.1%` | Highlights, hover states |

#### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `142 76% 36%` | Completed tasks, success states |
| `--warning` | `38 92% 50%` | High priority, overloaded agents |
| `--info` | `199 89% 48%` | In progress, active states |
| `--destructive` | `0 84.2% 60.2%` | Blocked, errors, critical priority |

### Spacing

Uses Tailwind's default spacing scale:
- `0`: 0px
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.5rem` | Default radius |
| `rounded` | `0.25rem` | Small elements |
| `rounded-lg` | `0.5rem` | Cards, modals |
| `rounded-full` | `9999px` | Avatars, pills |

---

## Components

### 1. Task Card (`task-card.tsx`)

Display individual tasks with status, priority, and metadata.

#### Variants

**Status Variants** (border-left indicator):
- `pending` - Gray border (muted)
- `progress` - Blue border (info)
- `completed` - Green border (success), reduced opacity
- `blocked` - Red border (destructive)

**Priority Indicator** (dot):
- `low` - Gray dot
- `medium` - Blue dot
- `high` - Yellow/orange dot
- `critical` - Red dot with pulse animation

#### Props

```typescript
interface TaskCardProps {
  task: Task
  selected?: boolean      // Show selection ring
  compact?: boolean       // Reduced layout
  showAssignee?: boolean  // Show assignee info
  showDueDate?: boolean   // Show due date
  showCategory?: boolean  // Show category badge
  onClick?: () => void    // Click handler
  className?: string
}
```

#### Usage

```tsx
// Full task card
<TaskCard 
  task={task} 
  onClick={() => selectTask(task.id)}
/>

// Compact variant for lists
<TaskCard 
  task={task} 
  compact 
  showDueDate={false}
/>

// Skeleton for loading
<TaskCardSkeleton compact />
```

#### Accessibility
- Keyboard navigable (tab + enter)
- Focus-visible ring
- ARIA role="button"

---

### 2. Status Indicator (`status-indicator.tsx`)

Visual indicators for task and agent status.

#### Components

##### StatusDot
Small colored dot indicating status.

```tsx
<StatusDot status="progress" size="md" showRing />
```

Sizes: `sm` (6px), `md` (10px), `lg` (12px)

##### StatusPill
Pill-shaped badge with optional icon.

```tsx
<StatusPill status="completed" label="Done" showIcon />
```

##### ProgressBar
Linear progress indicator.

```tsx
<ProgressBar 
  value={75} 
  max={100} 
  variant="default"
  showLabel 
/>
```

Auto-variant based on value:
- 0-30%: danger
- 30-70%: warning
- 70-100%: default
- 100%: success

##### CircularProgress
Circular progress indicator.

```tsx
<CircularProgress 
  value={75} 
  size={48} 
  strokeWidth={4}
  showValue 
/>
```

##### StatusSummary
Overview of all status counts.

```tsx
<StatusSummary 
  counts={{ pending: 5, progress: 3, completed: 10, blocked: 1 }}
  showLabels
/>
```

---

### 3. Agent Workload (`agent-workload.tsx`)

Display agent information and workload visualization.

#### Components

##### AgentAvatar
Initials avatar with status color.

```tsx
<AgentAvatar name="Aki Tanaka" size="md" status="active" />
```

Sizes: `sm` (32px), `md` (40px), `lg` (48px)

Status colors:
- `idle` - Gray
- `active` - Blue (with pulse)
- `overloaded` - Yellow
- `offline` - Muted

##### AgentCard
Full agent information card.

```tsx
<AgentCard 
  agent={agent}
  selected={selectedAgent === agent.name}
  onClick={() => setSelectedAgent(agent.name)}
/>
```

##### AgentWorkloadGrid
Grid layout for multiple agents.

```tsx
<AgentWorkloadGrid 
  agents={agents}
  selectedAgentId={selectedAgent}
  onAgentSelect={setSelectedAgent}
/>
```

##### TeamWorkloadSummary
Team-level statistics.

```tsx
<TeamWorkloadSummary agents={agents} />
```

#### Workload Levels

| Workload % | Level | Color | Description |
|------------|-------|-------|-------------|
| 0-25 | low | success | Good availability |
| 26-50 | medium | info | Normal load |
| 51-75 | high | warning | Approaching capacity |
| 76-100 | critical | destructive | At or over capacity |

---

## Layout Patterns

### Task List Grid

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {tasks.map(task => (
    <TaskCard key={task.id} task={task} />
  ))}
</div>
```

### Dashboard Layout

```tsx
<div className="container mx-auto p-6">
  <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
    {/* Main content */}
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
        <TaskCardGrid tasks={activeTasks} />
      </section>
    </div>
    
    {/* Sidebar */}
    <aside className="space-y-6">
      <TeamWorkloadSummary agents={agents} />
      <StatusSummary counts={statusCounts} />
    </aside>
  </div>
</div>
```

---

## Animation Classes

### Built-in Animations

| Class | Description |
|-------|-------------|
| `animate-pulse` | Subtle pulsing (priority dots) |
| `animate-spin` | Rotation (loading indicators) |
| `animate-ping` | Expanding ring (active indicators) |
| `animate-in` | Fade-in with slide |

### Transition Classes

```tsx
// Smooth color transitions
className="transition-colors duration-200"

// All properties with default timing
className="transition-all"

// Transform on hover
className="transition-transform hover:scale-105"
```

---

## Accessibility Guidelines

### Color Contrast
- All text meets WCAG AA contrast requirements
- Status indicators include icons/text, not just color

### Focus Management
- Use `focus-visible` for keyboard navigation styling
- Focus ring: `ring-2 ring-ring ring-offset-2`

### Interactive Elements
- All clickable cards have `role="button"` and `tabIndex={0}`
- Keyboard support: Enter key triggers onClick
- ARIA labels for icon-only buttons

### Loading States
- Skeleton components maintain layout during loading
- `aria-busy` attribute for loading containers

---

## Dark Mode

### Implementation

The design system uses CSS custom properties with a `.dark` class strategy:

```css
/* Toggle dark mode */
document.documentElement.classList.toggle('dark')
```

### Color Adaptations

Dark mode automatically inverts:
- Background becomes dark (#0c0c0f)
- Text becomes light
- Borders become lighter for visibility
- Status colors maintain their semantic meaning

---

## Responsive Breakpoints

Uses Tailwind's default breakpoints:

| Breakpoint | Min Width | Common Usage |
|------------|-----------|--------------|
| `sm` | 640px | Small screens |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Wide screens |

### Example Responsive Patterns

```tsx
// Grid that adjusts columns
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-4">
```

---

## Component Import Guide

```tsx
// Import all components
import { 
  TaskCard, 
  StatusDot, 
  AgentCard 
} from '@/components/ui'

// Or import individually
import { TaskCard } from '@/components/ui/task-card'
import { StatusPill } from '@/components/ui/status-indicator'
import { AgentCard } from '@/components/ui/agent-workload'
```

---

## File Structure

```
src/components/ui/
├── index.ts              # Barrel exports
├── button.tsx            # Base button component
├── card.tsx              # Base card component
├── badge.tsx             # Badge/chip component
├── task-card.tsx         # Task display component
├── status-indicator.tsx  # Status indicators
├── agent-workload.tsx    # Agent visualization
└── __tests__/
    └── components.test.tsx
```

---

## Testing Considerations

Each component includes:
1. **Default state** - Renders correctly
2. **All variants** - Each variant renders
3. **Interactive states** - Click, hover, focus
4. **Accessibility** - ARIA attributes present
5. **Loading states** - Skeleton components

Test coverage target: 80%+

---

## Changelog

### v1.0.0 (2026-03-02)
- Initial design system release
- TaskCard component with status/priority variants
- Status indicators (dot, pill, progress)
- Agent workload visualization
- Design tokens and CSS variables
- Dark mode support

---

*This design system follows shadcn/ui patterns and Tailwind CSS v4 best practices. Components are copy-paste ready and fully customizable.*