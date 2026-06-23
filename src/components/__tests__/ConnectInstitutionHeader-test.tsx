import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from 'src/utilities/testingLibrary'
import { ConnectInstitutionHeader } from 'src/components/ConnectInstitutionHeader'
import { COLOR_SCHEME } from 'src/const/Connect'
import { initialState } from 'src/services/mockedData'

describe('ConnectInstitutionHeader', () => {
  const createPreloadedState = (colorScheme: string) => ({
    ...initialState,
    config: {
      ...initialState.config,
      color_scheme: colorScheme,
    },
  })

  describe('rendering', () => {
    it('renders the header container with correct data-test attribute', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      const header = container.querySelector('[data-test="disclosure-svg-header"]')
      expect(header).toBeInTheDocument()
    })

    it('renders SVG elements for the header graphics', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('color scheme', () => {
    it('renders with light mode color scheme', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
    })

    it('renders with dark mode color scheme', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.DARK)
      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
    })
  })

  describe('institution logo', () => {
    it('renders with institutionGuid provided', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const institutionGuid = 'INS-12345'

      const { container } = render(<ConnectInstitutionHeader institutionGuid={institutionGuid} />, {
        preloadedState,
      })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
    })

    it('renders without institutionGuid', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
    })

    it('renders with undefined institutionGuid', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const { container } = render(<ConnectInstitutionHeader institutionGuid={undefined} />, {
        preloadedState,
      })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('renders all elements together in light mode with institution', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const institutionGuid = 'INS-BANK-001'

      const { container } = render(<ConnectInstitutionHeader institutionGuid={institutionGuid} />, {
        preloadedState,
      })

      const header = container.querySelector('[data-test="disclosure-svg-header"]')
      expect(header).toBeInTheDocument()

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('renders all elements together in dark mode without institution', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.DARK)

      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      const header = container.querySelector('[data-test="disclosure-svg-header"]')
      expect(header).toBeInTheDocument()

      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })
})
