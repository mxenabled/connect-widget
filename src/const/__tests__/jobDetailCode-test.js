import { JOB_DETAIL_CODE } from '../jobDetailCode'

describe('JOB_DETAIL_CODE Constants', () => {
  describe('Structure', () => {
    it('should be an object', () => {
      expect(typeof JOB_DETAIL_CODE).toBe('object')
      expect(JOB_DETAIL_CODE).not.toBeNull()
    })

    it('should have exactly 1 property', () => {
      expect(Object.keys(JOB_DETAIL_CODE)).toHaveLength(1)
    })

    it('should have all numeric values', () => {
      Object.values(JOB_DETAIL_CODE).forEach((value) => {
        expect(typeof value).toBe('number')
      })
    })

    it('should have unique values', () => {
      const values = Object.values(JOB_DETAIL_CODE)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('NO_VERIFIABLE_ACCOUNTS', () => {
    it('should exist', () => {
      expect(JOB_DETAIL_CODE.NO_VERIFIABLE_ACCOUNTS).toBeDefined()
    })

    it('should equal 1000', () => {
      expect(JOB_DETAIL_CODE.NO_VERIFIABLE_ACCOUNTS).toBe(1000)
    })

    it('should be a number', () => {
      expect(typeof JOB_DETAIL_CODE.NO_VERIFIABLE_ACCOUNTS).toBe('number')
    })
  })

  describe('Export', () => {
    it('should export JOB_DETAIL_CODE as a named export', () => {
      expect(JOB_DETAIL_CODE).toBeDefined()
    })

    it('should not be frozen or sealed', () => {
      expect(Object.isFrozen(JOB_DETAIL_CODE)).toBe(false)
      expect(Object.isSealed(JOB_DETAIL_CODE)).toBe(false)
    })
  })
})
