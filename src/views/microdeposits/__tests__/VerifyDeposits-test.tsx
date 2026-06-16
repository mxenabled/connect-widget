import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { VerifyDeposits } from 'src/views/microdeposits/VerifyDeposits'
import { render, screen } from 'src/utilities/testingLibrary'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

interface Microdeposit {
  guid: string
  account_name: string
  status?: string
}

interface VerifyDepositsProps {
  microdeposit: Microdeposit
  onSuccess: () => void
}

describe('VerifyDeposits', () => {
  let defaultProps: VerifyDepositsProps
  let apiValue: typeof apiValueMock

  beforeEach(() => {
    vi.mocked(fadeOut).mockClear()
    apiValue = {
      ...apiValueMock,
      verifyMicrodeposit: vi.fn(() =>
        Promise.resolve({} as unknown as typeof apiValueMock.verifyMicrodeposit),
      ),
    } as unknown as typeof apiValueMock

    defaultProps = {
      microdeposit: {
        guid: 'MD-123',
        account_name: 'My Checking Account',
      },
      onSuccess: vi.fn(),
    }
  })

  describe('Initial Rendering', () => {
    it('renders the enter deposit amounts header', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByText('Enter deposit amounts')).toBeInTheDocument()
    })

    it('renders the instruction paragraph with account name', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const paragraph = screen.getByTestId('deposit-paragraph')
      expect(paragraph).toHaveTextContent(
        'Please find the two small deposits less than a dollar each in your My Checking Account account, and enter the amounts here.',
      )
    })

    it('displays different account name when provided', () => {
      const propsWithDifferentAccount = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-456',
          account_name: 'Savings Account',
        },
      }
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...propsWithDifferentAccount} />
        </ApiProvider>,
      )

      const paragraph = screen.getByTestId('deposit-paragraph')
      expect(paragraph).toHaveTextContent('Savings Account')
    })

    it('renders two amount input fields', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByLabelText('Amount 1 *')).toBeInTheDocument()
      expect(screen.getByLabelText('Amount 2 *')).toBeInTheDocument()
    })

    it('renders continue button', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('renders required field note', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('shows placeholder text in amount fields', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByTestId('amount-1-input')).toHaveAttribute('placeholder', '0.00')
      expect(screen.getByTestId('amount-2-input')).toHaveAttribute('placeholder', '0.00')
    })

    it('marks both fields as required', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByLabelText('Amount 1 *')).toBeRequired()
      expect(screen.getByLabelText('Amount 2 *')).toBeRequired()
    })
  })

  describe('Error Display for DENIED Status', () => {
    it('shows error message when microdeposit status is DENIED', () => {
      const propsWithDeniedStatus = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.DENIED,
        },
      }
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...propsWithDeniedStatus} />
        </ApiProvider>,
      )

      expect(screen.getByTestId('input-error-messagebox')).toBeInTheDocument()
      expect(screen.getByTestId('input-error-text')).toHaveTextContent(
        'One or more of the amounts was incorrect. Please try again.',
      )
    })

    it('does not show error message when status is not DENIED', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.queryByTestId('input-error-messagebox')).not.toBeInTheDocument()
    })

    it('error message has alert role for accessibility', () => {
      const propsWithDeniedStatus = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.DENIED,
        },
      }
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...propsWithDeniedStatus} />
        </ApiProvider>,
      )

      const messageBox = screen.getByTestId('input-error-messagebox')
      expect(messageBox).toHaveAttribute('role', 'alert')
    })
  })

  describe('Form Input', () => {
    it('updates first amount when user types', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const input = screen.getByTestId('amount-1-input')
      await user.type(input, '0.05')

      expect(input).toHaveValue('0.05')
    })

    it('updates second amount when user types', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const input = screen.getByTestId('amount-2-input')
      await user.type(input, '0.07')

      expect(input).toHaveValue('0.07')
    })

    it('allows clearing input values', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const input = screen.getByTestId('amount-1-input')
      await user.type(input, '0.05')
      expect(input).toHaveValue('0.05')

      await user.clear(input)
      expect(input).toHaveValue('')
    })
  })

  describe('Form Validation', () => {
    it('shows error when first amount is empty on submit', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('amount-1-input')
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('shows error when second amount is empty on submit', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      await user.type(firstInput, '0.05')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('amount-2-input')
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('shows error when first amount is not a valid number', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const input = screen.getByTestId('amount-1-input')
      await user.type(input, 'abc')

      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(secondInput, '0.05')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('shows error when amount is below minimum (0.01)', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const input = screen.getByTestId('amount-1-input')
      await user.type(input, '0.00')

      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(secondInput, '0.05')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('shows error when amount is above maximum (0.09)', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const input = screen.getByTestId('amount-1-input')
      await user.type(input, '0.10')

      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(secondInput, '0.05')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('announces validation errors to screen readers', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const ariaLive = document.querySelector('[aria-live="assertive"]')
        expect(ariaLive).toBeInTheDocument()
      })
    })

    it('focuses first amount input when it has an error', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('amount-1-input')
        expect(input).toHaveFocus()
      })
    })

    it('focuses second amount input when only it has an error', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      await user.type(firstInput, '0.05')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const secondInput = screen.getByTestId('amount-2-input')
        expect(secondInput).toHaveFocus()
      })
    })
  })

  describe('Form Submission - Success', () => {
    it('calls verifyMicrodeposit API with correct amounts', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(apiValue.verifyMicrodeposit).toHaveBeenCalledWith('MD-123', {
          deposit_amount_1: '05',
          deposit_amount_2: '07',
        })
      })
    })

    it('extracts only the cents portion from amounts', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.03')
      await user.type(secondInput, '0.09')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(apiValue.verifyMicrodeposit).toHaveBeenCalledWith('MD-123', {
          deposit_amount_1: '03',
          deposit_amount_2: '09',
        })
      })
    })

    it('calls fadeOut animation on successful submission', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
      })
    })

    it('calls onSuccess callback after animation completes', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })
    })

    it('handles different microdeposit guid', async () => {
      const propsWithDifferentGuid = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-789',
          account_name: 'Test Account',
        },
      }
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...propsWithDifferentGuid} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(apiValue.verifyMicrodeposit).toHaveBeenCalledWith('MD-789', {
          deposit_amount_1: '05',
          deposit_amount_2: '07',
        })
      })
    })
  })

  describe('Form Submission - Error', () => {
    it('shows submission error when API call fails', async () => {
      const apiValueWithError = {
        ...apiValue,
        verifyMicrodeposit: vi.fn(() => Promise.reject(new Error('API Error'))),
      }

      const { user } = render(
        <ApiProvider apiValue={apiValueWithError as unknown as typeof apiValueMock}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(
        () => {
          expect(screen.getByTestId('input-error-messagebox')).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })

    it('shows correct error message for submission failure', async () => {
      const apiValueWithError = {
        ...apiValue,
        verifyMicrodeposit: vi.fn(() => Promise.reject(new Error('API Error'))),
      }

      const { user } = render(
        <ApiProvider apiValue={apiValueWithError as unknown as typeof apiValueMock}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(
        () => {
          expect(screen.getByTestId('input-error-text')).toHaveTextContent(
            "We're unable to submit your deposit amounts. Please try again.",
          )
        },
        { timeout: 3000 },
      )
    })

    it('does not call onSuccess when submission fails', async () => {
      const apiValueWithError = {
        ...apiValue,
        verifyMicrodeposit: vi.fn(() => Promise.reject(new Error('API Error'))),
      }

      const { user } = render(
        <ApiProvider apiValue={apiValueWithError as unknown as typeof apiValueMock}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(
        () => {
          expect(screen.getByTestId('input-error-messagebox')).toBeInTheDocument()
        },
        { timeout: 3000 },
      )

      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
    })

    it('does not call fadeOut when submission fails', async () => {
      const apiValueWithError = {
        ...apiValue,
        verifyMicrodeposit: vi.fn(() => Promise.reject(new Error('API Error'))),
      }

      const { user } = render(
        <ApiProvider apiValue={apiValueWithError as unknown as typeof apiValueMock}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      const secondInput = screen.getByTestId('amount-2-input')
      await user.type(firstInput, '0.05')
      await user.type(secondInput, '0.07')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(
        () => {
          expect(screen.getByTestId('input-error-messagebox')).toBeInTheDocument()
        },
        { timeout: 3000 },
      )

      expect(vi.mocked(fadeOut)).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('uses semantic heading for title', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const heading = screen.getByRole('heading', { name: 'Enter deposit amounts' })
      expect(heading.tagName).toBe('H2')
    })

    it('has aria-describedby for error messages on first amount', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const input = screen.getByTestId('amount-1-input')
        expect(input).toHaveAttribute('aria-describedby', 'firstAmount-error')
      })
    })

    it('has aria-describedby for error messages on second amount', async () => {
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      const firstInput = screen.getByTestId('amount-1-input')
      await user.type(firstInput, '0.05')

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        const secondInput = screen.getByTestId('amount-2-input')
        expect(secondInput).toHaveAttribute('aria-describedby', 'secondAmount-error')
      })
    })

    it('has autocomplete disabled for security', () => {
      render(
        <ApiProvider apiValue={apiValue}>
          <VerifyDeposits {...defaultProps} />
        </ApiProvider>,
      )

      expect(screen.getByTestId('amount-1-input')).toHaveAttribute('autocomplete', 'off')
      expect(screen.getByTestId('amount-2-input')).toHaveAttribute('autocomplete', 'off')
    })
  })
})
