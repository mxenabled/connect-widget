// AED Step 1: Add new codes here
export const ACTIONABLE_ERROR_CODES = {
  NO_ELIGIBLE_ACCOUNTS: 1000,
}

export const ACTIVE_ACTIONABLE_ERROR_CODES: number[] = Object.values(ACTIONABLE_ERROR_CODES)

export const canHandleActionableError = (errorCode: number) => {
  return ACTIVE_ACTIONABLE_ERROR_CODES.includes(errorCode)
}
