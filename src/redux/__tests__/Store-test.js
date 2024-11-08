import Store from 'src/redux/Store'

describe('Store', () => {
  it('should have a .subscribe', () => {
    expect(Store.subscribe).toBeDefined()
  })

  it('should have a .dispatch', () => {
    expect(Store.dispatch).toBeDefined()
  })

  describe('.getState', () => {
    const expectedKeys = [
      'analytics',
      'app',
      'browser',
      'componentStacks',
      'config',
      'connect',
      'profiles',
      'userFeatures',
    ]

    it('should exist', () => {
      expect(Store.getState).toBeDefined()
    })

    it('should have all expected reducer results combined', () => {
      const result = expectedKeys
        .map((key) => key in Store.getState())
        .filter((present) => !present)

      expect(result).toEqual([])
    })

    it('should have no unexpected reducer results', () => {
      const result = Object.keys(Store.getState())
        .map((key) => expectedKeys.indexOf(key) > -1)
        .filter((present) => !present)

      expect(result).toEqual([])
    })
  })
})
