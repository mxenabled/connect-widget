import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { ConnectInstitutionHeader } from 'src/components/ConnectInstitutionHeader'
import { COLOR_SCHEME } from 'src/const/Connect'
import { initialState } from 'src/services/mockedData'

// Mock SVG imports
vi.mock('src/images/header/HeaderDevice.svg', () => ({
  default: () => <div data-test="header-device" />,
}))
vi.mock('src/images/header/HeaderDefaultInstitution.svg', () => ({
  default: () => <div data-test="header-default-institution" />,
}))
vi.mock('src/images/header/HeaderBackdropDark.svg', () => ({
  default: () => <div data-test="header-backdrop-dark" />,
}))
vi.mock('src/images/header/HeaderBackdropLight.svg', () => ({
  default: () => <div data-test="header-backdrop-light" />,
}))

// Mock InstitutionLogo component
vi.mock('@kyper/institutionlogo', () => ({
  InstitutionLogo: ({ institutionGuid, size }: { institutionGuid: string; size: number }) => (
    <div data-institution-guid={institutionGuid} data-size={size} data-test="institution-logo" />
  ),
}))

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

    it('renders HeaderDevice in all cases', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      render(<ConnectInstitutionHeader />, { preloadedState })

      expect(screen.getByTestId('header-device')).toBeInTheDocument()
    })
  })

  describe('color scheme - light mode', () => {
    it('renders HeaderBackdropLight when color scheme is light', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      render(<ConnectInstitutionHeader />, { preloadedState })

      expect(screen.getByTestId('header-backdrop-light')).toBeInTheDocument()
      expect(screen.queryByTestId('header-backdrop-dark')).not.toBeInTheDocument()
    })
  })

  describe('color scheme - dark mode', () => {
    it('renders HeaderBackdropDark when color scheme is dark', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.DARK)
      render(<ConnectInstitutionHeader />, { preloadedState })

      expect(screen.getByTestId('header-backdrop-dark')).toBeInTheDocument()
      expect(screen.queryByTestId('header-backdrop-light')).not.toBeInTheDocument()
    })
  })

  describe('institution logo', () => {
    it('renders InstitutionLogo when institutionGuid is provided', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const institutionGuid = 'INS-12345'

      render(<ConnectInstitutionHeader institutionGuid={institutionGuid} />, { preloadedState })

      const logo = screen.getByTestId('institution-logo')
      expect(logo).toBeInTheDocument()
      expect(logo.getAttribute('data-institution-guid')).toBe(institutionGuid)
      expect(logo.getAttribute('data-size')).toBe('64')
    })

    it('renders default institution icon when no institutionGuid is provided', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      render(<ConnectInstitutionHeader />, { preloadedState })

      expect(screen.getByTestId('header-default-institution')).toBeInTheDocument()
      expect(screen.queryByTestId('institution-logo')).not.toBeInTheDocument()
    })

    it('renders default institution icon when institutionGuid is undefined', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      render(<ConnectInstitutionHeader institutionGuid={undefined} />, { preloadedState })

      expect(screen.getByTestId('header-default-institution')).toBeInTheDocument()
      expect(screen.queryByTestId('institution-logo')).not.toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('renders all elements together correctly in light mode with institution', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
      const institutionGuid = 'INS-BANK-001'

      const { container } = render(<ConnectInstitutionHeader institutionGuid={institutionGuid} />, {
        preloadedState,
      })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
      expect(screen.getByTestId('header-backdrop-light')).toBeInTheDocument()
      expect(screen.getByTestId('header-device')).toBeInTheDocument()
      expect(screen.getByTestId('institution-logo')).toBeInTheDocument()
    })

    it('renders all elements together correctly in dark mode without institution', () => {
      const preloadedState = createPreloadedState(COLOR_SCHEME.DARK)

      const { container } = render(<ConnectInstitutionHeader />, { preloadedState })

      expect(container.querySelector('[data-test="disclosure-svg-header"]')).toBeInTheDocument()
      expect(screen.getByTestId('header-backdrop-dark')).toBeInTheDocument()
      expect(screen.getByTestId('header-device')).toBeInTheDocument()
      expect(screen.getByTestId('header-default-institution')).toBeInTheDocument()
    })
  })
})
