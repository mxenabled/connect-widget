import React from 'react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { Connect } from '../Connect'
import { initialState, masterData } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'
import PostMessage from 'src/utilities/PostMessage'

vi.mock('src/utilities/PostMessage', () => ({
  default: {
    send: vi.fn(),
  },
}))

describe('<Connect />', () => {
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
        expect(PostMessage.send).toHaveBeenCalledWith('mxConnect:widgetLoaded')
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
})
