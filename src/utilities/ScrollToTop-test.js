import { describe, expect, it, vi } from 'vitest'
import { scrollToTop } from 'src/utilities/ScrollToTop.js'

describe('scrollToTop', () => {
  it('calls scrollIntoView on the current ref element', () => {
    const mockScrollIntoView = vi.fn()
    const ref = {
      current: {
        scrollIntoView: mockScrollIntoView,
      },
    }

    scrollToTop(ref)

    expect(mockScrollIntoView).toHaveBeenCalledWith(true)
  })

  it('returns undefined when ref.current is null', () => {
    const ref = {
      current: null,
    }

    const result = scrollToTop(ref)

    expect(result).toBeUndefined()
  })

  it('returns undefined when ref.current is undefined', () => {
    const ref = {
      current: undefined,
    }

    const result = scrollToTop(ref)

    expect(result).toBeUndefined()
  })

  it('returns the result of scrollIntoView', () => {
    const mockReturnValue = 'scrolled'
    const mockScrollIntoView = vi.fn().mockReturnValue(mockReturnValue)
    const ref = {
      current: {
        scrollIntoView: mockScrollIntoView,
      },
    }

    const result = scrollToTop(ref)

    expect(result).toBe(mockReturnValue)
  })
})
