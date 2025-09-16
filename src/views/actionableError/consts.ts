import { VERIFY_MODE } from 'src/const/Connect'

// AED Step 1: Add new codes here
// AED Step 2: see ActionableError.tsx
export const ACTIONABLE_ERROR_CODES = {
  NO_ELIGIBLE_ACCOUNTS: 1000,
}

export const ACTIVE_ACTIONABLE_ERROR_CODES: number[] = Object.values(ACTIONABLE_ERROR_CODES)

export const canHandleActionableError = (errorCode: number, mode: string) => {
  // There are some scenarios where the actionable error should not be shown
  // For example, NO_ELIGIBLE_ACCOUNTS(1000) should only be shown in VERIFY mode
  // because that error code is only applicable in VERIFY jobs.
  if (errorCode === ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS && mode !== VERIFY_MODE) {
    return false
  }

  return ACTIVE_ACTIONABLE_ERROR_CODES.includes(errorCode)
}
