import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import userEvent from '@testing-library/user-event'
import { LoginError } from 'src/views/loginError/LoginError'
import { PageviewInfo } from 'src/const/Analytics'
import { useAnalyticsPath } from 'src/hooks/useAnalyticsPath'
import { initialState as defaultState } from 'src/services/mockedData'
import { ConnectionStatusMap, ReadableStatuses } from 'src/const/Statuses'
import { PostMessageContext } from 'src/ConnectWidget'
import { ActionTypes } from 'src/redux/actions/Connect'

const institutionMock = {
  name: 'Institution',
  guid: 'INS-123',
}
const memberMock = {
  guid: 'MEM-123',
  error: {},
  name: 'Member',
  connection_status: ReadableStatuses.EXPIRED,
}

vitest.mock('src/hooks/useAnalyticsPath', { spy: true })

export const dispatch = vitest.fn()
vitest.mock('react-redux', async (importActual) => {
  const actual = await importActual()
  return { ...actual, useDispatch: () => dispatch }
})

describe('LoginError', () => {
  const initialState = {
    ...defaultState,
    connect: {
      ...defaultState.connect,
      selectedInstitution: institutionMock,
      currentMemberGuid: memberMock.guid,
      members: [memberMock],
      location: [{ step: 'LOGIN_ERROR' }],
    },
  }
  const defaultProps = {
    institution: institutionMock,
    isDeleteInstitutionOptionEnabled: true,
    member: memberMock,
    onDeleteConnectionClick: vitest.fn(),
    onRefreshClick: vitest.fn(),
    onUpdateCredentialsClick: vitest.fn(),
    showExternalLinkPopup: false,
    showSupport: true,
    size: 'medium',
  }
  let onPostMessage

  beforeEach(() => {
    vitest.clearAllMocks()
    onPostMessage = vitest.fn()
  })

  it('should fire a pageview event with correct parameters', () => {
    render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <LoginError {...defaultProps} />
      </PostMessageContext.Provider>,
      {
        preloadedState: initialState,
      },
    )
    expect(useAnalyticsPath).toHaveBeenCalledWith(...PageviewInfo.CONNECT_LOGIN_ERROR, {
      connection_status: memberMock.connection_status,
      readable_status: ConnectionStatusMap[memberMock.connection_status],
    })
  })

  it('should render an institution logo without a badge', () => {
    render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <LoginError {...defaultProps} />
      </PostMessageContext.Provider>,
      {
        preloadedState: initialState,
      },
    )
    const institutionLogo = screen.getByRole('img')
    expect(institutionLogo).toBeInTheDocument()
    expect(institutionLogo).toHaveAttribute('alt', `${institutionMock.name} logo`)

    const badge = screen.queryByText('!')
    expect(badge).not.toBeInTheDocument()
  })

  it('posts member error message on mount', () => {
    render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <LoginError {...defaultProps} />
      </PostMessageContext.Provider>,
      {
        preloadedState: initialState,
      },
    )

    expect(onPostMessage).toHaveBeenCalledWith('connect/memberError', {
      member: {
        guid: memberMock.guid,
        connection_status: memberMock.connection_status,
      },
    })
  })

  describe('Connection Status Variants', () => {
    it('renders PREVENTED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.PREVENTED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('New credentials needed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    })

    it('renders DENIED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.DENIED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Please re-enter your credentials')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    })

    it('renders REJECTED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.REJECTED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Incorrect information')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })

    it('renders LOCKED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.LOCKED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Account is locked')).toBeInTheDocument()
    })

    it('renders DEGRADED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.DEGRADED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Connection maintenance')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
    })

    it('renders DISCONNECTED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.DISCONNECTED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Connection maintenance')).toBeInTheDocument()
    })

    it('renders DISCONTINUED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.DISCONTINUED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Connection discontinued')).toBeInTheDocument()
    })

    it('renders CLOSED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.CLOSED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Closed account')).toBeInTheDocument()
    })

    it('renders FAILED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.FAILED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })

    it('renders DISABLED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.DISABLED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Connection disabled')).toBeInTheDocument()
    })

    it('renders IMPORTED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.IMPORTED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('New credentials needed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    })

    it('renders CHALLENGED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.CHALLENGED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })

    it('renders IMPAIRED status correctly', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.IMPAIRED }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('New credentials needed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument()
    })

    it('renders default status for unknown connection status', () => {
      const member = { ...memberMock, connection_status: 'UNKNOWN_STATUS' }
      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(
        screen.getByText(
          "We've notified support and are looking into the issue. Please try again later.",
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Primary Actions', () => {
    it('calls onRefreshClick when Try again button is clicked', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.REJECTED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const tryAgainButton = screen.getByRole('button', { name: 'Try again' })
      await user.click(tryAgainButton)

      expect(defaultProps.onRefreshClick).toHaveBeenCalled()
    })

    it('calls onUpdateCredentialsClick when Connect button is clicked', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.PREVENTED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const connectButton = screen.getByRole('button', { name: 'Connect' })
      await user.click(connectButton)

      expect(defaultProps.onUpdateCredentialsClick).toHaveBeenCalled()
    })

    it('dispatches LOGIN_ERROR_START_OVER when OK button is clicked without disable_institution_search', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.DEGRADED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const okButton = screen.getByRole('button', { name: 'OK' })
      await user.click(okButton)

      expect(onPostMessage).toHaveBeenCalledWith('connect/memberError/primaryAction', {
        member: {
          guid: memberMock.guid,
          connection_status: member.connection_status,
        },
      })

      const calls = dispatch.mock.calls
      const startOverCall = calls.find(
        (call) => call[0]?.type === ActionTypes.LOGIN_ERROR_START_OVER,
      )
      expect(startOverCall).toBeDefined()
    })

    it('calls onUpdateCredentialsClick when OK button is clicked with disable_institution_search', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.DEGRADED }
      const stateWithDisabledSearch = {
        ...initialState,
        config: {
          ...initialState.config,
          disable_institution_search: true,
        },
      }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: stateWithDisabledSearch },
      )

      const okButton = screen.getByRole('button', { name: 'OK' })
      await user.click(okButton)

      expect(defaultProps.onUpdateCredentialsClick).toHaveBeenCalled()
    })
  })

  describe('Secondary Actions', () => {
    it('renders Get help button when showSupport is true', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.PREVENTED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Get help')).toBeInTheDocument()
    })

    it('shows support view when Get help is clicked', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.PREVENTED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const getHelpButton = screen.getByText('Get help')
      await user.click(getHelpButton)

      await waitFor(() => {
        expect(screen.queryByText('New credentials needed')).not.toBeInTheDocument()
      })
    })

    it('renders Try another institution button', () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.REJECTED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(screen.getByText('Try another institution')).toBeInTheDocument()
    })

    it('dispatches LOGIN_ERROR_START_OVER when Try another institution is clicked', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.REJECTED }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const tryAnotherButton = screen.getByText('Try another institution')
      await user.click(tryAnotherButton)

      const calls = dispatch.mock.calls
      const startOverCall = calls.find(
        (call) => call[0]?.type === ActionTypes.LOGIN_ERROR_START_OVER,
      )
      expect(startOverCall).toBeDefined()
    })
  })

  describe('Navigation Ref', () => {
    it('provides handleBackButton that returns to main view from support', async () => {
      const user = userEvent.setup()
      const member = { ...memberMock, connection_status: ReadableStatuses.PREVENTED }
      const ref = { current: null }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} member={member} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      const getHelpButton = screen.getByText('Get help')
      await user.click(getHelpButton)

      await waitFor(() => {
        expect(screen.queryByText('New credentials needed')).not.toBeInTheDocument()
      })

      expect(ref.current.showBackButton()).toBe(true)

      ref.current.handleBackButton()

      await waitFor(() => {
        expect(screen.getByText('New credentials needed')).toBeInTheDocument()
      })
    })

    it('showBackButton returns false when not in support view', () => {
      const ref = { current: null }

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <LoginError {...defaultProps} ref={ref} />
        </PostMessageContext.Provider>,
        { preloadedState: initialState },
      )

      expect(ref.current.showBackButton()).toBe(false)
    })
  })
})
