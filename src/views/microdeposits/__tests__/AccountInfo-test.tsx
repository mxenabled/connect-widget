import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { AccountInfo } from 'src/views/microdeposits/AccountInfo'
import { render, screen } from 'src/utilities/testingLibrary'
import { AccountFields, ReadableAccountTypes } from 'src/views/microdeposits/const'

interface AccountDetails {
  account_type?: number
  account_number?: string
  routing_number?: string
}

interface AccountInfoProps {
  accountDetails?: AccountDetails
  focus?: string
  onContinue: (details: AccountDetails) => void
}

describe('AccountInfo', () => {
  let defaultProps: AccountInfoProps

  beforeEach(() => {
    defaultProps = {
      onContinue: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the account info form with correct header', () => {
      render(<AccountInfo {...defaultProps} />)

      expect(screen.getByText('Enter account information')).toBeInTheDocument()
      expect(screen.getByText('Account type')).toBeInTheDocument()
      expect(screen.getByLabelText('Account number *')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm account number *')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Continue to confirm details' }),
      ).toBeInTheDocument()
    })

    it('renders checking and savings account type options', () => {
      render(<AccountInfo {...defaultProps} />)

      expect(screen.getByText('Checking')).toBeInTheDocument()
      expect(screen.getByText('Savings')).toBeInTheDocument()
    })

    it('defaults to checking account type selected', () => {
      render(<AccountInfo {...defaultProps} />)

      const checkingOption = screen.getByRole('radio', { name: 'Checking' })
      const savingsOption = screen.getByRole('radio', { name: 'Savings' })

      expect(checkingOption).toBeChecked()
      expect(savingsOption).not.toBeChecked()
    })

    it('shows help finding account number link', () => {
      render(<AccountInfo {...defaultProps} />)

      expect(screen.getByText('Help finding your account number')).toBeInTheDocument()
    })

    it('shows required field note', () => {
      render(<AccountInfo {...defaultProps} />)

      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('auto-focuses the account number input when focus prop is ACCOUNT_NUMBER', () => {
      render(<AccountInfo {...defaultProps} focus={AccountFields.ACCOUNT_NUMBER} />)

      const input = screen.getByTestId('account-number-input')
      expect(input).toHaveFocus()
    })

    it('auto-focuses the checking option when focus prop is ACCOUNT_TYPE and checking is selected', () => {
      render(<AccountInfo {...defaultProps} focus={AccountFields.ACCOUNT_TYPE} />)

      const checkingOption = screen.getByRole('radio', { name: 'Checking' })
      expect(checkingOption).toHaveFocus()
    })

    it('auto-focuses the savings option when focus prop is ACCOUNT_TYPE and savings is selected', () => {
      const propsWithSavings = {
        ...defaultProps,
        accountDetails: { account_type: ReadableAccountTypes.SAVINGS },
        focus: AccountFields.ACCOUNT_TYPE,
      }
      render(<AccountInfo {...propsWithSavings} />)

      const savingsOption = screen.getByRole('radio', { name: 'Savings' })
      expect(savingsOption).toHaveFocus()
    })
  })

  describe('Pre-populated Values', () => {
    it('pre-populates account type from accountDetails', () => {
      const propsWithDetails = {
        ...defaultProps,
        accountDetails: { account_type: ReadableAccountTypes.SAVINGS },
      }
      render(<AccountInfo {...propsWithDetails} />)

      const savingsOption = screen.getByRole('radio', { name: 'Savings' })
      expect(savingsOption).toBeChecked()
    })

    it('pre-populates account number from accountDetails', () => {
      const propsWithDetails = {
        ...defaultProps,
        accountDetails: { account_number: '123456789' },
      }
      render(<AccountInfo {...propsWithDetails} />)

      const accountInput = screen.getByTestId('account-number-input')
      const confirmInput = screen.getByTestId('confirm-account-number-input')

      expect(accountInput).toHaveValue('123456789')
      expect(confirmInput).toHaveValue('123456789')
    })
  })

  describe('Account Type Selection', () => {
    it('switches to savings account type when savings is clicked', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const savingsOption = screen.getByRole('radio', { name: 'Savings' })
      await user.click(savingsOption)

      expect(savingsOption).toBeChecked()
    })

    it('switches back to checking account type when checking is clicked', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const savingsOption = screen.getByRole('radio', { name: 'Savings' })
      const checkingOption = screen.getByRole('radio', { name: 'Checking' })

      await user.click(savingsOption)
      expect(savingsOption).toBeChecked()

      await user.click(checkingOption)
      expect(checkingOption).toBeChecked()
    })
  })

  describe('Form Validation - Required Fields', () => {
    it('shows error when account number is empty and form is submitted', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      const accountInput = screen.getByTestId('account-number-input')
      await waitFor(() => {
        expect(accountInput).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Account number is required')[0]).toBeInTheDocument()
    })

    it('shows error when confirm account number is empty and form is submitted', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.clear(confirmInput)

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(confirmInput).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Confirm account number is required')[0]).toBeInTheDocument()
    })
  })

  describe('Form Validation - Digits Only', () => {
    it('shows error when account number contains non-digit characters', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '12345abc')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(accountInput).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.getAllByText('Account number must only contain digits')[0]).toBeInTheDocument()
    })

    it('shows error when confirm account number contains non-digit characters', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '12345xyz')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(confirmInput).toHaveAttribute('aria-invalid', 'true')
      })
      expect(
        screen.getAllByText('Confirm account number must only contain digits')[0],
      ).toBeInTheDocument()
    })
  })

  describe('Form Validation - Matching Fields', () => {
    it('shows error when account numbers do not match', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '987654321')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(accountInput).toHaveAttribute('aria-invalid', 'true')
        expect(confirmInput).toHaveAttribute('aria-invalid', 'true')
      })
      expect(
        screen.getAllByText('Account number must be the same as Confirm account number')[0],
      ).toBeInTheDocument()
    })

    it('does not show error when account numbers match', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalled()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls onContinue with account details when form is valid', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledWith({
          account_type: ReadableAccountTypes.CHECKING,
          account_number: '123456789',
        })
      })
    })

    it('calls onContinue with savings account type when selected', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const savingsOption = screen.getByRole('radio', { name: 'Savings' })
      await user.click(savingsOption)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '987654321')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '987654321')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledWith({
          account_type: ReadableAccountTypes.SAVINGS,
          account_number: '987654321',
        })
      })
    })

    it('calls onContinue with merged account details when existing details are present', async () => {
      const propsWithDetails = {
        ...defaultProps,
        accountDetails: {
          routing_number: '111222333',
          account_type: ReadableAccountTypes.SAVINGS,
        },
      }
      const { user } = render(<AccountInfo {...propsWithDetails} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '123456789')

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledWith({
          routing_number: '111222333',
          account_type: ReadableAccountTypes.SAVINGS,
          account_number: '123456789',
        })
      })
    })

    it('submits form when Enter key is pressed in account number field', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '123456789{Enter}')

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalled()
      })
    })
  })

  describe('Help Finding Account Number', () => {
    it('shows FindAccountInfo when help link is clicked', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const helpLink = screen.getByText('Help finding your account number')
      await user.click(helpLink)

      await waitFor(() => {
        expect(screen.getByText('Find your account number')).toBeInTheDocument()
      })
    })

    it('returns to account info form when FindAccountInfo is closed', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const helpLink = screen.getByText('Help finding your account number')
      await user.click(helpLink)

      await waitFor(() => {
        expect(screen.getByText('Find your account number')).toBeInTheDocument()
      })

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText('Enter account information')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('announces validation errors to screen readers', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: 'Continue to confirm details' })
      await user.click(submitButton)

      await waitFor(() => {
        const ariaLive = document.querySelector('[aria-live="assertive"]')
        expect(ariaLive?.textContent).toContain('Account number is required')
        expect(ariaLive?.textContent).toContain('Confirm account number is required')
      })
    })

    it('clears aria-live announcements when form is valid', async () => {
      const { user } = render(<AccountInfo {...defaultProps} />)

      const accountInput = screen.getByTestId('account-number-input')
      await user.type(accountInput, '123456789')

      const confirmInput = screen.getByTestId('confirm-account-number-input')
      await user.type(confirmInput, '123456789')

      await waitFor(() => {
        const ariaLive = document.querySelector('[aria-live="assertive"]')
        expect(ariaLive?.textContent).toBe('')
      })
    })
  })
})
