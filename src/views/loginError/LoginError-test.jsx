import React from 'react'
import { act, render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { LoginError } from 'src/views/loginError/LoginError'
import { initialState as defaultState } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { PostMessageContext } from 'src/ConnectWidget'
import { POST_MESSAGES } from 'src/const/postMessages'
import { STEPS } from 'src/const/Connect'

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

  const renderLoginError = (props = {}, preloadedState = initialState) =>
    render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <LoginError {...defaultProps} {...props} />
      </PostMessageContext.Provider>,
      { preloadedState },
    )

  const renderStepProps = {
    availableAccountTypes: [],
    handleConsentGoBack: vitest.fn(),
    handleCredentialsGoBack: vitest.fn(),
    navigationRef: React.createRef(),
    onManualAccountAdded: vitest.fn(),
    onUpsertMember: vitest.fn(),
    setConnectLocalState: vitest.fn(),
  }

  const renderErrorStep = (connection_status, preloadedState = initialState) => {
    const member = { ...memberMock, connection_status }

    return render(<RenderConnectStep {...renderStepProps} />, {
      preloadedState: {
        ...preloadedState,
        connect: {
          ...preloadedState.connect,
          location: [{ step: STEPS.ACTIONABLE_ERROR }],
          selectedInstitution: institutionMock,
          currentMemberGuid: member.guid,
          members: [member],
        },
      },
    })
  }

  beforeEach(() => {
    vitest.clearAllMocks()
    onPostMessage = vitest.fn()
  })

  it('renders the institution logo without an error badge', () => {
    renderLoginError()

    const institutionLogo = screen.getByRole('img')
    expect(institutionLogo).toBeInTheDocument()
    expect(institutionLogo).toHaveAttribute('alt', `${institutionMock.name} logo`)
    expect(screen.queryByText('!')).not.toBeInTheDocument()
  })

  it('posts a member error message on mount', () => {
    renderLoginError()

    expect(onPostMessage).toHaveBeenCalledWith('connect/memberError', {
      member: {
        guid: memberMock.guid,
        connection_status: memberMock.connection_status,
      },
    })
  })

  describe('Connection Status Variants', () => {
    it.each([
      { status: ReadableStatuses.PREVENTED, title: 'New credentials needed', button: 'Connect' },
      {
        status: ReadableStatuses.DENIED,
        title: 'Please re-enter your credentials',
        button: 'Connect',
      },
      { status: ReadableStatuses.REJECTED, title: 'Incorrect information', button: 'Try again' },
      { status: ReadableStatuses.LOCKED, title: 'Account is locked' },
      { status: ReadableStatuses.DEGRADED, title: 'Connection maintenance', button: 'OK' },
      { status: ReadableStatuses.DISCONNECTED, title: 'Connection maintenance' },
      { status: ReadableStatuses.DISCONTINUED, title: 'Connection discontinued' },
      { status: ReadableStatuses.CLOSED, title: 'Closed account' },
      { status: ReadableStatuses.FAILED, title: 'Connection failed' },
      { status: ReadableStatuses.DISABLED, title: 'Connection disabled' },
      { status: ReadableStatuses.IMPORTED, title: 'New credentials needed', button: 'Connect' },
      { status: ReadableStatuses.CHALLENGED, title: 'Something went wrong', button: 'Try again' },
      { status: ReadableStatuses.IMPAIRED, title: 'New credentials needed', button: 'Connect' },
    ])(
      'renders the "$title" view for the $status connection status',
      ({ status, title, button }) => {
        renderLoginError({ member: { ...memberMock, connection_status: status } })

        expect(screen.getByText(title)).toBeInTheDocument()
        if (button) {
          expect(screen.getByRole('button', { name: button })).toBeInTheDocument()
        }
      },
    )

    it('renders a generic error for an unknown connection status', () => {
      renderLoginError({ member: { ...memberMock, connection_status: 'UNKNOWN_STATUS' } })

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(
        screen.getByText(
          "We've notified support and are looking into the issue. Please try again later.",
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Primary Actions', () => {
    it('returns to connecting when the Try again button is clicked', async () => {
      const { user } = renderErrorStep(ReadableStatuses.REJECTED)

      expect(await screen.findByText('Incorrect information')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Try again' }))

      expect(screen.queryByText('Incorrect information')).not.toBeInTheDocument()
    })

    it('opens the update credentials form when the Connect button is clicked', async () => {
      const { user } = renderErrorStep(ReadableStatuses.PREVENTED)

      await user.click(await screen.findByRole('button', { name: 'Connect' }))

      expect(await screen.findByLabelText('Username *')).toBeInTheDocument()
    })

    it('posts a primary action message when the OK button is clicked', async () => {
      const member = { ...memberMock, connection_status: ReadableStatuses.DEGRADED }
      const { user } = renderLoginError({ member })

      await user.click(screen.getByRole('button', { name: 'OK' }))

      expect(onPostMessage).toHaveBeenCalledWith('connect/memberError/primaryAction', {
        member: {
          guid: member.guid,
          connection_status: member.connection_status,
        },
      })
    })

    it('opens the update credentials form when OK is clicked and institution search is disabled', async () => {
      const stateWithDisabledSearch = {
        ...initialState,
        config: {
          ...initialState.config,
          disable_institution_search: true,
        },
      }
      const { user } = renderErrorStep(ReadableStatuses.DEGRADED, stateWithDisabledSearch)

      await user.click(await screen.findByRole('button', { name: 'OK' }))

      expect(await screen.findByLabelText('Username *')).toBeInTheDocument()
    })
  })

  describe('Secondary Actions', () => {
    it('opens the support view when the Get help button is clicked', async () => {
      const { user } = renderLoginError({
        member: { ...memberMock, connection_status: ReadableStatuses.PREVENTED },
      })

      expect(screen.getByText('Get help')).toBeInTheDocument()

      await user.click(screen.getByText('Get help'))

      expect(await screen.findByText('Request support')).toBeInTheDocument()
      expect(screen.queryByText('New credentials needed')).not.toBeInTheDocument()
    })

    it('posts back to search when the Try another institution action is clicked', async () => {
      const { user } = renderLoginError({
        member: { ...memberMock, connection_status: ReadableStatuses.REJECTED },
      })

      await user.click(screen.getByText('Try another institution'))

      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.BACK_TO_SEARCH)
    })
  })

  describe('Navigation back button', () => {
    it('exposes a back button in support and returns to the error when invoked', async () => {
      const ref = React.createRef()
      const { user } = renderLoginError({
        member: { ...memberMock, connection_status: ReadableStatuses.PREVENTED },
        ref,
      })

      expect(ref.current.showBackButton()).toBe(false)

      await user.click(screen.getByText('Get help'))
      expect(await screen.findByText('Request support')).toBeInTheDocument()
      expect(ref.current.showBackButton()).toBe(true)

      act(() => {
        ref.current.handleBackButton()
      })

      expect(await screen.findByText('New credentials needed')).toBeInTheDocument()
    })
  })
})
