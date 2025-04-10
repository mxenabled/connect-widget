import { RootState } from 'src/redux/Store'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ActionTypes as ConnectActionTypes } from 'src/redux/actions/Connect'
import { AGG_MODE, REFERRAL_SOURCES, VERIFY_MODE, REWARD_MODE } from 'src/const/Connect'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

const initialState: ClientConfigType = {
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
  iso_country_code: null,
  oauth_referral_source: REFERRAL_SOURCES.BROWSER,
  update_credentials: false,
  wait_for_full_aggregation: false,
  data_request: null,
  use_cases: null,
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      ConnectActionTypes.LOAD_CONNECT,
      (state, action: PayloadAction<ClientConfigType>) => {
        const productDetermineMode = getProductDeterminedMode(action.payload)
        // This ensures the ui_message_version is an integer, in case it was passed as a string.
        const ui_message_version =
          typeof action.payload.ui_message_version === 'string'
            ? parseInt(action.payload.ui_message_version, 10)
            : action.payload.ui_message_version || state.ui_message_version

        return {
          ...state,
          ...action.payload,
          ui_message_version,
          mode:
            productDetermineMode !== null
              ? productDetermineMode
              : action.payload.mode || state.mode,
        }
      },
    )
  },
})

// Selectors

export const selectConfig = (state: RootState) => state.config

export const selectIsMobileWebView = (state: RootState) => state.config.is_mobile_webview

export const selectUIMessageVersion = (state: RootState) => state.config.ui_message_version

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
  iso_country_code: config.iso_country_code,
  oauth_referral_source: config.oauth_referral_source,
  update_credentials: config.update_credentials,
  wait_for_full_aggregation: config.wait_for_full_aggregation,
  data_request: config.data_request,
  use_cases: config.use_cases,
}))

export const selectColorScheme = (state: RootState) => state.config.color_scheme

// Helpers
const getProductDeterminedMode = (config: {
  data_request?: { products?: string[] | null } | null
}) => {
  const products = config?.data_request?.products

  if (Array.isArray(products)) {
    // Connect assumes the mode is mutually exclusive for verification, reward, and tax (unsupported tax mode).
    // TAX is an unsupported mode currently, so there's no way to start tax mode based on products.
    // Until combojobs are completely in use, we need to set an exclusive mode for the correct job to run.
    // The assumption is verification and reward will not be passed at the same time (yet).
    if (products.includes(COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER)) {
      return VERIFY_MODE
    } else if (products.includes(COMBO_JOB_DATA_TYPES.REWARDS)) {
      return REWARD_MODE
    } else {
      return AGG_MODE
    }
  } else {
    return null
  }
}

export default configSlice.reducer
