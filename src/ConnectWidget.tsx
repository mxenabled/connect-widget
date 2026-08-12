/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'
import { ConnectedTokenProvider } from 'src/ConnectedTokenProvider'
import { setLocalizedContent } from 'src/redux/reducers/localizedContentSlice'
import { WebSocketProvider } from 'src/context/WebSocketContext'
import './sharedVariables.css'
import 'src/styles/spacing.css'
import 'src/styles/styles.css'

interface PostMessageContextType {
  postMessageEventOverrides?: PostMessageEventOverrides
  onPostMessage: (event: string, data?: object) => void
}

export const PostMessageContext = createContext<PostMessageContextType>({ onPostMessage: () => {} })

export const ConnectWidgetWithoutReduxProvider = ({
  onPostMessage = () => {},
  onAnalyticPageview = () => {},
  postMessageEventOverrides,
  webSocketConnection,
  ...props
}: any) => {
  initGettextLocaleData(props.language)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setLocalizedContent(props?.language?.localizedContent || {}))
  }, [])

  return (
    <ConnectedTokenProvider>
      <WebSocketProvider value={webSocketConnection}>
        <PostMessageContext.Provider value={{ onPostMessage, postMessageEventOverrides }}>
          <WidgetDimensionObserver heightOffset={0}>
            <Connect onAnalyticPageview={onAnalyticPageview} {...props} />
          </WidgetDimensionObserver>
        </PostMessageContext.Provider>
      </WebSocketProvider>
    </ConnectedTokenProvider>
  )
}

export const ConnectWidget = (props: any) => (
  <Provider store={Store}>
    <ConnectWidgetWithoutReduxProvider {...props} />
  </Provider>
)

export default ConnectWidget
