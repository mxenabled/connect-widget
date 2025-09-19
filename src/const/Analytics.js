/**
 * AnalyticEvents for Custom PostHog Events
 *
 * The util that sends these events will prefix all events with `connect_`.
 *
 * connect_<location_in_connect>_<verb>_<optional-further-context>
 * For reference, the expected naming convention for the full name is the following.
 *
 * Events should be unique and not re-used. This helps with data/funnels.
 */
export const AnalyticEvents = {
  CREATE_CREDENTIALS_CLICKED_FORGOT_PASSWORD: 'create_credentials_clicked_forgot_password',
  CREATE_CREDENTIALS_CLICKED_FORGOT_USERNAME: 'create_credentials_clicked_forgot_username',
  CREATE_CREDENTIALS_CLICKED_TROUBLE_SIGNING_IN: 'create_credentials_clicked_trouble_signing_in',
  CREDENTIALS_CLICKED_GET_HELP: 'credentials_clicked_get_help',
  ENTERED_LOGIN: 'entered_login',
  ENTERED_PASSWORD: 'entered_password',
  INITIAL_DATA_READY: 'initial_data_ready',
  LOGIN_ERROR_CLICKED_GET_HELP: 'login_error_clicked_get_help',
  MFA_CLICKED_GET_HELP: 'mfa_clicked_get_help',
  MFA_ENTERED_INPUT: 'mfa_entered_input',
  MFA_SUBMITTED_INPUT: 'mfa_submitted_input',
  MFA_SELECTED_IMAGE: 'mfa_selected_image',
  MFA_SUBMITTED_IMAGE: 'mfa_submitted_image',
  MFA_SELECTED_OPTION: 'mfa_selected_option',
  MFA_SUBMITTED_OPTION: 'mfa_submitted_option',
  NO_ELIGIBLE_ACCOUNTS_RETRY: 'no_eligible_accounts_retry',
  OAUTH_PENDING_MEMBER_CREATED: 'oauth_pending_member_created',
  OAUTH_DEFAULT_CANCEL: 'oauth_default_cancel',
  OAUTH_DEFAULT_GO_TO_INSTITUTION: 'oauth_default_go_to_institution',
  SEARCH_QUERY: 'search_query',
  SELECT_POPULAR_INSTITUTION: 'select_popular_institution',
  SELECT_SEARCHED_INSTITUTION: 'select_searched_institution',
  SUBMITTED_CREDENTIALS: 'submitted_credentials',
  UPDATE_CREDENTIALS_CLICKED_FORGOT_PASSWORD: 'update_credentials_clicked_forgot_password',
  UPDATE_CREDENTIALS_CLICKED_FORGOT_USERNAME: 'update_credentials_clicked_forgot_username',
  UPDATE_CREDENTIALS_CLICKED_TROUBLE_SIGNING_IN: 'update_credentials_clicked_trouble_signing_in',
  WAITING_FOR_OAUTH_CANCEL: 'waiting_for_oauth_cancel',
  WAITING_FOR_OAUTH_TRYAGAIN: 'waiting_for_oauth_tryagain',
  WIDGET_LOAD: 'widget_load',
}

export const defaultEventMetadata = {
  widgetType: 'isolated',
}

/**
 * PagviewInfo for Analytics
 * Format: [ Name(STRING), Path(STRING) ]
 * Example: ['Connect Disclosure', '/disclosure']
 */
export const PageviewInfo = {
  CONNECT: ['Connect', '/connect'],
  CONNECT_ACTIONABLE_ERROR: ['Connect Actionable Error', '/actionable_error'],
  CONNECT_CONNECTED: ['Connect Successful', '/connected'],
  CONNECT_CONNECTING: ['Connect Connecting', '/connecting'],
  CONNECT_CREATE_CREDENTIALS: [
    'Connect Create Credentials',
    '/credentials/create_credentials_form',
  ],
  CONNECT_DELETE_MEMBER_SUCCESS: ['Connect Delete Member Success', '/delete_member/success'],
  CONNECT_DELETE_MEMBER_SURVEY: ['Connect Delete Member Survey', '/delete_member/survey'],
  CONNECT_DISCLOSURE: ['Connect Disclosure', '/disclosure'],
  CONNECT_DISCLOSURE_DATA_AVAILABLE: ['Connect Disclosure Data Available', '/data_available'],
  CONNECT_DISCLOSURE_DATA_REQUESTED: ['Connect Disclosure Data Requested', '/data_requested'],
  CONNECT_DISCLOSURE_PRIVACY_POLICY: ['Connect Disclosure Privacy Policy', '/privacy_policy'],
  CONNECT_DYNAMIC_DISCLOSURE: ['Connect Dynamic Disclosure', '/dynamic_disclosure'],
  CONNECT_GENERIC_ERROR: ['Connect Generic Error', '/generic_error'],
  CONNECT_IE_11_DEPRECATION: ['Connect IE 11 Deprecation', '/ie_11_deprecation'],
  CONNECT_INSTITUTION_DISABLED: ['Connect Institution Disabled', '/institution_disabled'],
  CONNECT_LOGIN_ERROR: ['Connect Login Error', '/login_error'],
  CONNECT_MANUAL_ACCOUNT: ['Manual Account Connect', '/manual_account_connect'],
  CONNECT_MANUAL_ACCOUNT_FORM: ['Connect Manual Account Form', '/manual_account_form'],
  CONNECT_MANUAL_ACCOUNT_SUCCESS: ['Connect Manual Account Success', '/manual_account_success'],
  CONNECT_MFA_DEFAULT: ['Connect MFA Default', '/mfa_default'],
  CONNECT_MFA_IMAGE_OPTIONS: ['Connect MFA Image Options', '/mfa_image_options'],
  CONNECT_MFA_OPTIONS: ['Connect MFA Options', '/mfa_options'],
  CONNECT_MFA_SINGLE_ACCOUNT_SELECT: [
    'Connect MFA Single Account Select',
    '/single_account_select',
  ],
  CONNECT_MICRODEPOSITS: ['Connect Microdeposits', '/microdeposits'],
  CONNECT_MICRODEPOSITS_ACCOUNT_INFO: ['Connect Microdeposits Account Info', '/account_info'],
  CONNECT_MICRODEPOSITS_COME_BACK: ['Connect Microdeposists Come Back', '/come_back'],
  CONNECT_MICRODEPOSITS_CONFIRM_DETAILS: [
    'Connect Microdeposits Confirm Details',
    '/confirm_details',
  ],
  CONNECT_MICRODEPOSITS_HOW_IT_WORKS: ['Connect Microdeposits How It Works', '/how_it_works'],
  CONNECT_MICRODEPOSITS_MICRODEPOSIT_ERRORS: [
    'Connect Microdepoits Microdeposit Errors',
    '/microdeposit_errors',
  ],
  CONNECT_MICRODEPOSITS_PERSONAL_INFO_FORM: [
    'Connect Microdeposits Personal Info Form',
    '/personal_info_form',
  ],
  CONNECT_MICRODEPOSITS_ROUTING_NUMBER: ['Connect Microdeposits Routing Number', '/routing_number'],
  CONNECT_MICRODEPOSITS_VERIFIED: ['Connect Microdeposits Verified', '/verified'],
  CONNECT_MICRODEPOSITS_VERIFYING: ['Connect Microdeposits Verifying', '/verifying'],
  CONNECT_MICRODEPOSITS_VERIFY_DEPOSITS: [
    'Connect Microdeposits Verify Deposits',
    '/verify_deposits',
  ],
  CONNECT_NOT_FOUND_ERROR: ['Connect Not Found Error', '/not_found_error'],
  CONNECT_OAUTH_INSTRUCTIONS: [
    'Connect Oauth Step Instructions',
    '/credentials/oauth_step/instructions',
  ],
  CONNECT_OAUTH_WAITING: ['Connect Oauth Step Waiting', '/credentials/oauth_step/waiting'],
  CONNECT_OAUTH_ERROR: ['Connect Oauth Error', '/oauth_error'],
  CONNECT_NO_ELIGIBLE_ACCOUNTS: ['Connect No Eligible Accounts', '/no_eligible_accounts'],
  CONNECT_SEARCH: ['Connect Search', '/search'],
  CONNECT_SEARCH_FAILED: ['Connect Search Failed', '/search_failed'],
  CONNECT_SEARCH_NO_RESULTS: ['Connect Search No Results', '/no_results'],
  CONNECT_SEARCH_POPULAR: ['Connect Search Popular', '/popular'],
  CONNECT_SEARCHED: ['Connect Searched', '/searched'],
  CONNECT_SHARED_ROUTING_NUMBER: ['Connect Shared Routing Number', '/shared_routing_number'],
  CONNECT_SUPPORT_MENU: ['Connect Support Menu', '/support/support_menu'],
  CONNECT_SUPPORT_REQUEST_INSTITUTION: [
    'Connect Support Request Institution',
    '/support/request_institution',
  ],
  CONNECT_SUPPORT_GENERAL: ['Connect Support General', '/support/support_general'],
  CONNECT_SUPPORT_SUCCESS: ['Connect Support Success', '/support/support_success'],
  CONNECT_UPDATE_CREDENTIALS: [
    'Connect Update Credentials',
    '/credentials/update_credentials_form',
  ],
  CONNECT_UNSUPPORTED_RESOLUTION: ['Connect Unsupported Resolution', '/unsupported_resolution'],
  CONNECT_VERIFY_EXISTING_MEMBER: ['Connect Verify Existing Member', '/verify_existing_member'],
}

export const AuthenticationMethods = {
  OAUTH: 'OAuth',
  NON_OAUTH: 'Non-OAuth',
}
