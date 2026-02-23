import React from 'react'
import { screen, render, waitFor } from 'src/utilities/testingLibrary'
import { RoutingNumber } from 'src/views/microdeposits/RoutingNumber'
import { initialState } from 'src/services/mockedData'
import { BLOCKED_REASONS } from 'src/views/microdeposits/const'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

describe('RoutingNumber', () => {
  let props
  let onPostMessage

  beforeEach(() => {
    onPostMessage = vi.fn()
    props = {
      accountDetails: {},
      onContinue: vi.fn(),
      setShowSharedRoutingNumber: vi.fn(),
      stepToIAV: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the routing number form with correct header', async () => {
      render(<RoutingNumber {...props} />)

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
      expect(screen.getByLabelText('Routing number *')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Continue to confirm details' }),
      ).toBeInTheDocument()
    })

    it('auto-focuses the routing number input field', async () => {
      render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await waitFor(() => {
        expect(input).toHaveFocus()
      })
    })

    it('shows help finding routing number link', async () => {
      render(<RoutingNumber {...props} />)

      expect(await screen.findByText('Help finding your routing number')).toBeInTheDocument()
    })

    it('shows required field note', async () => {
      render(<RoutingNumber {...props} />)

      expect(await screen.findByText('Required')).toBeInTheDocument()
    })

    it('pre-populates routing number from accountDetails', async () => {
      const propsWithAccountDetails = {
        ...props,
        accountDetails: { routing_number: '123456789' },
      }
      render(<RoutingNumber {...propsWithAccountDetails} />)

      const input = await screen.findByTestId('routing-number-input')
      expect(input.value).toBe('123456789')
    })
  })

  describe('Form Validation', () => {
    it('shows error when routing number is empty and form is submitted', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const submitButton = await screen.findByRole('button', {
        name: 'Continue to confirm details',
      })
      await user.click(submitButton)

      const input = screen.getByTestId('routing-number-input')
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Routing number is required')[0]).toBeInTheDocument()
    })

    it('shows error when routing number is not 9 characters', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '12345')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Routing number must be 9 characters')[0]).toBeInTheDocument()
    })

    it('shows error when routing number contains non-digit characters', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '12345abc9')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Routing number must only contain digits')[0]).toBeInTheDocument()
    })

    it('focuses on routing number input when validation error occurs', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '12345')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveFocus()
      })
    })
  })

  describe('Success Cases - Valid Routing Number (Not Blocked)', () => {
    it('calls onContinue with account details when routing number is valid and not blocked', async () => {
      const verifyRoutingNumber = vi.fn().mockResolvedValue({})
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(verifyRoutingNumber).toHaveBeenCalledWith('123456789', false)
        expect(props.onContinue).toHaveBeenCalledWith({
          routing_number: '123456789',
        })
      })
    })

    it('calls onContinue with merged account details when existing details are present', async () => {
      const verifyRoutingNumber = vi.fn().mockResolvedValue({})
      const propsWithDetails = {
        ...props,
        accountDetails: {
          account_number: '987654321',
          account_type: 1,
        },
      }
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...propsWithDetails} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(props.onContinue).toHaveBeenCalledWith({
          account_number: '987654321',
          account_type: 1,
          routing_number: '123456789',
        })
      })
    })

    it('passes includeIdentity flag to verifyRoutingNumber when enabled', async () => {
      const verifyRoutingNumber = vi.fn().mockResolvedValue({})
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            config: {
              ...initialState.config,
              include_identity: true,
            },
          },
        },
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(verifyRoutingNumber).toHaveBeenCalledWith('123456789', true)
      })
    })

    it('shows "Verifying..." text on button while submitting', async () => {
      let resolveVerify
      const verifyRoutingNumber = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveVerify = resolve
          }),
      )
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Checking...')).toBeInTheDocument()
      })

      resolveVerify({})
    })

    it('disables input and button while submitting', async () => {
      let resolveVerify
      const verifyRoutingNumber = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveVerify = resolve
          }),
      )
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toBeDisabled()
        expect(submitButton).toBeDisabled()
      })

      resolveVerify({})
    })
  })

  describe('Blocked Routing Number Cases', () => {
    it('shows error message when routing number is blocked', async () => {
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.BLOCKED,
          reason_name: 'BLOCKED',
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            config: {
              ...initialState.config,
            },
          },
        },
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      const errorMessages = screen.getAllByText(
        'Institution is not supported for microdeposit verification.',
      )
      expect(errorMessages.length).toBeGreaterThan(0)
      expect(errorMessages[0]).toBeInTheDocument()
    })

    it('sends post message when routing number is blocked', async () => {
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.CLIENT_BLOCKED,
          reason_name: 'CLIENT_BLOCKED',
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
            <RoutingNumber {...props} />
          </ApiProvider>
        </PostMessageContext.Provider>,
        {
          preloadedState: {
            ...initialState,
            config: {
              ...initialState.config,
            },
          },
        },
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      const errorMessages = screen.getAllByText(
        'Institution is not supported for microdeposit verification.',
      )
      expect(errorMessages.length).toBeGreaterThan(0)
      expect(errorMessages[0]).toBeInTheDocument()

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/blockedRoutingNumber', {
        routing_number: '123456789',
        reason: 'CLIENT_BLOCKED',
      })
    })

    it('continues with microdeposit flow when IAV_PREFERRED but no institutions found', async () => {
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.IAV_PREFERRED,
          reason_name: BLOCKED_REASONS.IAV_PREFERRED,
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const loadInstitutions = vi.fn().mockResolvedValue([])

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber, loadInstitutions }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(verifyRoutingNumber).toHaveBeenCalledWith('123456789', false)
      })

      await waitFor(() => {
        expect(loadInstitutions).toHaveBeenCalledWith({
          routing_number: '123456789',
          account_verification_is_enabled: true,
          account_identification_is_enabled: false,
        })
      })

      await waitFor(() => {
        expect(props.onContinue).toHaveBeenCalledWith({
          routing_number: '123456789',
        })
      })
    })

    it('shows SharedRoutingNumber when IAV_PREFERRED and institutions are found', async () => {
      const institutions = [
        {
          guid: 'INS-123',
          name: 'Test Bank 1',
          code: 'test_bank_1',
          url: 'https://testbank1.com',
        },
        {
          guid: 'INS-456',
          name: 'Test Bank 2',
          code: 'test_bank_2',
          url: 'https://testbank2.com',
        },
      ]
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.IAV_PREFERRED,
          reason_name: BLOCKED_REASONS.IAV_PREFERRED,
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const loadInstitutions = vi.fn().mockResolvedValue(institutions)

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber, loadInstitutions }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(verifyRoutingNumber).toHaveBeenCalledWith('123456789', false)
      })

      await waitFor(() => {
        expect(loadInstitutions).toHaveBeenCalled()
      })

      expect(await screen.findByText('Select how to connect your account')).toBeInTheDocument()
    })

    it('calls loadInstitutions with include_identity flag when enabled', async () => {
      const institutions = [
        {
          guid: 'INS-123',
          name: 'Test Bank 1',
          code: 'test_bank_1',
        },
      ]
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.IAV_PREFERRED,
          reason_name: BLOCKED_REASONS.IAV_PREFERRED,
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const loadInstitutions = vi.fn().mockResolvedValue(institutions)

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber, loadInstitutions }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            config: {
              ...initialState.config,
              include_identity: true,
            },
          },
        },
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(verifyRoutingNumber).toHaveBeenCalledWith('123456789', true)
      })

      await waitFor(() => {
        expect(loadInstitutions).toHaveBeenCalledWith({
          routing_number: '123456789',
          account_verification_is_enabled: true,
          account_identification_is_enabled: true,
        })
      })
    })
  })

  describe('API Error Handling', () => {
    it('shows error message when verifyRoutingNumber API call fails', async () => {
      const verifyRoutingNumber = vi.fn().mockRejectedValue({
        response: { status: 500 },
      })

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(
        screen.getAllByText('Unable to proceed. Please try again later. Error: 500')[0],
      ).toBeInTheDocument()
    })

    it('shows error with UNKNOWN status when error response has no status', async () => {
      const verifyRoutingNumber = vi.fn().mockRejectedValue({})

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(
        screen.getAllByText('Unable to proceed. Please try again later. Error: UNKNOWN')[0],
      ).toBeInTheDocument()
    })

    it('re-enables form after API error', async () => {
      const verifyRoutingNumber = vi.fn().mockRejectedValue({
        response: { status: 500 },
      })

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Navigation', () => {
    it('shows FindAccountInfo when help link is clicked', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const helpLink = await screen.findByText('Help finding your routing number')
      await user.click(helpLink)

      expect(await screen.findByText('Find your routing number')).toBeInTheDocument()
      expect(screen.getByText('Mobile app or online portal')).toBeInTheDocument()
    })

    it('returns to routing number form when FindAccountInfo is closed', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const helpLink = await screen.findByText('Help finding your routing number')
      await user.click(helpLink)

      const closeButton = await screen.findByRole('button', { name: 'Continue' })
      await user.click(closeButton)

      await waitFor(() => {
        expect(screen.getByText('Enter routing number')).toBeInTheDocument()
      })
    })

    it('renders SharedRoutingNumber component when institutions are found', async () => {
      const institutions = [
        {
          guid: 'INS-123',
          name: 'Test Bank 1',
          code: 'test_bank_1',
        },
      ]
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.IAV_PREFERRED,
          reason_name: BLOCKED_REASONS.IAV_PREFERRED,
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const loadInstitutions = vi.fn().mockResolvedValue(institutions)

      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber, loadInstitutions }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Select how to connect your account')).toBeInTheDocument()
      })

      expect(screen.getByText('Instant')).toBeInTheDocument()
      expect(screen.getByText('2-3 days')).toBeInTheDocument()
      expect(screen.getByText('Test Bank 1')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('associates error message with input using aria-describedby', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '12345')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby', 'routingNumber-error')
      })
    })

    it('announces validation errors to screen readers via AriaLive', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '12345')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      const ariaLiveRegion = document.querySelector('[aria-live="assertive"]')
      await waitFor(() => {
        expect(ariaLiveRegion).toHaveTextContent('Routing number must be 9 characters')
      })
    })

    it('announces routing blocked errors to screen readers via AriaLive', async () => {
      const blockedResponse = {
        blocked_routing_number: {
          guid: 'BLK-123',
          reason: BLOCKED_REASONS.BLOCKED,
          reason_name: 'BLOCKED',
        },
      }
      const verifyRoutingNumber = vi.fn().mockResolvedValue(blockedResponse)
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      const ariaLiveRegions = document.querySelectorAll('[aria-live="assertive"]')
      await waitFor(() => {
        const hasMessage = Array.from(ariaLiveRegions).some((region) =>
          region.textContent.includes(
            'Institution is not supported for microdeposit verification.',
          ),
        )
        expect(hasMessage).toBe(true)
      })
    })
  })

  describe('Form Interaction', () => {
    it('allows user to change routing number value', async () => {
      const { user } = render(<RoutingNumber {...props} />)

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')
      expect(input.value).toBe('123456789')

      await user.clear(input)
      await user.type(input, '987654321')
      expect(input.value).toBe('987654321')
    })

    it('handles form submission correctly', async () => {
      const verifyRoutingNumber = vi.fn().mockResolvedValue({})
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      await user.type(input, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(verifyRoutingNumber).toHaveBeenCalled()
        expect(props.onContinue).toHaveBeenCalled()
      })
    })

    it('clears validation errors when valid input is entered and resubmitted', async () => {
      const verifyRoutingNumber = vi.fn().mockResolvedValue({})
      const { user } = render(
        <ApiProvider apiValue={{ ...apiValueMock, verifyRoutingNumber }}>
          <RoutingNumber {...props} />
        </ApiProvider>,
      )

      const input = await screen.findByTestId('routing-number-input')
      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })

      // Submit with invalid input
      await user.type(input, '12345')
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Routing number must be 9 characters')[0]).toBeInTheDocument()

      // Fix input and resubmit
      await user.clear(input)
      await user.type(input, '123456789')
      await user.click(submitButton)

      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid', 'true')
      })
    })
  })
})
