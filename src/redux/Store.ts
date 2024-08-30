import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { createEpicMiddleware } from 'redux-observable'

import connectAPI from 'src/services/api'

import { rootEpic } from 'src/redux/epics'
import { connect } from 'src/redux/reducers/Connect'
import { experiments } from 'src/redux/reducers/Experiments'
import configSlice from 'src/redux/reducers/configSlice'
import profilesSlice from 'src/redux/reducers/profilesSlice'
import userFeaturesSlice from 'src/redux/reducers/userFeaturesSlice'
import { app } from 'src/redux/reducers/App'
import browser from 'src/redux/reducers/Browser'
import analyticsSlice from 'src/redux/reducers/analyticsSlice'

const rootReducer = combineReducers({
  analytics: analyticsSlice,
  app,
  browser,
  config: configSlice,
  connect,
  experiments,
  profiles: profilesSlice,
  userFeatures: userFeaturesSlice,
})

export const createReduxStore = (preloadedState?: Partial<RootState>) => {
  // 1. Create epic middleware
  const epicMiddleWare = createEpicMiddleware({
    dependencies: { connectAPI, scheduler: undefined },
  })

  // 2. Configure store with reducers and middleware
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
      // 3. Add epic middlware created above
      const middleware = getDefaultMiddleware().concat(epicMiddleWare)

      return middleware
    },
    preloadedState,
  })

  // 4. Call run after configureStore
  epicMiddleWare.run(rootEpic)

  return store
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof createReduxStore>
export type AppDispatch = AppStore['dispatch']

export default createReduxStore()
