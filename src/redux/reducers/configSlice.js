import { createSelector, createSlice } from '@reduxjs/toolkit'
import { ActionTypes as ConnectActionTypes } from 'src/redux/actions/Connect'
import { AGG_MODE, REFERRAL_SOURCES } from 'src/const/Connect'
const initialState = {
  is_mobile_webview: false,
  target_origin_referrer: null,
  ui_message_protocol: 'post_message',
  ui_message_version: 1,
  ui_message_webview_url_scheme: 'mx',
  color_scheme: 'light',
  mode: AGG_MODE,
  current_institution_code: null,
  current_institution_guid: null,
  current_member_guid: null,
  current_microdeposit_guid: null,
  enable_app2app: true,
  disable_background_agg: null,
  disable_institution_search: false,
  include_identity: null,
  include_transactions: null,
  oauth_referral_source: REFERRAL_SOURCES.BROWSER,
  update_credentials: false,
  wait_for_full_aggregation: false,
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(ConnectActionTypes.LOAD_CONNECT, (state, action) => {
      return { ...state, ...action.payload }
    })
  },
})

// Selectors

export const selectConfig = createSelector(
  (state) => state.config,
  (config) => config,
)

export const selectUIConfig = createSelector(selectConfig, (config) => ({
  is_mobile_webview: config.is_mobile_webview,
  target_origin_referrer: config.target_origin_referrer,
  ui_message_protocol: config.ui_message_protocol,
  ui_message_version: config.ui_message_version,
  ui_message_webview_url_scheme: config.ui_message_webview_url_scheme,
}))

export const selectConnectConfig = createSelector(selectConfig, (config) => ({
  mode: config.mode,
  current_institution_code: config.current_institution_code,
  current_institution_guid: config.current_institution_guid,
  current_member_guid: config.current_member_guid,
  current_microdeposit_guid: config.current_microdeposit_guid,
  enable_app2app: config.enable_app2app,
  disable_background_agg: config.disable_background_agg,
  disable_institution_search: config.disable_institution_search,
  include_identity: config.include_identity,
  include_transactions: config.include_transactions,
  oauth_referral_source: config.oauth_referral_source,
  update_credentials: config.update_credentials,
  wait_for_full_aggregation: config.wait_for_full_aggregation,
}))

export const selectColorScheme = createSelector(selectConfig, (config) => config.color_scheme)
// export const selectMode = createSelector(selectConfig, (config) => config.mode)

export default configSlice.reducer
