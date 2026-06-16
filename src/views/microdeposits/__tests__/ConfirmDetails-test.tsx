import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { of, throwError, delay } from 'rxjs'

import { ConfirmDetails } from 'src/views/microdeposits/ConfirmDetails'
import { render, screen } from 'src/utilities/testingLibrary'
import { AccountFields, ReadableAccountTypes } from 'src/views/microdeposits/const'
import { POST_MESSAGES } from 'src/const/postMessages'
import { PostMessageContext } from 'src/ConnectWidget'
import { AnalyticContext } from 'src/Connect'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { initialState } from 'src/services/mockedData'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

import { fadeOut } from 'src/utilities/Animation'

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

interface ErrorResponse {
  response?: {
    error?: string
  }
}

interface ConfirmDetailsProps {
  accountDetails: AccountDetails
  currentMicrodeposit: Microdeposit
  onEditForm: (field: string) => void
  onError: (error: ErrorResponse) => void
  onSuccess: (microdeposit: Microdeposit) => void
  shouldShowUserDetails?: boolean
}

describe('ConfirmDetails', () => {
  let defaultProps: ConfirmDetailsProps
  let onPostMessage: ReturnType<typeof vi.fn>
  let onAnalyticEvent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onPostMessage = vi.fn()
    onAnalyticEvent = vi.fn()
    vi.mocked(fadeOut).mockClear()

    defaultProps = {
      accountDetails: {
        routing_number: '123456789',
        account_type: ReadableAccountTypes.CHECKING,
        account_number: '9876543210',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      },
      currentMicrodeposit: {},
      onEditForm: vi.fn(),
      onError: vi.fn(),
      onSuccess: vi.fn(),
      shouldShowUserDetails: false,
    }
  })

  describe('Initial Rendering', () => {
    it('renders the review header', () => {
      render(<ConfirmDetails {...defaultProps} />)

      expect(screen.getByText('Review your information')).toBeInTheDocument()
    })

    it('renders routing number detail row', () => {
      render(<ConfirmDetails {...defaultProps} />)

      expect(screen.getByText('Routing number')).toBeInTheDocument()
      expect(screen.getByText('123456789')).toBeInTheDocument()
    })

    it('renders account type detail row', () => {
      render(<ConfirmDetails {...defaultProps} />)

      expect(screen.getByText('Account type')).toBeInTheDocument()
      expect(screen.getByText('Checking')).toBeInTheDocument()
    })

    it('renders account number detail row', () => {
      render(<ConfirmDetails {...defaultProps} />)

      expect(screen.getByText('Account number')).toBeInTheDocument()
      expect(screen.getByText('9876543210')).toBeInTheDocument()
    })

    it('displays savings account type when provided', () => {
      const propsWithSavings = {
        ...defaultProps,
        accountDetails: {
          ...defaultProps.accountDetails,
          account_type: ReadableAccountTypes.SAVINGS,
        },
      }
      render(<ConfirmDetails {...propsWithSavings} />)

      expect(screen.getByText('Savings')).toBeInTheDocument()
    })

    it('renders confirm button', () => {
      render(<ConfirmDetails {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })

    it('renders disclaimer text', () => {
      render(<ConfirmDetails {...defaultProps} />)

      const disclaimer = screen.getByTestId('disclaimer-paragraph')
      expect(disclaimer).toHaveTextContent(/By clicking Confirm, I authorize/)
      expect(disclaimer).toHaveTextContent(/Dwolla, Inc./)
      expect(disclaimer).toHaveTextContent(/micro-deposit verification/)
    })

    it('does not render user details when shouldShowUserDetails is false', () => {
      render(<ConfirmDetails {...defaultProps} />)

      expect(screen.queryByText('First and last name')).not.toBeInTheDocument()
      expect(screen.queryByText('Email')).not.toBeInTheDocument()
    })

    it('renders user details when shouldShowUserDetails is true', () => {
      const propsWithUserDetails = {
        ...defaultProps,
        shouldShowUserDetails: true,
      }
      render(<ConfirmDetails {...propsWithUserDetails} />)

      expect(screen.getByText('First and last name')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    })
  })

  describe('Edit Button Functionality', () => {
    it('calls onEditForm with ROUTING_NUMBER when routing number edit is clicked', async () => {
      const { user } = render(<ConfirmDetails {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: 'Edit routing number' })
      await user.click(editButton)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalled()
        expect(defaultProps.onEditForm).toHaveBeenCalledWith(AccountFields.ROUTING_NUMBER)
      })
    })

    it('calls onEditForm with ACCOUNT_TYPE when account type edit is clicked', async () => {
      const { user } = render(<ConfirmDetails {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: 'Edit account type' })
      await user.click(editButton)

      await waitFor(() => {
        expect(defaultProps.onEditForm).toHaveBeenCalledWith(AccountFields.ACCOUNT_TYPE)
      })
    })

    it('calls onEditForm with ACCOUNT_NUMBER when account number edit is clicked', async () => {
      const { user } = render(<ConfirmDetails {...defaultProps} />)

      const editButton = screen.getByRole('button', { name: 'Edit account number' })
      await user.click(editButton)

      await waitFor(() => {
        expect(defaultProps.onEditForm).toHaveBeenCalledWith(AccountFields.ACCOUNT_NUMBER)
      })
    })

    it('calls onEditForm with USER_NAME when user name edit is clicked', async () => {
      const propsWithUserDetails = {
        ...defaultProps,
        shouldShowUserDetails: true,
      }
      const { user } = render(<ConfirmDetails {...propsWithUserDetails} />)

      const editButton = screen.getByRole('button', { name: 'Edit first and last name' })
      await user.click(editButton)

      await waitFor(() => {
        expect(defaultProps.onEditForm).toHaveBeenCalledWith(AccountFields.USER_NAME)
      })
    })

    it('calls onEditForm with EMAIL when email edit is clicked', async () => {
      const propsWithUserDetails = {
        ...defaultProps,
        shouldShowUserDetails: true,
      }
      const { user } = render(<ConfirmDetails {...propsWithUserDetails} />)

      const editButton = screen.getByRole('button', { name: 'Edit email' })
      await user.click(editButton)

      await waitFor(() => {
        expect(defaultProps.onEditForm).toHaveBeenCalledWith(AccountFields.EMAIL)
      })
    })
  })

  describe('Form Submission - Create New Microdeposit', () => {
    it('changes button text to "Sending..." when submitting', async () => {
      const createMicrodeposit = vi.fn(() =>
        of({ micro_deposit: { guid: 'MD-123' } }).pipe(delay(100)),
      )
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sending...' })).toBeInTheDocument()
      })
    })

    it('disables confirm button while submitting', async () => {
      const createMicrodeposit = vi.fn(() =>
        of({ micro_deposit: { guid: 'MD-123' } }).pipe(delay(100)),
      )
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(confirmButton).toBeDisabled()
      })
    })

    it('calls createMicrodeposit with correct account details', async () => {
      const createMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-123' } }))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(createMicrodeposit).toHaveBeenCalledWith({
          routing_number: '123456789',
          account_type: ReadableAccountTypes.CHECKING,
          account_number: '9876543210',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          account_name: 'Checking ...3210',
          user_guid: 'user-123',
        })
      })
    })

    it('generates correct account nickname with last 4 digits', async () => {
      const createMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-123' } }))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(createMicrodeposit).toHaveBeenCalledWith(
          expect.objectContaining({
            account_name: 'Checking ...3210',
          }),
        )
      })
    })

    it('generates savings account nickname correctly', async () => {
      const propsWithSavings = {
        ...defaultProps,
        accountDetails: {
          ...defaultProps.accountDetails,
          account_type: ReadableAccountTypes.SAVINGS,
        },
      }
      const createMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-123' } }))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...propsWithSavings} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(createMicrodeposit).toHaveBeenCalledWith(
          expect.objectContaining({
            account_name: 'Savings ...3210',
          }),
        )
      })
    })

    it('posts MICRODEPOSIT_DETAILS_SUBMITTED message on success', async () => {
      const createMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-123' } }))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MICRODEPOSIT_DETAILS_SUBMITTED, {
          microdeposit_guid: 'MD-123',
        })
      })
    })

    it('triggers analytics event on success', async () => {
      const createMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-123' } }))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onAnalyticEvent).toHaveBeenCalledWith(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
          type: 'message',
        })
      })
    })

    it('calls onSuccess with microdeposit data', async () => {
      const createMicrodeposit = vi.fn(() =>
        of({ micro_deposit: { guid: 'MD-123', status: 'initiated' } }),
      )
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith({
          guid: 'MD-123',
          status: 'initiated',
        })
      })
    })
  })

  describe('Form Submission - Update Existing Microdeposit', () => {
    it('calls updateMicrodeposit when currentMicrodeposit has guid', async () => {
      const propsWithExistingMD = {
        ...defaultProps,
        currentMicrodeposit: { guid: 'MD-EXISTING' },
      }
      const updateMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-EXISTING' } }))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, updateMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...propsWithExistingMD} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(updateMicrodeposit).toHaveBeenCalledWith('MD-EXISTING', {
          account_name: 'Checking ...3210',
          account_number: '9876543210',
          account_type: ReadableAccountTypes.CHECKING,
          routing_number: '123456789',
          user_guid: 'user-123',
        })
      })
    })

    it('does not call createMicrodeposit when updating', async () => {
      const propsWithExistingMD = {
        ...defaultProps,
        currentMicrodeposit: { guid: 'MD-EXISTING' },
      }
      const createMicrodeposit = vi.fn()
      const updateMicrodeposit = vi.fn(() => of({ micro_deposit: { guid: 'MD-EXISTING' } }))
      const { user } = render(
        <ApiProvider
          apiValue={
            {
              ...apiValueMock,
              createMicrodeposit,
              updateMicrodeposit,
            } as unknown as typeof apiValueMock
          }
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...propsWithExistingMD} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(updateMicrodeposit).toHaveBeenCalled()
        expect(createMicrodeposit).not.toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('calls onError when createMicrodeposit fails', async () => {
      const errorResponse = { response: { error: 'Invalid account' } }
      const createMicrodeposit = vi.fn(() => throwError(() => errorResponse))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith({ error: 'Invalid account' })
      })
    })

    it('calls fadeOut animation before calling onError', async () => {
      const errorResponse = { response: { error: 'Invalid account' } }
      const createMicrodeposit = vi.fn(() => throwError(() => errorResponse))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(vi.mocked(fadeOut)).toHaveBeenCalled()
        expect(defaultProps.onError).toHaveBeenCalled()
      })
    })

    it('re-enables button after error', async () => {
      const errorResponse = { response: { error: 'Invalid account' } }
      const createMicrodeposit = vi.fn(() => throwError(() => errorResponse))
      const { user } = render(
        <ApiProvider
          apiValue={{ ...apiValueMock, createMicrodeposit } as unknown as typeof apiValueMock}
        >
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <AnalyticContext.Provider value={{ onAnalyticEvent }}>
              <ConfirmDetails {...defaultProps} />
            </AnalyticContext.Provider>
          </PostMessageContext.Provider>
        </ApiProvider>,
        {
          preloadedState: {
            ...initialState,
            profiles: {
              ...initialState.profiles,
              user: { guid: 'user-123' },
            },
          },
        },
      )

      const confirmButton = screen.getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalled()
      })

      // Wait for button to be re-enabled
      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled()
      })
    })
  })
})
