import { VERIFY_MODE } from 'src/const/Connect'

// AED Step 1: Add new codes here
// AED Step 2: see useActionableErrorMap.tsx
export const ACTIONABLE_ERROR_CODES = {
  NO_ELIGIBLE_ACCOUNTS: 1000,
  NO_ACCOUNTS: 1001,
  ACCESS_DENIED: 1002,
  INCORRECT_OTP: 2001,
  INCORRECT_MFA: 2002,
  MFA_TIMEOUT: 2003,
  REAUTHORIZATION_REQUIRED: 2004,
  INVALID_CREDENTIALS: 2005,
  INSTITUTION_DOWN: 3000,
  INSTITUTION_MAINTENANCE: 3001,
  INSTITUTION_UNAVAILABLE: 3002,
}
export const CODES_REQUIRING_CREDENTIALS = [
  ACTIONABLE_ERROR_CODES.INVALID_CREDENTIALS,
  ACTIONABLE_ERROR_CODES.REAUTHORIZATION_REQUIRED,
]
export const CODES_REQUIRING_MFA = [
  ACTIONABLE_ERROR_CODES.INCORRECT_OTP,
  ACTIONABLE_ERROR_CODES.INCORRECT_MFA,
  ACTIONABLE_ERROR_CODES.MFA_TIMEOUT,
]

export const ACTIVE_ACTIONABLE_ERROR_CODES: number[] = Object.values(ACTIONABLE_ERROR_CODES)

export const canHandleActionableError = (errorCode: number, mode: string) => {
  // VALIDATION: There are some scenarios where the actionable error should not be shown
  // For example, NO_ELIGIBLE_ACCOUNTS(1000) should only be shown in VERIFY mode
  // because that error code is only applicable in VERIFY jobs.
  if (errorCode === ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS && mode !== VERIFY_MODE) {
    return false
  }

  return ACTIVE_ACTIONABLE_ERROR_CODES.includes(errorCode)
}
