/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect } from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'
import { ConnectedTokenProvider } from 'src/ConnectedTokenProvider'
import { TooSmallDialog } from 'src/components/app/TooSmallDialog'
import { setLocalizedContent } from 'src/redux/reducers/localizedContentSlice'

interface PostMessageContextType {
  postMessageEventOverrides?: PostMessageEventOverrides
  onPostMessage: (event: string, data?: object) => void
}

interface ConnectOverridesContextType {
  aggregatorHeaderOverride?: string
}

export const PostMessageContext = createContext<PostMessageContextType>({ onPostMessage: () => {} })
export const ConnectOverridesContext = createContext<ConnectOverridesContextType>({})

function setupLocalizedContent(localizedContent: Record<string, any>) {
  Store.dispatch(setLocalizedContent(localizedContent))
}

export const ConnectWidget = ({
  onPostMessage = () => {},
  onAnalyticPageview = () => {},
  postMessageEventOverrides,
  showTooSmallDialog = true,
  aggregatorHeaderOverride,
  ...props
}: any) => {
  initGettextLocaleData(props.language)

  useEffect(() => {
    setupLocalizedContent(props?.language?.localizedContent || {})
  }, [])

  return (
    <Provider store={Store}>
      <ConnectedTokenProvider>
        <PostMessageContext.Provider value={{ onPostMessage, postMessageEventOverrides }}>
          <ConnectOverridesContext.Provider value={{ aggregatorHeaderOverride }}>
            <WidgetDimensionObserver heightOffset={0}>
              {showTooSmallDialog && <TooSmallDialog onAnalyticPageview={onAnalyticPageview} />}
              <Connect onAnalyticPageview={onAnalyticPageview} {...props} />
            </WidgetDimensionObserver>
          </ConnectOverridesContext.Provider>
        </PostMessageContext.Provider>
      </ConnectedTokenProvider>
    </Provider>
  )
}

export default ConnectWidget
