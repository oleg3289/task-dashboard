# Test Execution Guide: Dashboard Project

**Version:** 1.0.0  
**Last Updated:** 2026-03-02  
**Project:** Internal Task Status Dashboard

---

## Quick Start

### 1. Install Dependencies
```bash
cd projects/task-dashboard
npm install
```

### 2. Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### 3. Run E2E Tests
```bash
# First, start dev server (in another terminal)
npm run dev

# Then run E2E tests
npx playwright test
```

---

## Testing Commands Reference

### Unit Tests (Vitest)

| Command | Description |
|---------|-------------|
| `npm test` | Run all unit tests once |
| `npm test -- --watch` | Watch mode - auto-run on file changes |
| `npm test src/components/TaskCard.test.tsx` | Run specific test file |
| `npm test -- --testNamePattern="TaskCard"` | Run tests matching pattern |
| `npm run test:coverage` | Run tests with coverage report |

### E2E Tests (Playwright)

| Command | Description |
|---------|-------------|
| `npx playwright test` | Run all E2E tests |
| `npx playwright test dashboard.spec.ts` | Run specific test file |
| `npx playwright test --headed` | Run tests with visible browser |
| `npx playwright test --debug` | Run tests in debug mode |
| `npx playwright test --trace on` | Record trace for debugging |

### Test Coverage

| Command | Description |
|---------|-------------|
| `npm run test:coverage` | Generate coverage report |
| `open coverage/index.html` | View HTML coverage report |
| `cat coverage/coverage-summary.json` | View JSON coverage report |

---

## Test Development Workflow

### TDD Flow (3-Step Process)

#### Step 1: Write Test (Red)
```typescript
// Create test file: src/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

#### Step 2: Implement Code (Green)
```typescript
// Create component: src/components/MyComponent.tsx
export function MyComponent() {
  return <div>Hello</div>
}
```

#### Step 3: Verify (Refactor)
```bash
# Run tests
npm test

# If all pass, refactor if needed while keeping tests green
```

---

## Debugging Tests

### Debugging失败的 Unit Tests

1. **Run with verbose output:**
```bash
npm test -- --reporter=verbose
```

2. **Run specific test with debugger:**
```bash
npx vitest --debug src/components/MyComponent.test.tsx
```

3. **Use console.log in tests:**
```typescript
it('renders correctly', () => {
  console.log('Debug info:', someVariable)
  render(<MyComponent />)
  // ... assertions
})
```

### Debugging失败的 E2E Tests

1. **Run in headed mode (visible browser):**
```bash
npx playwright test dashboard.spec.ts --headed
```

2. **Use trace viewer:**
```bash
npx playwright test --trace on
npx playwright show-trace coverage/playwright-results/trace.zip
```

3. **Take screenshots on failure:**
```bash
npx playwright test --screenshot=only-on-failure
```

---

## Common Test Patterns

### Testing Components

```typescript
// 1. Render component
render(<MyComponent prop="value" />)

// 2. Find element
screen.getByText('Button')
screen.getByRole('button')
screen.getByPlaceholderText('Search...')

// 3. Simulate interaction
fireEvent.click(screen.getByRole('button'))
fireEvent.change(screen.getByPlaceholderText('Input'), { target: { value: 'test' } })

// 4. Assert
expect(screen.getByText('Success')).toBeInTheDocument()
expect(screen.getByRole('button')).toBeDisabled()
```

### Testing API Routes

```typescript
import { GET } from './route'

it('returns tasks successfully', async () => {
  const request = new Request('http://localhost/api/tasks')
  const response = await GET(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data.success).toBe(true)
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTaskFilter } from './useTaskFilter'

it('filters tasks by status', () => {
  const { result } = renderHook(() => useTaskFilter())
  
  act(() => {
    result.current.setStatus('pending')
  })
  
  expect(result.current.status).toBe('pending')
})
```

---

## Performance Testing

### Measure Test Execution Time

```bash
# Run tests and show timing
npm test -- --reporter=verbose

# Check individual test timing in output
```

### Optimize Slow Tests

| Strategy | Example |
|----------|---------|
| Mock external dependencies | `vi.mock('@/services/service')` |
| Test in parallel | Enable `threads` in vitest config |
| Use `vi.useFakeTimers()` | For time-based tests |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      - name: Run E2E tests
        run: npx playwright test
        if: github.ref == 'refs/heads/main'
```

---

## Quality Gate Verification

### Verify Before Code Review

```bash
# 1. All tests passing?
npm test
# Expected: All tests pass ✓

# 2. Coverage ≥ 80%?
npm run test:coverage
# Check: global branches/functions/lines/statements ≥ 80

# 3. E2E tests passing?
npx playwright test
# Expected: All critical flows pass ✓

# 4. No warnings?
# Check output for any warnings or errors
```

### Quality Gate Checklist

- [ ] `npm test` returns exit code 0
- [ ] Coverage ≥ 80% (check `coverage/index.html`)
- [ ] `npx playwright test` passes
- [ ] No skipped tests (`it.skip`, `describe.skip`)
- [ ] No console errors during test run

---

## Troubleshooting

### Issue: "Module not found"

**Solution:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Issue: Test is flaky

**Solutions:**
- Use `waitFor` instead of `setTimeout`
- Use data-testid attributes
- Add proper waits for async operations

### Issue: E2E test times out

**Solutions:**
- Check if dev server is running
- Verify baseURL in playwright config
- Increase timeout if needed

### Issue: Coverage below threshold

**Solutions:**
- Add tests for uncovered branches
- Test error handling paths
- Refactor untestable code

---

## Best Practices

### Do ✅
- Write tests first (TDD)
- Mock external dependencies
- Test edge cases
- Use descriptive test names
- Keep tests fast (< 50ms each)

### Don't ❌
- Test implementation details
- Share state between tests
- Use CSS selectors (brittle)
- Skip tests without reason
- Add arbitrary timeouts

---

## Test File templates

### Component Test Template
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders with correct props', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    render(<MyComponent onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('displays loading state', () => {
    render(<MyComponent loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<MyComponent error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
```

### API Route Test Template
```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'

vi.mock('@/services/service', () => ({
  fetchData: vi.fn()
}))

describe('GET /api/endpoint', () => {
  it('returns data successfully', async () => {
    vi.mocked(fetchData).mockResolvedValue({ data: [] })

    const request = new Request('http://localhost/api/endpoint')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('handles errors gracefully', async () => {
    vi.mocked(fetchData).mockRejectedValue(new Error('Network error'))

    const request = new Request('http://localhost/api/endpoint')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})
```

---

## Support and Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/guide/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)

### Related Skills
- `tdd-workflow` - Test-driven development methodology
- `vitest` - Unit testing framework
- `playwright-expert` - E2E testing specialist
- `quality-gate-enforcement` - Quality assurance framework

---

*Test Execution Guide v1.0 - For daily development testing*
