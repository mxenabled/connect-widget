import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { Disclosure } from 'src/views/disclosure/Disclosure'
import RenderConnectStep from 'src/components/RenderConnectStep'
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
    it.each([
      {
        mode: 'aggregation',
        item1: { testId: 'disclosure-agg-mode-list-item1', text: 'Account details' },
        item2: {
          testId: 'disclosure-agg-mode-list-item2',
          text: 'Account balances and transactions',
        },
      },
      {
        mode: 'verification',
        item1: { testId: 'disclosure-ver-mode-list-item1', text: 'Routing and account numbers' },
        item2: { testId: 'disclosure-ver-mode-list-item2', text: 'Account balances' },
      },
      {
        mode: 'tax',
        item1: { testId: 'disclosure-tax-mode-list-item1', text: 'Basic account information' },
        item2: { testId: 'disclosure-tax-mode-list-item2', text: 'Tax documents' },
      },
    ])('renders $mode mode list items', ({ mode, item1, item2 }) => {
      render(<Disclosure />, {
        preloadedState: { ...preloadedState, config: { ...preloadedState.config, mode } },
      })

      expect(screen.getByTestId(item1.testId)).toHaveTextContent(item1.text)
      expect(screen.getByTestId(item2.testId)).toHaveTextContent(item2.text)
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

      expect(await screen.findByTestId('leaving-notice-flat-header')).toBeInTheDocument()

      expect(openSpy).not.toHaveBeenCalled()
    })
  })

  describe('Continue Button', () => {
    it('advances to the search step when Continue is clicked', async () => {
      const { user } = render(
        <RenderConnectStep
          availableAccountTypes={[]}
          handleConsentGoBack={() => {}}
          handleCredentialsGoBack={() => {}}
          navigationRef={React.createRef()}
          onManualAccountAdded={() => {}}
          onUpsertMember={() => {}}
          setConnectLocalState={() => {}}
        />,
        {
          preloadedState: {
            ...preloadedState,
            connect: {
              ...preloadedState.connect,
              location: [{ step: STEPS.DISCLOSURE }],
            },
          },
        },
      )

      const continueButton = screen.getByTestId('disclosure-continue')
      expect(continueButton).toBeEnabled()

      await user.click(continueButton)

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
      expect(screen.queryByTestId('disclosure-title')).not.toBeInTheDocument()
    })
  })

  describe('Imperative Handle', () => {
    it('toggles the privacy policy and back button via the imperative handle', async () => {
      const ref = React.createRef<DisclosureHandle>()

      const { user } = render(
        <div id="connect-wrapper">
          <Disclosure ref={ref} />
        </div>,
        { preloadedState: stateWithExternalLinkPopup },
      )

      expect(ref.current?.showBackButton()).toBe(false)

      await user.click(screen.getByTestId('disclosure-privacy-policy-link'))

      expect(await screen.findByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      expect(ref.current?.showBackButton()).toBe(true)

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
