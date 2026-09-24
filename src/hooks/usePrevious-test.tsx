import { renderHook } from '@testing-library/react'
import { usePrevious } from './usePrevious'

describe('usePrevious', () => {
  it('should return null on the initial render', () => {
    const { result } = renderHook(() => usePrevious('first'))

    expect(result.current).toBe(null)
  })

  it('should return the previous value after the value changes', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    })

    expect(result.current).toBe(null)

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    rerender({ value: 'third' })
    expect(result.current).toBe('second')
  })

  it('should reflect the latest committed value when re-rendered with the same value', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    // The effect from the prior render already committed 'second' to the ref,
    // so a same-value re-render reads 'second' even though the effect is skipped
    rerender({ value: 'second' })
    expect(result.current).toBe('second')
  })

  it('should work with non-string values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    })

    expect(result.current).toBe(null)

    rerender({ value: 1 })
    expect(result.current).toBe(0)

    rerender({ value: 2 })
    expect(result.current).toBe(1)
  })

  it('should track previous values for objects', () => {
    const firstObj = { id: 1 }
    const secondObj = { id: 2 }
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: firstObj },
    })

    rerender({ value: secondObj })
    expect(result.current).toBe(firstObj)
  })
})
