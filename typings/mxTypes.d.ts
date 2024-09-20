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
