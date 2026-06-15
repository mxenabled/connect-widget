import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { ManualAccountForm } from '../ManualAccountForm'
import { AccountTypes } from 'src/views/manualAccount/constants'
import { initialState } from 'src/services/mockedData'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

describe('<ManualAccountForm />', () => {
  const mockHandleSuccess = vi.fn()
  const mockSetShowDayPicker = vi.fn()
  const mockApi: ApiContextTypes = {
    createAccount: vi.fn(() =>
      Promise.resolve({
        guid: 'ACT-123',
        member_guid: 'MBR-123',
        institution_guid: 'INS-MANUAL-123',
      }),
    ),
    loadMemberByGuid: vi.fn(() => Promise.resolve({ guid: 'MBR-123' })),
    loadInstitutionByGuid: vi.fn(() => Promise.resolve({ guid: 'INS-MANUAL-123' })),
  } as unknown as ApiContextTypes

  const defaultProps = {
    accountType: AccountTypes.CHECKING,
    handleSuccess: mockHandleSuccess,
    setShowDayPicker: mockSetShowDayPicker,
    showDayPicker: false,
  }

  const preloadedState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      members: [],
    },
  }

  const renderWithContext = (props = defaultProps, apiValue = mockApi, state = preloadedState) => {
    const ref = React.createRef<HTMLInputElement>()
    return render(
      <ApiProvider apiValue={apiValue}>
        <ManualAccountForm {...props} ref={ref} />
      </ApiProvider>,
      {
        preloadedState: state,
      },
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Content Display', () => {
    it('renders the account type header', () => {
      renderWithContext()

      expect(screen.getByTestId('manual-account-form-header')).toHaveTextContent('Checking')
    })

    it('renders different account type headers correctly', () => {
      const savingsProps = { ...defaultProps, accountType: AccountTypes.SAVINGS }
      renderWithContext(savingsProps)

      expect(screen.getByTestId('manual-account-form-header')).toHaveTextContent('Savings')
    })

    it('renders account name field', () => {
      renderWithContext()

      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument()
    })

    it('renders account balance field', () => {
      renderWithContext()

      expect(screen.getByLabelText(/account balance/i)).toBeInTheDocument()
    })

    it('renders required field note', () => {
      renderWithContext()

      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })

    it('renders save button', () => {
      renderWithContext()

      expect(screen.getByTestId('save-manual-account-button')).toHaveTextContent('Save')
    })
  })

  describe('Account Type Specific Fields', () => {
    it('renders credit limit field for credit card accounts', () => {
      const creditCardProps = { ...defaultProps, accountType: AccountTypes.CREDIT_CARD }
      renderWithContext(creditCardProps)

      expect(screen.getByLabelText(/credit limit/i)).toBeInTheDocument()
    })

    it('renders minimum payment field for credit card accounts', () => {
      const creditCardProps = { ...defaultProps, accountType: AccountTypes.CREDIT_CARD }
      renderWithContext(creditCardProps)

      expect(screen.getByLabelText(/minimum payment/i)).toBeInTheDocument()
    })

    it('renders day payment is due field for credit card accounts', () => {
      const creditCardProps = { ...defaultProps, accountType: AccountTypes.CREDIT_CARD }
      renderWithContext(creditCardProps)

      expect(screen.getByLabelText(/day of the month payment is due/i)).toBeInTheDocument()
    })

    it('renders interest rate field for loan accounts', () => {
      const loanProps = { ...defaultProps, accountType: AccountTypes.LOAN }
      renderWithContext(loanProps)

      expect(screen.getByLabelText(/interest rate/i)).toBeInTheDocument()
    })

    it('does not render credit limit for checking accounts', () => {
      renderWithContext()

      expect(screen.queryByLabelText(/credit limit/i)).not.toBeInTheDocument()
    })
  })

  describe('Personal/Business Selection', () => {
    it('renders personal and business selection boxes for checking accounts', () => {
      renderWithContext()

      expect(screen.getByText('Personal')).toBeInTheDocument()
      expect(screen.getByText('Business')).toBeInTheDocument()
    })

    it('selects personal by default', () => {
      renderWithContext()

      const personalRadio = screen.getByLabelText('Personal')
      expect(personalRadio).toBeChecked()
    })

    it('allows switching to business', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByLabelText('Business'))

      expect(screen.getByLabelText('Business')).toBeChecked()
      expect(screen.getByLabelText('Personal')).not.toBeChecked()
    })

    it('allows switching back to personal', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByLabelText('Business'))
      await user.click(screen.getByLabelText('Personal'))

      expect(screen.getByLabelText('Personal')).toBeChecked()
      expect(screen.getByLabelText('Business')).not.toBeChecked()
    })
  })

  describe('Day Picker', () => {
    it('shows day picker when showDayPicker is true', () => {
      const dayPickerProps = { ...defaultProps, showDayPicker: true }
      renderWithContext(dayPickerProps)

      expect(screen.getByText('Payment due day')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-form-header')).not.toBeInTheDocument()
    })

    it('opens day picker when clicking day payment field', async () => {
      const creditCardProps = { ...defaultProps, accountType: AccountTypes.CREDIT_CARD }
      const { user } = renderWithContext(creditCardProps)

      await user.click(screen.getByLabelText(/day of the month payment is due/i))

      expect(mockSetShowDayPicker).toHaveBeenCalledWith(true)
    })

    it('closes day picker when back button is clicked', async () => {
      const dayPickerProps = { ...defaultProps, showDayPicker: true }
      const { user } = renderWithContext(dayPickerProps)

      await user.click(screen.getByTestId('back-button'))

      expect(mockSetShowDayPicker).toHaveBeenCalledWith(false)
    })

    it('selects day and closes picker when day is selected', async () => {
      const dayPickerProps = { ...defaultProps, showDayPicker: true }
      const { user } = renderWithContext(dayPickerProps)

      await user.click(screen.getByTestId('date-picker-button-15'))

      expect(mockSetShowDayPicker).toHaveBeenCalledWith(false)
    })
  })

  describe('Form Validation', () => {
    it('allows submission when account name is filled', async () => {
      const { user } = renderWithContext()

      await user.type(screen.getByLabelText(/account name/i), 'My Checking Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockApi.createAccount).toHaveBeenCalled()
      })
    })

    it('does not show errors before form submission', () => {
      renderWithContext()

      expect(screen.queryByText(/is required/i)).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('calls createAccount API with correct data', async () => {
      const { user } = renderWithContext()

      await user.type(screen.getByLabelText(/account name/i), 'Test Account')
      await user.type(screen.getByLabelText(/account balance/i), '1000')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockApi.createAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            user_name: 'Test Account',
            balance: '1000',
            account_type: AccountTypes.CHECKING,
            is_personal: true,
          }),
        )
      })
    })

    it('submits with business type when business is selected', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByLabelText('Business'))
      await user.type(screen.getByLabelText(/account name/i), 'Business Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockApi.createAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            is_personal: false,
          }),
        )
      })
    })

    it('calls handleSuccess after successful save', async () => {
      const { user } = renderWithContext()

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockHandleSuccess).toHaveBeenCalled()
      })
    })

    it('loads member and institution when no manual members exist', async () => {
      const { user } = renderWithContext()

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith('MBR-123', 'en')
        expect(mockApi.loadInstitutionByGuid).toHaveBeenCalledWith('INS-MANUAL-123')
      })
    })

    it('does not load member and institution when manual member already exists', async () => {
      const stateWithManualMember = {
        ...preloadedState,
        connect: {
          ...preloadedState.connect,
          members: [{ institution_guid: 'INS-MANUAL-456' }],
        },
      } as typeof preloadedState

      const { user } = renderWithContext(defaultProps, mockApi, stateWithManualMember)

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockHandleSuccess).toHaveBeenCalled()
      })

      expect(mockApi.loadMemberByGuid).not.toHaveBeenCalled()
      expect(mockApi.loadInstitutionByGuid).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('shows error message when account creation fails', async () => {
      const failingApi = {
        ...mockApi,
        createAccount: vi.fn(() => Promise.reject(new Error('Network error'))),
      } as unknown as ApiContextTypes

      const { user } = renderWithContext(defaultProps, failingApi)

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByTestId('something-went-wrong-text')).toHaveTextContent(
          'Please try saving your account again.',
        )
      })
    })

    it('re-enables save button after error', async () => {
      const failingApi = {
        ...mockApi,
        createAccount: vi.fn(() => Promise.reject(new Error('Network error'))),
      } as unknown as ApiContextTypes

      const { user } = renderWithContext(defaultProps, failingApi)

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })

      expect(screen.getByTestId('save-manual-account-button')).not.toBeDisabled()
    })

    it('allows retry after error', async () => {
      const failingThenSucceedingApi = {
        ...mockApi,
        createAccount: vi
          .fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            guid: 'ACT-123',
            member_guid: 'MBR-123',
            institution_guid: 'INS-MANUAL-123',
          }),
      } as unknown as ApiContextTypes

      const { user } = renderWithContext(defaultProps, failingThenSucceedingApi)

      await user.type(screen.getByLabelText(/account name/i), 'My Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockHandleSuccess).toHaveBeenCalled()
      })
    })
  })

  describe('Integration', () => {
    it('renders all form elements for a checking account', () => {
      renderWithContext()

      expect(screen.getByTestId('manual-account-form-header')).toBeInTheDocument()
      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/account balance/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Personal')).toBeInTheDocument()
      expect(screen.getByLabelText('Business')).toBeInTheDocument()
      expect(screen.getByTestId('save-manual-account-button')).toBeInTheDocument()
    })

    it('handles complete credit card form submission flow', async () => {
      const creditCardProps = { ...defaultProps, accountType: AccountTypes.CREDIT_CARD }
      const { user } = renderWithContext(creditCardProps)

      await user.type(screen.getByLabelText(/account name/i), 'My Credit Card')
      await user.type(screen.getByLabelText(/account balance/i), '500')
      await user.type(screen.getByLabelText(/credit limit/i), '5000')
      await user.type(screen.getByLabelText(/minimum payment/i), '25')

      await user.click(screen.getByLabelText(/day of the month payment is due/i))
      expect(mockSetShowDayPicker).toHaveBeenCalledWith(true)
    })

    it('submits different account types correctly', async () => {
      const savingsProps = { ...defaultProps, accountType: AccountTypes.SAVINGS }
      const { user } = renderWithContext(savingsProps)

      await user.type(screen.getByLabelText(/account name/i), 'Savings Account')
      await user.click(screen.getByTestId('save-manual-account-button'))

      await waitFor(() => {
        expect(mockApi.createAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            account_type: AccountTypes.SAVINGS,
          }),
        )
      })
    })
  })
})
