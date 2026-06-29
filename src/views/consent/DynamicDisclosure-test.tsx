import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { initialState } from 'src/services/mockedData'
import { AGG_MODE, VERIFY_MODE, STEPS } from 'src/const/Connect'
import * as Intl from 'src/utilities/Intl'

declare global {
  interface Window {
    app: {
      options: { language: string }
    }
  }
}

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

const mockInstitution = {
  guid: 'INS-123',
  name: 'Test Bank',
  logo_url: 'https://example.com/logo.png',
}

type DynamicDisclosureHandle = {
  handleBackButton: () => void
  showBackButton: () => boolean
}

type StateOverrides = {
  config?: Record<string, unknown>
  connect?: Record<string, unknown>
  profiles?: Record<string, unknown>
}

const renderConsentStep = (stateOverrides: StateOverrides = {}) => {
  const navigationRef = React.createRef<DynamicDisclosureHandle>()
  const handleConsentGoBack = vi.fn()

  const preloadedState = {
    ...initialState,
    config: { ...initialState.config, ...stateOverrides.config },
    profiles: { ...initialState.profiles, ...stateOverrides.profiles },
    connect: {
      ...initialState.connect,
      ...stateOverrides.connect,
      location: [{ step: STEPS.CONSENT }],
      selectedInstitution: mockInstitution,
    },
  }

  const utils = render(
    <RenderConnectStep
      availableAccountTypes={[]}
      handleConsentGoBack={handleConsentGoBack}
      handleCredentialsGoBack={() => {}}
      navigationRef={navigationRef}
      onManualAccountAdded={() => {}}
      onUpsertMember={() => {}}
      setConnectLocalState={() => {}}
    />,
    { preloadedState },
  )

  return { ...utils, navigationRef, handleConsentGoBack }
}

describe('DynamicDisclosure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.app = { options: { language: 'en-us' } }
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    })
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    })
    Object.defineProperty(document.documentElement, 'clientHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
  })

  describe('Rendering', () => {
    it('renders the consent screen', async () => {
      renderConsentStep()

      expect(await screen.findByTestId('dynamic-disclosure-title')).toBeInTheDocument()
      expect(await screen.findByTestId('dynamic-disclosure-p1')).toBeInTheDocument()
      expect(await screen.findByText('I consent')).toBeInTheDocument()
      expect(await screen.findByText('Account Information')).toBeInTheDocument()
    })

    it('should render with app name when provided', () => {
      const { container } = renderConsentStep({
        profiles: {
          client: { ...initialState.profiles.client, oauth_app_name: 'MyApp' },
        },
      })

      expect(container.textContent).toContain('MyApp uses MX Technologies')
    })

    it('should render without app name when not provided', () => {
      const { container } = renderConsentStep({
        profiles: {
          client: { ...initialState.profiles.client, oauth_app_name: null },
        },
      })

      expect(container.textContent).toContain('This app uses MX Technologies')
    })

    it('should render Share your data title', () => {
      renderConsentStep()

      expect(screen.getByTestId('dynamic-disclosure-title')).toHaveTextContent('Share your data')
    })

    it('should render PrivateAndSecure component', () => {
      renderConsentStep()

      expect(screen.getByText(/Private and secure/i)).toBeInTheDocument()
    })
  })

  describe('Mode-specific rendering', () => {
    it('should render AGG mode content when mode is AGG_MODE', () => {
      const { container } = renderConsentStep({ config: { mode: AGG_MODE } })

      expect(container.textContent).toContain('manage your finances')
    })

    it('should render VERIFY mode content when mode is VERIFY_MODE', () => {
      const { container } = renderConsentStep({ config: { mode: VERIFY_MODE } })

      expect(container.textContent).toContain('move money')
    })

    it('should render combined mode content when both AGG and VERIFY', () => {
      const { container } = renderConsentStep({
        config: {
          mode: AGG_MODE,
          data_request: { products: ['transactions', 'identity_verification'] },
        },
      })

      expect(container.textContent).toContain('move money and manage your finances')
    })

    it('should render AGG mode when include_transactions is true', () => {
      const { container } = renderConsentStep({ config: { include_transactions: true } })

      expect(container.textContent).toContain('manage your finances')
    })
  })

  describe('Modal interaction', () => {
    it('loads the consent screen and clicks the info button to open modal', async () => {
      const { user } = renderConsentStep()

      await user.click(await screen.findByTestId('info-button'))

      expect(await screen.findByText('Who is MX Technologies?')).toBeInTheDocument()
    })

    it('should toggle modal when info button is clicked multiple times', async () => {
      const { user } = renderConsentStep()

      const infoButton = screen.getByTestId('info-button')
      await user.click(infoButton)
      expect(screen.getByText('Who is MX Technologies?')).toBeInTheDocument()

      const closeButton = screen.getByText('Close')
      await user.click(closeButton)
      expect(screen.queryByText('Who is MX Technologies?')).not.toBeInTheDocument()
    })
  })

  describe('Consent button', () => {
    it('should have consent button disabled initially when not scrolled to bottom', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 2000,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 0,
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        writable: true,
        configurable: true,
        value: 800,
      })

      renderConsentStep()

      const consentButton = screen.getByTestId('consent-button')
      expect(consentButton).toBeDisabled()
    })

    it('should enable consent button when scrolled to bottom', async () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 200,
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        writable: true,
        configurable: true,
        value: 800,
      })

      renderConsentStep()

      window.dispatchEvent(new Event('scroll'))
      const consentButton = await screen.findByTestId('consent-button')
      expect(consentButton).not.toBeDisabled()
    })

    it('should advance to the enter credentials step when consent button is clicked', async () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 200,
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { user, store } = renderConsentStep()

      window.dispatchEvent(new Event('scroll'))

      await waitFor(() => {
        const consentButton = screen.getByTestId('consent-button')
        expect(consentButton).not.toBeDisabled()
      })

      const consentButton = screen.getByTestId('consent-button')
      await user.click(consentButton)

      const { location } = store.getState().connect
      expect(location[location.length - 1].step).toBe(STEPS.ENTER_CREDENTIALS)
    })
  })

  describe('Translation toggle', () => {
    it('should show translation link for Spanish locale', () => {
      window.app = { options: { language: 'es' } }
      vi.spyOn(Intl, 'getLocale').mockReturnValue('es')

      renderConsentStep()

      expect(screen.getByTestId('translation-button')).toBeInTheDocument()
    })

    it('should show translation link for French-Canadian locale', () => {
      window.app = { options: { language: 'fr-ca' } }
      vi.spyOn(Intl, 'getLocale').mockReturnValue('fr-ca')

      renderConsentStep()

      expect(screen.getByTestId('translation-button')).toBeInTheDocument()
    })

    it('should not show translation link for English locale', () => {
      window.app = { options: { language: 'en-us' } }
      vi.spyOn(Intl, 'getLocale').mockReturnValue('en')

      renderConsentStep()

      expect(screen.queryByTestId('translation-button')).not.toBeInTheDocument()
    })

    it('should toggle locale when translation link is clicked', async () => {
      window.app = { options: { language: 'es' } }
      const setLocaleSpy = vi.spyOn(Intl, 'setLocale')
      vi.spyOn(Intl, 'getLocale').mockReturnValue('es')

      const { user } = renderConsentStep()

      const translationButton = screen.getByTestId('translation-button')
      await user.click(translationButton)

      expect(setLocaleSpy).toHaveBeenCalledWith('en')
    })
  })

  describe('Imperative handle', () => {
    it('hands control back to the parent when the back button is triggered', async () => {
      const { navigationRef, handleConsentGoBack } = renderConsentStep()

      navigationRef.current?.handleBackButton()

      await waitFor(() => {
        expect(handleConsentGoBack).toHaveBeenCalled()
      })
    })

    it('should return true for showBackButton when institution search is not disabled', () => {
      const { navigationRef } = renderConsentStep({
        config: { disable_institution_search: false },
      })

      expect(navigationRef.current?.showBackButton()).toBe(true)
    })

    it('should return false for showBackButton when institution search is disabled', () => {
      const { navigationRef } = renderConsentStep({
        config: { disable_institution_search: true },
      })

      expect(navigationRef.current?.showBackButton()).toBe(false)
    })

    it('should restore locale when handleBackButton is called with non-English initial locale', async () => {
      window.app = { options: { language: 'es' } }
      const setLocaleSpy = vi.spyOn(Intl, 'setLocale')
      vi.spyOn(Intl, 'getLocale').mockReturnValue('en')

      const { navigationRef } = renderConsentStep()

      navigationRef.current?.handleBackButton()

      await waitFor(() => {
        expect(setLocaleSpy).toHaveBeenCalledWith('es')
      })
    })

    it('should restore locale when consent button is clicked with non-English initial locale', async () => {
      window.app = { options: { language: 'es' } }
      const setLocaleSpy = vi.spyOn(Intl, 'setLocale')
      vi.spyOn(Intl, 'getLocale').mockReturnValue('en')

      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 200,
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        writable: true,
        configurable: true,
        value: 800,
      })

      const { user } = renderConsentStep()

      window.dispatchEvent(new Event('scroll'))

      await waitFor(() => {
        const consentButton = screen.getByTestId('consent-button')
        expect(consentButton).not.toBeDisabled()
      })

      const consentButton = screen.getByTestId('consent-button')
      await user.click(consentButton)

      expect(setLocaleSpy).toHaveBeenCalledWith('es')
    })
  })

  describe('Cleanup', () => {
    it('should remove scroll event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderConsentStep()

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })
})
