import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { of, throwError } from 'rxjs'

import MFAStepComponent from 'src/views/mfa/MFAStep'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { member, institutionData, MFA_CREDENTIALS, initialState } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { PostMessageContext } from 'src/ConnectWidget'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

const MFAStep = MFAStepComponent as unknown as React.ComponentType<Record<string, unknown>>

type RenderMFAStepOptions = {
  apiOverrides?: Partial<typeof apiValueMock>
  credentials?: typeof MFA_CREDENTIALS
  enableSupportRequests?: boolean
  onPostMessage?: ReturnType<typeof vi.fn>
}

describe('MFAStep', () => {
  const institution = institutionData.institution

  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  let onGoBack: ReturnType<typeof vi.fn>

  const createMember = (credentials: typeof MFA_CREDENTIALS = MFA_CREDENTIALS) => ({
    ...member.member,
    connection_status: ReadableStatuses.CHALLENGED,
    mfa: { credentials },
  })

  beforeEach(() => {
    onAnalyticsEvent = vi.fn()
    onGoBack = vi.fn()
  })

  const renderMFAStep = ({
    apiOverrides = {},
    credentials = MFA_CREDENTIALS,
    enableSupportRequests = true,
    onPostMessage = vi.fn(),
  }: RenderMFAStepOptions = {}) => {
    const currentMember = createMember(credentials)
    const utils = render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <MFAStep
          enableSupportRequests={enableSupportRequests}
          institution={institution}
          onGoBack={onGoBack}
        />
      </PostMessageContext.Provider>,
      {
        onAnalyticsEvent,
        apiValue: { ...apiValueMock, ...apiOverrides },
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      },
    )

    return { ...utils, currentMember, onPostMessage }
  }

  describe('Support Navigation', () => {
    it('opens the support view and reports the analytics event when Get help is clicked', async () => {
      const { user } = renderMFAStep()

      await user.click(await screen.findByRole('button', { name: 'Get help' }))

      expect(await screen.findByText('Request support')).toBeInTheDocument()
      expect(onAnalyticsEvent).toHaveBeenCalledWith(
        `connect_${AnalyticEvents.MFA_CLICKED_GET_HELP}`,
        expect.objectContaining({ widgetType: defaultEventMetadata.widgetType }),
      )
    })

    it('does not render the Get help button when support is disabled', () => {
      renderMFAStep({ enableSupportRequests: false })

      expect(screen.queryByRole('button', { name: 'Get help' })).not.toBeInTheDocument()
    })

    it('returns to the MFA form when the support view is closed', async () => {
      const { user } = renderMFAStep()

      await user.click(await screen.findByRole('button', { name: 'Get help' }))
      expect(await screen.findByText('Request support')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(await screen.findByRole('button', { name: 'Get help' })).toBeInTheDocument()
      expect(screen.queryByText('Request support')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('shows the error message and calls onGoBack when credentials are missing', async () => {
      const { user } = renderMFAStep({ credentials: [] })

      expect(
        screen.getByText('Oops! Something went wrong. Please try again later.'),
      ).toBeInTheDocument()

      await user.click(screen.getByText('Go Back'))

      expect(onGoBack).toHaveBeenCalled()
    })
  })

  describe('MFA Form Rendering', () => {
    it('renders the MFA form and institution block when credentials are present', () => {
      renderMFAStep()

      expect(screen.getByText(new RegExp(MFA_CREDENTIALS[0].label))).toBeInTheDocument()
      expect(screen.getByTestId('continue-button')).toBeInTheDocument()
      expect(screen.getByText(institution.name)).toBeInTheDocument()
    })
  })

  describe('MFA Form Submission', () => {
    it('posts the submit message and calls the update API with the answer', async () => {
      const updateMFA = vi.fn().mockReturnValue(of(createMember()))
      const { user, currentMember, onPostMessage } = renderMFAStep({ apiOverrides: { updateMFA } })

      await user.type(screen.getByRole('textbox'), 'myAnswer123')
      await user.click(screen.getByTestId('continue-button'))

      expect(onPostMessage).toHaveBeenCalledWith('connect/submitMFA', {
        member_guid: currentMember.guid,
      })
      await waitFor(() => expect(updateMFA).toHaveBeenCalled())
      expect(updateMFA.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          credentials: [{ guid: MFA_CREDENTIALS[0].guid, value: 'myAnswer123' }],
        }),
      )
    })

    it('keeps the continue button available after a failed submission', async () => {
      const updateMFA = vi.fn().mockReturnValue(throwError(() => new Error('update failed')))
      const { user } = renderMFAStep({ apiOverrides: { updateMFA } })

      await user.type(screen.getByRole('textbox'), 'test123')
      await user.click(screen.getByTestId('continue-button'))

      expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })

    it('shows the checking state while the submission is pending', async () => {
      const updateMFA = vi.fn().mockReturnValue(new Promise(() => {}))
      const { user } = renderMFAStep({ apiOverrides: { updateMFA } })

      await user.type(screen.getByRole('textbox'), 'test123')
      await user.click(screen.getByTestId('continue-button'))

      expect(await screen.findByText(/Checking/i)).toBeInTheDocument()
    })
  })
})
