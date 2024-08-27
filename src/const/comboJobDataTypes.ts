// combojobs product types defined in Platform API
export const COMBO_JOB_DATA_TYPES = {
  ACCOUNT_NUMBER: 'account_verification', // verification mode
  ACCOUNT_OWNER: 'identity_verification', // include_identity
  TRANSACTIONS: 'transactions', // include_transactions || aggregation mode
  TRANSACTION_HISTORY: 'transaction_history',
  STATEMENTS: 'statements',
  REWARDS: 'rewards', // reward mode
  INVESTMENTS: 'investments',
}
