import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { VERIFY_MODE, STEPS } from 'src/const/Connect'
import { createRenderConnectStepInitialState } from 'src/utilities/test/createRenderConnectStepInitialState'
import { initialState } from 'src/services/mockedData'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import { ReadableStatuses } from 'src/const/Statuses'

vi.mock('react-confetti', () => ({ default: () => null }))

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

    it('should render Search view for SEARCH step', async () => {
      const state = createRenderConnectStepInitialState(STEPS.SEARCH)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(await screen.findByText('Select your institution')).toBeInTheDocument()
    })

    it('should render Connecting view for CONNECTING step', async () => {
      const state = createRenderConnectStepInitialState(STEPS.CONNECTING, mockInstitution)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(await screen.findByText('Connecting to')).toBeInTheDocument()
      expect(await screen.findByText(mockInstitution.name)).toBeInTheDocument()
    })

    it('should render Disclosure view for DISCLOSURE step', () => {
      const state = createRenderConnectStepInitialState(STEPS.DISCLOSURE)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

    it('should render InstitutionStatusDetails for INSTITUTION_STATUS_DETAILS step', () => {
      const state = createRenderConnectStepInitialState(
        STEPS.INSTITUTION_STATUS_DETAILS,
        mockInstitution,
      )

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByAltText(`Logo for ${mockInstitution.name}`)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('should render DynamicDisclosure for CONSENT step', () => {
      const state = createRenderConnectStepInitialState(STEPS.CONSENT, mockInstitution)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByRole('button', { name: /i consent/i })).toBeInTheDocument()
    })

    it('should render ManualAccountConnect for ADD_MANUAL_ACCOUNT step', () => {
      const state = createRenderConnectStepInitialState(STEPS.ADD_MANUAL_ACCOUNT)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Add account manually')).toBeInTheDocument()
    })

    it('should render MFAStep for MFA step', () => {
      const state = createRenderConnectStepInitialState(STEPS.MFA, mockInstitution)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByAltText(`${mockInstitution.name} logo`)).toBeInTheDocument()
    })

    it('should render VerifyExistingMember for VERIFY_EXISTING_MEMBER step', async () => {
      const state = createRenderConnectStepInitialState(STEPS.VERIFY_EXISTING_MEMBER)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(
        await screen.findByText(
          'Choose an institution that’s already connected and select accounts to share, or search for a different one.',
        ),
      ).toBeInTheDocument()
    })

    it('should render VerifyError for VERIFY_ERROR step', () => {
      const state = createRenderConnectStepInitialState(STEPS.VERIFY_ERROR)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
    })

    it('should render Connected for CONNECTED step', () => {
      const mockMember = { guid: 'MEM-123', name: 'Test Member' }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.CONNECTED, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.CONNECTED, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
    })

    it('should render DeleteMemberSuccess for DELETE_MEMBER_SUCCESS step', () => {
      const state = createRenderConnectStepInitialState(
        STEPS.DELETE_MEMBER_SUCCESS,
        mockInstitution,
      )

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Disconnected')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
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

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should default to SEARCH step when location is empty', () => {
      const state = {
        ...initialState,
        connect: {
          ...initialState.connect,
          location: [],
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Select your institution')).toBeInTheDocument()
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

      // An unrecognized step matches no branch and renders no view. It must not
      // crash, nor fall back to Search (which only happens when location is empty).
      expect(screen.queryByText('Select your institution')).not.toBeInTheDocument()
    })
  })

  describe('ENTER_CREDENTIALS Step Variations', () => {
    it('should render OAuthStep when the institution supports OAuth', () => {
      const oauthInstitution = {
        ...mockInstitution,
        supports_oauth: true,
        instructional_data: {},
      }
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
          oauthURL: 'https://oauth.example.com/authorize',
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Log in at Test Bank')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /go to log in/i })).toBeInTheDocument()
    })

    it('should render UpdateMemberForm (loads the member’s credentials) when updateCredentials is true', async () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution).connect,
          updateCredentials: true,
        },
      }
      const getMemberCredentials = vi.fn(apiValueMock.getMemberCredentials)
      const getInstitutionCredentials = vi.fn(apiValueMock.getInstitutionCredentials)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
        apiValue: { ...apiValueMock, getMemberCredentials, getInstitutionCredentials },
      })

      expect(await screen.findByText('Enter your credentials')).toBeInTheDocument()
      // UpdateMemberForm edits an existing member, so it loads that member's
      // credentials rather than the institution's.
      expect(getMemberCredentials).toHaveBeenCalled()
      expect(getInstitutionCredentials).not.toHaveBeenCalled()
    })

    it('should render CreateMemberForm (loads the institution’s credentials) when updateCredentials is false', async () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ENTER_CREDENTIALS, mockInstitution).connect,
          updateCredentials: false,
        },
      }
      const getMemberCredentials = vi.fn(apiValueMock.getMemberCredentials)
      const getInstitutionCredentials = vi.fn(apiValueMock.getInstitutionCredentials)

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
        apiValue: { ...apiValueMock, getMemberCredentials, getInstitutionCredentials },
      })

      expect(await screen.findByText('Enter your credentials')).toBeInTheDocument()
      // CreateMemberForm creates a new member, so it loads the institution's
      // credentials rather than an existing member's.
      expect(getInstitutionCredentials).toHaveBeenCalled()
      expect(getMemberCredentials).not.toHaveBeenCalled()
    })

    it('should render OAuthStep when the current member is OAuth', () => {
      const mockMember = { guid: 'MEM-123', name: 'Test Member', is_oauth: true }
      const oauthInstitution = { ...mockInstitution, instructional_data: {} }
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
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
          updateCredentials: false,
          oauthURL: 'https://oauth.example.com/authorize',
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(screen.getByText('Log in at Test Bank')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /go to log in/i })).toBeInTheDocument()
    })
  })

  describe('MICRODEPOSITS Step', () => {
    it('should render Microdeposits when enabled in verification mode', async () => {
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
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
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

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      // Gating: when microdeposits are not enabled, no microdeposits view renders.
      expect(screen.queryByText('Enter routing number')).not.toBeInTheDocument()
    })
  })

  describe('ACTIONABLE_ERROR Step Variations', () => {
    it('should render ActionableError when the error code can be handled', () => {
      const mockMember = {
        guid: 'MEM-123',
        name: 'Test Member',
        connection_status: ReadableStatuses.PREVENTED,
        error: { error_code: ACTIONABLE_ERROR_CODES.NO_ACCOUNTS },
      }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      // NO_ACCOUNTS is a handleable code, so the newer ActionableError view renders
      // its specific content (not the legacy LoginError fallback).
      expect(screen.getByText('No accounts found')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /return to institution selection/i }),
      ).toBeInTheDocument()
      expect(screen.queryByText('New credentials needed')).not.toBeInTheDocument()
    })

    it('should render LoginError when the error code cannot be handled', () => {
      const mockMember = {
        guid: 'MEM-123',
        name: 'Test Member',
        connection_status: ReadableStatuses.PREVENTED,
        error: { error_code: 9999 },
      }
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution),
        connect: {
          ...createRenderConnectStepInitialState(STEPS.ACTIONABLE_ERROR, mockInstitution).connect,
          currentMemberGuid: mockMember.guid,
          members: [mockMember],
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      // An unknown code falls back to the legacy LoginError, which shows the
      // member's PREVENTED status messaging instead of ActionableError content.
      expect(screen.getByText('New credentials needed')).toBeInTheDocument()
      expect(screen.queryByTestId('actionable-error-header')).not.toBeInTheDocument()
    })

    it('should render LoginError when the error is null', () => {
      const mockMember = {
        guid: 'MEM-123',
        name: 'Test Member',
        connection_status: ReadableStatuses.PREVENTED,
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

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      // No error code is also non-handleable, so it falls back to LoginError.
      expect(screen.getByText('New credentials needed')).toBeInTheDocument()
      expect(screen.queryByTestId('actionable-error-header')).not.toBeInTheDocument()
    })
  })

  describe('ADDITIONAL_PRODUCT Step', () => {
    it('should render AdditionalProductStep with valid product option', async () => {
      const state = {
        ...createRenderConnectStepInitialState(STEPS.ADDITIONAL_PRODUCT, mockInstitution),
        config: {
          ...initialState.config,
          additional_product_option: 'account_verification',
        },
      }

      render(<RenderConnectStep {...defaultProps} />, {
        preloadedState: state,
      })

      // The account_verification option renders the "add transfers and payments" offer.
      expect(await screen.findByText('Add transfers and payments?')).toBeInTheDocument()
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
