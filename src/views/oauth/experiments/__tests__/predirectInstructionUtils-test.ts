import { describe, it, expect } from 'vitest'
import {
  isWellsFargoInstitution,
  getInstitutionBrandColor,
} from 'src/views/oauth/experiments/predirectInstructionsUtils'

describe('predirectInstructionsUtils', () => {
  describe('isWellsFargoInstitution', () => {
    it('returns true for Wells Fargo PROD guid', () => {
      const institution = {
        guid: 'INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867',
      } as InstitutionResponseType

      expect(isWellsFargoInstitution(institution)).toBe(true)
    })

    it('returns true for Wells Fargo SAND guid', () => {
      const institution = {
        guid: 'INS-f9e8d5f6-b953-da63-32e4-6e88fbe8b250',
      } as InstitutionResponseType

      expect(isWellsFargoInstitution(institution)).toBe(true)
    })

    it('returns true for institution name Wells Fargo', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Wells Fargo',
      } as InstitutionResponseType

      expect(isWellsFargoInstitution(institution)).toBe(true)
    })

    it('returns false for non-Wells Fargo institution', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Chase Bank',
      } as InstitutionResponseType

      expect(isWellsFargoInstitution(institution)).toBe(false)
    })
  })

  describe('getInstitutionBrandColor', () => {
    it('returns configured color for Wells Fargo when brand_color_hex_code exists', () => {
      const institution = {
        guid: 'INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867',
        brand_color_hex_code: '#D71E28',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#000000')).toBe('#D71E28')
    })

    it('returns Wells Fargo red when brand_color_hex_code is missing', () => {
      const institution = {
        guid: 'INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#000000')).toBe('#B22222')
    })

    it('returns configured color for non-Wells Fargo institution', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Chase Bank',
        brand_color_hex_code: '#117ACA',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#000000')).toBe('#117ACA')
    })

    it('returns default color when brand_color_hex_code is missing for non-Wells Fargo', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Chase Bank',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#AABBCC')).toBe('#AABBCC')
    })

    it('brand_color_hex_code: validates hex color format with 6 digits', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Test Bank',
        brand_color_hex_code: '#1A2B3C',
      } as InstitutionResponseType

      const result = getInstitutionBrandColor(institution, '#000000')
      expect(result).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(result).toBe('#1A2B3C')
    })

    it('brand_color_hex_code: validates hex color format with 8 digits (with transparency)', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Test Bank',
        brand_color_hex_code: '#1A2B3C80',
      } as InstitutionResponseType

      const result = getInstitutionBrandColor(institution, '#00000000')
      expect(result).toMatch(/^#[0-9A-Fa-f]{8}$/)
      expect(result).toBe('#1A2B3C80')
    })

    it('brand_color_hex_code: returns default color when brand_color_hex_code is invalid', () => {
      const institution = {
        guid: 'INS-other-guid',
        name: 'Test Bank',
        brand_color_hex_code: 'invalid-color',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#FFFFFF')).toBe('#FFFFFF')
    })
  })
})
