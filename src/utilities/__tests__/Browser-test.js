import { light as tokens } from '@mxenabled/design-tokens'
import { getWindowSize, shouldShowTooSmallDialogFromSnooze } from 'src/utilities/Browser'

describe('Browser', () => {
  it('returns "small" when window width is less than Med breakpoint', () => {
    window.innerWidth = tokens.MediaQuery.Small

    const windowSize = getWindowSize()

    expect(windowSize).toEqual('small')
  })

  it('returns "medium" when window width is greater than or equal to Med breakpoint', () => {
    window.innerWidth = tokens.MediaQuery.Med

    const windowSize = getWindowSize()

    expect(windowSize).toEqual('medium')
  })

  it('returns "large" when window width is greater than or equal to Large breakpoint', () => {
    window.innerWidth = tokens.MediaQuery.Large

    const windowSize = getWindowSize()

    expect(windowSize).toEqual('large')
  })

  describe('shouldShowTooSmallModalFromSnooze', () => {
    const nowDate = new Date(1680195964443)
    const yesterdayDate = new Date(1680109564000)
    const thirtyDaysAgoDate = new Date(1677607564000)
    const threeDaysAgo = new Date(1679936764000)

    it('defaults true when no "dismissed at" or "threshold days" given', () => {
      expect(shouldShowTooSmallDialogFromSnooze(null, 10)).toBe(true)
      expect(shouldShowTooSmallDialogFromSnooze(threeDaysAgo, null)).toBe(true)
      expect(shouldShowTooSmallDialogFromSnooze(threeDaysAgo, 0)).toBe(true)
    })

    it('should show modal if days since dismissal exceeds client set threshold', () => {
      expect(shouldShowTooSmallDialogFromSnooze(thirtyDaysAgoDate, 15, nowDate)).toBe(false)
    })

    it('should not show modal if days since dismissal is below client set threshold', () => {
      expect(shouldShowTooSmallDialogFromSnooze(yesterdayDate, 15, nowDate)).toBe(false)
    })
  })
})
