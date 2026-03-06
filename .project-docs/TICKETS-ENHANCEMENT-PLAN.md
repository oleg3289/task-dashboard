# Tickets Tab Enhancement - Implementation Plan

## Executive Summary

**Feature:** Enhance the Tickets tab in Task Dashboard to provide comprehensive ticket management with filtering capabilities.

**Definition of Done:**
1. ✅ Complete list of tickets displayed (including completed, archived)
2. ✅ Relevant info about each ticket (including assigned agent)
3. ✅ Filter tasks by status and agent

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript, Static Export for GitHub Pages

---

## Current State Analysis

### Existing Architecture
- **Frontend:** Next.js 14 App Router with client components
- **Styling:** Tailwind CSS with shadcn/ui components
- **Data Sources:**
  - `/public/data/agents.json` - Agent roster (8 agents)
  - `/public/real-status.json` - Live agent status
  - `/work-tracker/current-assignments.json` - Active assignments
  - `/work-tracker/escalations.json` - Escalation records
  - `COMPANY_ROSTER.md` - Story/ticket data (JSON embedded)
  - `/public/data/stories.json` - Currently empty (needs sync)

### Current Tickets Tab
- Displays tickets from `stories.json` (currently empty)
- No filtering capabilities
- No archived/completed ticket visibility
- Basic agent display without detailed status

### Available Components
- `TaskCard` - Displays individual tickets with status badges
- `AgentCard` - Shows agent workload
- `TeamStatus` - Live team tracking
- `Badge`, `Card`, `Tabs`, `Select` - UI primitives

---

## Data Architecture

### New Data Model

```typescript
// Enhanced ticket status to include archived
type TicketStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'archived';

// Extended ticket interface
interface EnhancedTicket extends Ticket {
  storyId: string;
  storyTitle: string;
  archivedAt?: string;
  archivedReason?: string;
  completedAt?: string;
  assigneeRole?: string;
  assigneeSpecialization?: string;
}

// Filter state
interface TicketFilters {
  status: TicketStatus[];
  agent: string | 'all';
  story: string | 'all';
  priority: TaskPriority[];
  search: string;
  showArchived: boolean;
}
```

### Data Flow

```
COMPANY_ROSTER.md → Parse JSON → stories.json → Dashboard
                    ↓
                 tickets.json (normalized)
                    ↓
              FilteredTicketsView
```

---

## Implementation Sprint Breakdown

### Sprint 1: Data Infrastructure (Foundation)
**Duration:** 2-3 hours
**Assignee:** Aki (Developer)

#### Tickets:
1. **TICKET-001**: Create data sync script
   - Parse COMPANY_ROSTER.md JSON section
   - Generate `/public/data/stories.json` 
   - Generate `/public/data/tickets.json` (normalized view)
   - Assign to: aki
   - Priority: critical
   - Estimate: 1h

2. **TICKET-002**: Add archived tickets data source
   - Create `/public/data/archived-tickets.json`
   - Define archived ticket schema
   - Include completion metadata
   - Assign to: aki
   - Priority: high
   - Estimate: 30m

3. **TICKET-003**: Create custom hooks for ticket data
   - `useTickets()` - fetch all tickets
   - `useTicketFilters()` - filter state management
   - `useArchivedTickets()` - archived tickets hook
   - Assign to: aki
   - Priority: high
   - Estimate: 1h

---

### Sprint 2: UI Components (Presentation)
**Duration:** 3-4 hours
**Assignee:** Power (Designer)

#### Tickets:
4. **TICKET-004**: Design filter controls component
   - Status multi-select
   - Agent dropdown
   - Search input
   - Archive toggle
   - Responsive layout
   - Assign to: power
   - Priority: high
   - Estimate: 1h

5. **TICKET-005**: Enhance TaskCard component
   - Add story context display
   - Show assignee details (role, specialization)
   - Add archived/completed indicators
   - Improve mobile responsiveness
   - Assign to: power
   - Priority: high
   - Estimate: 45m

6. **TICKET-006**: Create TicketStats overview component
   - Status distribution chart
   - Agent workload summary
   - Active vs archived count
   - Assign to: power
   - Priority: medium
   - Estimate: 1h

---

### Sprint 3: Filtering Logic (Core Feature)
**Duration:** 2-3 hours
**Assignee:** Aki (Developer)

#### Tickets:
7. **TICKET-007**: Implement status filtering
   - Multi-select status filter
   - Status badge integration
   - URL state sync
   - Assign to: aki
   - Priority: critical
   - Estimate: 45m

8. **TICKET-008**: Implement agent filtering
   - Agent dropdown with search
   - Show agent status indicators
   - Cross-reference with real-status.json
   - Assign to: aki
   - Priority: critical
   - Estimate: 45m

9. **TICKET-009**: Implement search functionality
   - Title/description search
   - Debounced input
   - Highlight matching text
   - Assign to: aki
   - Priority: high
   - Estimate: 30m

10. **TICKET-010**: Implement archive toggle
    - Show/hide archived tickets
    - Visual distinction for archived
    - Archive count badge
    - Assign to: aki
    - Priority: high
    - Estimate: 30m

---

### Sprint 4: Testing & Polish (Quality)
**Duration:** 2-3 hours
**Assignee:** Kobeni (Tester)

#### Tickets:
11. **TICKET-011**: Unit tests for filter hooks
    - Test filter combinations
    - Test edge cases (empty results)
    - Test URL state sync
    - Assign to: kobeni
    - Priority: high
    - Estimate: 1h

12. **TICKET-012**: E2E tests for tickets tab
    - Filter workflow tests
    - Search functionality tests
    - Mobile responsiveness tests
    - Assign to: kobeni
    - Priority: high
    - Estimate: 1h

13. **TICKET-013**: Accessibility audit
    - Keyboard navigation
    - Screen reader testing
    - Color contrast verification
    - Assign to: kobeni
    - Priority: medium
    - Estimate: 1h

---

### Sprint 5: Documentation & Review (Handoff)
**Duration:** 1-2 hours
**Assignee:** Denji (Researcher)

#### Tickets:
14. **TICKET-014**: Update documentation
    - Component docs
    - Data flow diagrams
    - Filter usage examples
    - Assign to: denji
    - Priority: medium
    - Estimate: 45m

15. **TICKET-015**: Code review preparation
    - Self-review checklist
    - Performance metrics
    - Bundle size check
    - Assign to: himeno
    - Priority: medium
    - Estimate: 30m

---

## Technical Specifications

### New Files to Create

```
src/
├── hooks/
│   ├── useTickets.ts           # Ticket data fetching
│   ├── useTicketFilters.ts     # Filter state management
│   └── useArchivedTickets.ts   # Archived tickets
├── components/
│   ├── tickets/
│   │   ├── TicketFilters.tsx   # Filter controls
│   │   ├── TicketStats.tsx     # Stats overview
│   │   └── ArchivedToggle.tsx  # Archive visibility toggle
│   └── ui/
│       └── MultiSelect.tsx      # Multi-select dropdown
├── lib/
│   ├── ticket-utils.ts         # Filtering utilities
│   └── data-sync.ts            # Data sync script
└── types/
    └── ticket.ts               # Extended types (update)

public/data/
├── stories.json                # Synced from COMPANY_ROSTER.md
├── tickets.json               # Normalized tickets
└── archived-tickets.json      # Archived tickets
```

### Filter State Management

```typescript
interface FilterState {
  status: Set<TicketStatus>;
  agent: string;
  search: string;
  showArchived: boolean;
  priority: Set<TaskPriority>;
}

// URL sync for shareable filters
const FILTER_URL_KEYS = {
  status: 's',
  agent: 'a',
  search: 'q',
  showArchived: 'archived',
} as const;
```

### Performance Considerations

- **Memoization:** All filter operations use `useMemo`
- **Debouncing:** Search input debounced 300ms
- **Virtual Scrolling:** Consider for 100+ tickets
- **Static Generation:** Pre-compute filtered counts at build time

---

## Acceptance Criteria

### US-001: Complete Ticket List
- [ ] All tickets from stories displayed
- [ ] Archived tickets accessible via toggle
- [ ] Completed tickets shown with completion date
- [ ] Tickets grouped by story (optional grouping view)

### US-002: Ticket Information
- [ ] Assignee name displayed with role/specialization
- [ ] Assignee status indicator (working/available/idle)
- [ ] Priority badge clearly visible
- [ ] Story context shown (story title link)

### US-003: Filtering
- [ ] Status filter with multi-select
- [ ] Agent filter with search
- [ ] Text search across title/description
- [ ] Archived toggle with visual feedback
- [ ] Filter state persists in URL
- [ ] Clear filters button available

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data sync breaks | High | Fallback to mock data, error boundary |
| Performance with many tickets | Medium | Virtual scrolling, pagination |
| Filter state complexity | Medium | Use URL params, simple state machine |
| Mobile responsiveness | Low | Mobile-first design approach |

---

## Dependencies

1. **Data Source:** COMPANY_ROSTER.md must have valid JSON
2. **Components:** shadcn/ui Select, Dialog available
3. **Build:** Static export compatible with all features
4. **Testing:** Playwright tests exist for E2E

---

## Timeline Estimate

| Sprint | Duration | Dependencies |
|--------|----------|--------------|
| Sprint 1: Data | 2-3h | None |
| Sprint 2: UI | 3-4h | Sprint 1 |
| Sprint 3: Filters | 2-3h | Sprint 1, 2 |
| Sprint 4: Testing | 2-3h | Sprint 3 |
| Sprint 5: Docs | 1-2h | Sprint 4 |

**Total Estimated Time:** 10-15 hours
**Recommended Sprint:** Single day with parallelization

---

## Next Steps

1. **Immediate:** Assign tickets to specialists
2. **Sprint 1 Kickoff:** Aki starts data infrastructure
3. **Parallel:** Power begins UI component design
4. **Review Gate:** After Sprint 3 completion
5. **Final:** Deploy to GitHub Pages