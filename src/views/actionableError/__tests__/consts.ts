import { ACTIONABLE_ERROR_CODES, canHandleActionableError } from 'src/views/actionableError/consts'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'

describe('canHandleActionableError', () => {
  it('returns true for known actionable error codes that pass validation', () => {
    expect(
      canHandleActionableError(ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS, VERIFY_MODE), // NO_ELIGIBLE_ACCOUNTS
    ).toBe(true)
  })

  it("returns false for known actionable error codes that doesn't pass validation", () => {
    expect(
      canHandleActionableError(ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS, AGG_MODE), // NO_ELIGIBLE_ACCOUNTS
    ).toBe(false)
  })

  it('returns false for unknown error codes', () => {
    expect(canHandleActionableError(1, VERIFY_MODE)).toBe(false)
    expect(canHandleActionableError(1, AGG_MODE)).toBe(false)
  })
})
