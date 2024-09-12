/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext } from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'
import { ConnectedTokenProvider } from 'src/ConnectedTokenProvider'

export const PostMessageContext = createContext<
  | {
      onPostMessage: (event: string, data: object) => void
    }
  | undefined
>(undefined)

export const ConnectWidget = (props: any) => {
  initGettextLocaleData(props.language)

  return (
    <Provider store={Store}>
      <ConnectedTokenProvider>
        <PostMessageContext.Provider value={{ onPostMessage: props.onPostMessage }}>
          <WidgetDimensionObserver heightOffset={0}>
            <Connect {...props} />
          </WidgetDimensionObserver>
        </PostMessageContext.Provider>
      </ConnectedTokenProvider>
    </Provider>
  )
}

export default ConnectWidget
