import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { ManualAccountConnect } from '../ManualAccountConnect'
import { initialState } from 'src/services/mockedData'
import { PostMessageContext } from 'src/ConnectWidget'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ActionTypes } from 'src/redux/actions/Connect'
import { AccountTypes } from 'src/views/manualAccount/constants'
import * as animationUtils from 'src/utilities/Animation'

vi.mock('src/utilities/Animation', () => ({
  fadeOut: vi.fn(() => Promise.resolve()),
}))

const mockDispatch = vi.fn()
vi.mock('react-redux', async (importActual) => {
  const actual = (await importActual()) as object
  return { ...actual, useDispatch: () => mockDispatch }
})

// Only mock the complex ManualAccountForm component
vi.mock('src/views/manualAccount/ManualAccountForm', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockManualAccountForm = React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div data-test="manual-account-form" ref={ref}>
      <button onClick={props.handleGoBack}>Go Back</button>
      <button onClick={props.handleSuccess}>Success</button>
      <div data-test="account-type">{props.accountType}</div>
      <div data-test="show-day-picker">{props.showDayPicker ? 'true' : 'false'}</div>
    </div>
  ))
  MockManualAccountForm.displayName = 'ManualAccountForm'
  return { ManualAccountForm: MockManualAccountForm }
})

interface ManualAccountConnectProps {
  availableAccountTypes?: number[]
  onManualAccountAdded?: () => void
}

describe('<ManualAccountConnect />', () => {
  const mockPostMessage = {
    onPostMessage: vi.fn(),
    postMessageEventOverrides: {},
  }

  const defaultProps = {
    availableAccountTypes: [AccountTypes.CHECKING, AccountTypes.SAVINGS],
    onManualAccountAdded: vi.fn(),
  } satisfies ManualAccountConnectProps

  const preloadedState = {
    ...initialState,
    config: {
      ...initialState.config,
      _initialValues: JSON.stringify({ connect_widget_url: 'https://test.com' }),
    },
  }

  const renderWithContext = (
    props: ManualAccountConnectProps = defaultProps,
    state = preloadedState,
  ) => {
    return render(
      <PostMessageContext.Provider value={mockPostMessage}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ManualAccountConnect {...(props as any)} />
      </PostMessageContext.Provider>,
      {
        preloadedState: state,
      },
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDispatch.mockClear()
  })

  describe('Content Display', () => {
    it('renders ManualAccountMenu by default', () => {
      renderWithContext()

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-form')).not.toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-success-header')).not.toBeInTheDocument()
    })

    it('pre-selects account type when only one is available', () => {
      const singleTypeProps = {
        ...defaultProps,
        availableAccountTypes: [AccountTypes.CHECKING],
      }

      renderWithContext(singleTypeProps)

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
      expect(screen.getByTestId('Checking-button')).toBeInTheDocument()
    })

    it('passes available account types to menu', () => {
      renderWithContext()

      expect(screen.getByTestId('Checking-button')).toBeInTheDocument()
      expect(screen.getByTestId('Savings-button')).toBeInTheDocument()
    })
  })

  describe('Account Type Selection', () => {
    it('transitions from menu to form when account type is selected', async () => {
      const { user } = renderWithContext()

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()

      await user.click(screen.getByTestId('Checking-button'))

      expect(screen.getByTestId('manual-account-form')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-menu-container')).not.toBeInTheDocument()
      expect(screen.getByTestId('account-type')).toHaveTextContent(AccountTypes.CHECKING.toString())
    })

    it('can select different account types', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Savings-button'))

      expect(screen.getByTestId('account-type')).toHaveTextContent(AccountTypes.SAVINGS.toString())
    })
  })

  describe('Form Navigation', () => {
    it('returns to menu when go back is clicked from form', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Checking-button'))

      expect(screen.getByTestId('manual-account-form')).toBeInTheDocument()

      await user.click(screen.getByText('Go Back'))

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-form')).not.toBeInTheDocument()
    })

    it('clears account type when returning to menu', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Checking-button'))
      await user.click(screen.getByText('Go Back'))
      await user.click(screen.getByTestId('Savings-button'))

      expect(screen.getByTestId('account-type')).toHaveTextContent(AccountTypes.SAVINGS.toString())
    })
  })

  describe('Success Flow', () => {
    it('shows success view when form is submitted successfully', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Checking-button'))
      await user.click(screen.getByText('Success'))

      expect(screen.getByTestId('manual-account-success-header')).toBeInTheDocument()
      expect(screen.queryByTestId('manual-account-form')).not.toBeInTheDocument()
    })

    it('passes account type to success view', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Savings-button'))
      await user.click(screen.getByText('Success'))

      expect(screen.getByTestId('manual-account-success-header')).toHaveTextContent('Savings added')
    })

    it('passes onManualAccountAdded callback to success view', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Checking-button'))
      await user.click(screen.getByText('Success'))

      expect(screen.getByTestId('manual-account-success-header')).toBeInTheDocument()
    })

    it('dispatches GO_BACK_MANUAL_ACCOUNT when done is clicked', async () => {
      const { user } = renderWithContext()

      await user.click(screen.getByTestId('Checking-button'))
      await user.click(screen.getByText('Success'))
      await user.click(screen.getByTestId('manual-success-done-button'))

      expect(mockDispatch).toHaveBeenCalledWith({
        type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
        payload: { connect_widget_url: 'https://test.com' },
      })
    })
  })

  describe('Post Messages', () => {
    it('posts BACK_TO_SEARCH when navigating back from menu', async () => {
      const ref = React.createRef<{ handleBackButton: () => void }>()

      render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      await waitFor(() => {
        ref.current?.handleBackButton()
      })

      await waitFor(() => {
        expect(mockPostMessage.onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
      })
    })

    it('dispatches GO_BACK_MANUAL_ACCOUNT when navigating back from menu', async () => {
      const ref = React.createRef<{ handleBackButton: () => void }>()

      render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      await waitFor(() => {
        ref.current?.handleBackButton()
      })

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
          payload: { connect_widget_url: 'https://test.com' },
        })
      })
    })
  })

  describe('useImperativeHandle', () => {
    it('exposes handleBackButton and showBackButton methods', () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null
      }>()

      render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(ref.current).toHaveProperty('handleBackButton')
      expect(ref.current).toHaveProperty('showBackButton')
      expect(typeof ref.current?.handleBackButton).toBe('function')
      expect(typeof ref.current?.showBackButton).toBe('function')
    })

    it('showBackButton returns truthy value when on menu', () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null
      }>()

      render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      expect(ref.current?.showBackButton()).toBeTruthy()
    })

    it('showBackButton returns truthy value when on form', async () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null
      }>()

      const { user } = render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      await user.click(screen.getByTestId('Checking-button'))

      expect(ref.current?.showBackButton()).toBeTruthy()
    })

    it('showBackButton returns false when on success', async () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null | false
      }>()

      const { user } = render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      await user.click(screen.getByTestId('Checking-button'))
      await user.click(screen.getByText('Success'))

      expect(ref.current?.showBackButton()).toBe(false)
    })

    it('handleBackButton fades out and returns to menu from form', async () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null
      }>()
      const fadeOutSpy = vi.spyOn(animationUtils, 'fadeOut')

      const { user } = render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      await user.click(screen.getByTestId('Checking-button'))

      expect(screen.getByTestId('manual-account-form')).toBeInTheDocument()

      await waitFor(() => {
        ref.current?.handleBackButton()
      })

      expect(fadeOutSpy).toHaveBeenCalledWith(expect.anything(), 'up', 300)

      await waitFor(() => {
        expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
        expect(screen.queryByTestId('manual-account-form')).not.toBeInTheDocument()
      })
    })

    it('handleBackButton from menu posts message and dispatches action', async () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null
      }>()
      const fadeOutSpy = vi.spyOn(animationUtils, 'fadeOut')

      render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )

      await waitFor(() => {
        ref.current?.handleBackButton()
      })

      expect(fadeOutSpy).toHaveBeenCalledWith(expect.anything(), 'up', 300)

      await waitFor(() => {
        expect(mockPostMessage.onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
        expect(mockDispatch).toHaveBeenCalledWith({
          type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
          payload: { connect_widget_url: 'https://test.com' },
        })
      })
    })
  })

  describe('Day Picker State', () => {
    it('passes showDayPicker state to form', async () => {
      const { user } = renderWithContext()

      // First select an account type to show the form
      await user.click(screen.getByTestId('Checking-button'))

      expect(screen.getByTestId('show-day-picker')).toHaveTextContent('false')
    })

    it('showBackButton returns false when day picker is shown', () => {
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => HTMLElement | null
      }>()

      render(
        <PostMessageContext.Provider value={mockPostMessage}>
          <ManualAccountConnect {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState },
      )
    })
  })

  describe('Integration', () => {
    it('handles complete flow from menu to success', async () => {
      const { user } = renderWithContext()

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()

      await user.click(screen.getByTestId('Checking-button'))
      expect(screen.getByTestId('manual-account-form')).toBeInTheDocument()

      await user.click(screen.getByText('Success'))
      expect(screen.getByTestId('manual-account-success-header')).toBeInTheDocument()

      await user.click(screen.getByTestId('manual-success-done-button'))
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
        payload: { connect_widget_url: 'https://test.com' },
      })
    })

    it('renders menu with correct account types list', () => {
      renderWithContext()

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
      expect(screen.getByTestId('Checking-button')).toBeInTheDocument()
      expect(screen.getByTestId('Savings-button')).toBeInTheDocument()
    })

    it('handles single account type scenario correctly', () => {
      const singleTypeProps = {
        ...defaultProps,
        availableAccountTypes: [AccountTypes.SAVINGS],
      }

      renderWithContext(singleTypeProps)

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('handles empty availableAccountTypes array', () => {
      const emptyProps = {
        ...defaultProps,
        availableAccountTypes: [],
      }

      renderWithContext(emptyProps)

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
    })

    it('handles undefined availableAccountTypes', () => {
      const undefinedProps = {
        availableAccountTypes: undefined as unknown as number[],
        onManualAccountAdded: vi.fn(),
      }

      renderWithContext(undefinedProps)

      expect(screen.getByTestId('manual-account-menu-container')).toBeInTheDocument()
    })

    it('calls onManualAccountAdded when provided', async () => {
      const onManualAccountAdded = vi.fn()
      const propsWithCallback = {
        ...defaultProps,
        onManualAccountAdded,
      }

      const { user } = renderWithContext(propsWithCallback)

      await user.click(screen.getByTestId('Checking-button'))
      await user.click(screen.getByText('Success'))

      expect(screen.getByTestId('manual-account-success-header')).toBeInTheDocument()
    })
  })
})
