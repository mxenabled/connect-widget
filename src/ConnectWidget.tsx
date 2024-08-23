import React from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'

export const ConnectWidget = (props: any) => {
  return (
    <Provider store={Store}>
      <Connect {...props} />
    </Provider>
  )
}

export default ConnectWidget
