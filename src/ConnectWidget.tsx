import React, { createContext } from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import type { ConnectProps } from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'
import { ConnectedTokenProvider } from 'src/ConnectedTokenProvider'
import { TooSmallDialog } from 'src/components/app/TooSmallDialog'

interface PostMessageContextType {
  onPostMessage: (event: string, data?: object) => void
}
interface ConnectWidgetPropTypes extends ConnectProps {
  language?: ConnectLanguageTypes
  onPostMessage: (event: string, data?: object) => void
}
type ConnectLanguageTypes = {
  locale: 'en' | 'es' | 'fr-ca'
  custom_copy_namespace: string
}

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
