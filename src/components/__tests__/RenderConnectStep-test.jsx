import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { STEPS } from 'src/const/Connect'

describe('RenderConnectStep', () => {
  const defaultProps = {
    availableAccountTypes: [],
    handleConsentGoBack: vi.fn(),
    handleCredentialsGoBack: vi.fn(),
    navigationRef: React.createRef(),
    onManualAccountAdded: vi.fn(),
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

  const createInitialState = (step) => ({
    browser: {
      height: 768,
      width: 1024,
      size: 'large',
    },
    connect: {
      location: [{ step }],
      selectedInstitution: mockInstitution,
      updateCredentials: false,
      error: null,
    },
    config: {
      mode: 'aggregation',
      initialConfig: {},
    },
    profiles: {
      client: { has_atrium_api: false },
      clientProfile: {
        uses_oauth: false,
        account_verification_is_enabled: true,
        is_microdeposits_enabled: true,
      },
      widgetProfile: {
        enable_support_requests: true,
        show_microdeposits_in_connect: false,
        display_delete_option_in_connect: true,
      },
    },
  })

  it('should render DemoConnectGuard when step is DEMO_CONNECT_GUARD', () => {
    const initialState = createInitialState(STEPS.DEMO_CONNECT_GUARD)

    const { container } = render(<RenderConnectStep {...defaultProps} />, {
      preloadedState: initialState,
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
})
