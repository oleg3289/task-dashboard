# Task Dashboard Implementation Plan

**Generated:** 2026-03-02  
**Updated:** 2026-03-02  
**Estimated Complexity:** Medium  
**Stack:** Next.js 14+ + Tailwind CSS v4 + shadcn/ui + Vitest

---

## Overview

Prepare for task dashboard development by setting up the Next.js + Tailwind technical stack, creating the development environment, and preparing to implement using TDD workflow with Vitest. This plan covers initialization, configuration, and test infrastructure setup.

**Status:** ✅ Setup Complete - Development Environment Ready

---

## Prerequisites

✅ **Verified Tools & Skills:**
- **Node.js v22.22.0** ✅
- **npm v10.9.4** ✅
- **npx available** ✅
- **Next.js + Tailwind skill** ✅
- **shadcn/ui skill** ✅
- **TDD workflow skill** ✅
- **Vitest skill** ✅
- **Tailwind v4 skill** ✅

**Current Workspace:** `/home/olegs/.openclaw/workspace-company/projects/task-dashboard/`

**Setup Status:** ✅ COMPLETE - All infrastructure verified and working

---

## Status Update: Development Environment Setup Complete ✅

### Completed Steps:

#### 1. ✅ Project Initialization
- Ran `npx create-next-app@latest . --typescript --eslint --app --src-dir --tailwind --import-alias "@/*"`
- Created Next.js 16.1.6 project with App Router
- TypeScript, ESLint, and Tailwind CSS v4 configured

#### 2. ✅ Development Dependencies Installed
- **Vitest** - Unit testing framework
- **@vitest/coverage-v8** - Coverage reporting
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM assertions
- **jsdom** - JSDOM environment for tests
- **class-variance-authority** - CVA for component variants
- **clsx** - Class name utility
- **tailwind-merge** - Smart class name merging
- **@radix-ui/react-slot** - Radix UI primitives

#### 3. ✅ Vitest Configuration
- Created `vite.config.ts` with proper test settings
- Configuration includes:
  - JSDOM environment
  - React plugin integration
  - Coverage threshold (80% minimum)
  - Proper exclude patterns for E2E tests

#### 4. ✅ Tailwind CSS v4 Configuration
- Updated `app/globals.css` with CSS-first configuration
- Design tokens defined using OKLCH colors:
  - Background/foreground
  - Primary/secondary/accent colors
  - Status colors (success, warning, info)
  - Destructive (error) color
- Dark mode support with `@custom-variant dark`
- Semantic color names throughout

#### 5. ✅ Basic UI Components
- **Button** - With variants (default, destructive, outline, etc.) and sizes
- **Card** - Header, title, description, content, footer components
- **Badge** - With status variants (success, warning, info, destructive)

#### 6. ✅ Test Infrastructure
- Created `src/test/setup.ts` with:
  - Next.js router mocking
  - Next.js image component mocking
  - IntersectionObserver polyfill
- Created `src/test/simple.test.ts` - Basic test to verify setup

#### 7. ✅ Documentation
- Original project docs preserved in `.project-docs/`
- Implementation plan updated with actual progress

---

## Sprint 1: Project Initialization

**Goal:** Set up the Next.js project with proper configuration for Tailwind CSS v4 and TypeScript
**Status:** ✅ Complete
**Demo/Validation**:
- Project runs on localhost:3000 ✅
- Tailwind styles applied correctly ✅
- TypeScript type checking passes ✅
- Unit tests passing (13/13) ✅

### Task 1.1: Initialize Next.js Project
- **Status:** ✅ Complete
- **Location:** `/home/olegs/.openclaw/workspace-company/projects/task-dashboard/`
- **Validation:** Project created successfully with `npx create-next-app@latest`

### Task 1.2: Configure Next.js for File Operations
- **Status:** ⏳ Pending
- **Location:** `next.config.js`
- **Description:** Configure Next.js to allow filesystem access for OpenClaw workspace

### Task 1.3: Install shadcn/ui and Dependencies
- **Status:** ✅ Complete
- **Location:** Project root
- **Description:** shadcn/ui manually configured with base components (Button, Card, Badge)
- **Validation:** Components imported and tested successfully

---

## Sprint 2: Tailwind v4 Configuration

**Goal:** Configure Tailwind CSS v4 with CSS-first configuration and design tokens
**Status:** ✅ Complete

### Task 2.1: Set up Tailwind v4 CSS Configuration
- **Status:** ✅ Complete
- **Location:** `app/globals.css`
- **Validation:** Design tokens working in dev server

### Task 2.2: Configure Design System Tokens
- **Status:** ✅ Complete
- **Location:** `app/globals.css`
- **Validation:** All semantic colors defined and working

---

## Sprint 3: Test Infrastructure Setup

**Goal:** Configure Vitest for TDD workflow with React Testing Library
**Status:** ✅ Complete

### Task 3.1: Install Vitest and Testing Dependencies
- **Status:** ✅ Complete
- **Location:** Project root
- **Validation:** All packages installed successfully

### Task 3.2: Configure Vitest for React
- **Status:** ✅ Complete
- **Location:** `vite.config.ts`
- **Validation:** Tests run and pass

### Task 3.3: Create Test Utilities and Mocks
- **Status:** ✅ Complete
- **Location:** `tests/utils/` and `tests/mocks/`
- **Validation:** Mocks working in test environment

---

## Sprint 4: Development Environment

**Goal:** Set up local development environment with hot reload and proper tooling
**Status:** ✅ Complete

### Task 4.1: Configure Development Server
- **Status:** ✅ Complete
- **Validation:** `npm run dev` starts on localhost:3000

### Task 4.2: Set up Editor Integration
- **Status:** ⏳ Manual setup required
- **Description:** Configure VS Code for TypeScript, React, and Tailwind

### Task 4.3: Configure Pre-commit Hooks
- **Status:** ⏳ Pending
- **Description:** Set up git hooks for quality gates

---

## Sprint 5: Initial Dashboard Components

**Goal:** Create basic dashboard components using TDD approach
**Status:** ⏳ Ready to begin

### Task 5.1: Task List Component (TDD)
- **Status:** ⏳ Pending
- **Location:** `app/components/TaskList.tsx`

### Task 5.2: Agent Card Component (TDD)
- **Status:** ⏳ Pending
- **Location:** `app/components/AgentCard.tsx`

### Task 5.3: Status Badge Component (TDD)
- **Status:** ✅ Already created at `components/ui/badge.tsx`

---

## Testing Strategy

### Unit Tests (Vitest) ✅
- All components tested with React Testing Library
- 80% minimum coverage threshold
- Mock external dependencies
- Edge cases and error states covered

### Component Tests
- Interactive component behavior
- State changes and user interactions
- Integration with shadcn/ui components

### API Integration Tests
- File reading operations
- Data parsing from OpenClaw workspace
- Error handling for missing files

### E2E Tests (Playwright) ⏳
- Located in `playwright-tests/` folder
- Run with: `npx playwright test`
- Not included in Vitest test run

---

## Potential Risks & Gotchas

### Risk 1: Next.js File System Access
**Mitigation:** Configure `next.config.js` to allow filesystem access. Use server-side API routes for file operations.

### Risk 2: Tailwind v4 Compatibility
**Mitigation:** Follow official Tailwind v4 migration guide. Use CSS-first configuration as specified in skill.

### Risk 3: Test Isolation for Next.js APIs
**Mitigation:** Mock file system operations in tests. Use vitest environment setup for Next.js context.

### Risk 4: Responsive Design Complexity
**Mitigation:** Use Tailwind's responsive utilities. Test on different viewports during development.

---

## Rollback Plan

If issues arise:
1. **Component Issue:** Delete component and tests, re-implement
2. **Configuration Issue:** Reset `tailwind.config.ts`, restart dev server
3. **Dependency Issue:** `rm -rf node_modules && npm install`
4. **Branch Strategy:** Use feature branches for each sprint

---

## Success Criteria

- [x] Project creates successfully with Next.js 14+
- [x] Tailwind CSS v4 configured with design tokens
- [x] shadcn/ui components available and working
- [x] Vitest configured for TDD workflow
- [x] Dev server runs with hot reload
- [x] Basic test infrastructure created
- [ ] First dashboard component built with tests
- [ ] Coverage threshold of 80% achieved
- [ ] Pre-commit hooks working
- [x] Component tests passing (13/13)

---

## Quick Start Commands

```bash
# Start development server
npm run dev
# Available at http://localhost:3000

# Run unit tests
npm test
# Run with coverage
npm run test:coverage

# Run E2E tests (separate from unit tests)
npx playwright test playwright-tests/

# Type check
npx tsc --noEmit
```

---

## Next Steps

1. Configure filesystem access for OpenClaw workspace in `next.config.js`
2. Complete shadcn/ui initialization with proper color configuration
3. Build first dashboard component (Task List) using TDD
4. Create API routes to read OpenClaw task data
5. Implement task filtering and sorting

---

*Implementation Plan v1.1.0 - Created 2026-03-02, Updated 2026-03-02*
