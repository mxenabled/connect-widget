// Account types
type AccountType = {
  account_type: number
  balance: number
  guid: string
  interest_rate: number
  is_personal: boolean
}

// Member types
type MemberType = { guid: string }

// Institution types
type InstitutionType = { guid: string }

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

// Support types
type SupportTicketType = {
  email: string
  message: string
  title: string
}
