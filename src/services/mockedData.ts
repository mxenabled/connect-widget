import { AGG_MODE } from 'src/const/Connect'
import { defaultState as connectDefaultState } from 'src/redux/reducers/Connect'

export const masterData = {
  client: {
    guid: 'CLT-123',
    default_institution_guid: 'INS-123',
    external_guid: 'client-external-guid',
    has_atrium_api: false,
    has_limited_institutions: false,
    name: 'Test Bank',
    oauth_app_name: 'Test Bank One',
    urls: null,
  },
  clientColorScheme: {
    primary_100: '',
    primary_200: '',
    primary_300: '',
    primary_400: '',
    primary_500: '',
    primary_color: '',
    secondary_color: '',
    widget_brand_color: '',
  },
  clientProfile: {
    account_verification_is_enabled: true,
    client_guid: 'CLT-123',
    custom_copy_namespace: null,
    institution_display_name: '',
    is_microdeposits_enabled: true,
    locale: 'en',
    privacy_policy_url: null,
    show_external_link_popup: true,
    tax_statement_is_enabled: true,
    uses_custom_popular_institution_list: false,
    uses_mobile_sign_on_tokens: true,
    uses_oauth: true,
    default_institution_guid: 'INS-123',
  },
  user: {
    guid: 'USR-123',
    birthday: 631152000,
    client_guid: 'CLT-123',
    credit_score: 720,
    email: 'first.last@mx.com',
    email_is_verified: true,
    external_guid: 'first-last',
    first_name: 'First',
    has_accepted_terms: true,
    has_password: true,
    has_updated_terms_and_conditions: false,
    health_score: null,
    last_name: 'Last',
    metadata: null,
    phone: null,
    phone_is_verified: false,
    postal_code: '',
    sex: null,
    uses_single_sign_on: false,
    created_at: 1565207629,
  },
  userProfile: {
    guid: 'USP-123',
    too_small_modal_dismissed_at: '2024-03-06T19:12:46+00:00',
    user_guid: 'USR-123',
  },
  widgetProfile: {
    client_guid: 'CLT-123',
    display_delete_option_in_connect: true,
    display_disclosure_in_connect: false,
    display_full_external_account_number: true,
    display_terms_and_conditions: false,
    enable_manual_accounts: true,
    enable_mark_account_closed_for_held_accounts: true,
    enable_mark_account_duplicate_for_held_accounts: true,
    enable_support_requests: true,
    widgets_display_name: null,
    show_mx_branding: true,
  },
}

export const clientConfig = {
  connect: {
    is_mobile_webview: false,
    ui_message_protocol: 'post_message',
    ui_message_version: 4,
    ui_message_webview_url_scheme: 'mx',
    target_origin_referrer: null,
    mode: AGG_MODE,
    update_credentials: false,
    // include_identity: false,
  },
  color_scheme: 'light',
}

export const initialState = {
  config: {
    appConfig: {
      is_mobile_webview: false,
      target_origin_referrer: null,
      ui_message_protocol: 'post_message',
      ui_message_version: 4,
      ui_message_webview_url_scheme: 'mx',
      color_scheme: 'light',
    },
    connectConfig: {
      mode: 'aggregation',
      current_institution_code: null,
      current_institution_guid: null,
      current_member_guid: null,
      current_microdeposit_guid: null,
      enable_app2app: true,
      disable_background_agg: null,
      disable_institution_search: false,
      include_identity: null,
      include_transactions: null,
      oauth_referral_source: 'BROWSER',
      update_credentials: false,
      wait_for_full_aggregation: false,
    },
  },
  connect: connectDefaultState,
  profiles: { ...masterData },
  userFeatures: { items: [] },
}

export const member = {
  member: {
    aggregation_status: 0,
    connection_status: 0,
    guid: 'MBR-123',
    institution_guid: 'INS-123',
    institution_name: null,
    institution_url: 'test.com',
    instructional_data: {
      title: null,
      description: 'Please do all these things',
      steps: ['test1', 'test2'],
    },
    is_being_aggregated: true,
    is_manual: false,
    is_managed_by_user: true,
    is_oauth: false,
    last_job_guid: 'JOB-123',
    mfa: {},
    most_recent_job_detail_code: null,
    most_recent_job_guid: 'JOB-123',
    needs_updated_credentials: false,
    name: 'test',
    user_guid: 'USR-134',
    oauth_window_uri: null,
    verification_is_enabled: true,
    tax_statement_is_enabled: false,
    successfully_aggregated_at: null,
  },
}

export const institutionCredentialsData = {
  credentials: [
    {
      display_order: 1,
      field_name: 'LOGIN',
      field_type: 3,
      guid: 'CRD-123',
      label: 'Username',
      meta_data: null,
      optional: false,
      options: null,
    },
    {
      display_order: 2,
      field_name: 'PASSWORD',
      field_type: 1,
      guid: 'CRD-345',
      label: 'Password',
      meta_data: null,
      optional: false,
      options: null,
    },
  ],
}

export const institutionData = {
  institution: {
    guid: 'INS-123',
    name: 'Test Bank',
    instructional_data: {
      title: null as string | null,
      description: null as string | null,
      steps: [] as string[],
    },
    url: 'test.com',
    trouble_signing_credential_recovery_url: null as string | null,
    credentials: [
      {
        credential: {
          display_order: 1,
          field_name: 'LOGIN',
          field_type: 3,
          guid: 'CRD-123',
          label: 'Username',
          meta_data: null,
          optional: false,
          options: null,
        },
      },
      {
        credential: {
          display_order: 2,
          field_name: 'PASSWORD',
          field_type: 1,
          guid: 'CRD-345',
          label: 'Password',
          meta_data: null,
          optional: false,
          options: null,
        },
      },
    ],
  },
}
export const MFA_MEMBER = {
  connection_status: 3,
  guid: 'MBR-123',
  institution_guid: 'INS-123',
  instructional_data: {},
  is_being_aggregated: true,
  is_manual: false,
  is_managed_by_user: true,
  is_oauth: false,
  metadata: null,
  mfa: {
    credentials: [
      {
        guid: 'CRD-123',
        institution_guid: 'INS-123',
        external_id: 'UNIQUE_ID_FOR_THIS_CHALLENGE-123',
        label: 'What city were you born in?',
        field_type: 0,
        mfa: true,
        status_code: 200,
        options: [],
      },
    ],
  },
  name: 'Gringotts',
  user_guid: 'USR-123',
  verification_is_enabled: true,
}
export const NEW_MEMBER = {
  aggregation_status: null,
  background_aggregation_is_disabled: false,
  connection_status: 6,
  guid: 'MBR-123',
  institution_guid: 'INS-123',
  institution_name: null,
  instructional_data: null,
  is_being_aggregated: false,
  is_manual: false,
  is_managed_by_user: true,
  is_oauth: true,
  last_job_guid: null,
  last_job_status: null,
  last_update_time: null,
  mfa: {},
  most_recent_job_detail_code: null,
  most_recent_job_guid: null,
  needs_updated_credentials: false,
  name: 'MX Bank',
  process_status: null,
  user_guid: 'USR-123',
  oauth_window_uri: 'https://bank.mx.com/v1/oauth/authorize',
  verification_is_enabled: true,
  tax_statement_is_enabled: true,
  successfully_aggregated_at: null,
}
export const memberCredentialsData = {
  credentials: [
    {
      display_order: 1,
      field_name: 'LOGIN',
      field_type: 3,
      guid: 'CRD-123',
      label: 'Username',
      meta_data: null,
      optional: false,
      options: null,
    },
    {
      display_order: 2,
      field_name: 'PASSWORD',
      field_type: 1,
      guid: 'CRD-345',
      label: 'Password',
      meta_data: null,
      optional: false,
      options: null,
    },
  ],
}
export const CONNECTED_MEMBERS = [
  {
    connection_status: 6,
    guid: 'MBR-123',
    institution_guid: 'INS-123',
    instructional_data: {},
    is_being_aggregated: false,
    is_manual: false,
    is_managed_by_user: true,
    is_oauth: false,
    metadata: null,
    mfa: {},
    name: 'Gringotts',
    user_guid: 'USR-123',
    verification_is_enabled: true,
  },
]

export const JOB_DATA = { guid: 'JOB-123', job_type: 0, status: 6, finished_at: 1682356863 }
export const ACCOUNT_DATA = {
  account_number: '123456',
  account_subtype: 0,
  account_type: 4,
  available_balance: 2723.53,
  balance: 276.47,
  balance_updated_at: 1685652016,
  credit_limit: 3000.0,
  external_guid: '858194',
  feed_account_type: 4,
  feed_name: 'Visa Platinum Credit',
  feed_nickname: null,
  feed_original_balance: null,
  flags: 0,
  guid: 'ACT-123',
  institution_guid: 'INS-123',
  is_closed: false,
  is_deleted: false,
  is_hidden: false,
  is_manual: false,
  member_guid: 'MBR-123',
  member_is_managed_by_user: true,
  name: 'Visa Platinum Credit',
  user_guid: 'USR-123',
  user_name: 'Visa Platinum Credit',
}
export const MICRODEPOSIT = {
  account_name: 'Checking',
  account_number: '****1234',
  account_type: '1',
  can_auto_verify: 'false',
  deposit_expected_at: '2023-04-13T09:00:00+00:00',
  email: 'first.last@mx.com',
  first_name: 'First',
  guid: 'MIC-123',
  last_name: 'Last',
  routing_number: '123456789',
  status: 0,
  status_name: 'INITIATED',
  updated_at: '1681150156',
  user_guid: 'USR-123',
}
export const OAUTH_STATE = {
  oauth_state: {
    guid: 'OAS-123',
    auth_status: 2,
    error_reason: null,
    inbound_member_guid: 'MBR-123',
    outbound_member_guid: null,
    user_guid: 'USR-123',
  },
}
export const ANALYTICS_SESSION = {
  guid: 'ANS-123',
  is_first_visit: false,
  browser_name: 'Safari',
  browser_version: '13.0.3',
  product_name: 'Connect',
  product_version: '1.0.0',
  started_at: Date.now(),
  ended_at: 0,
}
export const USER_DATA = {
  guid: 'USR-123',
  birthday: 395625600,
  client_guid: 'CLT-123',
  credit_score: 760,
  email: 'first.last@mx.com',
  email_is_verified: false,
  external_guid: 'name',
  first_name: 'First',
  has_accepted_terms: false,
  has_password: true,
  has_updated_terms_and_conditions: false,
  health_score: 32,
  last_name: 'Last',
  metadata: null,
  phone: null,
  phone_is_verified: false,
  postal_code: null,
  sex: null,
  uses_single_sign_on: false,
  created_at: 1661194428,
}

export const FAVORITE_INSTITUTIONS = [
  {
    account_verification_is_enabled: true,
    account_identification_is_enabled: true,
    code: 'gringotts',
    guid: 'INS-123',
    login_url: null,
    name: 'Gringotts',
    popularity: 43985,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'https://gringotts.sand.internal.mx',
  },
  {
    account_verification_is_enabled: false,
    account_identification_is_enabled: true,
    code: '77277',
    guid: 'INS-345',
    login_url: 'https://www.americanexpress.com/en-us/account/login/',
    name: 'American Express Credit Card',
    popularity: 20,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'www.americanexpress.com',
  },
  {
    account_verification_is_enabled: false,
    account_identification_is_enabled: false,
    code: '78033',
    guid: 'INS-567',
    login_url: null,
    name: 'Discover Credit Card',
    popularity: 9,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'http://www.discovercard.com',
  },
  {
    account_verification_is_enabled: true,
    account_identification_is_enabled: true,
    code: '1d303f53-a9c2-4819-9469-9320b561280b',
    guid: 'INS-789',
    login_url: null,
    name: 'Capital One',
    popularity: 9,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'https://www.capitalone.com',
  },
]

export const SEARCHED_INSTITUTIONS = [
  {
    account_verification_is_enabled: true,
    account_identification_is_enabled: true,
    code: 'gringotts',
    guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
    login_url: null,
    name: 'Gringotts',
    popularity: 43984,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'https://gringotts.sand.internal.mx',
  },
  {
    account_verification_is_enabled: true,
    account_identification_is_enabled: false,
    code: '043ff29f-ff1b-43ac-936f-27d26403c6aa',
    guid: 'INS-39fc8bea-4568-40ce-95d5-c2ea33a86398',
    login_url: null,
    name: 'MX Bank',
    popularity: 3,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'www.brian.search.test',
  },
  {
    account_verification_is_enabled: false,
    account_identification_is_enabled: false,
    code: '11166c24-99c4-4552-a6a2-4a4706abf9b0',
    guid: 'INS-c706ddb2-dfee-4575-a1ce-df2f907ab4af',
    login_url: 'https://mx.com',
    name: 'Gringotts Oauth/MDX V50',
    popularity: 1,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'https://gringotts.sand.internal.mx/',
  },
  {
    account_verification_is_enabled: true,
    account_identification_is_enabled: false,
    code: '4a32a8d9-44e8-4302-a1a5-e37c109eead4',
    guid: 'INS-f8968535-d8e1-45e9-8d0e-80bdcaaeb0fd',
    login_url: null,
    name: 'Gringotts TEST(Clone)',
    popularity: 0,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'www.brian.search.test',
  },
  {
    account_verification_is_enabled: true,
    account_identification_is_enabled: false,
    code: '83ee1118-4ae9-4140-a501-8b74c2f60cbe',
    guid: 'INS-83914605-0efa-45e5-b1f2-b5a9a0afa909',
    login_url: null,
    name: 'Grinnell State Bank',
    popularity: 0,
    supports_oauth: false,
    tax_statement_is_enabled: false,
    url: 'www.brian.search.test',
  },
]

export const GLOBAL_NAVIGATION_FEATURE_ENABLED = {
  guid: 'FTR-aafd7fff-904b-48ff-b15e-e1e1112466cb',
  feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
  is_enabled: true,
}
export const GLOBAL_NAVIGATION_FEATURE_DISABLED = {
  guid: 'FTR-aafd7fff-904b-48ff-b15e-e1e1112466cb',
  feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
  is_enabled: true,
}
