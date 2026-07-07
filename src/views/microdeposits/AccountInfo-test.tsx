import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AccountInfo } from 'src/views/microdeposits/AccountInfo'
import { Microdeposits as MicrodepositsComponent } from 'src/views/microdeposits/Microdeposits'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { AccountFields, ReadableAccountTypes } from 'src/views/microdeposits/const'

const Microdeposits = MicrodepositsComponent as unknown as React.ComponentType<
  Record<string, unknown>
>

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
  const renderAccountInfo = (props: Partial<AccountInfoProps> = {}) =>
    render(<AccountInfo onContinue={() => {}} {...props} />)

  const renderAccountInfoStep = async () => {
    const utils = render(<Microdeposits microdepositGuid={null} stepToIAV={vi.fn()} />, {
      apiValue: { ...apiValueMock, verifyRoutingNumber: () => Promise.resolve({}) },
    })

    await utils.user.type(await screen.findByTestId('routing-number-input'), '123456789')
    await utils.user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await utils.user.click(await screen.findByRole('button', { name: 'Continue' }))

    await screen.findByText('Enter account information')

    return utils
  }

  describe('Rendering', () => {
    it('renders the account information form', () => {
      renderAccountInfo()

      expect(screen.getByText('Enter account information')).toBeInTheDocument()
      expect(screen.getByText('Account type')).toBeInTheDocument()
      expect(screen.getByText('Checking')).toBeInTheDocument()
      expect(screen.getByText('Savings')).toBeInTheDocument()
      expect(screen.getByLabelText('Account number *')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm account number *')).toBeInTheDocument()
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(screen.getByText('Help finding your account number')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Continue to confirm details' }),
      ).toBeInTheDocument()
    })

    it('defaults to the checking account type', () => {
      renderAccountInfo()

      expect(screen.getByRole('radio', { name: 'Checking' })).toBeChecked()
      expect(screen.getByRole('radio', { name: 'Savings' })).not.toBeChecked()
    })

    it('pre-populates the account type from the provided details', () => {
      renderAccountInfo({ accountDetails: { account_type: ReadableAccountTypes.SAVINGS } })

      expect(screen.getByRole('radio', { name: 'Savings' })).toBeChecked()
    })

    it('pre-populates both account number fields from the provided details', () => {
      renderAccountInfo({ accountDetails: { account_number: '123456789' } })

      expect(screen.getByTestId('account-number-input')).toHaveValue('123456789')
      expect(screen.getByTestId('confirm-account-number-input')).toHaveValue('123456789')
    })
  })

  describe('Focus', () => {
    it('focuses the account number field when requested', () => {
      renderAccountInfo({ focus: AccountFields.ACCOUNT_NUMBER })

      expect(screen.getByTestId('account-number-input')).toHaveFocus()
    })

    it('focuses the checking option when requested', () => {
      renderAccountInfo({ focus: AccountFields.ACCOUNT_TYPE })

      expect(screen.getByRole('radio', { name: 'Checking' })).toHaveFocus()
    })

    it('focuses the savings option when it is the pre-selected type', () => {
      renderAccountInfo({
        accountDetails: { account_type: ReadableAccountTypes.SAVINGS },
        focus: AccountFields.ACCOUNT_TYPE,
      })

      expect(screen.getByRole('radio', { name: 'Savings' })).toHaveFocus()
    })
  })

  describe('Account type selection', () => {
    it('lets the user switch between checking and savings', async () => {
      const { user } = renderAccountInfo()

      const checkingOption = screen.getByRole('radio', { name: 'Checking' })
      const savingsOption = screen.getByRole('radio', { name: 'Savings' })

      await user.click(savingsOption)
      expect(savingsOption).toBeChecked()

      await user.click(checkingOption)
      expect(checkingOption).toBeChecked()
    })
  })

  describe('Validation', () => {
    it('shows required-field errors when the account numbers are missing', async () => {
      const { user } = renderAccountInfo()

      await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

      expect((await screen.findAllByText('Account number is required'))[0]).toBeInTheDocument()
      expect(screen.getAllByText('Confirm account number is required')[0]).toBeInTheDocument()
    })

    it('shows an error when the account number contains non-digit characters', async () => {
      const { user } = renderAccountInfo()

      await user.type(screen.getByTestId('account-number-input'), '12345abc')
      await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

      expect(
        (await screen.findAllByText('Account number must only contain digits'))[0],
      ).toBeInTheDocument()
    })

    it('shows a mismatch error and clears it once the numbers match', async () => {
      const { user } = renderAccountInfo()

      await user.type(screen.getByTestId('account-number-input'), '123456789')
      await user.type(screen.getByTestId('confirm-account-number-input'), '987654321')
      await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

      expect(
        (
          await screen.findAllByText('Account number must be the same as Confirm account number')
        )[0],
      ).toBeInTheDocument()

      await user.clear(screen.getByTestId('confirm-account-number-input'))
      await user.type(screen.getByTestId('confirm-account-number-input'), '123456789')
      await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

      await waitFor(() =>
        expect(
          screen.queryByText('Account number must be the same as Confirm account number'),
        ).not.toBeInTheDocument(),
      )
    })
  })

  describe('Submission', () => {
    it('advances to the account holder step after a valid submission', async () => {
      const { user } = await renderAccountInfoStep()

      await user.type(screen.getByTestId('account-number-input'), '123456789')
      await user.type(screen.getByTestId('confirm-account-number-input'), '123456789')
      await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

      expect(await screen.findByText('Enter account holder information')).toBeInTheDocument()
    })

    it('advances to the account holder step when the user presses Enter', async () => {
      const { user } = await renderAccountInfoStep()

      await user.type(screen.getByTestId('account-number-input'), '123456789')
      await user.type(screen.getByTestId('confirm-account-number-input'), '123456789{Enter}')

      expect(await screen.findByText('Enter account holder information')).toBeInTheDocument()
    })
  })

  describe('Help finding your account number', () => {
    it('opens the help view and returns to the form when closed', async () => {
      const { user } = renderAccountInfo()

      await user.click(screen.getByText('Help finding your account number'))

      expect(await screen.findByText('Find your account number')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByText('Enter account information')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('announces validation errors to screen readers', async () => {
      const { user } = renderAccountInfo()

      await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

      await waitFor(() => {
        const ariaLive = document.querySelector('[aria-live="assertive"]')
        expect(ariaLive?.textContent).toContain('Account number is required')
        expect(ariaLive?.textContent).toContain('Confirm account number is required')
      })
    })
  })
})
