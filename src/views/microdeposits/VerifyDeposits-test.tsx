import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import RenderConnectStep from 'src/components/RenderConnectStep'
import { VerifyDeposits } from 'src/views/microdeposits/VerifyDeposits'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'

interface Microdeposit {
  guid: string
  account_name: string
  status?: number
}

type ApiOverrides = Record<string, unknown>

describe('VerifyDeposits', () => {
  const microdeposit = (overrides: Partial<Microdeposit> = {}): Microdeposit => ({
    guid: 'MD-123',
    account_name: 'My Checking Account',
    ...overrides,
  })

  const renderVerifyDeposits = (
    overrides: Partial<Microdeposit> = {},
    apiOverrides: ApiOverrides = {},
  ) =>
    render(<VerifyDeposits microdeposit={microdeposit(overrides)} onSuccess={() => {}} />, {
      apiValue: {
        ...apiValueMock,
        verifyMicrodeposit: () => Promise.resolve({}),
        ...apiOverrides,
      } as unknown as typeof apiValueMock,
    })

  const connectStepProps = {
    availableAccountTypes: [],
    handleConsentGoBack: () => {},
    handleCredentialsGoBack: () => {},
    navigationRef: React.createRef(),
    onManualAccountAdded: () => {},
    onUpsertMember: () => {},
    setConnectLocalState: () => {},
  }

  const microdepositsEnabledState = (currentMicrodepositGuid: string) => ({
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

  const renderVerifyDepositsStep = async () => {
    const utils = render(<RenderConnectStep {...connectStepProps} />, {
      apiValue: {
        ...apiValueMock,
        loadMicrodepositByGuid: vi
          .fn()
          .mockResolvedValueOnce({ guid: 'MD-123', status: MicrodepositsStatuses.PREINITIATED })
          .mockResolvedValue({
            guid: 'MD-123',
            account_name: 'My Checking Account',
            status: MicrodepositsStatuses.DEPOSITED,
          }),
        refreshMicrodepositStatus: vi.fn().mockResolvedValue(undefined),
        verifyMicrodeposit: vi.fn().mockResolvedValue({}),
      } as unknown as typeof apiValueMock,
      preloadedState: microdepositsEnabledState('MD-123'),
    })

    await screen.findByText('Enter deposit amounts', {}, { timeout: 4000 })

    return utils
  }

  describe('Rendering', () => {
    it('renders the header and the instructions with the account name', () => {
      renderVerifyDeposits()

      expect(screen.getByText('Enter deposit amounts')).toBeInTheDocument()
      expect(screen.getByTestId('deposit-paragraph')).toHaveTextContent(
        'Please find the two small deposits less than a dollar each in your My Checking Account account, and enter the amounts here.',
      )
    })

    it('reflects a different account name in the instructions', () => {
      renderVerifyDeposits({ account_name: 'Savings Account' })

      expect(screen.getByTestId('deposit-paragraph')).toHaveTextContent('Savings Account')
    })

    it('renders the two required amount fields and the continue button', () => {
      renderVerifyDeposits()

      expect(screen.getByLabelText('Amount 1 *')).toBeRequired()
      expect(screen.getByLabelText('Amount 2 *')).toBeRequired()
      expect(screen.getByTestId('amount-1-input')).toHaveAttribute('placeholder', '0.00')
      expect(screen.getByTestId('amount-2-input')).toHaveAttribute('placeholder', '0.00')
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })
  })

  describe('Denied status', () => {
    it('shows the incorrect-amounts alert when the microdeposit was denied', () => {
      renderVerifyDeposits({ status: MicrodepositsStatuses.DENIED })

      const alert = screen.getByTestId('input-error-messagebox')
      expect(alert).toHaveAttribute('role', 'alert')
      expect(screen.getByTestId('input-error-text')).toHaveTextContent(
        'One or more of the amounts was incorrect. Please try again.',
      )
    })

    it('does not show the alert for a pending microdeposit', () => {
      renderVerifyDeposits()

      expect(screen.queryByTestId('input-error-messagebox')).not.toBeInTheDocument()
    })
  })

  describe('Form input', () => {
    it('updates and clears the amount fields as the user types', async () => {
      const { user } = renderVerifyDeposits()

      const firstInput = screen.getByTestId('amount-1-input')
      await user.type(firstInput, '0.05')
      await user.type(screen.getByTestId('amount-2-input'), '0.07')

      expect(firstInput).toHaveValue('0.05')
      expect(screen.getByTestId('amount-2-input')).toHaveValue('0.07')

      await user.clear(firstInput)
      expect(firstInput).toHaveValue('')
    })
  })

  describe('Validation', () => {
    it('shows validation errors and focuses the first amount on empty submit', async () => {
      const { user } = renderVerifyDeposits()

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect((await screen.findAllByText('Amount 1 must be a number'))[0]).toBeInTheDocument()
      expect(screen.getByTestId('amount-1-input')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('amount-2-input')).toHaveAttribute('aria-invalid', 'true')
      await waitFor(() => expect(screen.getByTestId('amount-1-input')).toHaveFocus())
    })

    it('focuses the second amount when only it is invalid', async () => {
      const { user } = renderVerifyDeposits()

      await user.type(screen.getByTestId('amount-1-input'), '0.05')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => expect(screen.getByTestId('amount-2-input')).toHaveFocus())
      expect(screen.getByTestId('amount-2-input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('rejects a non-numeric amount', async () => {
      const { user } = renderVerifyDeposits()

      await user.type(screen.getByTestId('amount-1-input'), 'abc')
      await user.type(screen.getByTestId('amount-2-input'), '0.05')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect((await screen.findAllByText('Amount 1 must be a number'))[0]).toBeInTheDocument()
      expect(screen.getByTestId('amount-1-input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('rejects an amount below the minimum', async () => {
      const { user } = renderVerifyDeposits()

      await user.type(screen.getByTestId('amount-1-input'), '0.00')
      await user.type(screen.getByTestId('amount-2-input'), '0.05')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(
        (await screen.findAllByText('Amount 1 must be greater than or equal to 0.01'))[0],
      ).toBeInTheDocument()
    })

    it('rejects an amount above the maximum', async () => {
      const { user } = renderVerifyDeposits()

      await user.type(screen.getByTestId('amount-1-input'), '0.10')
      await user.type(screen.getByTestId('amount-2-input'), '0.05')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(
        (await screen.findAllByText('Amount 1 must be less than or equal to 0.09'))[0],
      ).toBeInTheDocument()
    })
  })

  describe('Submission', () => {
    it('advances to the verifying screen after submitting valid amounts', async () => {
      const { user } = await renderVerifyDepositsStep()

      await user.type(screen.getByTestId('amount-1-input'), '0.05')
      await user.type(screen.getByTestId('amount-2-input'), '0.07')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByText('Verifying ...')).toBeInTheDocument()
      expect(screen.getByText('Checking microdeposit amounts.')).toBeInTheDocument()
    })

    it('shows a submission error and stays on the form when the API rejects', async () => {
      const { user } = renderVerifyDeposits(
        {},
        { verifyMicrodeposit: () => Promise.reject(new Error('API Error')) },
      )

      await user.type(screen.getByTestId('amount-1-input'), '0.05')
      await user.type(screen.getByTestId('amount-2-input'), '0.07')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByTestId('input-error-text')).toHaveTextContent(
        "We're unable to submit your deposit amounts. Please try again.",
      )
      expect(screen.getByText('Enter deposit amounts')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses a semantic H2 heading for the title', () => {
      renderVerifyDeposits()

      const heading = screen.getByRole('heading', { name: 'Enter deposit amounts' })
      expect(heading.tagName).toBe('H2')
    })

    it('links each amount field to its error message when invalid', async () => {
      const { user } = renderVerifyDeposits()

      await user.type(screen.getByTestId('amount-1-input'), '0.05')
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(await screen.findByTestId('amount-2-input')).toHaveAttribute(
        'aria-describedby',
        'secondAmount-error',
      )
    })

    it('disables autocomplete on both amount fields', () => {
      renderVerifyDeposits()

      expect(screen.getByTestId('amount-1-input')).toHaveAttribute('autocomplete', 'off')
      expect(screen.getByTestId('amount-2-input')).toHaveAttribute('autocomplete', 'off')
    })
  })
})
