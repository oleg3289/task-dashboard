# STORY-002: Tickets Tab Enhancement

## Story Overview

**ID:** STORY-002  
**Title:** Tickets Tab Enhancement for Task Dashboard  
**Description:** Enhance the Tickets tab to provide comprehensive ticket management with filtering capabilities, including complete ticket lists (including archived/completed), relevant agent information, and filter controls.  
**Type:** feature  
**Priority:** high  
**Status:** todo  
**Assignee:** reze (planning), aki (implementation), power (design), kobeni (testing)  
**Created:** 2026-03-05T16:45:00Z  
**Updated:** 2026-03-05T16:45:00Z

## Definition of Done

1. ✅ Complete list of tickets displayed (including completed, archived)
2. ✅ Relevant info about each ticket (including assigned agent with role/specialization)
3. ✅ Filter tasks by status and agent
4. ✅ Search functionality (title/description)
5. ✅ Archive visibility toggle
6. ✅ Mobile responsive design
7. ✅ Unit and E2E tests passing
8. ✅ Documentation updated

## Technical Context

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript, Static Export  
**Current Components:** TaskCard, AgentCard, TeamStatus, Badge, Card, Tabs, Select  
**Data Sources:**
- `/public/data/agents.json` - Agent roster
- `/public/real-status.json` - Live agent status
- `COMPANY_ROSTER.md` - Story/ticket data (needs sync to stories.json)

## Sprint Breakdown

---

## Sprint 1: Data Infrastructure
**Duration:** 2-3 hours  
**Lead:** aki  

### TICKET-002-001: Create Data Sync Script
- **Description:** Create script to parse COMPANY_ROSTER.md JSON and generate stories.json and tickets.json files
- **Assignee:** aki
- **Status:** todo
- **Priority:** critical
- **Estimate:** 1h
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] Script parses JSON from COMPANY_ROSTER.md
  - [ ] Generates /public/data/stories.json
  - [ ] Generates /public/data/tickets.json (normalized view)
  - [ ] Script handles missing/malformed data gracefully
  - [ ] Adds npm script command for easy execution

### TICKET-002-002: Create Archived Tickets Data Source
- **Description:** Define schema and create data source for archived tickets with completion metadata
- **Assignee:** aki
- **Status:** todo
- **Priority:** high
- **Estimate:** 30m
- **Dependencies:** TICKET-002-001
- **Acceptance Criteria:**
  - [ ] Create /public/data/archived-tickets.json
  - [ ] Define archived ticket interface with completion metadata
  - [ ] Include archivedAt and archivedReason fields
  - [ ] Include completedAt timestamp for completed tickets

### TICKET-002-003: Create Custom Hooks for Ticket Data
- **Description:** Implement React hooks for ticket data fetching and filtering
- **Assignee:** aki
- **Status:** todo
- **Priority:** high
- **Estimate:** 1h
- **Dependencies:** TICKET-002-001, TICKET-002-002
- **Acceptance Criteria:**
  - [ ] useTickets() - fetches all tickets
  - [ ] useTicketFilters() - manages filter state
  - [ ] useArchivedTickets() - fetches archived tickets
  - [ ] All hooks have proper TypeScript types
  - [ ] Hooks handle loading/error states

---

## Sprint 2: UI Components
**Duration:** 3-4 hours  
**Lead:** power  

### TICKET-002-004: Design Filter Controls Component
- **Description:** Create responsive filter controls with status multi-select, agent dropdown, and search
- **Assignee:** power
- **Status:** todo
- **Priority:** high
- **Estimate:** 1h
- **Dependencies:** None (can work in parallel)
- **Acceptance Criteria:**
  - [ ] Status multi-select with visual badges
  - [ ] Agent dropdown with search functionality
  - [ ] Text search input with debounce
  - [ ] Archive visibility toggle
  - [ ] Clear filters button
  - [ ] Mobile responsive layout

### TICKET-002-005: Enhance TaskCard Component
- **Description:** Improve TaskCard to show assignee details and archived/completed states
- **Assignee:** power
- **Status:** todo
- **Priority:** high
- **Estimate:** 45m
- **Dependencies:** None (can work in parallel)
- **Acceptance Criteria:**
  - [ ] Show story context (story title as link)
  - [ ] Display assignee role and specialization
  - [ ] Add archived/completed visual indicators
  - [ ] Improve mobile responsiveness
  - [ ] Add hover/interaction states

### TICKET-002-006: Create TicketStats Overview Component
- **Description:** Build stats overview showing ticket distribution and agent workload
- **Assignee:** power
- **Status:** todo
- **Priority:** medium
- **Estimate:** 1h
- **Dependencies:** Sprint 1 data hooks
- **Acceptance Criteria:**
  - [ ] Status distribution visualization
  - [ ] Agent workload summary per agent
  - [ ] Active vs archived count badges
  - [ ] Responsive grid layout

---

## Sprint 3: Filtering Logic
**Duration:** 2-3 hours  
**Lead:** aki  

### TICKET-002-007: Implement Status Filtering
- **Description:** Add multi-select status filter with URL state sync
- **Assignee:** aki
- **Status:** todo
- **Priority:** critical
- **Estimate:** 45m
- **Dependencies:** Sprint 1, Sprint 2 components
- **Acceptance Criteria:**
  - [ ] Multi-select dropdown for statuses
  - [ ] Status badges display current selection
  - [ ] Filter state syncs to URL parameters
  - [ ] URL parameters restore filter state on load
  - [ ] Works with all status types including archived

### TICKET-002-008: Implement Agent Filtering
- **Description:** Add agent filter with status indicators and cross-reference
- **Assignee:** aki
- **Status:** todo
- **Priority:** critical
- **Estimate:** 45m
- **Dependencies:** TICKET-002-007
- **Acceptance Criteria:**
  - [ ] Agent dropdown with avatar/status indicators
  - [ ] Search within agent list
  - [ ] Show agent workload count in dropdown
  - [ ] Cross-reference with real-status.json for live status
  - [ ] URL sync for selected agent

### TICKET-002-009: Implement Search Functionality
- **Description:** Add search across ticket title and description
- **Assignee:** aki
- **Status:** todo
- **Priority:** high
- **Estimate:** 30m
- **Dependencies:** TICKET-002-007
- **Acceptance Criteria:**
  - [ ] Debounced search input (300ms)
  - [ ] Search across title and description
  - [ ] Highlight matching text in results
  - [ ] URL sync for search query
  - [ ] Clear search button

### TICKET-002-010: Implement Archive Toggle
- **Description:** Add toggle to show/hide archived tickets
- **Assignee:** aki
- **Status:** todo
- **Priority:** high
- **Estimate:** 30m
- **Dependencies:** TICKET-002-002
- **Acceptance Criteria:**
  - [ ] Toggle button for archive visibility
  - [ ] Visual distinction for archived tickets
  - [ ] Archive count badge
  - [ ] Separate filter state for archived
  - [ ] URL sync for archive toggle state

---

## Sprint 4: Testing & Quality
**Duration:** 2-3 hours  
**Lead:** kobeni  

### TICKET-002-011: Unit Tests for Filter Hooks
- **Description:** Write comprehensive unit tests for all filter-related hooks
- **Assignee:** kobeni
- **Status:** todo
- **Priority:** high
- **Estimate:** 1h
- **Dependencies:** Sprint 1, Sprint 3
- **Acceptance Criteria:**
  - [ ] Test all filter combinations
  - [ ] Test edge cases (empty results, invalid filters)
  - [ ] Test URL state sync
  - [ ] Test debounced search
  - [ ] All tests pass in CI

### TICKET-002-012: E2E Tests for Tickets Tab
- **Description:** Write Playwright E2E tests for complete filter workflow
- **Assignee:** kobeni
- **Status:** todo
- **Priority:** high
- **Estimate:** 1h
- **Dependencies:** Sprint 3 complete
- **Acceptance Criteria:**
  - [ ] Test full filter workflow
  - [ ] Test search functionality
  - [ ] Test mobile responsiveness
  - [ ] Test URL state persistence
  - [ ] Test archive toggle

### TICKET-002-013: Accessibility Audit
- **Description:** Ensure accessibility compliance for all new components
- **Assignee:** kobeni
- **Status:** todo
- **Priority:** medium
- **Estimate:** 1h
- **Dependencies:** Sprint 2, Sprint 3
- **Acceptance Criteria:**
  - [ ] Keyboard navigation works for all controls
  - [ ] Screen reader testing passes
  - [ ] Color contrast meets WCAG AA
  - [ ] Focus states visible
  - [ ] ARIA labels appropriate

---

## Sprint 5: Documentation & Review
**Duration:** 1-2 hours  
**Lead:** denji, himeno  

### TICKET-002-014: Update Documentation
- **Description:** Document all new components, hooks, and data flows
- **Assignee:** denji
- **Status:** todo
- **Priority:** medium
- **Estimate:** 45m
- **Dependencies:** Sprint 4
- **Acceptance Criteria:**
  - [ ] Component docs for new UI components
  - [ ] Hook documentation with examples
  - [ ] Data flow diagrams updated
  - [ ] Filter usage examples documented
  - [ ] README updated

### TICKET-002-015: Code Review Preparation
- **Description:** Prepare code for final review with metrics and checklist
- **Assignee:** himeno
- **Status:** todo
- **Priority:** medium
- **Estimate:** 30m
- **Dependencies:** Sprint 4
- **Acceptance Criteria:**
  - [ ] Self-review checklist completed
  - [ ] Performance metrics documented
  - [ ] Bundle size impact measured
  - [ ] No TypeScript errors
  - [ ] Lint warnings addressed

---

## Architecture Notes

### Filter State Shape

```typescript
interface FilterState {
  status: Set<TicketStatus>;
  agent: string | 'all';
  search: string;
  showArchived: boolean;
  priority: Set<TaskPriority>;
}

// URL sync mapping
const FILTER_URL_KEYS = {
  status: 's',
  agent: 'a',
  search: 'q',
  showArchived: 'archived',
} as const;
```

### Component Hierarchy

```
TabbedDashboard
└── TicketsTab
    ├── TicketStats (overview)
    ├── TicketFilters
    │   ├── StatusMultiSelect
    │   ├── AgentDropdown
    │   ├── SearchInput
    │   └── ArchiveToggle
    └── TicketList
        └── TaskCard (enhanced) × n
```

### Data Flow

```
COMPANY_ROSTER.md
       │
       ▼ (sync script)
  stories.json
       │
       ▼ (useTickets hook)
  tickets.json (normalized)
       │
       ▼ (filtered by useTicketFilters)
  FilteredTickets
       │
       ▼ (rendered in TicketList)
  TaskCard components
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data sync script fails | Medium | High | Error boundary, fallback to mock data |
| Performance with many tickets | Low | Medium | Virtual scrolling, pagination |
| Complex filter state bugs | Medium | Medium | Comprehensive unit tests, URL state |
| Mobile layout issues | Low | Low | Mobile-first design, E2E tests |

---

## Dependencies Map

```
Sprint 1 (Data)
├── TICKET-002-001 ─┬─► TICKET-002-003
└── TICKET-002-002 ─┘

Sprint 2 (UI) - parallel
├── TICKET-002-004
├── TICKET-002-005
└── TICKET-002-006 ──► (needs Sprint 1 hooks)

Sprint 3 (Logic)
├── TICKET-002-007 ──► TICKET-002-008
│                      └─► TICKET-002-009
│                           └─► TICKET-002-010
Sprint 4 (Testing)
└── All Sprint 1-3 complete

Sprint 5 (Docs)
└── Sprint 4 complete
```

---

## Definition of Ready for Implementation

- [x] Requirements clearly defined
- [x] Technical approach documented
- [x] Component hierarchy designed
- [x] Data structures defined
- [x] Acceptance criteria written
- [x] Dependencies mapped
- [ ] Tickets assigned
- [ ] Sprint start confirmed

---

*Story created: 2026-03-05*
*Last updated: 2026-03-05*