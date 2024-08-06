import { createSlice } from '@reduxjs/toolkit'
import { ActionTypes as ConnectActionTypes } from 'reduxify/actions/Connect'
import { ActionTypes as ConnectionsActionTypes } from 'reduxify/actions/Connections'

const initialState = {
  // this is app level config we keep them here to avoid passing
  // them around to each and every epic/action/component that may need it
  appConfig: {},
  // this is Connect specific config we keep them here to avoid passing
  // them around to each and every epic/action/component that may need it
  connectConfig: {},
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(ConnectActionTypes.LOAD_CONNECT, (state, action) => {
        const { connect: connectConfig, ...appConfig } = action.payload
        state.appConfig = appConfig
        state.connectConfig = connectConfig
      })
      .addCase(ConnectionsActionTypes.LOAD_CONNECTIONS, (state, action) => {
        const { connect: connectConfig, ...appConfig } = action.payload
        state.appConfig = appConfig
        state.connectConfig = connectConfig
      })
  },
})

// Selectors
export const selectAppConfig = state => state.config.appConfig
export const selectColorScheme = state => state.config.appConfig.color_scheme
export const selectUIMessageVersion = state => state.config.appConfig.ui_message_version
export const selectIsMobileWebView = state => state.config.appConfig.is_mobile_webview
export const selectConnectConfig = state => state.config.connectConfig
export const selectConnectMode = state => state.config.connectConfig.mode

export default configSlice.reducer
