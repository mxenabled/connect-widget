import React, { createContext } from 'react'
import type { Observable } from 'rxjs'

export const WebSocketContext = createContext<
  | {
      isConnected: () => boolean
      webSocketMessages$: Observable<{ event: any; payload: any }> | null
    }
  | undefined
  | null
>(null)

export const useWebSocketContext = () => {
  const context = React.useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}
