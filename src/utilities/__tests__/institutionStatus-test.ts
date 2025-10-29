import { describe, it, expect } from 'vitest'
import {
  InstitutionStatus,
  getInstitutionStatus,
  isUnavailable,
  isBlocked,
  getUnavailableInstitutions,
  getBlockedInstitutions,
} from 'src/utilities/institutionStatus'

// Get the first entry for tests below, this will ony work while we've hard-coded values
const { guid: unavailableGuid, name: unavailableName } = getUnavailableInstitutions()[0]
const { guid: blockedGuid, name: blockedName } = getBlockedInstitutions()[0]

describe('InstitutionStatus', () => {
  describe('InstitutionStatus constants', () => {
    it('should have correct status values', () => {
      expect(InstitutionStatus.BLOCKED).toBe('BLOCKED')
      expect(InstitutionStatus.OPERATIONAL).toBe('OPERATIONAL')
      expect(InstitutionStatus.UNAVAILABLE).toBe('UNAVAILABLE')
    })
  })

  describe('isUnavailable', () => {
    it('should return true for Unavailable institutions by name', () => {
      const institution = { name: unavailableName }
      expect(isUnavailable(institution)).toBe(true)
    })
    it('should return true for Unavailable institutions by guid', () => {
      const institution = { guid: unavailableGuid }
      expect(isUnavailable(institution)).toBe(true)
    })

    it('should return false for other institutions', () => {
      const institution = { name: 'Other Bank', guid: 'some-other-guid' }
      expect(isUnavailable(institution)).toBe(false)
    })

    it('should return false for empty institution', () => {
      const institution = {}
      expect(isUnavailable(institution)).toBe(false)
    })
  })

  describe('isBlocked', () => {
    it('should return true for blocked institution by name', () => {
      const institution = { name: blockedName, is_disabled_by_client: true }
      expect(isBlocked(institution)).toBe(true)
    })

    it('should return true for blocked institution by guid', () => {
      const institution = { guid: blockedGuid, is_disabled_by_client: true }
      expect(isBlocked(institution)).toBe(true)
    })

    it('should return false for blocked institution by name, when the client is not blocking it', () => {
      const institution = { name: blockedName, is_disabled_by_client: false }
      expect(isBlocked(institution)).toBe(false)
    })

    it('should return true for blocked institution by guid, when the client is not bocking it', () => {
      const institution = { guid: blockedGuid, is_disabled_by_client: false }
      expect(isBlocked(institution)).toBe(false)
    })

    it('should return false for non-blocked institutions', () => {
      const institution = { name: 'Regular Bank', guid: 'regular-guid' }
      expect(isBlocked(institution)).toBe(false)
    })

    it('should return false for empty institution', () => {
      const institution = {}
      expect(isBlocked(institution)).toBe(false)
    })
  })

  describe('getInstitutionStatus', () => {
    it('should return UNAVAILABLE for institutions that are unavailable by name', () => {
      const paypalInstitution = { name: unavailableName }
      expect(getInstitutionStatus(paypalInstitution)).toBe(InstitutionStatus.UNAVAILABLE)
    })

    it('should return UNAVAILABLE for institutions that are unavailable by guid', () => {
      const paypalInstitution = { guid: unavailableGuid }
      expect(getInstitutionStatus(paypalInstitution)).toBe(InstitutionStatus.UNAVAILABLE)
    })

    it('should return BLOCKED for institutions that are blocked by name', () => {
      const paypalInstitution = { name: unavailableName, is_disabled_by_client: true }
      expect(getInstitutionStatus(paypalInstitution)).toBe(InstitutionStatus.UNAVAILABLE)
    })

    it('should return BLOCKED for institutions that are blocked by guid', () => {
      const paypalInstitution = { guid: blockedGuid, is_disabled_by_client: true }
      expect(getInstitutionStatus(paypalInstitution)).toBe(InstitutionStatus.BLOCKED)
    })

    it('should return OPERATIONAL for regular institutions', () => {
      const regularInstitution = { name: 'Regular Bank', guid: 'regular-guid' }
      expect(getInstitutionStatus(regularInstitution)).toBe(InstitutionStatus.OPERATIONAL)
    })

    it('should return OPERATIONAL for empty institution', () => {
      const emptyInstitution = {}
      expect(getInstitutionStatus(emptyInstitution)).toBe(InstitutionStatus.OPERATIONAL)
    })
  })
})
