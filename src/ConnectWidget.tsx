import React from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
import Connect from 'src/Connect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConnectWidget = (props: any) => {
  return (
    <Provider store={Store}>
      <Connect {...props} />
    </Provider>
  )
}

export default ConnectWidget
