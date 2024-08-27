import { configureStore } from '@reduxjs/toolkit'
import { createEpicMiddleware } from 'redux-observable'

import connectAPI from 'src/services/api'

import { rootEpic } from 'src/redux/epics'
import { initializedClientConfig } from 'src/redux/reducers/Client'
import { connect } from 'src/redux/reducers/Connect'
import { experiments } from 'src/redux/reducers/Experiments'
import configSlice from 'src/redux/reducers/configSlice'
import profilesSlice from 'src/redux/reducers/profilesSlice'
import userFeaturesSlice from 'src/redux/reducers/userFeaturesSlice'
import { app } from 'src/redux/reducers/App'
import browser from 'src/redux/reducers/Browser'
import componentStacks from 'src/redux/reducers/ComponentStacks'
import analyticsSlice from 'src/redux/reducers/analyticsSlice'

export const createReduxStore = () => {
  // 1. Create epic middleware
  const epicMiddleWare = createEpicMiddleware({
    dependencies: { connectAPI },
  })

  // 2. Configure store with reducers and middleware
  const store = configureStore({
    reducer: {
      analytics: analyticsSlice,
      app,
      browser,
      componentStacks,
      config: configSlice,
      connect,
      experiments,
      initializedClientConfig,
      profiles: profilesSlice,
      userFeatures: userFeaturesSlice,
    },
    middleware: (getDefaultMiddleware) => {
      // 3. Add epic middlware created above
      const middleware = getDefaultMiddleware().concat(epicMiddleWare)

      return middleware
    },
  })

  // 4. Call run after configureStore
  epicMiddleWare.run(rootEpic)

  return store
}

export default createReduxStore()
