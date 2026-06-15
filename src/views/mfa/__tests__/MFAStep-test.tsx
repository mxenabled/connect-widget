import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { of, throwError } from 'rxjs'
import { waitFor } from '@testing-library/react'

import MFAStepComponent from 'src/views/mfa/MFAStep'
import { AnalyticEvents, defaultEventMetadata } from 'src/const/Analytics'
import { render, screen } from 'src/utilities/testingLibrary'
import { member, institutionData, MFA_CREDENTIALS, initialState } from 'src/services/mockedData'
import { ReadableStatuses } from 'src/const/Statuses'
import { PostMessageContext } from 'src/ConnectWidget'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'

interface MFAStepProps {
  enableSupportRequests: boolean
  institution: typeof institutionData.institution
  onGoBack: () => void
}

const MFAStep = MFAStepComponent as unknown as React.ForwardRefExoticComponent<
  MFAStepProps &
    React.RefAttributes<{ handleBackButton: () => void; showBackButton: () => boolean }>
>

describe('MFAStep', () => {
  let onAnalyticsEvent: ReturnType<typeof vi.fn>
  let mockPostMessage: ReturnType<typeof vi.fn>
  const onGoBack = vi.fn()
  const institution = institutionData.institution

  const createMember = (credentials = MFA_CREDENTIALS, status = ReadableStatuses.CHALLENGED) => ({
    ...member.member,
    connection_status: status,
    mfa: {
      credentials,
    },
  })

  const defaultProps: MFAStepProps = {
    enableSupportRequests: true,
    institution,
    onGoBack,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    onAnalyticsEvent = vi.fn()
    mockPostMessage = vi.fn()
  })

  describe('Support Navigation', () => {
    it('can navigate to Support when Support is enabled', async () => {
      const currentMember = createMember()
      const { user } = render(<MFAStep {...defaultProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      const supportButton = await screen.findByRole('button', { name: 'Get help' })

      expect(supportButton).toBeInTheDocument()

      await user.click(supportButton)
      expect(onAnalyticsEvent).toHaveBeenCalledWith(
        `connect_${AnalyticEvents.MFA_CLICKED_GET_HELP}`,
        expect.objectContaining({
          widgetType: defaultEventMetadata.widgetType,
        }),
      )
      expect(await screen.findByText('Request support')).toBeInTheDocument()
    })

    it('does not render the support button when Support is disabled', async () => {
      const currentMember = createMember()
      const noSupportProps = {
        ...defaultProps,
        enableSupportRequests: false,
      }
      render(<MFAStep {...noSupportProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })
      expect(screen.queryByRole('button', { name: 'Get help' })).not.toBeInTheDocument()
    })

    it('closes support view when close button is clicked', async () => {
      const currentMember = createMember()
      const { user } = render(<MFAStep {...defaultProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      const supportButton = await screen.findByRole('button', { name: 'Get help' })
      await user.click(supportButton)

      expect(await screen.findByText('Request support')).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Request support')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Get help' })).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Ref', () => {
    it('exposes handleBackButton and showBackButton methods through ref', () => {
      const currentMember = createMember()
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()
      render(<MFAStep {...defaultProps} ref={ref} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      expect(ref.current).toBeDefined()
      expect(ref.current?.handleBackButton).toBeDefined()
      expect(ref.current?.showBackButton).toBeDefined()
      expect(typeof ref.current?.handleBackButton).toBe('function')
      expect(typeof ref.current?.showBackButton).toBe('function')
    })

    it('showBackButton returns false when not in support view', () => {
      const currentMember = createMember()
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()
      render(<MFAStep {...defaultProps} ref={ref} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      expect(ref.current?.showBackButton()).toBe(false)
    })

    it('showBackButton returns true when in support view', async () => {
      const currentMember = createMember()
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()
      const { user } = render(<MFAStep {...defaultProps} ref={ref} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      const supportButton = await screen.findByRole('button', { name: 'Get help' })
      await user.click(supportButton)

      await waitFor(() => {
        expect(ref.current?.showBackButton()).toBe(true)
      })
    })

    it('handleBackButton closes support view when in support view', async () => {
      const currentMember = createMember()
      const ref = React.createRef<{
        handleBackButton: () => void
        showBackButton: () => boolean
      }>()
      const { user } = render(<MFAStep {...defaultProps} ref={ref} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      const supportButton = await screen.findByRole('button', { name: 'Get help' })
      await user.click(supportButton)

      expect(await screen.findByText('Request support')).toBeInTheDocument()

      ref.current?.handleBackButton()

      await waitFor(() => {
        expect(screen.queryByText('Request support')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error State', () => {
    it('displays error message when MFA credentials are empty', () => {
      const currentMember = createMember([])
      render(<MFAStep {...defaultProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      expect(
        screen.getByText('Oops! Something went wrong. Please try again later.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('calls onGoBack when Go Back link is clicked in error state', async () => {
      const currentMember = createMember([])
      const { user } = render(<MFAStep {...defaultProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      const goBackLink = screen.getByText('Go Back')
      await user.click(goBackLink)

      expect(onGoBack).toHaveBeenCalled()
    })
  })

  describe('MFA Form Rendering', () => {
    it('renders MFA form when credentials are present', () => {
      const currentMember = createMember()
      render(<MFAStep {...defaultProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      expect(screen.getByText(new RegExp(MFA_CREDENTIALS[0].label))).toBeInTheDocument()
      expect(screen.getByTestId('continue-button')).toBeInTheDocument()
    })

    it('renders institution block', () => {
      const currentMember = createMember()
      render(<MFAStep {...defaultProps} />, {
        onAnalyticsEvent,
        preloadedState: {
          ...initialState,
          connect: {
            ...initialState.connect,
            members: [currentMember],
            currentMemberGuid: currentMember.guid,
          },
        },
      })

      expect(screen.getByText(institution.name)).toBeInTheDocument()
    })
  })

  describe('MFA Form Submission', () => {
    it('calls postMessage when form is submitted', async () => {
      const currentMember = createMember()
      const mockUpdateMFA = vi
        .fn()
        .mockReturnValue(of({ ...currentMember, connection_status: ReadableStatuses.CONNECTED }))
      const apiValue = {
        ...apiValueMock,
        updateMFA: mockUpdateMFA,
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage: mockPostMessage }}>
          <MFAStep {...defaultProps} />
        </PostMessageContext.Provider>,
        {
          onAnalyticsEvent,
          apiValue,
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

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'test123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPostMessage).toHaveBeenCalledWith('connect/submitMFA', {
          member_guid: currentMember.guid,
        })
      })
    })

    it('calls updateMFA API on submission', async () => {
      const currentMember = createMember()
      const mockUpdateMFA = vi
        .fn()
        .mockReturnValue(of({ ...currentMember, connection_status: ReadableStatuses.CONNECTED }))
      const apiValue = {
        ...apiValueMock,
        updateMFA: mockUpdateMFA,
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage: mockPostMessage }}>
          <MFAStep {...defaultProps} />
        </PostMessageContext.Provider>,
        {
          onAnalyticsEvent,
          apiValue,
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

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'myAnswer123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateMFA).toHaveBeenCalledWith(
          expect.objectContaining({
            credentials: [
              {
                guid: MFA_CREDENTIALS[0].guid,
                value: 'myAnswer123',
              },
            ],
          }),
          expect.anything(),
          expect.anything(),
        )
      })
    })

    it('handles successful API response', async () => {
      const currentMember = createMember()
      const connectedMember = { ...currentMember, connection_status: ReadableStatuses.CONNECTED }
      const mockUpdateMFA = vi.fn().mockReturnValue(of(connectedMember))
      const apiValue = {
        ...apiValueMock,
        updateMFA: mockUpdateMFA,
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage: mockPostMessage }}>
          <MFAStep {...defaultProps} />
        </PostMessageContext.Provider>,
        {
          onAnalyticsEvent,
          apiValue,
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

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'test123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateMFA).toHaveBeenCalled()
      })

      expect(mockUpdateMFA).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: expect.arrayContaining([
            expect.objectContaining({
              guid: MFA_CREDENTIALS[0].guid,
              value: 'test123',
            }),
          ]),
        }),
        expect.anything(),
        expect.anything(),
      )
    })

    it('handles API error', async () => {
      const currentMember = createMember()
      const mockUpdateMFA = vi.fn().mockReturnValue(throwError(() => new Error('API Error')))
      const apiValue = {
        ...apiValueMock,
        updateMFA: mockUpdateMFA,
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage: mockPostMessage }}>
          <MFAStep {...defaultProps} />
        </PostMessageContext.Provider>,
        {
          onAnalyticsEvent,
          apiValue,
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

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'test123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateMFA).toHaveBeenCalled()
      })

      expect(mockUpdateMFA).toHaveBeenCalledTimes(1)
    })

    it('disables form during submission', async () => {
      const currentMember = createMember()
      const pendingPromise = new Promise(() => {})
      const mockUpdateMFA = vi.fn().mockReturnValue(pendingPromise)
      const apiValue = {
        ...apiValueMock,
        updateMFA: mockUpdateMFA,
      }

      const { user } = render(
        <PostMessageContext.Provider value={{ onPostMessage: mockPostMessage }}>
          <MFAStep {...defaultProps} />
        </PostMessageContext.Provider>,
        {
          onAnalyticsEvent,
          apiValue,
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

      const input = screen.getByLabelText(new RegExp(MFA_CREDENTIALS[0].label, 'i'))
      await user.type(input, 'test123')

      const submitButton = screen.getByTestId('continue-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('continue-button')).toHaveTextContent(/Checking/i)
      })
    })
  })
})
