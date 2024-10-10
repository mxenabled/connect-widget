/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext } from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'
import { ConnectedTokenProvider } from 'src/ConnectedTokenProvider'
import { TooSmallDialog } from 'src/components/app/TooSmallDialog'

export const PostMessageContext = createContext<PostMessageContextType>({ onPostMessage: () => {} })

export const ConnectWidget = ({
  onPostMessage = () => {},
  onAnalyticPageview = () => {},
  showTooSmallDialog = true,
  ...props
}: any) => {
  initGettextLocaleData(props.language)
  return (
    <Provider store={Store}>
      <ConnectedTokenProvider>
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <WidgetDimensionObserver heightOffset={0}>
            {showTooSmallDialog && <TooSmallDialog onAnalyticPageview={onAnalyticPageview} />}
            <Connect onAnalyticPageview={onAnalyticPageview} {...props} />
          </WidgetDimensionObserver>
        </PostMessageContext.Provider>
      </ConnectedTokenProvider>
    </Provider>
  )
}

export default ConnectWidget
