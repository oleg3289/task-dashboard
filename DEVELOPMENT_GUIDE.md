# Task Dashboard - Development Guide

## Setup Status: ✅ COMPLETE

All infrastructure is configured and working. Ready to begin dashboard development.

## Getting Started

### Prerequisites
- Node.js v22+ installed
- npm available

### Installation
```bash
cd projects/task-dashboard
npm install
```

### Development
```bash
# Start development server
npm run dev
# Server available at http://localhost:3000

# Run unit tests
npm test

# Watch mode for development
npm run test:watch
```

## Project Structure

```
task-dashboard/
├── .project-docs/          # Original project documentation
├── playwright-tests/       # E2E tests (Playwright - separate runner)
├── src/
│   ├── app/
│   │   ├── globals.css     # Tailwind v4 configuration
│   │   └── layout.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       └── __tests__/
│   │           └── components.test.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── test/
│       └── setup.ts
├── vite.config.ts          # Vitest configuration
├── next.config.ts
├── postcss.config.mjs
└── package.json
```

## Test Results

```
Test Files: 2 passed (2)
Tests: 13 passed (13)
  - src/test/simple.test.ts: 2 tests
  - src/components/ui/__tests__/components.test.tsx: 11 tests
```

## Design System

### Color Tokens
- **Primary:** Brand blue (OKLCH)
- **Success:** Green for completed tasks
- **Warning:** Yellow for pending tasks
- **Info:** Blue for information
- **Destructive:** Red for errors

### Components Available
- **Button** - With variants and sizes
- **Card** - Header, content, footer composition
- **Badge** - Status indicators with color variants

## Next Steps

1. **Configure filesystem access** in next.config.js
2. **Create API routes** to read OpenClaw task data
3. **Build dashboard UI** components (TDD approach)
4. **Connect to data** and implement filtering

## Notes

- E2E tests are run separately with Playwright
- Unit tests use Vitest with React Testing Library
- 80% coverage threshold configured
- TypeScript type checking via Next.js
