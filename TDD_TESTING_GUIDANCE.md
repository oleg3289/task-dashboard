# TDD Testing Guidance

**Project:** Internal Task Status Dashboard  
**Date:** 2026-03-02  
**Status:** Coverage Validation Complete  

---

## Executive Summary

- **Total Tests:** 31 tests
- **Passing:** 13 tests (42%)
- **Failing:** 18 tests (58%)
- **Code Coverage Target:** 80%+ (currently unmeasured due to failures)

---

## ✅ Working Tests

### Component Tests (11 tests) - GOOD
**File:** `src/components/ui/__tests__/components.test.tsx`

All UI component tests are passing. This demonstrates:
- Proper React Testing Library setup
- Correct use of `@testing-library/react` and `@testing-library/jest-dom`
- Good component isolation and testing patterns

### Simple Tests (2 tests) - GOOD
**File:** `src/test/simple.test.ts`

Basic vitest configuration working correctly.

---

## ❌ Failing Tests Analysis

### Issue 1: File Monitor Mock Setup

**File:** `src/lib/file-monitor.test.ts`

**Problem:**
```typescript
// ❌ WRONG
const mockFs = vi.mocked(vi.fn(() => ({})))
```

**Fix:**
```typescript
// ✅ CORRECT
import * as fs from 'fs'
const mockFs = vi.mocked(fs)
```

**Additional Issues:**
- Need to add proper `vi.mock()` at the top of the file
- Should mock individual fs functions properly

**Correct Pattern:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'fs'
import { readOpenClawWorkspace, parseAgentSession, monitorFileChanges } from './file-monitor'

// Mock fs module before importing
vi.mock('fs')

describe('File Monitor Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('readOpenClawWorkspace', () => {
    it('should read workspace files successfully', () => {
      const mockReadFileSync = vi.spyOn(fs, 'readFileSync')
      const mockExistsSync = vi.spyOn(fs, 'existsSync')
      const mockLstatSync = vi.spyOn(fs, 'lstatSync')

      mockReadFileSync.mockReturnValue(JSON.stringify({ version: '1.0' }))
      mockExistsSync.mockReturnValue(true)
      mockLstatSync.mockReturnValue({ isFile: () => true } as any)

      const result = readOpenClawWorkspace('/fake/path')

      expect(result).toBeDefined()
      expect(result?.version).toBe('1.0')
    })
  })
})
```

---

### Issue 2: API Route Import Mismatch

**File:** `src/app/api/route.test.ts`

**Problem:** Tests expect a `GET` function but the actual route exports:
- `GET` (for `/api/workspace`)
- `SessionGET` (for `/api/session`)
- `StatusGET` (for `/api/status`)

**Fix Options:**

**Option A: Import by correct name**
```typescript
const { GET, SessionGET: sessionRoute, StatusGET: statusRoute } = await import('./route')
```

**Option B: Rename functions to follow Next.js conventions**
```typescript
// In route.ts, rename:
// SessionGET -> GET (export both as GET with dynamic handling)
// StatusGET -> GET
```

**Recommended:** Merge into a single `GET` handler with path-based routing:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readOpenClawWorkspace, parseAgentSession, getWorkspacePath } from '@/lib/file-monitor'

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url)
  
  try {
    const workspacePath = getWorkspacePath()

    // Handle /api/workspace
    if (pathname === '/api/workspace') {
      const workspaceData = readOpenClawWorkspace(workspacePath)
      return NextResponse.json({
        success: true,
        data: workspaceData,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle /api/session
    if (pathname === '/api/session') {
      const { searchParams } = new URL(request.url)
      const file = searchParams.get('file')

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Required query parameter: file', timestamp: new Date().toISOString() },
          { status: 400 }
        )
      }

      const sessionPath = `${workspacePath}/agents/aki/sessions/${file}`
      const sessionData = parseAgentSession(sessionPath)

      if (!sessionData) {
        return NextResponse.json(
          { success: false, error: 'Session file not found or invalid', timestamp: new Date().toISOString() },
          { status: 200 }
        )
      }

      return NextResponse.json({
        success: true,
        data: sessionData,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle /api/status
    if (pathname === '/api/status') {
      const workspaceData = readOpenClawWorkspace(workspacePath)
      return NextResponse.json({
        success: true,
        data: {
          workspaceAvailable: workspaceData !== null,
          workspacePath,
          version: workspaceData?.version || 'unknown',
          agentCount: workspaceData?.agents?.length || 0,
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Default: 404
    return NextResponse.json(
      { success: false, error: 'Not found', timestamp: new Date().toISOString() },
      { status: 404 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date().toISOString() },
      { status: 200 }
    )
  }
}
```

Then the tests can import a single `GET` function:
```typescript
const { GET } = await import('./route')
```

---

### Issue 3: Mock Function Call Pattern

**Problem:** Tests call functions like `mockFileMonitor.readOpenClawWorkspace.mockResolvedValue()`

**Fix:** Either make the functions async in the source:
```typescript
export async function readOpenClawWorkspace(workspacePath: string): Promise<OpenClawWorkspace | null> {
  // implementation
}
```

Or adjust tests to not use `.mockResolvedValue()`:
```typescript
mockFileMonitor.readOpenClawWorkspace.mockReturnValue(mockData)  // Not .mockResolvedValue()
```

---

## Testing Command Reference

```bash
# Run all tests (watch mode - quit with 'q')
npm test

# Run tests once (non-watch mode)
npm test -- --run

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/components/ui/__tests__/components.test.tsx

# Run E2E tests
npx playwright test

# Run specific E2E test
npx playwright test playwright-tests/dashboard.e2e.ts
```

---

## Quality Gate Progress

| Gate | Description | Status |
|------|-------------|--------|
| QG1: Requirements | Requirements quality | ✅ PASSED |
| QG2: Design | Design system review | ✅ PASSED |
| QG3: Code | Test coverage ≥ 80% | ⚠️ IN PROGRESS - Fix failing tests first |
| QG4: Integration | API/service testing | ⚠️ IN PROGRESS - Need mock fixes |
| QG5: Testing | Test suite validation | ⏳ PENDING |
| QG6: E2E | User flow testing | ⏳ PENDING |
| QG7: UAT | User acceptance | ⏳ PENDING |
| QG8: Deployment | Production readiness | ⏳ PENDING |

---

## Immediate Action Items

### Priority 1: Fix Failing Tests

1. **File Monitor Tests** - Fix mock setup (2-4 hours)
2. **API Route Tests** - Fix import/function naming mismatch (1-2 hours)
3. **Re-run coverage** - Ensure all tests pass (1 hour)

### Priority 2: Enhance Test Coverage

1. **Component Tests** - Add more component tests (2-4 hours)
2. **API Tests** - Add more API route tests (2-4 hours)
3. **Integration Tests** - Add integration tests for key flows (4-6 hours)

### Priority 3: E2E Testing

1. **Dashboard Tests** - Complete dashboard E2E tests (4-6 hours)
2. **User Flow Tests** - Add user journey tests (3-4 hours)
3. **Regression Tests** - Add regression suite (4-6 hours)

---

## Coverage Analysis Tools

```bash
# View coverage report
open coverage/index.html

# Check coverage summary
npm run test:coverage -- --reporter=basic

# Run with detailed coverage
npm run test:coverage -- --coverage.provider=v8 --coverage.reporter=text
```

---

## Testing Best Practices Applied

### ✅ What's Working
- React Testing Library setup is correct
- Component tests follow best practices
- Basic vitest configuration is sound
- Playwright E2E setup is configured

### ⚠️ Issues to Fix
- Module mocking strategy needs review
- Import/export naming consistency
- Async function handling in mocks
- Test file organization

---

## Next Steps

1. **Fix failing tests** (Priority 1)
2. **Re-run coverage** to establish baseline
3. **Add missing tests** to reach 80% target
4. **Set up CI** to run tests automatically
5. **Document testing patterns** for the team

---

*Testing Guidance Complete - Ready for Implementation*  
*Last Updated: 2026-03-02*
