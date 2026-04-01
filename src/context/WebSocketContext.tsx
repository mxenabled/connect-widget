/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext } from 'react'
import { Observable } from 'rxjs'

export interface WebSocketConnection {
  isConnected: () => boolean
  webSocketMessages$: Observable<any>
}

const WebSocketContext = createContext<WebSocketConnection | undefined>(undefined)

export const WebSocketProvider: React.FC<{
  value?: WebSocketConnection
  children: React.ReactNode
}> = ({ value, children }) => (
  <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
)

export const useWebSocket = () => useContext(WebSocketContext)
