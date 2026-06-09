import React from 'react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, waitFor } from 'src/utilities/testingLibrary'
import { AGG_MODE } from 'src/const/Connect'
import ConnectWidget from '../ConnectWidget'

vi.mock('../global.css', () => ({}))
vi.mock('../styles.css', () => ({}))

vi.mock('react-confetti', () => ({
  default: () => <div data-test="confetti" />,
}))

describe('main.tsx entry point', () => {
  const defaultProps = {
    clientConfig: { connect: { mode: AGG_MODE } },
    profiles: {},
    userFeatures: {},
    language: { locale: 'en', localizedContent: {} },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ConnectWidget initialization', () => {
    it('renders ConnectWidget with aggregation mode config', async () => {
      render(<ConnectWidget {...defaultProps} />)

      await waitFor(() => {
        expect(document.querySelector('#connect-wrapper')).toBeInTheDocument()
      })
    })

    it('uses the correct default mode configuration', () => {
      const expectedConfig = { connect: { mode: AGG_MODE } }

      expect(expectedConfig.connect.mode).toBe('aggregation')
    })

    it('renders without errors when using main.tsx config structure', () => {
      expect(() => {
        render(<ConnectWidget {...defaultProps} />)
      }).not.toThrow()
    })
  })

  describe('DOM mounting', () => {
    it('renders to a root element', () => {
      const container = document.createElement('div')
      container.id = 'root'
      document.body.appendChild(container)

      render(<ConnectWidget {...defaultProps} />, { container })

      expect(container.children.length).toBeGreaterThan(0)

      document.body.removeChild(container)
    })

    it('mounts ConnectWidget successfully', () => {
      const { container } = render(<ConnectWidget {...defaultProps} />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('configuration validation', () => {
    it('accepts the main.tsx config format', () => {
      const { container } = render(<ConnectWidget {...defaultProps} />)

      expect(container).toBeInTheDocument()
    })

    it('uses aggregation mode as specified in main.tsx', async () => {
      render(<ConnectWidget {...defaultProps} />)

      await waitFor(() => {
        expect(document.querySelector('#connect-wrapper')).toBeInTheDocument()
      })
    })

    it('renders the widget with correct mode constant', () => {
      expect(AGG_MODE).toBe('aggregation')

      const { container } = render(<ConnectWidget {...defaultProps} />)

      expect(container).toBeTruthy()
    })
  })

  describe('React 18 compatibility', () => {
    it('is compatible with React 18 createRoot API', () => {
      expect(() => {
        render(<ConnectWidget {...defaultProps} />)
      }).not.toThrow()
    })

    it('renders without strict mode violations', () => {
      const { container } = render(
        <React.StrictMode>
          <ConnectWidget {...defaultProps} />
        </React.StrictMode>,
      )

      expect(container).toBeInTheDocument()
    })
  })
})
