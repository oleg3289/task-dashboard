# Testing Quick Reference: Internal Task Status Dashboard

**Quick-start guide for developers working on the dashboard project**

---

## 📋 Quick Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-run on changes)
npm test -- --watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npx playwright test

# Run specific test file
npm test src/components/TaskCard.test.tsx

# Run E2E tests withtrace
npx playwright test --trace on
```

---

## 🏃 TDD Workflow (5 Minutes)

### Step 1: Write Test First
```typescript
// src/components/NewComponent/NewComponent.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewComponent } from './NewComponent'

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Step 2: Run Test (Expect Red)
```bash
npm test
# Test should fail
```

### Step 3: Implement Code
```typescript
// src/components/NewComponent/NewComponent.tsx
export function NewComponent() {
  return <div>Hello</div>
}
```

### Step 4: Run Test (Expect Green)
```bash
npm test
# All tests pass ✓
```

### Step 5: Refactor (If Needed)
```typescript
// Improve code while keeping tests green
export const NewComponent = () => <h1>Hello</h1>
```

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] Tests written for new functionality
- [ ] All existing tests passing
- [ ] Coverage ≥ 80% (check with `npm run test:coverage`)
- [ ] No skipped tests (`it.skip`, `describe.skip`)
- [ ] Tests follow naming convention

---

## 📁 Test Filelocations

| Location | Purpose | Example |
|----------|---------|---------|
| `src/components/*/` | Component unit tests | `TaskCard.test.tsx` |
| `src/app/api/*/` | API route integration tests | `route.test.ts` |
| `src/services/` | Service layer tests | `taskService.test.ts` |
| `src/utils/` | Utility function tests | `formatDate.test.ts` |
| `e2e/` | E2E user flows | `dashboard.spec.ts` |

---

## 🎯 Coverage Requirements

| Test Type | Target Coverage | Command |
|-----------|-----------------|---------|
| Unit Tests | 80%+ | `npm test -- --coverage` |
| Integration Tests | 80%+ | `npm test` |
| E2E Tests | 100% critical | `npx playwright test` |

Check coverage report:
```bash
open coverage/index.html
```

---

## 🐛 Quick Troubleshooting

### Test fails with "Module not found"
```bash
# Install test dependencies
npm install --save-dev vitest @testing-library/react jsdom
```

### E2E test is flaky
```typescript
// Use waitFor instead of setTimeout
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### Mock not working
```typescript
// Define mocks before imports
vi.mock('@/services/service', () => ({ ... }))

// Use vi.hoisted for async mocks
vi.hoisted(() => {
  return { mockedFunction: vi.fn() }
})
```

---

## 📝 Common Patterns

### Testing Components
```typescript
// Render component
render(<MyComponent prop="value" />)

// Find elements
screen.getByText('Button')
screen.getByRole('button')
screen.getByPlaceholderText('Search...')

// Simulate events
fireEvent.click(screen.getByRole('button'))
fireEvent.change(screen.getByPlaceholderText('Input'), { target: { value: 'test' } })

// Expect assertions
expect(screen.getByText('Success')).toBeInTheDocument()
expect(screen.getByRole('button')).toBeDisabled()
```

### Testing API Routes
```typescript
const request = new Request('http://localhost/api/tasks')
const response = await GET(request)
const data = await response.json()

expect(response.status).toBe(200)
expect(data.success).toBe(true)
```

### Testing E2E Flows
```typescript
// Navigate and verify
await page.goto('/')
await expect(page).toHaveTitle(/Dashboard/)

// Interact
await page.fill('input[name="search"]', 'query')
await page.click('button:has-text("Submit")')

// Assert
await expect(page.locator('[data-testid="result"]')).toBeVisible()
```

---

## 🚦 Quality Gates

Before merging code, ensure:

| Gate | Status | Command |
|------|--------|---------|
| Tests Passing | ✅ | `npm test` |
| Coverage ≥80% | ✅ | `npm run test:coverage` |
| E2E Tests Pass | ✅ | `npx playwright test` |

---

## 🎓 Learning Resources

- **Vitest Docs:** https://vitest.dev/guide/
- **Playwright Docs:** https://playwright.dev/
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **TDD Guide:** Martin Fowler's TDD article

---

## 💡 Pro Tips

1. **Test one thing per test** - Keep tests focused
2. **Use descriptive names** - `function_condition_result`
3. **Mock external dependencies** - Keep tests isolated
4. **Test edge cases** - Handle errors and edge conditions
5. **Keep tests fast** - Unit tests should be < 50ms

---

*Quick Reference v1.0 - For daily development*
