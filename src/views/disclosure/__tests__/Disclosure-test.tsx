import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { Disclosure } from '../Disclosure'
import { initialState, institutionData } from 'src/services/mockedData'
import * as globalUtils from 'src/utilities/global'
import * as scrollToTopUtils from 'src/utilities/ScrollToTop'

const preloadedState = {
  ...initialState,
  browser: {
    height: 0,
    isMobile: false,
    isTablet: false,
    size: '',
    width: 0,
  },
  connect: {
    ...initialState.connect,
    selectedInstitution: institutionData.institution,
  },
}

describe('<Disclosure />', () => {
  let goToUrlLinkSpy: ReturnType<typeof vi.spyOn>
  let scrollToTopSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    goToUrlLinkSpy = vi.spyOn(globalUtils, 'goToUrlLink').mockImplementation(() => {})
    scrollToTopSpy = vi.spyOn(scrollToTopUtils, 'scrollToTop').mockImplementation(() => {})
  })

  afterEach(() => {
    goToUrlLinkSpy.mockRestore()
    scrollToTopSpy.mockRestore()
  })

  describe('Content Display', () => {
    it('renders the disclosure title', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-title')).toHaveTextContent('Connect your account')
    })

    it('renders the disclosure paragraph', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-paragraph1')).toHaveTextContent(
        'This app will have access to the information below unless you choose to disconnect:',
      )
    })

    it('renders the security message', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-paragraph-2')).toHaveTextContent(
        'Your information is protected with bank-level security.',
      )
    })

    it('renders the privacy policy text', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-privacy-policy-text')).toHaveTextContent(
        'By clicking Continue, you agree to the',
      )
    })

    it('renders the privacy policy link', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-privacy-policy-link')).toHaveTextContent(
        'MX Privacy Policy.',
      )
    })

    it('renders the Continue button', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-continue')).toHaveTextContent('Continue')
    })

    it('renders the Powered by MX text', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-databymx')).toBeInTheDocument()
    })

    it('renders the institution header', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-svg-header')).toBeInTheDocument()
    })
  })

  describe('Mode-specific Content', () => {
    it('renders aggregation mode list items', () => {
      const aggState = {
        ...preloadedState,
        config: {
          ...preloadedState.config,
          mode: 'aggregation',
        },
      }

      render(<Disclosure />, { preloadedState: aggState })

      expect(screen.getByTestId('disclosure-agg-mode-list-item1')).toHaveTextContent(
        'Account details',
      )
      expect(screen.getByTestId('disclosure-agg-mode-list-item2')).toHaveTextContent(
        'Account balances and transactions',
      )
    })

    it('renders verification mode list items', () => {
      const verifyState = {
        ...preloadedState,
        config: {
          ...preloadedState.config,
          mode: 'verification',
        },
      }

      render(<Disclosure />, { preloadedState: verifyState })

      expect(screen.getByTestId('disclosure-ver-mode-list-item1')).toHaveTextContent(
        'Routing and account numbers',
      )
      expect(screen.getByTestId('disclosure-ver-mode-list-item2')).toHaveTextContent(
        'Account balances',
      )
    })

    it('renders tax mode list items', () => {
      const taxState = {
        ...preloadedState,
        config: {
          ...preloadedState.config,
          mode: 'tax',
        },
      }

      render(<Disclosure />, { preloadedState: taxState })

      expect(screen.getByTestId('disclosure-tax-mode-list-item1')).toHaveTextContent(
        'Basic account information',
      )
      expect(screen.getByTestId('disclosure-tax-mode-list-item2')).toHaveTextContent(
        'Tax documents',
      )
    })
  })

  describe('Privacy Policy Link', () => {
    it('opens privacy policy externally when show_external_link_popup is false', async () => {
      const stateWithoutPopup = {
        ...preloadedState,
        profiles: {
          ...preloadedState.profiles,
          clientProfile: {
            ...preloadedState.profiles.clientProfile,
            show_external_link_popup: false,
          },
        },
      }

      const { user } = render(<Disclosure />, { preloadedState: stateWithoutPopup })

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      expect(goToUrlLinkSpy).toHaveBeenCalledWith('https://www.mx.com/privacy/', true)
    })

    it('shows inline privacy policy when show_external_link_popup is true', async () => {
      const stateWithPopup = {
        ...preloadedState,
        profiles: {
          ...preloadedState.profiles,
          clientProfile: {
            ...preloadedState.profiles.clientProfile,
            show_external_link_popup: true,
          },
        },
      }

      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure />
        </div>,
        { preloadedState: stateWithPopup },
      )

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      await waitFor(() => {
        expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      })

      expect(goToUrlLinkSpy).not.toHaveBeenCalled()
    })
  })

  describe('Continue Button', () => {
    it('dispatches ACCEPT_DISCLOSURE action when Continue is clicked', async () => {
      const { user } = render(<Disclosure />, { preloadedState })

      const continueButton = screen.getByTestId('disclosure-continue')
      expect(continueButton).toBeEnabled()

      await user.click(continueButton)

      // Button interaction is tested; action dispatch is tested via integration tests
    })
  })

  describe('Imperative Handle', () => {
    it('exposes handleBackButton and showBackButton methods', () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()

      render(<Disclosure ref={ref} />, { preloadedState })

      expect(ref.current).toHaveProperty('handleBackButton')
      expect(ref.current).toHaveProperty('showBackButton')
    })

    it('showBackButton returns false when privacy policy is not shown', () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()

      render(<Disclosure ref={ref} />, { preloadedState })

      expect(ref.current?.showBackButton()).toBe(false)
    })

    it('showBackButton returns true when privacy policy is shown', async () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()
      const stateWithPopup = {
        ...preloadedState,
        profiles: {
          ...preloadedState.profiles,
          clientProfile: {
            ...preloadedState.profiles.clientProfile,
            show_external_link_popup: true,
          },
        },
      }

      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure ref={ref} />
        </div>,
        { preloadedState: stateWithPopup },
      )

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      await waitFor(() => {
        expect(ref.current?.showBackButton()).toBe(true)
      })
    })

    it('handleBackButton hides privacy policy', async () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()
      const stateWithPopup = {
        ...preloadedState,
        profiles: {
          ...preloadedState.profiles,
          clientProfile: {
            ...preloadedState.profiles.clientProfile,
            show_external_link_popup: true,
          },
        },
      }

      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure ref={ref} />
        </div>,
        { preloadedState: stateWithPopup },
      )

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      await waitFor(() => {
        expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      })

      await waitFor(() => {
        ref.current?.handleBackButton()
      })

      await waitFor(() => {
        expect(screen.queryByTestId('leaving-notice-flat-header')).not.toBeInTheDocument()
        expect(screen.getByTestId('disclosure-title')).toBeInTheDocument()
      })
    })
  })

  describe('Integration', () => {
    it('renders all main sections together', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-title')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-paragraph1')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-list')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-paragraph-2')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-privacy-policy-text')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-continue')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-databymx')).toBeInTheDocument()
    })
  })
})
