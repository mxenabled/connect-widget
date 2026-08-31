import React from 'react'
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { Connect } from './Connect'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState, masterData, institutionData } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'
import { createRenderConnectStepInitialState } from 'src/utilities/test/createRenderConnectStepInitialState'

describe('<Connect />', () => {
  const mockPostMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'parent', {
      writable: true,
      configurable: true,
      value: {
        postMessage: mockPostMessage,
      },
    })
    Object.defineProperty(window, 'top', {
      writable: true,
      configurable: true,
      value: {},
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const defaultProps: ConnectProps = {
    clientConfig: {} as ClientConfigType,
    profiles: { loading: false, ...masterData },
    userFeatures: {},
    experimentalFeatures: {},
    availableAccountTypes: [] as [],
    onManualAccountAdded: vi.fn(),
    onMemberDeleted: vi.fn(),
    onSuccessfulAggregation: vi.fn(),
    onUpsertMember: vi.fn(),
    onAnalyticEvent: vi.fn(),
    onAnalyticPageview: vi.fn(),
    onShowConnectSuccessSurvey: () => {},
    onSubmitConnectSuccessSurvey: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading states', () => {
    it('displays loading spinner when component is loading', () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: true,
        },
      }

      render(<Connect {...defaultProps} />, { preloadedState })

      expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    })

    it('renders without crashing when there is a config error', () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
          loadError: {
            type: 'config',
            title: 'Configuration Error',
            message: 'This mode is not available for your account',
          },
        },
      }

      const { container } = render(<Connect {...defaultProps} />, { preloadedState })

      expect(container).toBeInTheDocument()
    })

    it('renders without crashing when there is a network error', () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
          loadError: {
            type: 'network',
            title: 'Network Error',
            message: 'Unable to connect to the server',
          },
        },
      }

      const { container } = render(<Connect {...defaultProps} />, { preloadedState })

      expect(container).toBeInTheDocument()
    })
  })

  describe('legacy Atrium API support', () => {
    it('sends legacy post message for Atrium with old ui_message_version', async () => {
      const preloadedState = {
        ...initialState,
        profiles: {
          ...initialState.profiles,
          client: {
            ...initialState.profiles.client,
            has_atrium_api: true,
          },
        },
        config: {
          ...initialState.config,
          is_mobile_webview: false,
          ui_message_version: 3,
        },
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
        },
      }

      render(<Connect {...defaultProps} />, { preloadedState })

      await waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalled()
        const callArgs = mockPostMessage.mock.calls[0]
        const messageData = JSON.parse(callArgs[0])
        expect(messageData.type).toBe('mxConnect:widgetLoaded')
      })
    })
  })

  describe('version metadata', () => {
    it('stores version prop in redux state', async () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
        },
      }

      const { store } = render(<Connect {...defaultProps} version="v1.2.3" />, { preloadedState })

      await waitFor(() => {
        expect(store.getState().app.version).toBe('v1.2.3')
      })
    })

    it('handles missing version prop', async () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
        },
      }

      const { store } = render(<Connect {...defaultProps} />, { preloadedState })

      await waitFor(() => {
        const version = store.getState().app.version
        expect(version === null || version === undefined).toBe(true)
      })
    })
  })

  describe('profiles loading', () => {
    it('loads profiles on mount', async () => {
      const customProfiles = {
        loading: false,
        ...masterData,
        client: { ...masterData.client, name: 'Custom Client Name' },
      }

      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
        },
      }

      const { store } = render(<Connect {...defaultProps} profiles={customProfiles} />, {
        preloadedState,
      })

      await waitFor(() => {
        expect(store.getState().profiles.client.name).toBe('Custom Client Name')
      })
    })
  })

  describe('renders main connect flow', () => {
    it('renders search view when on search step', async () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
          location: [{ step: STEPS.SEARCH }],
        },
      }

      render(<Connect {...defaultProps} />, { preloadedState })

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument()
      })
    })

    it('includes ConnectNavigationHeader in the rendered output', async () => {
      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
          location: [{ step: STEPS.SEARCH }],
        },
      }

      render(<Connect {...defaultProps} />, { preloadedState })

      await waitFor(() => {
        expect(document.querySelector('#connect-wrapper')).toBeInTheDocument()
      })
    })
  })

  describe('analytic context provider', () => {
    it('provides analytic callbacks to child components', async () => {
      const onAnalyticEvent = vi.fn()
      const onAnalyticPageview = vi.fn()
      const onSubmitConnectSuccessSurvey = vi.fn()

      const preloadedState = {
        ...initialState,
        connect: {
          ...initialState.connect,
          isComponentLoading: false,
          location: [{ step: STEPS.SEARCH }],
        },
      }
      render(
        <Connect
          {...defaultProps}
          onAnalyticEvent={onAnalyticEvent}
          onAnalyticPageview={onAnalyticPageview}
          onSubmitConnectSuccessSurvey={onSubmitConnectSuccessSurvey}
        />,
        { preloadedState },
      )

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument()
      })
    })
  })

  describe('Connect - Demo Connect Guard', () => {
    const defaultProps = {
      clientConfig: { current_institution_guid: 'INS-123' } as ClientConfigType,
      onShowConnectSuccessSurvey: () => undefined,
      onSubmitConnectSuccessSurvey: () => {},
      profiles: { ...masterData, loading: false },
    }

    const nonDemoInstitution = { ...institutionData.institution, is_demo: false }
    const demoInstitution = { ...institutionData.institution, is_demo: true }
    const demoUser = { ...masterData.user, is_demo: true }
    const regularUser = { ...masterData.user, is_demo: false }

    it('blocks demo user from accessing non-demo institution', async () => {
      const mockApiValue = {
        ...apiValueMock,
        loadInstitutionByGuid: vi.fn().mockResolvedValue(nonDemoInstitution),
        loadMembers: vi.fn().mockResolvedValue([]),
      }

      render(
        <Connect {...defaultProps} profiles={{ ...masterData, user: demoUser, loading: false }} />,
        { apiValue: mockApiValue },
      )

      expect(await screen.findByText(/Demo mode active/i)).toBeInTheDocument()
    })

    it('allows demo user to access demo institution', async () => {
      const mockApiValue = {
        ...apiValueMock,
        loadInstitutionByGuid: vi.fn().mockResolvedValue(demoInstitution),
        loadMembers: vi.fn().mockResolvedValue([]),
      }

      render(
        <Connect {...defaultProps} profiles={{ ...masterData, user: demoUser, loading: false }} />,
        { apiValue: mockApiValue },
      )

      expect(await screen.findByText(/Log in at Test Bank/i)).toBeInTheDocument()
      expect(screen.queryByText(/Demo mode active/i)).not.toBeInTheDocument()
    })

    it('allows regular user to access non-demo institution', async () => {
      const mockApiValue = {
        ...apiValueMock,
        loadInstitutionByGuid: vi.fn().mockResolvedValue(nonDemoInstitution),
        loadMembers: vi.fn().mockResolvedValue([]),
      }

      render(
        <Connect
          {...defaultProps}
          profiles={{ ...masterData, user: regularUser, loading: false }}
        />,
        { apiValue: mockApiValue },
      )

      expect(await screen.findByText(/Log in at Test Bank/i)).toBeInTheDocument()
      expect(screen.queryByText(/Demo mode active/i)).not.toBeInTheDocument()
    })

    describe('back button', () => {
      const props = {
        ...defaultProps,
        clientConfig: {} as ClientConfigType,
        profiles: { ...masterData, user: demoUser, loading: false },
      }
      const guardState = (steps: string[]) => {
        const base = createRenderConnectStepInitialState(
          steps[steps.length - 1],
          nonDemoInstitution,
        )
        return {
          ...base,
          connect: {
            ...base.connect,
            isComponentLoading: false,
            location: steps.map((s) => ({ step: s })),
          },
        }
      }

      it('is hidden when guard fires as the first screen', async () => {
        render(<Connect {...props} />, { preloadedState: guardState([STEPS.ENTER_CREDENTIALS]) })
        expect(await screen.findByText(/Demo mode active/i)).toBeInTheDocument()
        expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
      })

      it('navigates back to search when the previous step is search', async () => {
        const { user } = render(<Connect {...props} />, {
          preloadedState: guardState([STEPS.SEARCH, STEPS.ENTER_CREDENTIALS]),
        })
        const backButton = await screen.findByTestId('back-button')
        await user.click(backButton)
        expect(screen.queryByText('Select your institution')).toBeInTheDocument()
      })

      it('pops one step back rather than resetting to search', async () => {
        const { user } = render(<Connect {...props} />, {
          preloadedState: guardState([STEPS.SEARCH, STEPS.CONSENT, STEPS.ENTER_CREDENTIALS]),
        })
        const backButton = await screen.findByTestId('back-button')
        await user.click(backButton)
        expect(await screen.findByText(/Demo mode active/i)).toBeInTheDocument()
      })
    })
  })
})
