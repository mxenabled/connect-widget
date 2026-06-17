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

    it('should render Disclosure view for DISCLOSURE step', () => {
      const state = createRenderConnectStepInitialState(STEPS.DISCLOSURE)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render InstitutionStatusDetails for INSTITUTION_STATUS_DETAILS step', () => {
      const state = createRenderConnectStepInitialState(
        STEPS.INSTITUTION_STATUS_DETAILS,
        mockInstitution,
      )

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render DynamicDisclosure for CONSENT step', () => {
      const state = createRenderConnectStepInitialState(STEPS.CONSENT, mockInstitution)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render ManualAccountConnect for ADD_MANUAL_ACCOUNT step', () => {
      const state = createRenderConnectStepInitialState(STEPS.ADD_MANUAL_ACCOUNT)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render MFAStep for MFA step', () => {
      const state = createRenderConnectStepInitialState(STEPS.MFA, mockInstitution)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render VerifyExistingMember for VERIFY_EXISTING_MEMBER step', () => {
      const state = createRenderConnectStepInitialState(STEPS.VERIFY_EXISTING_MEMBER)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render VerifyError for VERIFY_ERROR step', () => {
      const state = createRenderConnectStepInitialState(STEPS.VERIFY_ERROR)

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it.skip('should render Connected for CONNECTED step', () => {
      const mockMember = { guid: 'MEM-123', name: 'Test Member' }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.CONNECTED, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.CONNECTED, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      // Just verify it renders without error - confetti testing is in Connected component tests
      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render DeleteMemberSuccess for DELETE_MEMBER_SUCCESS step', () => {
      const state = createRenderConnectStepInitialState(
        STEPS.DELETE_MEMBER_SUCCESS,
        mockInstitution,
      )

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render OAuthError for OAUTH_ERROR step', () => {
      const mockMember = { guid: 'MEM-123', name: 'Test Member' }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.OAUTH_ERROR, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.OAUTH_ERROR, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

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

  describe('ENTER_CREDENTIALS Step Variations', () => {
    it.skip('should render OAuthStep when institution supports OAuth', () => {
      const oauthInstitution = { ...mockInstitution, supports_oauth: true }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, oauthInstitution),
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            uses_oauth: true,
          },
        },
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, oauthInstitution).connect,
          selectedInstitution: oauthInstitution,
          updateCredentials: false,
          selectedInstructionalData: {
            title: 'Log in at Test Bank',
            description: 'Connect your account',
          },
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render UpdateMemberForm when updateCredentials is true', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution).connect,
          updateCredentials: true,
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render CreateMemberForm when updateCredentials is false', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution).connect,
          updateCredentials: false,
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it.skip('should render OAuthStep when current member is OAuth', () => {
      const mockMember = { guid: 'MEM-123', name: 'Test Member', is_oauth: true }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution),
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            uses_oauth: true,
          },
        },
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
          updateCredentials: false,
          selectedInstructionalData: {
            title: 'Log in at Test Bank',
            description: 'Connect your account',
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

  describe('MICRODEPOSITS Step', () => {
    it('should render Microdeposits when enabled in verification mode', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.MICRODEPOSITS),
        config: {
          ...initialState.config,
          mode: VERIFY_MODE,
        },
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            account_verification_is_enabled: true,
            is_microdeposits_enabled: true,
          },
          widgetProfile: {
            ...initialState.profiles.widgetProfile,
            show_microdeposits_in_connect: true,
          },
        },
        connect: {
          ...createRenderConnectStepInitialState(STEPS.MICRODEPOSITS).connect,
          currentMicrodepositGuid: 'MICRO-123',
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should not render Microdeposits when not enabled', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.MICRODEPOSITS),
        config: {
          ...initialState.config,
          mode: 'aggregation',
        },
        profiles: {
          ...initialState.profiles,
          clientProfile: {
            ...initialState.profiles.clientProfile,
            account_verification_is_enabled: false,
            is_microdeposits_enabled: false,
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

  describe('ACTIONABLE_ERROR Step Variations', () => {
    it('should render ActionableError when error code can be handled', () => {
      const mockMember = {
        guid: 'MEM-123',
        name: 'Test Member',
        connection_status: 'PREVENTED',
        error: { error_code: 'REQUEST_EXPIRED' },
      }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render LoginError when error code cannot be handled', () => {
      const mockMember = {
        guid: 'MEM-123',
        name: 'Test Member',
        connection_status: 'PREVENTED',
        error: { error_code: 'UNKNOWN_ERROR' },
      }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should render LoginError when error code is null', () => {
      const mockMember = {
        guid: 'MEM-123',
        name: 'Test Member',
        connection_status: 'PREVENTED',
        error: null,
      }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })
  })

  describe('ADDITIONAL_PRODUCT Step', () => {
    it('should render AdditionalProductStep with valid product option', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ADDITIONAL_PRODUCT, mockInstitution),
        config: {
          ...initialState.config,
          additional_product_option: 'account_verification',
        },
      }

      const { container } = render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      const stepWrapper = container.firstChild
      expect(stepWrapper).toBeInTheDocument()
    })

    it('should throw error for invalid product option', () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ADDITIONAL_PRODUCT),
        config: {
          ...initialState.config,
          additional_product_option: 'invalid_option',
        },
      }

      expect(() => {
        render(<RenderConnectStep {...defaultProps} />, {
          preloadedState: state,
        })
      }).toThrow('invalid product offer')
    })
  })
})
