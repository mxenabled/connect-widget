import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { fromEntriesPolyfill } from 'src/utilities/Polyfill'

describe('fromEntriesPolyfill', () => {
  let originalFromEntries

  const installPolyfill = () => {
    delete Object.fromEntries
    fromEntriesPolyfill()
  }

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
    installPolyfill()

    expect(Object.fromEntries).toBeDefined()
    expect(typeof Object.fromEntries).toBe('function')
  })

  it('creates object from entries array when polyfilled', () => {
    installPolyfill()

    const entries = [
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]
    const result = Object.fromEntries(entries)

    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('handles Map entries when polyfilled', () => {
    installPolyfill()

    const map = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = Object.fromEntries(map)

    expect(result).toEqual({ key1: 'value1', key2: 'value2' })
  })

  it('throws for non-iterable arguments when polyfilled', () => {
    installPolyfill()

    const expectedError = 'Object.fromEntries() requires a single iterable argument'

    expect(() => Object.fromEntries(null)).toThrow(expectedError)
    expect(() => Object.fromEntries(42)).toThrow(expectedError)
  })

  it('handles empty entries array when polyfilled', () => {
    installPolyfill()

    const result = Object.fromEntries([])

    expect(result).toEqual({})
  })

  it('handles various value types when polyfilled', () => {
    installPolyfill()

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
