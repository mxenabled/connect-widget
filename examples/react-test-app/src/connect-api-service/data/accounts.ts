import { manualInstitution } from './institutions'
import { USR_GUID } from './users'

interface Account {
  account_number: string | null
  account_subtype: string | null
  account_type: number
  apr: number | null
  apy: number | null
  available_balance: number | null
  balance: number
  balance_updated_at: number
  cash_balance: number | null
  credit_limit: number | null
  currency_code: string | null
  day_payment_is_due: number | null
  display_order: number | null
  external_guid: string | null
  feed_account_type: string | null
  feed_apr: number | null
  feed_apy: number | null
  feed_credit_limit: number | null
  feed_day_payment_is_due: number | null
  feed_interest_rate: number | null
  feed_is_closed: boolean | null
  feed_localized_name: string | null
  feed_name: string | null
  feed_nickname: string | null
  feed_original_balance: number | null
  flags: number
  guid: string
  institution_guid: string
  interest_rate: number
  interest_rate_set_by: number
  is_closed: boolean
  is_deleted: boolean
  is_excluded_from_accounts: boolean
  is_excluded_from_budgets: boolean
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
  localized_name: string | null
  member_guid: string
  member_is_managed_by_user: boolean
  metadata: any | null
  minimum_payment: number | null
  name: string
  nickname: string | null
  original_balance: number | null
  payment_due_at: number | null
  pending_balance: number | null
  property_type: string | null
  revision: number
  updated_at: number
  user_guid: string
  user_name: string
}

const defaultAccount: Account = {
  account_number: null,
  account_subtype: null,
  account_type: 1,
  apr: null,
  apy: null,
  available_balance: null,
  balance: 100.0,
  balance_updated_at: 1755200797,
  cash_balance: null,
  credit_limit: null,
  currency_code: null,
  day_payment_is_due: null,
  display_order: null,
  external_guid: null,
  feed_account_type: null,
  feed_apr: null,
  feed_apy: null,
  feed_credit_limit: null,
  feed_day_payment_is_due: null,
  feed_interest_rate: null,
  feed_is_closed: null,
  feed_localized_name: null,
  feed_name: null,
  feed_nickname: null,
  feed_original_balance: null,
  flags: 0,
  guid: 'ACT-11fb6942-f9e7-4943-ba8e-d045f4cd6f67',
  institution_guid: manualInstitution.guid,
  interest_rate: 0.01,
  interest_rate_set_by: 2,
  is_closed: false,
  is_deleted: false,
  is_excluded_from_accounts: false,
  is_excluded_from_budgets: false,
  is_excluded_from_cash_flow: false,
  is_excluded_from_debts: false,
  is_excluded_from_goals: false,
  is_excluded_from_investments: false,
  is_excluded_from_net_worth: false,
  is_excluded_from_spending: false,
  is_excluded_from_transactions: false,
  is_excluded_from_trends: false,
  is_hidden: false,
  is_manual: true,
  is_personal: true,
  localized_name: null,
  member_guid: 'MBR-MANUAL',
  member_is_managed_by_user: true,
  metadata: null,
  minimum_payment: null,
  name: 'name',
  nickname: null,
  original_balance: null,
  payment_due_at: null,
  pending_balance: null,
  property_type: null,
  revision: 1,
  updated_at: 1755200797,
  user_guid: USR_GUID,
  user_name: 'name',
}

export function create(accountOverrides: Partial<Account> = {}): Account {
  return {
    ...defaultAccount,
    guid: `ACT-${Date.now()}`,
    institution_guid: manualInstitution.guid,
    member_guid: 'MBR-MANUAL',
    user_guid: USR_GUID,
    ...accountOverrides,
  }
}
