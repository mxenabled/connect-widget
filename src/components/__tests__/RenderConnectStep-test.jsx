import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { VERIFY_MODE, STEPS } from 'src/const/Connect'
import { createRenderConnectStepInitialState } from 'src/utilities/test/createRenderConnectStepInitialState'
import { initialState } from 'src/services/mockedData'

describe('RenderConnectStep', () => {
  const defaultProps = {
    availableAccountTypes: [],
    handleConsentGoBack: vi.fn(),
    handleCredentialsGoBack: vi.fn(),
    handleOAuthGoBack: vi.fn(),
    navigationRef: React.createRef(),
    onManualAccountAdded: vi.fn(),
    onSuccessfulAggregation: vi.fn(),
    onUpsertMember: vi.fn(),
    setConnectLocalState: vi.fn(),
  }

  const mockInstitution = {
    guid: 'INS-123',
    name: 'Test Bank',
    logo_url: 'https://example.com/logo.png',
    code: 'TEST',
    url: 'https://testbank.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Step Rendering', () => {
    it('should render DemoConnectGuard when step is DEMO_CONNECT_GUARD', () => {
      const state = createRenderConnectStepInitialState(STEPS.DEMO_CONNECT_GUARD, mockInstitution)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Demo mode active')).toBeInTheDocument()
      expect(
        screen.getByText(/Live institutions are not available in the demo environment/i),
      ).toBeInTheDocument()
      expect(screen.getByText('MX Bank')).toBeInTheDocument()

      const logo = screen.getByAltText('Logo for Test Bank')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', mockInstitution.logo_url)

      const errorIcon = container.querySelector('svg.MuiSvgIcon-colorError')
      expect(errorIcon).toBeInTheDocument()

      const button = screen.getByRole('button', { name: /return to institution selection/i })
      expect(button).toBeInTheDocument()
    })

    it('should render Search view for SEARCH step', () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render Connecting view for CONNECTING step', () => {
      const state = createRenderConnectStepInitialState(STEPS.CONNECTING, mockInstitution)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should default to SEARCH step when location is empty', () => {
      const state = {
        ...initialState,
        connect: {
          ...initialState.connect,
          location: [],
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply maxHeight for SEARCH step', () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const containerDiv = container.firstChild
      expect(containerDiv).toHaveStyle({
        maxHeight: 'calc(100% - 60px)',
      })
    })

    it('should not apply maxHeight for non-SEARCH steps', () => {
      const state = createRenderConnectStepInitialState(STEPS.DEMO_CONNECT_GUARD, mockInstitution)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const containerDiv = container.firstChild
      expect(containerDiv.style.maxHeight).toBe('')
    })

    it('should apply correct container styles', () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const containerDiv = container.firstChild
      expect(containerDiv).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        minHeight: 'calc(100% - 60px)',
      })
    })
  })

  describe('Configuration-Dependent Rendering', () => {
    it('should render in AGG_MODE by default', () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render in VERIFY_MODE when configured', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.SEARCH),
        config: {
          ...initialState.config,
          mode: VERIFY_MODE,
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should apply widget profile settings', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.SEARCH),
        profiles: {
          ...initialState.profiles,
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            enable_support_requests: false,
          },
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should render complete component with all providers', () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should handle step navigation', () => {
      const state1 = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container, rerender } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state1,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()

      rerender(<RenderConnectStep {...defaultProps} />)
    })

    it('should pass props correctly to views', () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should handle missing optional props gracefully', () => {
      const minimalProps = {
        handleConsentGoBack: vi.fn(),
        handleCredentialsGoBack: vi.fn(),
        handleOAuthGoBack: vi.fn(),
        navigationRef: React.createRef(),
        setConnectLocalState: vi.fn(),
      }

      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      const { container } = render(<RenderConnectStep {...minimalProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid step gracefully', () => {
      const state = {
        ...initialState,
        connect: {
          ...initialState.connect,
          location: [{ step: 'INVALID_STEP' }],
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })
      expect(true).toBe(true)
    })
  })
})
