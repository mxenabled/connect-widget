import _merge from 'lodash/merge'
import _cloneDeep from 'lodash/cloneDeep'

import { createReducer } from 'utils/Reducer'
import { ActionTypes as ClientActionTypes } from 'reduxify/actions/Client'
import { AGG_MODE, REFERRAL_SOURCES, REWARD_MODE, VERIFY_MODE } from 'src/connect/const/Connect'
import { COMBO_JOB_DATA_TYPES } from 'src/connect/const/comboJobDataTypes'

const { INITIALIZED_CLIENT_CONFIG } = ClientActionTypes

// Initialize Config Reducer
export const defaultClientConfig = {
  is_mobile_webview: false,
  target_origin_referrer: null,
  ui_message_protocol: 'post_message',
  ui_message_version: 1,
  ui_message_webview_url_scheme: 'mx',
  color_scheme: 'light',
  connect: {
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
  },
}

/**
 * Initialize the client configuration
 */
const initializeConfig = (state, action) => {
  // `is_mobile_webview`, 'target_origin_referrer', and ui message configs are tricky config options with
  // a lot of past baggage. They can come from the top level object, but also
  // under a `master` and `connect` key, so we have to check all 3 to really
  // determine what their values are
  const clientConfig = _cloneDeep(action.payload)
  const masterConfig = clientConfig?.master || {}
  const connectConfig = clientConfig?.connect || {}
  const isMobileWebView = clientConfig?.is_mobile_webview || false

  const is_mobile_webview =
    isMobileWebView || connectConfig.is_mobile_webview || masterConfig.is_mobile_webview

  const ui_message_version = parseInt(
    connectConfig.ui_message_version ||
      masterConfig.ui_message_version ||
      defaultClientConfig.ui_message_version,
    10,
  )

  const ui_message_protocol =
    connectConfig.ui_message_protocol ||
    masterConfig.ui_message_protocol ||
    defaultClientConfig.ui_message_protocol

  const ui_message_webview_url_scheme =
    connectConfig.ui_message_webview_url_scheme ||
    masterConfig.ui_message_webview_url_scheme ||
    defaultClientConfig.ui_message_webview_url_scheme

  const target_origin_referrer =
    connectConfig.target_origin_referrer ||
    masterConfig.target_origin_referrer ||
    defaultClientConfig.target_origin_referrer

  const color_scheme =
    connectConfig.color_scheme || masterConfig.color_scheme || defaultClientConfig.color_scheme

  // if we are in a mobile webview, we are going to normalize that at the top
  // level of the config and remove them from under the master and connect keys
  // to isolate the obscurity in one place (here)
  delete connectConfig.is_mobile_webview
  delete masterConfig.is_mobile_webview

  delete connectConfig.ui_message_version
  delete masterConfig.ui_message_version

  delete connectConfig.ui_message_protocol
  delete masterConfig.ui_message_protocol

  delete connectConfig.ui_message_webview_url_scheme
  delete masterConfig.ui_message_webview_url_scheme

  delete connectConfig.color_scheme
  delete masterConfig.color_scheme

  delete connectConfig.target_origin_referrer
  delete masterConfig.target_origin_referrer

  let productDeterminedMode = null
  const products = connectConfig?.data_request?.products
  if (Array.isArray(products)) {
    // Connect assumes the mode is mutually exclusive for verification, reward, and tax (unsupported tax mode).
    // TAX is an unsupported mode currently, so there's no way to start tax mode based on products.
    // Until combojobs are completely in use, we need to set an exclusive mode for the correct job to run.
    // The assumption is verification and reward will not be passed at the same time (yet).
    if (products.includes(COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER)) {
      productDeterminedMode = VERIFY_MODE
    } else if (products.includes(COMBO_JOB_DATA_TYPES.REWARDS)) {
      productDeterminedMode = REWARD_MODE
    } else {
      productDeterminedMode = AGG_MODE
    }
  }

  return _merge(
    {},
    state,
    {
      is_mobile_webview,
      target_origin_referrer,
      ui_message_version,
      ui_message_protocol,
      ui_message_webview_url_scheme,
      color_scheme,
    },
    clientConfig,
    productDeterminedMode !== null
      ? {
          connect: {
            mode: productDeterminedMode,
          },
        }
      : {},
  )
}

export const initializedClientConfig = createReducer(defaultClientConfig, {
  [INITIALIZED_CLIENT_CONFIG]: initializeConfig,
})
