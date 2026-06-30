import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { Disclosure } from 'src/views/disclosure/Disclosure'
import { initialState, institutionData } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'

type DisclosureHandle = {
  handleBackButton: () => void
  showBackButton: () => boolean
}

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

const stateWithExternalLinkPopup = {
  ...preloadedState,
  profiles: {
    ...preloadedState.profiles,
    clientProfile: {
      ...preloadedState.profiles.clientProfile,
      show_external_link_popup: true,
    },
  },
}

describe('<Disclosure />', () => {
  let openSpy: MockInstance<typeof window.open>

  beforeEach(() => {
    vi.clearAllMocks()
    openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  describe('Content Display', () => {
    it('renders the disclosure screen content', () => {
      render(<Disclosure />, { preloadedState })

      expect(screen.getByTestId('disclosure-svg-header')).toBeInTheDocument()
      expect(screen.getByTestId('disclosure-title')).toHaveTextContent('Connect your account')
      expect(screen.getByTestId('disclosure-paragraph1')).toHaveTextContent(
        'This app will have access to the information below unless you choose to disconnect:',
      )
      expect(screen.getByTestId('disclosure-paragraph-2')).toHaveTextContent(
        'Your information is protected with bank-level security.',
      )
      expect(screen.getByTestId('disclosure-privacy-policy-text')).toHaveTextContent(
        'By clicking Continue, you agree to the',
      )
      expect(screen.getByTestId('disclosure-privacy-policy-link')).toHaveTextContent(
        'MX Privacy Policy.',
      )
      expect(screen.getByTestId('disclosure-continue')).toHaveTextContent('Continue')
      expect(screen.getByTestId('disclosure-databymx')).toBeInTheDocument()
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

      expect(openSpy).toHaveBeenCalledWith(
        'https://www.mx.com/privacy/',
        '_blank',
        'noopener,noreferrer',
      )
    })

    it('shows inline privacy policy when show_external_link_popup is true', async () => {
      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure />
        </div>,
        { preloadedState: stateWithExternalLinkPopup },
      )

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      await waitFor(() => {
        expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      })

      expect(openSpy).not.toHaveBeenCalled()
    })
  })

  describe('Continue Button', () => {
    it('advances past the disclosure when Continue is clicked', async () => {
      const { user, store } = render(<Disclosure />, { preloadedState })

      const continueButton = screen.getByTestId('disclosure-continue')
      expect(continueButton).toBeEnabled()

      await user.click(continueButton)

      await waitFor(() => {
        const { location } = store.getState().connect
        expect(location[location.length - 1].step).toBe(STEPS.SEARCH)
      })
    })
  })

  describe('Imperative Handle', () => {
    it('showBackButton reflects whether the privacy policy is shown', async () => {
      const ref = React.createRef<DisclosureHandle>()

      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure ref={ref} />
        </div>,
        { preloadedState: stateWithExternalLinkPopup },
      )

      expect(ref.current?.showBackButton()).toBe(false)

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      await waitFor(() => {
        expect(ref.current?.showBackButton()).toBe(true)
      })
    })

    it('handleBackButton hides the privacy policy and returns to the disclosure', async () => {
      const ref = React.createRef<DisclosureHandle>()

      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure ref={ref} />
        </div>,
        { preloadedState: stateWithExternalLinkPopup },
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
        expect(ref.current?.showBackButton()).toBe(false)
      })
    })
  })
})
