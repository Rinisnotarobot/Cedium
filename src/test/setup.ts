import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock server-only modules to prevent import errors in tests
vi.mock('@tanstack/react-start/server-only', () => ({}))

// Mock environment variables
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test')
vi.stubEnv('BETTER_AUTH_SECRET', 'test-secret-key-for-testing')
vi.stubEnv('BETTER_AUTH_URL', 'http://localhost:3000')