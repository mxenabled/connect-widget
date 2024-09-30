import React, { createContext } from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import type { ConnectProps } from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'
import { ConnectedTokenProvider } from 'src/ConnectedTokenProvider'

interface PostMessageContextType {
  onPostMessage: (event: string, data?: object) => void
}
interface ConnectWidgetPropTypes extends ConnectProps {
  language?: { locale: 'en' | 'es' | 'fr-ca'; custom_copy_namespace: string }
  onPostMessage: (event: string, data?: object) => void
}

export const PostMessageContext = createContext<PostMessageContextType>({ onPostMessage: () => {} })

export const ConnectWidget = ({
  onPostMessage = () => {},
  language = { locale: 'en', custom_copy_namespace: '' },
  ...props
}: ConnectWidgetPropTypes) => {
  initGettextLocaleData(language)

  return (
    <Provider store={Store}>
      <ConnectedTokenProvider>
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <WidgetDimensionObserver heightOffset={0}>
            <Connect {...props} />
          </WidgetDimensionObserver>
        </PostMessageContext.Provider>
      </ConnectedTokenProvider>
    </Provider>
  )
}

export default ConnectWidget
