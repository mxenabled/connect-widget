import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { throwError } from 'rxjs'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { render, screen } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { MicrodepositsStatuses, ReadableAccountTypes } from 'src/views/microdeposits/const'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'

interface Microdeposit {
  guid?: string
  status?: number
  account_number?: string
  routing_number?: string
  account_type?: number
}

type ApiOverrides = Record<string, unknown>

const enteredDetails = {
  routingNumber: '123456789',
  accountNumber: '9876543210',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
}

describe('MicrodepositErrors', () => {
  const erroredMicrodeposit: Microdeposit = {
    guid: 'MD-123',
    status: MicrodepositsStatuses.ERRORED,
    account_number: '9876543210',
    routing_number: '123456789',
    account_type: ReadableAccountTypes.CHECKING,
  }

  const connectStepProps = {
    availableAccountTypes: [],
    handleConsentGoBack: () => {},
    handleCredentialsGoBack: () => {},
    navigationRef: React.createRef(),
    onManualAccountAdded: () => {},
    onUpsertMember: () => {},
    setConnectLocalState: () => {},
  }

  const microdepositsEnabledState = (currentMicrodepositGuid: string | null) => ({
    ...initialState,
    config: { ...initialState.config, mode: VERIFY_MODE },
    connect: {
      ...initialState.connect,
      location: [{ step: STEPS.MICRODEPOSITS }],
      currentMicrodepositGuid,
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
  })

  const renderErrorsStep = (microdeposit: Microdeposit, apiOverrides: ApiOverrides = {}) =>
    render(<RenderConnectStep {...connectStepProps} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid: vi
          .fn()
          .mockResolvedValueOnce({ ...microdeposit, status: MicrodepositsStatuses.PREINITIATED })
          .mockResolvedValue(microdeposit),
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
        ...apiOverrides,
      } as unknown as typeof apiValueMock,
      preloadedState: microdepositsEnabledState(microdeposit.guid ?? null),
    })

  const renderMicrodepositsForm = (apiOverrides: ApiOverrides = {}) =>
    render(<RenderConnectStep {...connectStepProps} />, {
      apiValue: {
        ...apiValueMock,
        verifyRoutingNumber: () => Promise.resolve({}),
        ...apiOverrides,
      } as unknown as typeof apiValueMock,
      preloadedState: microdepositsEnabledState(null),
    })

  const navigateToConfirm = async (user: ReturnType<typeof render>['user']) => {
    await user.type(await screen.findByTestId('routing-number-input'), enteredDetails.routingNumber)
    await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    await user.type(await screen.findByTestId('account-number-input'), enteredDetails.accountNumber)
    await user.type(
      screen.getByTestId('confirm-account-number-input'),
      enteredDetails.accountNumber,
    )
    await user.click(screen.getByRole('button', { name: 'Continue to confirm details' }))

    await user.type(await screen.findByTestId('first-name-input'), enteredDetails.firstName)
    await user.type(screen.getByTestId('last-name-input'), enteredDetails.lastName)
    await user.type(screen.getByTestId('email-input'), enteredDetails.email)
    await user.click(screen.getByRole('button', { name: 'Continue to account details' }))

    await screen.findByText('Review your information')
  }

  describe('Prevented status', () => {
    it('shows the account-not-connected error and returns the user to search', async () => {
      const { user } = renderErrorsStep({
        ...erroredMicrodeposit,
        status: MicrodepositsStatuses.PREVENTED,
      })

      expect(
        await screen.findByText('Account not connected', {}, { timeout: 4000 }),
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('too many failed attempts')
      expect(screen.queryByRole('button', { name: 'Edit details' })).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
    })
  })

  describe('Rejected status', () => {
    it('shows the try-again-later error and returns the user to search', async () => {
      const { user } = renderErrorsStep({
        ...erroredMicrodeposit,
        status: MicrodepositsStatuses.REJECTED,
      })

      expect(
        await screen.findByText('Something went wrong', {}, { timeout: 4000 }),
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Please try again later')

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
    })
  })

  describe('Errored status', () => {
    it('shows the review-details error and lets the user edit their details', async () => {
      const { user } = renderErrorsStep(erroredMicrodeposit)

      expect(
        await screen.findByText('Something went wrong', {}, { timeout: 4000 }),
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Please review the account details')

      await user.click(screen.getByRole('button', { name: 'Edit details' }))

      expect(await screen.findByText('Enter routing number')).toBeInTheDocument()
    })

    it('lets the user connect a different account and returns them to search', async () => {
      const { user } = renderErrorsStep(erroredMicrodeposit)

      await screen.findByText('Something went wrong', {}, { timeout: 4000 })

      await user.click(screen.getByRole('button', { name: 'Connect a different account' }))

      expect(await screen.findByTestId('search-header')).toBeInTheDocument()
    })

    it('displays the submitted account information', async () => {
      renderErrorsStep(erroredMicrodeposit)

      await screen.findByText('Something went wrong', {}, { timeout: 4000 })

      expect(screen.getByText('Account type')).toBeInTheDocument()
      expect(screen.getByText('Checking')).toBeInTheDocument()
      expect(screen.getByText('Routing number')).toBeInTheDocument()
      expect(screen.getByText('123456789')).toBeInTheDocument()
      expect(screen.getByText('Account number')).toBeInTheDocument()
      expect(screen.getByText('•••• 3210')).toBeInTheDocument()
    })

    it('displays a savings account type', async () => {
      renderErrorsStep({ ...erroredMicrodeposit, account_type: ReadableAccountTypes.SAVINGS })

      await screen.findByText('Something went wrong', {}, { timeout: 4000 })

      expect(screen.getByText('Savings')).toBeInTheDocument()
    })

    it('displays a dash when account information is missing', async () => {
      renderErrorsStep({ guid: 'MD-123', status: MicrodepositsStatuses.ERRORED })

      await screen.findByText('Something went wrong', {}, { timeout: 4000 })

      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Create failure', () => {
    it('shows the review-details error using the details returned by the failed request', async () => {
      const createMicrodeposit = vi.fn(() =>
        throwError(() => ({
          response: {
            status: 400,
            data: {
              micro_deposit: {
                account_number: '1111222233334444',
                routing_number: '555666777',
                account_type: ReadableAccountTypes.SAVINGS,
              },
            },
          },
        })),
      )
      const { user } = renderMicrodepositsForm({ createMicrodeposit })

      await navigateToConfirm(user)
      await user.click(screen.getByRole('button', { name: 'Confirm' }))

      expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Please review the account details')
      expect(screen.getByRole('button', { name: 'Edit details' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Connect a different account' }),
      ).toBeInTheDocument()

      expect(screen.getByText('•••• 4444')).toBeInTheDocument()
      expect(screen.getByText('555666777')).toBeInTheDocument()
      expect(screen.getByText('Savings')).toBeInTheDocument()
    })
  })
})
