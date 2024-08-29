/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'
import { WidgetDimensionObserver } from 'src/components/app/WidgetDimensionObserver'
import { initGettextLocaleData } from 'src/utilities/Personalization'

export const ConnectWidget = (props: any) => {
  initGettextLocaleData(props.language)

  return (
    <Provider store={Store}>
      <WidgetDimensionObserver heightOffset={0}>
        <Connect {...props} />
      </WidgetDimensionObserver>
    </Provider>
  )
}

export default ConnectWidget
