// Account types
type AccountCreateType = {
  account_type: number
  balance: string
  credit_limit?: string | null
  day_payment_is_due?: string | null
  interest_rate?: string | null
  is_personal: boolean
  minimum_payment?: string | null
  user_name: string
  guid: string
}
type AccountResponseType = {
  account_number?: string | null
  account_subtype?: number | null
  account_type: number
  apr?: number | null
  apy?: number | null
  available_balance?: number | null
  balance: number
  balance_updated_at: string
  cash_balance?: number | null
  credit_limit?: number | null
  currency_code?: string | null
  day_payment_is_due?: number | null
  display_order?: number | null
  external_guid?: string | null
  feed_account_type?: number | null
  feed_apr?: number | null
  feed_apy?: number | null
  feed_credit_limit?: number | null
  feed_day_payment_is_due?: number | null
  feed_interest_rate?: number | null
  feed_is_closed?: boolean | null
  feed_localized_name?: string | null
  feed_name?: string | null
  feed_nickname?: string | null
  feed_original_balance?: number | null
  flags: number
  guid: string
  institution_guid: string
  interest_rate?: number | null
  interest_rate_set_by?: string | null
  is_closed: boolean
  is_deleted: boolean
  is_excluded_from_accounts: boolean
  is_excluded_form_budgets: boolean
  is_excluded_from_cash_flow: boolean
  is_excluded_from_debts: boolean
  is_excluded_from_goals: boolean
  is_excluded_from_investments: boolean
  is_excluded_from_net_worth: boolean
  is_excluded_from_spending: boolean
  is_excluded_from_transactions: boolean
  is_excluded_from_trends: boolean
  is_hidden: boolean
  is_manual: boolean
  is_personal: boolean
  localized_name?: string | null
  member_guid: string
  member_is_managed_by_user: boolean
  metadata?: object | null
  minimum_payment?: number | null
  name: string
  nickname?: string | null
  original_balance?: string | null
  payment_due_at?: number | null
  pending_balance?: number | null
  property_type?: number | null
  revision: number
  updated_at: number
  user_guid: string
  user_name: string
}

// Member types
type MemberDeleteType = {
  guid: string
}

type MemberResponseType = {
  aggregation_status: number
  connection_status: number
  error?: {
    error_code: number
    error_message: string
    error_type: string
    locale: string
    user_message: string
  }
  guid: string
  institution_guid: string
  institution_name?: string | null
  institution_url: string
  instructional_data?: {
    title: string | null
    description: string
    steps: string[] | null
  }
  is_being_aggregated: boolean
  is_manual: boolean
  is_managed_by_user: boolean
  is_oauth: boolean
  last_job_guid?: string
  last_job_status?: number
  last_update_time?: string
  metadata?: { [key: string]: unknown }
  mfa?: MfaCredentialType | object
  most_recent_job_detail_code?: number | null
  most_recent_job_guid?: string
  needs_updated_credentials?: boolean
  name?: string
  process_status?: number
  revision?: number
  user_guid: string
  verification_is_enabled: boolean
  oauth_window_uri?: string | null
  verification_is_enabled?: boolean
  tax_statement_is_enabled?: boolean
  successfully_aggreagted_at?: number
}

// Institution types
type InstitutionResponseType = {
  account_verification_is_enabled: boolean
  account_identification_is_enabled: boolean
  brand_color_hex_code?: string | null
  code: string
  forgot_password_credential_recovery_url?: string | null
  forgot_username_credential_recovery_url?: string | null
  guid: string
  instructional_text?: string
  instructional_data?: {
    title: string | null
    description: string | null
    steps: string[] | null
  }
  is_disabled_by_client: boolean
  login_url: string | null
  name: string
  popularity?: number
  supports_oauth: boolean
  tax_statement_is_enabled: boolean
  trouble_signing_credential_recovery_url?: string | null
  url: string
  credentials?: { credential: CredentialResponseType }[]
}

// Microdeposit types
type MicrodepositCreateType = {
  account_name: string
  account_number: string
  account_type: number
  email: string
  first_name: string
  last_name: string
  routing_number: string
  user_guid: string
}
type MicrodepositUpdateType = {
  account_name: string
  account_number: string
  account_type: number
  user_guid: string
  email: string
  first_name: string
  last_name: string
}
type MicroDepositVerifyType = {
  deposit_amount_1: string
  deposit_amount_2: string
}
type MicrodepositResponseType = {
  account_name: string
  account_number: string
  account_type: number
  can_auto_verify: boolean
  deposit_expected_at?: string
  email: string
  first_name: string
  guid: string
  institution_guid?: string
  last_name: string
  member_guid?: string
  routing_number: string
  status: number
  status_name: string
  updated_at: string
  user_guid: string
}
type BlockedRoutingNumberType = {
  guid: string
  reason: number
  reason_name: string
}
//OAuth Types
type OAuthStateResponseType = {
  guid: string
  auth_status: number
  created_at?: string
  error_reason?: number | null
  first_retrieved_at?: string
  inbound_member_guid?: string
  outbound_member_guid?: string | null
  updated_at?: string
  user_guid: string
}
type OAuthWindowURIResponseType = {
  guid: string
  oauth_window_uri: string
}

//Credential Types

type CredentialResponseType = {
  display_order: number
  field_name: string
  field_type: number
  guid: string
  label: string
  meta_data: object | null
  optional: boolean
  options: object | null
}

type MfaCredentialType = {
  nullify?: null
  guid: string
  institution_guid: string
  label: string
  field_name?: string | null
  opt?: object | null
  type: number
  display_order?: number | null
  external_id: string
  data_source_guid?: string | null
  field_type: number
  optional?: boolean | null
  editable?: boolean | null
  mfa: boolean
  optional_mfa?: boolean | null
  aggregator_guid: string
  question_field_type?: number | null
  answer_field_type?: number | null
  escaped?: boolean | null
  value_identifier?: string | null
  value_mask?: string | null
  size?: number | null
  max_length?: number | null
  created_at: string
  updated_at: string
  legacy_question_field_type?: number | null
  sequence?: string | null
  meta_data?: object | null
  display_name?: string | null
  status_code: number
  job_guid: string
  options: [
    {
      nullify: null
      guid: string
      label: string
      external_id?: string | null
      data_uri?: string | null
      status_code: number
    },
  ]
}
// Support types
type SupportTicketType = {
  email: string
  message: string
  title: string
}

// job types
type JobResponseType = {
  guid: string
  has_processed_account_numbers: boolean
  member_guid: string
  user_guid: string
  job_type: number
  status: number
  error_message?: string | null
  is_authenticated: boolean
  finished_at: number
  started_at: number
  updated_at: number
}

// user types
type UserProfileResponseType = {
  guid: string
  too_small_modal_dismissed_at: string
  user_guid: string
  has_completed_finstrong_onboarding: boolean
  has_completed_guide_me_wizard: boolean
  has_completed_budgets2_onboarding: boolean
  has_completed_cash_flow_onboarding: boolean
  has_completed_spending_plan_onboarding: boolean
  has_completed_recurring_transactions_manager_onboarding: boolean
  has_completed_widgets_wizard: boolean
  has_closed_accounts_widget_help_state: boolean
  has_closed_budgets_widget_help_state: boolean
  has_closed_debts_widget_help_state: boolean
  has_closed_goals_widget_help_state: boolean
  has_closed_net_worth_widget_help_state: boolean
  has_closed_spending_widget_help_state: boolean
  has_closed_transactions_widget_help_state: boolean
  has_closed_trends_widget_help_state: boolean
  uses_detailed_notifications: boolean
}
