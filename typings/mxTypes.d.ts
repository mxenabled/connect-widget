/* eslint-disable @typescript-eslint/no-explicit-any */
// Account types
type AccountCreateType = {
  guid: string
}
type AccountResponseType = {
  account_type: number
  balance: number
  guid: string
  interest_rate: number
  is_personal: boolean
}

// Member types
type MemberType = {
  guid: string
  connection_status: number
}
type MemberDeleteType = {
  guid: string
}
type MemberResponseType = {
  aggregation_status: number
  connection_status: number
  guid: string
  institution_guid: string
  institution_name: string
  institution_url: string
  instructional_data?: string
  is_being_aggregated: boolean
  is_manual: boolean
  is_managed_by_user: boolean
  is_oauth: boolean
  last_job_guid?: string
  last_job_status?: number
  last_update_time?: string
  metadata?: any
  mfa?: any
  most_recent_job_detail_code?: number
  most_recent_job_guid?: string
  needs_updated_credentials?: boolean
  name?: string
  process_status?: number
  revision?: number
  user_guid: string
  verification_is_enabled: boolean
}

// Institution types
type InstitutionResponseType = {
  account_verification_is_enabled: boolean
  account_identification_is_enabled: boolean
  code: string
  forgot_password_credential_recovery_url?: string
  forgot_username_credential_recovery_url?: string
  guid: string
  instructional_text?: string
  instructional_data?: string
  login_url: string
  name: string
  popularity: number
  supports_oauth: boolean
  tax_statement_is_enabled: boolean
  trouble_signing_credential_recovery_url?: string
  url: string
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
type OAuthWindowURIType = {
  guid: string
  oauth_window_uri: string
}
type CredentialType = {
  display_order: 1
  field_name: string
  field_type: number
  guid: string
  label: string
  meta_data: object
  optional: boolean
  options: object
}

// Support types
type SupportTicketType = {
  email: string
  message: string
  title: string
}
