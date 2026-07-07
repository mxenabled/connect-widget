import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { of, throwError, delay } from 'rxjs'

import { ConfirmDetails } from 'src/views/microdeposits/ConfirmDetails'
import { Microdeposits as MicrodepositsComponent } from 'src/views/microdeposits/Microdeposits'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses, ReadableAccountTypes } from 'src/views/microdeposits/const'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

const Microdeposits = MicrodepositsComponent as unknown as React.ComponentType<
  Record<string, unknown>
>

interface AccountDetails {
  routing_number: string
  account_type: number
  account_number: string
  first_name?: string
  last_name?: string
  email?: string
}

interface Microdeposit {
  guid?: string
  account_name?: string
  status?: string
}

interface ConfirmDetailsProps {
  accountDetails: AccountDetails
  currentMicrodeposit: Microdeposit
  onEditForm: (field: string) => void
  onError: (error: unknown) => void
  onSuccess: (microdeposit: Microdeposit) => void
  shouldShowUserDetails?: boolean
}

const enteredDetails = {
  routingNumber: '123456789',
  accountNumber: '9876543210',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
}

type ApiOverrides = Record<string, unknown>

describe('ConfirmDetails', () => {
  const leafAccountDetails: AccountDetails = {
    routing_number: '123456789',
    account_type: ReadableAccountTypes.CHECKING,
    account_number: '9876543210',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
  }

  const renderConfirmDetails = (props: Partial<ConfirmDetailsProps> = {}) =>
    render(
      <ConfirmDetails
        accountDetails={leafAccountDetails}
        currentMicrodeposit={{}}
        onEditForm={() => {}}
        onError={() => {}}
        onSuccess={() => {}}
        shouldShowUserDetails={false}
        {...props}
      />,
    )

  const renderMicrodeposits = (apiOverrides: ApiOverrides = {}) =>
    render(<Microdeposits microdepositGuid={null} stepToIAV={vi.fn()} />, {
      apiValue: {
        ...apiValueMock,
        verifyRoutingNumber: () => Promise.resolve({}),
        ...apiOverrides,
      } as unknown as typeof apiValueMock,
    })

  const navigateToConfirmDetails = async (
    user: ReturnType<typeof render>['user'],
    { includeUserDetails = true } = {},
  ) => {
    await user.type(
      await screen.findByTestId('routing-number-input', {}, { timeout: 4000 }),
      enteredDetails.routingNumber,
    )
    await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    await user.type(await screen.findByTestId('account-number-input'), enteredDetails.accountNumber)
    await user.type(
      screen.getByTestId('confirm-account-number-input'),
      enteredDetails.accountNumber,
    )
    await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    if (includeUserDetails) {
      await user.type(await screen.findByTestId('first-name-input'), enteredDetails.firstName)
      await user.type(screen.getByTestId('last-name-input'), enteredDetails.lastName)
      await user.type(screen.getByTestId('email-input'), enteredDetails.email)
      await user.click(screen.getByRole('button', { name: 'Continue to account details' }))
    }

    await screen.findByText('Review your information')
  }

  describe('Initial Rendering', () => {
    it('renders the account details for review with a confirm action and disclaimer', () => {
      renderConfirmDetails()

      expect(screen.getByText('Review your information')).toBeInTheDocument()
      expect(screen.getByText('Routing number')).toBeInTheDocument()
      expect(screen.getByText('123456789')).toBeInTheDocument()
      expect(screen.getByText('Account type')).toBeInTheDocument()
      expect(screen.getByText('Checking')).toBeInTheDocument()
      expect(screen.getByText('Account number')).toBeInTheDocument()
      expect(screen.getByText('9876543210')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()

      const disclaimer = screen.getByTestId('disclaimer-paragraph')
      expect(disclaimer).toHaveTextContent(/By clicking Confirm, I authorize/)
      expect(disclaimer).toHaveTextContent(/Dwolla, Inc./)
      expect(disclaimer).toHaveTextContent(/micro-deposit verification/)

      expect(screen.queryByText('First and last name')).not.toBeInTheDocument()
      expect(screen.queryByText('Email')).not.toBeInTheDocument()
    })

    it('displays savings account type when provided', () => {
      renderConfirmDetails({
        accountDetails: { ...leafAccountDetails, account_type: ReadableAccountTypes.SAVINGS },
      })

      expect(screen.getByText('Savings')).toBeInTheDocument()
    })

    it('renders user details when shouldShowUserDetails is true', () => {
      renderConfirmDetails({ shouldShowUserDetails: true })

      expect(screen.getByText('First and last name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    })
  })

  describe('Edit Button Functionality', () => {
    it('returns to the routing number step when routing number edit is clicked', async () => {
      const { user } = renderMicrodeposits()
      await navigateToConfirmDetails(user)

      await user.click(screen.getByRole('button', { name: 'Edit routing number' }))

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
    })

    it('returns to the account information step when an account field edit is clicked', async () => {
      const { user } = renderMicrodeposits()
      await navigateToConfirmDetails(user)

      await user.click(screen.getByRole('button', { name: 'Edit account number' }))

      expect(await screen.findByText('Enter account information')).toBeInTheDocument()
    })

    it('returns to the personal information step when a user detail edit is clicked', async () => {
      const { user } = renderMicrodeposits()
      await navigateToConfirmDetails(user)

      await user.click(screen.getByRole('button', { name: 'Edit first and last name' }))

      expect(await screen.findByText('Enter account holder information')).toBeInTheDocument()
    })
  })

  describe('Form Submission - Create New Microdeposit', () => {
    it('creates the microdeposit and advances to the come-back step', async () => {
      const createMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-123' } }))
      const { user } = renderMicrodeposits({ createMicrodeposit })

      await navigateToConfirmDetails(user)
      await user.click(screen.getByRole('button', { name: 'Confirm' }))

      await waitFor(() =>
        expect(createMicrodeposit).toHaveBeenCalledWith({
          routing_number: '123456789',
          account_type: ReadableAccountTypes.CHECKING,
          account_number: '9876543210',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          account_name: 'Checking ...3210',
          user_guid: 'USR-123',
        }),
      )

      expect(await screen.findByText('Check back soon', {}, { timeout: 4000 })).toBeInTheDocument()
    })

    it('shows a sending state while the microdeposit is being created', async () => {
      const createMicrodeposit = vi.fn(() =>
        of({ micro_deposit: { guid: 'MD-123' } }).pipe(delay(100)),
      )
      const { user } = renderMicrodeposits({ createMicrodeposit })

      await navigateToConfirmDetails(user)
      await user.click(screen.getByRole('button', { name: 'Confirm' }))

      const sendingButton = await screen.findByRole('button', { name: 'Sending...' })
      expect(sendingButton).toBeDisabled()
    })
  })

  describe('Form Submission - Update Existing Microdeposit', () => {
    it('updates the existing microdeposit and advances to the come-back step', async () => {
      const existingMicrodeposit = {
        guid: 'MD-EXISTING',
        status: MicrodepositsStatuses.PREINITIATED,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      }
      const loadMicrodepositByGuid = vi
        .fn()
        .mockResolvedValueOnce({ ...existingMicrodeposit, status: MicrodepositsStatuses.INITIATED })
        .mockResolvedValue(existingMicrodeposit)
      const updateMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-EXISTING' } }))

      const { user } = render(
        <Microdeposits microdepositGuid="MD-EXISTING" stepToIAV={vi.fn()} />,
        {
          apiValue: {
            ...apiValueMock,
            verifyRoutingNumber: () => Promise.resolve({}),
            refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
            loadMicrodepositByGuid,
            updateMicrodeposit,
          } as unknown as typeof apiValueMock,
        },
      )

      await navigateToConfirmDetails(user, { includeUserDetails: false })
      await user.click(screen.getByRole('button', { name: 'Confirm' }))

      await waitFor(() =>
        expect(updateMicrodeposit).toHaveBeenCalledWith('MD-EXISTING', {
          account_name: 'Checking ...3210',
          account_number: '9876543210',
          account_type: ReadableAccountTypes.CHECKING,
          routing_number: '123456789',
          user_guid: 'USR-123',
        }),
      )

      expect(await screen.findByText('Check back soon', {}, { timeout: 4000 })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('shows the error screen when creating the microdeposit fails', async () => {
      const createMicrodeposit = vi.fn(() =>
        throwError(() => ({
          response: {
            status: 400,
            data: {
              micro_deposit: {
                account_number: '9876543210',
                routing_number: '123456789',
                account_type: ReadableAccountTypes.CHECKING,
              },
            },
          },
        })),
      )
      const { user } = renderMicrodeposits({ createMicrodeposit })

      await navigateToConfirmDetails(user)
      await user.click(screen.getByRole('button', { name: 'Confirm' }))

      expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
      expect(
        screen.getByText(
          'We’re unable to connect this account. Please review the account details you submitted.',
        ),
      ).toBeInTheDocument()
    })
  })
})
