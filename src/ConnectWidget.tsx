import React from 'react'
import { Provider } from 'react-redux'

import Store from 'src/redux/Store'
// import Connect from 'src/Connect'

export const ConnectWidget = () => {
  return (
    <Provider store={Store}>
      <h1>Connect widget</h1>
      {/* <Connect /> */}
    </Provider>
  )
}

export default ConnectWidget
