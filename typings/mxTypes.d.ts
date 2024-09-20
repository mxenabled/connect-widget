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
  guid: string
  routing_number: string
  account_number: string
  account_type: number
}
type MicrodepositUpdateType = {
  guid: string
  routing_number: string
  account_number: string
  account_type: number
}
type MicroDepositVerifyType = {
  deposit_amount_1: string
  deposit_amount_2: string
}
type MicrodepositResponseType = {
  guid: string
  status: string
  routing_number: string
  account_number: string
  account_type: number
}
type MicroDepositVerifyResponseType = {
  guid: string
  status: string
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
