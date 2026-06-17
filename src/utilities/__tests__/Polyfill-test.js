import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { fromEntriesPolyfill } from '../Polyfill'

describe('fromEntriesPolyfill', () => {
  let originalFromEntries

  beforeEach(() => {
    originalFromEntries = Object.fromEntries
  })

  afterEach(() => {
    Object.fromEntries = originalFromEntries
  })

  it('does not override Object.fromEntries if it exists', () => {
    const existingImpl = Object.fromEntries

    fromEntriesPolyfill()

    expect(Object.fromEntries).toBe(existingImpl)
  })

  it('adds Object.fromEntries if it does not exist', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    expect(Object.fromEntries).toBeDefined()
    expect(typeof Object.fromEntries).toBe('function')
  })

  it('creates object from entries array when polyfilled', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    const entries = [
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]
    const result = Object.fromEntries(entries)

    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('handles Map entries when polyfilled', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    const map = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = Object.fromEntries(map)

    expect(result).toEqual({ key1: 'value1', key2: 'value2' })
  })

  it('throws error for non-iterable argument when polyfilled', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    expect(() => {
      Object.fromEntries(null)
    }).toThrow('Object.fromEntries() requires a single iterable argument')
  })

  it('throws error for undefined argument when polyfilled', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    expect(() => {
      Object.fromEntries(undefined)
    }).toThrow('Object.fromEntries() requires a single iterable argument')
  })

  it('handles empty entries array when polyfilled', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    const result = Object.fromEntries([])

    expect(result).toEqual({})
  })

  it('handles various value types when polyfilled', () => {
    delete Object.fromEntries

    fromEntriesPolyfill()

    const entries = [
      ['string', 'value'],
      ['number', 42],
      ['boolean', true],
      ['null', null],
      ['object', { nested: 'object' }],
    ]
    const result = Object.fromEntries(entries)

    expect(result).toEqual({
      string: 'value',
      number: 42,
      boolean: true,
      null: null,
      object: { nested: 'object' },
    })
  })
})
