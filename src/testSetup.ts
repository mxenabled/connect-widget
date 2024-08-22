import { afterEach } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { server } from 'src/services/testServer'

// We are overriding the defaut DOM Testing Library attribute "data-testid" to be "data-test"
configure({ testIdAttribute: 'data-test' })

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => {
  server.close()
})
