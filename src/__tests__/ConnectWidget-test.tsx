import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { of } from 'rxjs'

import { ConnectWidget } from '../ConnectWidget'
import { useWebSocket } from 'src/context/WebSocketContext'

// Mock Connect component to verify context value
const MockConnect = () => {
  const ws = useWebSocket()
  return <div data-test="mock-connect">{ws ? 'has-ws' : 'no-ws'}</div>
}

vi.mock('src/Connect', () => ({
  default: MockConnect,
}))

describe('ConnectWidget', () => {
  const defaultProps = {
    clientConfig: {},
    profiles: {},
    userFeatures: {},
    language: { locale: 'en', localizedContent: {} },
  }

  it('provides webSocketConnection to children when passed as a prop', () => {
    const mockWS = {
      isConnected: vi.fn().mockReturnValue(true),
      webSocketMessages$: of({}),
    }

    const { getByTestId } = render(<ConnectWidget {...defaultProps} webSocketConnection={mockWS} />)

    expect(getByTestId('mock-connect')).toHaveTextContent('has-ws')
  })

  it('does not provide webSocketConnection when not passed', () => {
    const { getByTestId } = render(<ConnectWidget {...defaultProps} />)

    expect(getByTestId('mock-connect')).toHaveTextContent('no-ws')
  })
})
