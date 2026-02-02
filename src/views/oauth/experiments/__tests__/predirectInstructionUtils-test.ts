import { describe, it, expect } from 'vitest'
import { getInstitutionBrandColor } from 'src/views/oauth/experiments/predirectInstructionsUtils'

describe('predirectInstructionsUtils', () => {
  describe('getInstitutionBrandColor', () => {
    it('returns configured color for the INS when brand_color_hex_code exists', () => {
      const institution = {
        guid: 'INS-test',
        brand_color_hex_code: '#D71E28',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#000000')).toBe('#D71E28')
    })

    it('returns the provided default color when brand_color_hex_code is missing', () => {
      const institution = {
        guid: 'INS-test',
      } as InstitutionResponseType

      expect(getInstitutionBrandColor(institution, '#000000')).toBe('#000000')
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
