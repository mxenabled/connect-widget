import { ReadableStatuses } from 'src/const/Statuses'
import { hasNoSingleAccountSelectOptions } from 'src/utilities/memberUtils'

describe('memberUtils Tests', () => {
  describe('hasNoSingleAccountSelectOptions', () => {
    const SAS_EXTERNAL_ID = 'single_account_select'
    it('returns true when CHALLENGED, it is SAS, and there are no options', () => {
      const member = {
        connection_status: ReadableStatuses.CHALLENGED,
        mfa: {
          credentials: [
            {
              external_id: SAS_EXTERNAL_ID,
              options: [],
            },
          ],
        },
      }
      const result = hasNoSingleAccountSelectOptions(member)
      expect(result).toEqual(true)
    })

    // QUESTION - should this enforce account type?
    it('returns false when CHALLENGED, it is SAS, and there are account options', () => {
      const member = {
        connection_status: ReadableStatuses.CHALLENGED,
        mfa: {
          credentials: [
            {
              external_id: SAS_EXTERNAL_ID,
              options: [
                {
                  guid: 'ACT-1',
                },
                {
                  guid: 'ACT-2',
                },
              ],
            },
          ],
        },
      }
      const result = hasNoSingleAccountSelectOptions(member)
      expect(result).toEqual(false)
    })
  })
})
