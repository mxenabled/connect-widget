import React from 'react'
import { render as rtlRender, screen } from '@testing-library/react'
import { of, Subject } from 'rxjs'
import { WebSocketProvider, useWebSocket, WebSocketConnection } from '../WebSocketContext'

describe('WebSocketContext', () => {
  describe('WebSocketProvider', () => {
    it('should render children', () => {
      rtlRender(
        <WebSocketProvider>
          <div>Test Child</div>
        </WebSocketProvider>,
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should provide undefined value when no value prop is passed', () => {
      const TestComponent = () => {
        const webSocket = useWebSocket()
        return <div data-test="ws-value">{webSocket === undefined ? 'undefined' : 'defined'}</div>
      }

      rtlRender(
        <WebSocketProvider>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('ws-value')).toHaveTextContent('undefined')
    })

    it('should provide WebSocket connection when value prop is passed', () => {
      const mockConnection: WebSocketConnection = {
        isConnected: () => true,
        webSocketMessages$: of({ type: 'test' }),
      }

      const TestComponent = () => {
        const webSocket = useWebSocket()
        return (
          <div data-test="ws-connected">
            {webSocket?.isConnected() ? 'connected' : 'disconnected'}
          </div>
        )
      }

      rtlRender(
        <WebSocketProvider value={mockConnection}>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('ws-connected')).toHaveTextContent('connected')
    })
  })

  describe('useWebSocket hook', () => {
    it('should return undefined when used without provider value', () => {
      const TestComponent = () => {
        const webSocket = useWebSocket()
        return <div data-test="result">{webSocket ? 'has value' : 'no value'}</div>
      }

      rtlRender(
        <WebSocketProvider>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('result')).toHaveTextContent('no value')
    })

    it('should return WebSocket connection when provided', () => {
      const mockConnection: WebSocketConnection = {
        isConnected: () => false,
        webSocketMessages$: of({ type: 'message' }),
      }

      const TestComponent = () => {
        const webSocket = useWebSocket()
        return <div data-test="result">{webSocket ? 'has value' : 'no value'}</div>
      }

      rtlRender(
        <WebSocketProvider value={mockConnection}>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('result')).toHaveTextContent('has value')
    })

    it('should allow accessing isConnected method', () => {
      const mockConnection: WebSocketConnection = {
        isConnected: vi.fn(() => true),
        webSocketMessages$: of({}),
      }

      const TestComponent = () => {
        const webSocket = useWebSocket()
        const connected = webSocket?.isConnected()
        return <div data-test="status">{connected ? 'connected' : 'disconnected'}</div>
      }

      rtlRender(
        <WebSocketProvider value={mockConnection}>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('status')).toHaveTextContent('connected')
      expect(mockConnection.isConnected).toHaveBeenCalled()
    })

    it('should allow subscribing to webSocketMessages$', async () => {
      const messageSubject = new Subject()
      const mockConnection: WebSocketConnection = {
        isConnected: () => true,
        webSocketMessages$: messageSubject.asObservable(),
      }

      const TestComponent = () => {
        const webSocket = useWebSocket()
        const [message, setMessage] = React.useState<string>('')

        React.useEffect(() => {
          if (webSocket) {
            const subscription = webSocket.webSocketMessages$.subscribe((msg: { text: string }) => {
              setMessage(msg.text)
            })
            return () => subscription.unsubscribe()
          }
          return undefined
        }, [webSocket])

        return <div data-test="message">{message || 'no message'}</div>
      }

      rtlRender(
        <WebSocketProvider value={mockConnection}>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('message')).toHaveTextContent('no message')

      messageSubject.next({ text: 'Hello WebSocket' })

      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(screen.getByTestId('message')).toHaveTextContent('Hello WebSocket')
    })
  })

  describe('Integration tests', () => {
    it('should allow multiple components to access the same WebSocket connection', () => {
      const mockConnection: WebSocketConnection = {
        isConnected: () => true,
        webSocketMessages$: of({ type: 'test' }),
      }

      const Component1 = () => {
        const ws = useWebSocket()
        return <div data-test="comp1">{ws?.isConnected() ? 'connected' : 'disconnected'}</div>
      }

      const Component2 = () => {
        const ws = useWebSocket()
        return <div data-test="comp2">{ws?.isConnected() ? 'connected' : 'disconnected'}</div>
      }

      rtlRender(
        <WebSocketProvider value={mockConnection}>
          <Component1 />
          <Component2 />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('comp1')).toHaveTextContent('connected')
      expect(screen.getByTestId('comp2')).toHaveTextContent('connected')
    })

    it('should handle disconnected state', () => {
      const mockConnection: WebSocketConnection = {
        isConnected: () => false,
        webSocketMessages$: of({}),
      }

      const TestComponent = () => {
        const ws = useWebSocket()
        return (
          <div data-test="connection-status">
            {ws?.isConnected() ? 'Connected' : 'Disconnected'}
          </div>
        )
      }

      rtlRender(
        <WebSocketProvider value={mockConnection}>
          <TestComponent />
        </WebSocketProvider>,
      )

      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')
    })
  })
})
