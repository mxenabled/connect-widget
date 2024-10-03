import { configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// We are overriding the defaut DOM Testing Library attribute "data-testid" to be "data-test"
configure({ testIdAttribute: 'data-test' })

Object.defineProperty(document, 'referrer', {
  value: 'Banana Stand',
})
