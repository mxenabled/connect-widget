import { describe, expect, it, vi } from 'vitest'
import { preventDefaultAndStopAllPropagation } from '../KeyPress'

describe('preventDefaultAndStopAllPropagation', () => {
  it('calls preventDefault on the event', () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {
        stopImmediatePropagation: vi.fn(),
      },
    }

    preventDefaultAndStopAllPropagation(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('calls stopPropagation on the event', () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {
        stopImmediatePropagation: vi.fn(),
      },
    }

    preventDefaultAndStopAllPropagation(mockEvent)

    expect(mockEvent.stopPropagation).toHaveBeenCalled()
  })

  it('calls stopImmediatePropagation on the native event', () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {
        stopImmediatePropagation: vi.fn(),
      },
    }

    preventDefaultAndStopAllPropagation(mockEvent)

    expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalled()
  })

  it('calls all three propagation methods', () => {
    const mockEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      nativeEvent: {
        stopImmediatePropagation: vi.fn(),
      },
    }

    preventDefaultAndStopAllPropagation(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1)
    expect(mockEvent.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1)
  })
})
