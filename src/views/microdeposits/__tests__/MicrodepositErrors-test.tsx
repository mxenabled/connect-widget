import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'

import { MicrodepositErrors as MicrodepositErrorsComponent } from 'src/views/microdeposits/MicrodepositErrors'
import { render, screen } from 'src/utilities/testingLibrary'
import {
  MicrodepositsStatuses,
  ReadableAccountTypes,
  ReadableStatuses,
} from 'src/views/microdeposits/const'
import { POST_MESSAGES } from 'src/const/postMessages'
import { PostMessageContext } from 'src/ConnectWidget'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

const MicrodepositErrors = MicrodepositErrorsComponent as React.FC<{
  accountDetails?: AccountDetails
  microdeposit?: Microdeposit
  microdepositCreateError?: MicrodepositCreateError
  onResetMicrodeposits: () => void
  resetMicrodeposits: () => void
}>

interface AccountDetails {
  account_number?: string
  routing_number?: string
  account_type?: number
}

interface Microdeposit {
  guid?: string
  status?: number
  account_number?: string
  routing_number?: string
  account_type?: number
}

interface MicrodepositCreateError {
  status?: number
  data?: {
    micro_deposit?: {
      account_number?: string
      routing_number?: string
      account_type?: number
    }
  }
}

interface MicrodepositErrorsProps {
  accountDetails?: AccountDetails
  microdeposit?: Microdeposit
  microdepositCreateError?: MicrodepositCreateError
  onResetMicrodeposits: () => void
  resetMicrodeposits: () => void
}

describe('MicrodepositErrors', () => {
  let defaultProps: MicrodepositErrorsProps
  let onPostMessage: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onPostMessage = vi.fn()
    vi.mocked(fadeOut).mockClear()

    defaultProps = {
      microdeposit: {
        guid: 'MD-123',
        status: MicrodepositsStatuses.ERRORED,
        account_number: '9876543210',
        routing_number: '123456789',
        account_type: ReadableAccountTypes.CHECKING,
      },
      onResetMicrodeposits: vi.fn(),
      resetMicrodeposits: vi.fn(),
    }
  })

  describe('PREVENTED Status - Too Many Failed Attempts', () => {
    it('renders "Account not connected" title for PREVENTED status', () => {
      const propsWithPrevented = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.PREVENTED,
        },
      }
      render(<MicrodepositErrors {...propsWithPrevented} />)

      expect(screen.getByText('Account not connected')).toBeInTheDocument()
    })

    it('renders failed attempts message for PREVENTED status', () => {
      const propsWithPrevented = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.PREVENTED,
        },
      }
      render(<MicrodepositErrors {...propsWithPrevented} />)

      const message = screen.getByRole('alert')
      expect(message.textContent).toContain('This account')
      expect(message.textContent).toContain('too many failed attempts')
    })

    it('shows Continue button for PREVENTED status', () => {
      const propsWithPrevented = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.PREVENTED,
        },
      }
      render(<MicrodepositErrors {...propsWithPrevented} />)

      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Edit details' })).not.toBeInTheDocument()
    })

    it('posts error message and BACK_TO_SEARCH when Continue is clicked for PREVENTED', async () => {
      const propsWithPrevented = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-456',
          status: MicrodepositsStatuses.PREVENTED,
        },
      }
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <MicrodepositErrors {...propsWithPrevented} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/error/primaryAction', {
        status: ReadableStatuses[MicrodepositsStatuses.PREVENTED as keyof typeof ReadableStatuses],
        guid: 'MD-456',
      })
      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
    })

    it('calls onResetMicrodeposits after fadeOut for PREVENTED status', async () => {
      const propsWithPrevented = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.PREVENTED,
        },
      }
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <MicrodepositErrors {...propsWithPrevented} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
        expect(defaultProps.onResetMicrodeposits).toHaveBeenCalled()
      })
    })
  })

  describe('REJECTED Status', () => {
    it('renders "Something went wrong" title for REJECTED status', () => {
      const propsWithRejected = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.REJECTED,
        },
      }
      render(<MicrodepositErrors {...propsWithRejected} />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders try again later message for REJECTED status', () => {
      const propsWithRejected = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          status: MicrodepositsStatuses.REJECTED,
        },
      }
      render(<MicrodepositErrors {...propsWithRejected} />)

      const message = screen.getByRole('alert')
      expect(message.textContent).toContain('unable to connect this account')
      expect(message.textContent).toContain('Please try again later')
    })

    it('posts error message and BACK_TO_SEARCH when Continue is clicked for REJECTED', async () => {
      const propsWithRejected = {
        ...defaultProps,
        microdeposit: {
          guid: 'MD-789',
          status: MicrodepositsStatuses.REJECTED,
        },
      }
      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <MicrodepositErrors {...propsWithRejected} />
        </PostMessageContext.Provider>,
      )

      const continueButton = screen.getByRole('button', { name: 'Continue' })
      await user.click(continueButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/microdeposits/error/primaryAction', {
        status: ReadableStatuses[MicrodepositsStatuses.REJECTED as keyof typeof ReadableStatuses],
        guid: 'MD-789',
      })
      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
    })
  })

  describe('ERRORED Status - Review Account Details', () => {
    it('renders "Something went wrong" title for ERRORED status', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders review details message for ERRORED status', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      const message = screen.getByRole('alert')
      expect(message.textContent).toContain('unable to connect this account')
      expect(message.textContent).toContain('Please review the account details')
    })

    it('shows Edit details button for ERRORED status', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Edit details' })).toBeInTheDocument()
    })

    it('shows Connect a different account button for ERRORED status', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Connect a different account' }),
      ).toBeInTheDocument()
    })

    it('calls resetMicrodeposits when Edit details is clicked', async () => {
      const { user } = render(<MicrodepositErrors {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: 'Edit details' })
      await user.click(editButton)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalled()
        expect(defaultProps.resetMicrodeposits).toHaveBeenCalled()
      })
    })

    it('calls onResetMicrodeposits when Connect a different account is clicked', async () => {
      const { user } = render(<MicrodepositErrors {...defaultProps} />)

      const differentAccountButton = screen.getByRole('button', {
        name: 'Connect a different account',
      })
      await user.click(differentAccountButton)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalled()
        expect(defaultProps.onResetMicrodeposits).toHaveBeenCalled()
      })
    })
  })

  describe('Create Error with 400 Status', () => {
    it('renders review details message for 400 create error', () => {
      const propsWithCreateError = {
        ...defaultProps,
        microdeposit: { status: undefined },
        microdepositCreateError: {
          status: 400,
          data: {
            micro_deposit: {
              account_number: '1234567890',
              routing_number: '987654321',
              account_type: ReadableAccountTypes.SAVINGS,
            },
          },
        },
      }
      render(<MicrodepositErrors {...propsWithCreateError} />)

      const message = screen.getByRole('alert')
      expect(message.textContent).toContain('unable to connect this account')
      expect(message.textContent).toContain('Please review the account details')
    })

    it('shows Edit details button for 400 create error', () => {
      const propsWithCreateError = {
        ...defaultProps,
        microdeposit: { status: undefined },
        microdepositCreateError: {
          status: 400,
          data: {
            micro_deposit: {
              account_number: '1234567890',
              routing_number: '987654321',
              account_type: ReadableAccountTypes.SAVINGS,
            },
          },
        },
      }
      render(<MicrodepositErrors {...propsWithCreateError} />)

      expect(screen.getByRole('button', { name: 'Edit details' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Connect a different account' }),
      ).toBeInTheDocument()
    })
  })

  describe('Account Details Display', () => {
    it('displays account type from microdeposit', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      expect(screen.getByText('Account type')).toBeInTheDocument()
      expect(screen.getByText('Checking')).toBeInTheDocument()
    })

    it('displays savings account type correctly', () => {
      const propsWithSavings = {
        ...defaultProps,
        microdeposit: {
          ...defaultProps.microdeposit,
          account_type: ReadableAccountTypes.SAVINGS,
        },
      }
      render(<MicrodepositErrors {...propsWithSavings} />)

      expect(screen.getByText('Savings')).toBeInTheDocument()
    })

    it('displays routing number from microdeposit', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      expect(screen.getByText('Routing number')).toBeInTheDocument()
      expect(screen.getByText('123456789')).toBeInTheDocument()
    })

    it('displays masked account number with last 4 digits', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      expect(screen.getByText('Account number')).toBeInTheDocument()
      expect(screen.getByText('•••• 3210')).toBeInTheDocument()
    })

    it('displays account number from microdepositCreateError when microdeposit is missing', () => {
      const propsWithCreateError = {
        ...defaultProps,
        microdeposit: { status: undefined },
        microdepositCreateError: {
          status: 400,
          data: {
            micro_deposit: {
              account_number: '1111222233334444',
              routing_number: '555666777',
              account_type: ReadableAccountTypes.CHECKING,
            },
          },
        },
      }
      render(<MicrodepositErrors {...propsWithCreateError} />)

      expect(screen.getByText('•••• 4444')).toBeInTheDocument()
      expect(screen.getByText('555666777')).toBeInTheDocument()
      expect(screen.getByText('Checking')).toBeInTheDocument()
    })

    it('displays account details from accountDetails as fallback', () => {
      const propsWithAccountDetails = {
        ...defaultProps,
        microdeposit: {},
        accountDetails: {
          account_number: '9999888877776666',
          routing_number: '111222333',
          account_type: ReadableAccountTypes.SAVINGS,
        },
      }
      render(<MicrodepositErrors {...propsWithAccountDetails} />)

      expect(screen.getByText('•••• 6666')).toBeInTheDocument()
      expect(screen.getByText('111222333')).toBeInTheDocument()
      expect(screen.getByText('Savings')).toBeInTheDocument()
    })

    it('displays dash when account details are missing', () => {
      const propsWithNoDetails = {
        ...defaultProps,
        microdeposit: {},
      }
      render(<MicrodepositErrors {...propsWithNoDetails} />)

      const dashes = screen.getAllByText('-')
      expect(dashes.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Error Message Box', () => {
    it('renders error message box with alert role', () => {
      render(<MicrodepositErrors {...defaultProps} />)

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert.textContent).toContain('We')
      expect(alert.textContent).toContain('unable to connect this account')
      expect(alert.textContent).toContain('Please review the account details')
    })
  })

  describe('Animation and Callbacks', () => {
    it('calls fadeOut with down direction for Edit details', async () => {
      const { user } = render(<MicrodepositErrors {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: 'Edit details' })
      await user.click(editButton)

      expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
    })

    it('calls fadeOut with down direction for Connect different account', async () => {
      const { user } = render(<MicrodepositErrors {...defaultProps} />)

      const differentButton = screen.getByRole('button', { name: 'Connect a different account' })
      await user.click(differentButton)

      expect(vi.mocked(fadeOut)).toHaveBeenCalledWith(expect.any(Object), 'down')
    })
  })
})
