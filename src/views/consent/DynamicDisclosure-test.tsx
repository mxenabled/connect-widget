import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'
import { DynamicDisclosure } from 'src/views/consent/DynamicDisclosure'
import { initialState } from 'src/services/mockedData'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'
import { ActionTypes } from 'src/redux/actions/Connect'
import * as Animation from 'src/utilities/Animation'
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

const dispatch = vi.fn()
vi.mock('react-redux', async (importActual) => {
  const actual = await importActual<typeof import('react-redux')>()
  return {
    ...actual,
    useDispatch: () => dispatch,
  }
})

const onConsentClick = vi.fn()
const onGoBackClick = vi.fn()

const dynamicDisclosureProps = {
  onConsentClick,
  onGoBackClick,
}

const mockInstitution = {
  guid: 'INS-123',
  name: 'Test Bank',
  logo_url: 'https://example.com/logo.png',
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
    it('loads the consent screen', async () => {
      const ref = React.createRef()
      render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />)

      expect(await screen.findByTestId('dynamic-disclosure-title')).toBeInTheDocument()
      expect(await screen.findByTestId('dynamic-disclosure-p1')).toBeInTheDocument()
      expect(await screen.findByText('I consent')).toBeInTheDocument()
      expect(await screen.findByText('Account Information')).toBeInTheDocument()
    })

    it('should render with app name when provided', () => {
      const state = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            oauth_app_name: 'MyApp',
          },
        },
        connect: {
          ...initialState.connect,
          selectedInstitution: mockInstitution,
        },
      }

      const { container } = render(<DynamicDisclosure {...dynamicDisclosureProps} />, {
        preloadedState: state,
      })

      expect(container.textContent).toContain('MyApp uses MX Technologies')
    })

    it('should render without app name when not provided', () => {
      const state = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            oauth_app_name: null,
          },
        },
        connect: {
          ...initialState.connect,
          selectedInstitution: mockInstitution,
        },
      }

      const { container } = render(<DynamicDisclosure {...dynamicDisclosureProps} />, {
        preloadedState: state,
      })

      expect(container.textContent).toContain('This app uses MX Technologies')
    })

    it('should render Share your data title', () => {
      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      expect(screen.getByTestId('dynamic-disclosure-title')).toHaveTextContent('Share your data')
    })

    it('should render PrivateAndSecure component', () => {
      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      expect(screen.getByText(/Private and secure/i)).toBeInTheDocument()
    })
  })

  describe('Mode-specific rendering', () => {
    it('should render AGG mode content when mode is AGG_MODE', () => {
      const state = {
        ...initialState,
        config: {
          ...initialState.config,
          mode: AGG_MODE,
        },
        connect: {
          ...initialState.connect,
          selectedInstitution: mockInstitution,
        },
      }

      const { container } = render(<DynamicDisclosure {...dynamicDisclosureProps} />, {
        preloadedState: state,
      })

      expect(container.textContent).toContain('manage your finances')
    })

    it('should render VERIFY mode content when mode is VERIFY_MODE', () => {
      const state = {
        ...initialState,
        config: {
          ...initialState.config,
          mode: VERIFY_MODE,
        },
        connect: {
          ...initialState.connect,
          selectedInstitution: mockInstitution,
        },
      }

      const { container } = render(<DynamicDisclosure {...dynamicDisclosureProps} />, {
        preloadedState: state,
      })

      expect(container.textContent).toContain('move money')
    })

    it('should render combined mode content when both AGG and VERIFY', () => {
      const state = {
        ...initialState,
        config: {
          ...initialState.config,
          mode: AGG_MODE,
          data_request: {
            products: ['transactions', 'identity_verification'],
          },
        },
        connect: {
          ...initialState.connect,
          selectedInstitution: mockInstitution,
        },
      }

      const { container } = render(<DynamicDisclosure {...dynamicDisclosureProps} />, {
        preloadedState: state,
      })

      expect(container.textContent).toContain('move money and manage your finances')
    })

    it('should render AGG mode when include_transactions is true', () => {
      const state = {
        ...initialState,
        config: {
          ...initialState.config,
          include_transactions: true,
        },
        connect: {
          ...initialState.connect,
          selectedInstitution: mockInstitution,
        },
      }

      const { container } = render(<DynamicDisclosure {...dynamicDisclosureProps} />, {
        preloadedState: state,
      })

      expect(container.textContent).toContain('manage your finances')
    })
  })

  describe('Modal interaction', () => {
    it('loads the consent screen and clicks the info button to open modal', async () => {
      const ref = React.createRef()
      const { user } = render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />)

      await user.click(await screen.findByTestId('info-button'))

      expect(await screen.findByText('Who is MX Technologies?')).toBeInTheDocument()
    })

    it('should toggle modal when info button is clicked multiple times', async () => {
      const { user } = render(<DynamicDisclosure {...dynamicDisclosureProps} />)

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

      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

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

      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      window.dispatchEvent(new Event('scroll'))
      const consentButton = await screen.findByTestId('consent-button')
      expect(consentButton).not.toBeDisabled()
    })

    it('should dispatch USER_CONSENTED action when consent button is clicked', async () => {
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

      const { user } = render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      window.dispatchEvent(new Event('scroll'))

      await waitFor(() => {
        const consentButton = screen.getByTestId('consent-button')
        expect(consentButton).not.toBeDisabled()
      })

      const consentButton = screen.getByTestId('consent-button')
      await user.click(consentButton)

      expect(dispatch).toHaveBeenCalledWith({ type: ActionTypes.USER_CONSENTED })
    })
  })

  describe('Translation toggle', () => {
    it('should show translation link for Spanish locale', () => {
      window.app = { options: { language: 'es' } }
      vi.spyOn(Intl, 'getLocale').mockReturnValue('es')

      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      expect(screen.getByTestId('translation-button')).toBeInTheDocument()
    })

    it('should show translation link for French-Canadian locale', () => {
      window.app = { options: { language: 'fr-ca' } }
      vi.spyOn(Intl, 'getLocale').mockReturnValue('fr-ca')

      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      expect(screen.getByTestId('translation-button')).toBeInTheDocument()
    })

    it('should not show translation link for English locale', () => {
      window.app = { options: { language: 'en-us' } }
      vi.spyOn(Intl, 'getLocale').mockReturnValue('en')

      render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      expect(screen.queryByTestId('translation-button')).not.toBeInTheDocument()
    })

    it('should toggle locale when translation link is clicked', async () => {
      window.app = { options: { language: 'es' } }
      const setLocaleSpy = vi.spyOn(Intl, 'setLocale')
      vi.spyOn(Intl, 'getLocale').mockReturnValue('es')

      const { user } = render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      const translationButton = screen.getByTestId('translation-button')
      await user.click(translationButton)

      expect(setLocaleSpy).toHaveBeenCalledWith('en')
    })
  })

  describe('Imperative handle', () => {
    it('should call fadeOut and onGoBackClick when handleBackButton is called', async () => {
      const ref = React.createRef<{ handleBackButton: () => void }>()
      render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />)

      ref.current?.handleBackButton()

      await waitFor(() => {
        expect(Animation.fadeOut).toHaveBeenCalled()
        expect(onGoBackClick).toHaveBeenCalled()
      })
    })

    it('should return true for showBackButton when institution search is not disabled', () => {
      const state = {
        ...initialState,
        config: {
          ...initialState.config,
          disable_institution_search: false,
        },
      }

      const ref = React.createRef<{ showBackButton: () => boolean }>()
      render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />, { preloadedState: state })

      expect(ref.current?.showBackButton()).toBe(true)
    })

    it('should return false for showBackButton when institution search is disabled', () => {
      const state = {
        ...initialState,
        config: {
          ...initialState.config,
          disable_institution_search: true,
        },
      }

      const ref = React.createRef<{ showBackButton: () => boolean }>()
      render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />, { preloadedState: state })

      expect(ref.current?.showBackButton()).toBe(false)
    })

    it('should restore locale when handleBackButton is called with non-English initial locale', async () => {
      window.app = { options: { language: 'es' } }
      const setLocaleSpy = vi.spyOn(Intl, 'setLocale')
      vi.spyOn(Intl, 'getLocale').mockReturnValue('en')

      const ref = React.createRef<{ handleBackButton: () => void }>()
      render(<DynamicDisclosure {...dynamicDisclosureProps} ref={ref} />)

      ref.current?.handleBackButton()

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

      const { user } = render(<DynamicDisclosure {...dynamicDisclosureProps} />)

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

      const { unmount } = render(<DynamicDisclosure {...dynamicDisclosureProps} />)

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    })
  })
})
