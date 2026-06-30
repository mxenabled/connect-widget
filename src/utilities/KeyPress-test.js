import { describe, expect, it, vi } from 'vitest'
import { preventDefaultAndStopAllPropagation } from 'src/utilities/KeyPress'

describe('preventDefaultAndStopAllPropagation', () => {
  const createMockEvent = () => ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    nativeEvent: {
      stopImmediatePropagation: vi.fn(),
    },
  })

  it('stops the event on both the synthetic and native event so global listeners do not fire', () => {
    const event = createMockEvent()

    preventDefaultAndStopAllPropagation(event)

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
    expect(event.stopPropagation).toHaveBeenCalledTimes(1)
    expect(event.nativeEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1)
  })
})
