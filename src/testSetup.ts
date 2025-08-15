import { configure, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// We are overriding the defaut DOM Testing Library attribute "data-testid" to be "data-test"
configure({ testIdAttribute: 'data-test' })

Object.defineProperty(document, 'referrer', {
  value: 'Banana Stand',
})

Object.defineProperty(global.document, 'fonts', {
  value: {
    ready: Promise.resolve(),
  },
  writable: true,
})

// Mock window.open for JSDOM compatibility
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
})

// Handle unhandled promise rejections in tests
const originalRejectionHandler = process.listeners('unhandledRejection')
beforeAll(() => {
  process.removeAllListeners('unhandledRejection')
  process.on('unhandledRejection', (reason) => {
    // Only log if it's not an expected test error
    if (
      reason &&
      typeof reason === 'object' &&
      'name' in reason &&
      reason.name !== 'TestingLibraryElementError'
    ) {
      console.warn('Unhandled promise rejection in tests:', reason)
    }
  })
})

afterAll(() => {
  process.removeAllListeners('unhandledRejection')
  originalRejectionHandler.forEach((handler) => {
    process.on('unhandledRejection', handler)
  })
})

// Mock console.warn to suppress React act() warnings in tests
const originalWarn = console.warn
const originalError = console.error

beforeEach(() => {
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }

  // Suppress Material-UI related warnings in tests
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Material-UI') || args[0].includes('MUI'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterEach(() => {
  console.warn = originalWarn
  console.error = originalError
  // Clean up any pending timers
  vi.clearAllTimers()
  // Reset mocks
  vi.clearAllMocks()
  // Clean up DOM
  cleanup()
})
