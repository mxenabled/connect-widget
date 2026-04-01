import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { of } from 'rxjs'

import { ConnectWidget } from '../ConnectWidget'
import { useWebSocket } from '../context/WebSocketContext'

vi.mock('src/Connect', () => ({
  default: vi.fn(() => {
    // In actual implementation, it uses Context
    // But for the test we just want to see if it renders without crashing
    // and correctly provides the context which we can check via useWebSocket in a child if we want
    return <div data-test="mock-connect">mock-connect</div>
  }),
}))

// A simple component to verify context
const ContextChecker = () => {
  const ws = useWebSocket()
  return <div data-test="context-checker">{ws ? 'has-ws' : 'no-ws'}</div>
}

// We need to mock Connect to render the ContextChecker instead
vi.mock('src/Connect', () => ({
  default: () => <ContextChecker />,
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

    expect(getByTestId('context-checker')).toHaveTextContent('has-ws')
  })

  it('does not provide webSocketConnection when not passed', () => {
    const { getByTestId } = render(<ConnectWidget {...defaultProps} />)

    expect(getByTestId('context-checker')).toHaveTextContent('no-ws')
  })
})
