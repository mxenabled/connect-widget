import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { LoginError as LoginErrorComponent } from 'src/views/loginError/LoginError'
import { initialState, institutionData } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { STEPS } from 'src/const/Connect'

const LoginError = LoginErrorComponent as unknown as React.ComponentType<Record<string, unknown>>

describe('<ImpededMemberError />', () => {
  const impededMember = {
    guid: 'MBR-123',
    error: {},
    name: 'Test Member',
    connection_status: ReadableStatuses.IMPEDED,
  }

  const preloadedState = {
    ...initialState,
    connect: {
      ...initialState.connect,
      selectedInstitution: institutionData.institution,
      currentMemberGuid: impededMember.guid,
      members: [impededMember],
      location: [{ step: 'LOGIN_ERROR' }],
    },
  }

  const defaultProps = {
    institution: institutionData.institution,
    isDeleteInstitutionOptionEnabled: true,
    member: impededMember,
    onDeleteConnectionClick: vi.fn(),
    onRefreshClick: vi.fn(),
    onUpdateCredentialsClick: vi.fn(),
    showExternalLinkPopup: false,
    showSupport: true,
    size: 'medium',
  }

  let openSpy: MockInstance<typeof window.open>

  beforeEach(() => {
    vi.clearAllMocks()
    openSpy = vi.spyOn(window, 'open').mockReturnValue(null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  const renderImpededMemberError = (props: Partial<typeof defaultProps> = {}) =>
    render(
      <div id="connect-wrapper">
        <LoginError {...defaultProps} {...props} />
      </div>,
      { preloadedState },
    )

  const renderStepProps = {
    availableAccountTypes: [],
    handleConsentGoBack: vi.fn(),
    handleCredentialsGoBack: vi.fn(),
    navigationRef: React.createRef(),
    onManualAccountAdded: vi.fn(),
    onUpsertMember: vi.fn(),
    setConnectLocalState: vi.fn(),
  }

  const renderImpededErrorStep = () =>
    render(<RenderConnectStep {...renderStepProps} />, {
      preloadedState: {
        ...preloadedState,
        connect: {
          ...preloadedState.connect,
          location: [{ step: STEPS.ACTIONABLE_ERROR }],
        },
      },
    })

  describe('Content Display', () => {
    it('renders the impeded error with both resolution steps', () => {
      renderImpededMemberError()

      expect(screen.getByText('Your attention is needed')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Your login info was correct, but your attention is needed at Test Bank before we can proceed. You need to:',
        ),
      ).toBeInTheDocument()

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(
        screen.getByText("Log in to Test Bank's website and resolve the issue."),
      ).toBeInTheDocument()
      expect(screen.getByText('Visit website')).toBeInTheDocument()

      expect(screen.getByText('2')).toBeInTheDocument()
      expect(
        screen.getByText('Come back here and try to connect your account again.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })
  })

  describe('Try Again Link', () => {
    it('leaves the error view and returns to connecting when clicked', async () => {
      const { user } = renderImpededErrorStep()

      expect(await screen.findByText('Your attention is needed')).toBeInTheDocument()

      await user.click(screen.getByText('Try again'))

      expect(screen.queryByText('Your attention is needed')).not.toBeInTheDocument()
    })
  })

  describe('Visit Website Link', () => {
    it('opens the institution login URL in a new tab when external link popup is disabled', async () => {
      const { user } = renderImpededMemberError({ showExternalLinkPopup: false })

      await user.click(screen.getByText('Visit website'))

      expect(openSpy).toHaveBeenCalledWith('https://test.com', '_blank')
      expect(screen.queryByTestId('leaving-notice-flat-header')).not.toBeInTheDocument()
    })

    it('shows the leaving notice instead of navigating when external link popup is enabled', async () => {
      const { user } = renderImpededMemberError({ showExternalLinkPopup: true })

      await user.click(screen.getByText('Visit website'))

      expect(screen.getByTestId('leaving-notice-flat-header')).toBeInTheDocument()
      expect(openSpy).not.toHaveBeenCalled()
    })
  })
})
