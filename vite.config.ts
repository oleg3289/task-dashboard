/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.ts{,x}'],
    exclude: [
      'node_modules',
      '.next',
      '.output',
      'dist',
      'src/test/setup.ts',
      'playwright-tests'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        '.next',
        '.output',
        'dist',
        'playwright-tests',
        'src/test/'
      ],
      all: true,
      threshold: {
        global: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
})
