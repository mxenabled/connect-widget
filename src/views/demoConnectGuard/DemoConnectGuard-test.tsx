import React from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import { DemoConnectGuard } from './DemoConnectGuard'
import { initialState } from 'src/services/mockedData'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { STEPS } from 'src/const/Connect'
import { createRenderConnectStepInitialState } from 'src/utilities/test/createRenderConnectStepInitialState'

describe('DemoConnectGuard', () => {
  const mockInstitution = {
    guid: 'INS-test-123',
    name: 'Test Bank',
    logo_url: 'https://example.com/logo.png',
    code: 'TEST',
    url: 'https://testbank.com',
  }

  const mockInitialState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      selectedInstitution: mockInstitution,
    },
  }

  it('renders all component elements correctly', () => {
    const { container } = render(<DemoConnectGuard />, { preloadedState: mockInitialState })

    expect(screen.getByText('Demo mode active')).toBeInTheDocument()
    expect(
      screen.getByText(/Live institutions are not available in the demo environment/i),
    ).toBeInTheDocument()
    expect(screen.getByText('MX Bank')).toBeInTheDocument()

    const logo = screen.getByAltText('Logo for Test Bank')
    expect(logo).toBeInTheDocument()

    const errorIcon = container.querySelector('svg.MuiSvgIcon-colorError')
    expect(errorIcon).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /return to institution selection/i })
    expect(button).toBeInTheDocument()
  })

  it('should navigate back to search when return button is clicked', async () => {
    const defaultProps = {
      availableAccountTypes: [],
      handleConsentGoBack: vi.fn(),
      handleOAuthGoBack: vi.fn(),
      handleCredentialsGoBack: vi.fn(),
      navigationRef: vi.fn(),
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

    const initialState = createRenderConnectStepInitialState(
      STEPS.DEMO_CONNECT_GUARD,
      mockInstitution as unknown as InstitutionResponseType,
    )

    const { user } = render(<RenderConnectStep {...defaultProps} />, {
      preloadedState: initialState,
    })

    const returnButton = screen.getByRole('button', { name: /return to institution selection/i })
    await user.click(returnButton)

    expect(await screen.findByText(/Select your institution/i)).toBeInTheDocument()
  })
})
