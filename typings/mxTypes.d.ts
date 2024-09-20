// Account types
type AccountType = {
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

// Institution types
type InstitutionType = {
  account_verification_is_enabled: boolean
  code: string
  forgot_password_credential_recovery_url: string
  forgot_username_credential_recovery_url: string
  guid: string
  login_url: string
  name: string
  popularity: number
  supports_oauth: boolean
  tax_statement_is_enabled: boolean
  trouble_signing_credential_recovery_url: string
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
  deposit_expected_at: string
  email: string
  first_name: string
  guid: string
  last_name: string
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
