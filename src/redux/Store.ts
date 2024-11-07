import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { connect } from 'src/redux/reducers/Connect'
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
  profiles: profilesSlice,
  userFeatures: userFeaturesSlice,
})

export const createReduxStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  })
  return store
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof createReduxStore>
export type AppDispatch = AppStore['dispatch']

export default createReduxStore()
