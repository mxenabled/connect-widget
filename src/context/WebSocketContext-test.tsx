import React from 'react'
import { renderHook } from '@testing-library/react'
import { of } from 'rxjs'
import { WebSocketProvider, useWebSocket, WebSocketConnection } from 'src/context/WebSocketContext'

describe('WebSocketContext', () => {
  it('should return undefined when no WebSocket connection is provided', () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: ({ children }) => <WebSocketProvider>{children}</WebSocketProvider>,
    })

    expect(result.current).toBeUndefined()
  })

  it('should return the WebSocket connection when provided', () => {
    const mockConnection: WebSocketConnection = {
      isConnected: () => true,
      webSocketMessages$: of({ type: 'test' }),
    }

    const { result } = renderHook(() => useWebSocket(), {
      wrapper: ({ children }) => (
        <WebSocketProvider value={mockConnection}>{children}</WebSocketProvider>
      ),
    })

    expect(result.current).toBe(mockConnection)
    expect(result.current?.isConnected()).toBe(true)
  })

  it('should allow accessing webSocketMessages$ observable', () => {
    const mockConnection: WebSocketConnection = {
      isConnected: () => false,
      webSocketMessages$: of({ event: 'test', payload: { id: 123 } }),
    }

    const { result } = renderHook(() => useWebSocket(), {
      wrapper: ({ children }) => (
        <WebSocketProvider value={mockConnection}>{children}</WebSocketProvider>
      ),
    })

    expect(result.current?.webSocketMessages$).toBeDefined()

    let receivedMessage: unknown
    result.current?.webSocketMessages$.subscribe((msg) => {
      receivedMessage = msg
    })

    expect(receivedMessage).toEqual({ event: 'test', payload: { id: 123 } })
  })

  it('should provide the same connection to multiple consumers', () => {
    const mockConnection: WebSocketConnection = {
      isConnected: vi.fn(() => true),
      webSocketMessages$: of({}),
    }

    const { result: result1 } = renderHook(() => useWebSocket(), {
      wrapper: ({ children }) => (
        <WebSocketProvider value={mockConnection}>{children}</WebSocketProvider>
      ),
    })

    const { result: result2 } = renderHook(() => useWebSocket(), {
      wrapper: ({ children }) => (
        <WebSocketProvider value={mockConnection}>{children}</WebSocketProvider>
      ),
    })

    expect(result1.current).toBe(mockConnection)
    expect(result2.current).toBe(mockConnection)
  })
})
