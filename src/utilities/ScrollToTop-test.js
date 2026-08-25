import { describe, expect, it, vi } from 'vitest'
import { scrollToTop } from 'src/utilities/ScrollToTop'

describe('scrollToTop', () => {
  it('scrolls the ref element into view and returns the result', () => {
    const scrollIntoView = vi.fn().mockReturnValue('scrolled')
    const ref = {
      current: {
        scrollIntoView,
      },
    }

    const result = scrollToTop(ref)

    expect(scrollIntoView).toHaveBeenCalledWith(true)
    expect(result).toBe('scrolled')
  })

  it('does nothing and returns undefined when ref.current is not set', () => {
    expect(scrollToTop({ current: null })).toBeUndefined()
    expect(scrollToTop({ current: undefined })).toBeUndefined()
  })
})
