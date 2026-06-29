import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { initialState, institutionData, member } from 'src/services/mockedData'
import { apiValue as baseApiValue } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'
import { STEPS } from 'src/const/Connect'

type RenderUpdateStepOptions = {
  apiOverrides?: Partial<typeof baseApiValue>
  onUpsertMember?: ReturnType<typeof vi.fn>
}

const renderUpdateStep = ({
  apiOverrides = {},
  onUpsertMember = vi.fn(),
}: RenderUpdateStepOptions = {}) => {
  const onPostMessage = vi.fn()
  const navigationRef = React.createRef()

  const mockApi = {
    ...baseApiValue,
    getMemberCredentials: vi.fn(baseApiValue.getMemberCredentials),
    updateMember: vi.fn(baseApiValue.updateMember),
    ...apiOverrides,
  }

  const preloadedState = {
    ...initialState,
    profiles: {
      ...initialState.profiles,
      clientProfile: { ...initialState.profiles.clientProfile, uses_oauth: false },
    },
    connect: {
      ...initialState.connect,
      location: [{ step: STEPS.ENTER_CREDENTIALS }],
      selectedInstitution: institutionData.institution,
      currentMemberGuid: member.member.guid,
      members: [member.member],
      updateCredentials: true,
    },
    app: { humanEvent: true },
  } as unknown as typeof initialState

  return {
    ...render(
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <RenderConnectStep
          availableAccountTypes={[]}
          handleConsentGoBack={() => {}}
          handleCredentialsGoBack={() => {}}
          navigationRef={navigationRef}
          onManualAccountAdded={() => {}}
          onUpsertMember={onUpsertMember}
          setConnectLocalState={() => {}}
        />
      </PostMessageContext.Provider>,
      {
        apiValue: mockApi,
        preloadedState,
      },
    ),
    mockApi,
    onPostMessage,
    onUpsertMember,
    navigationRef,
  }
}

describe('<UpdateMemberForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('displays loading spinner while fetching credentials', () => {
      renderUpdateStep({
        apiOverrides: {
          getMemberCredentials: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      })

      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })

    it('calls getMemberCredentials on mount', () => {
      const { mockApi } = renderUpdateStep()

      expect(mockApi.getMemberCredentials).toHaveBeenCalledWith(member.member.guid)
    })
  })

  describe('Credentials Display', () => {
    it('renders Credentials component after loading credentials', async () => {
      renderUpdateStep()

      expect(await screen.findByText('Continue')).toBeInTheDocument()
    })

    it('passes credentials to Credentials component', async () => {
      renderUpdateStep()

      expect(await screen.findByLabelText('Username *')).toBeInTheDocument()
      expect(await screen.findByLabelText('Password *')).toBeInTheDocument()
    })

    it('renders institution header', async () => {
      renderUpdateStep()

      await screen.findByText('Continue')

      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles error when fetching credentials fails', async () => {
      const error = new Error('Failed to fetch credentials')
      renderUpdateStep({
        apiOverrides: {
          getMemberCredentials: vi.fn().mockRejectedValue(error),
        },
      })

      await waitFor(() => {
        expect(screen.queryByText('Continue')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Member Update', () => {
    it('submits credentials and updates member', async () => {
      const { mockApi, user } = renderUpdateStep()

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.updateMember).toHaveBeenCalled()
      })
    })

    it('posts connect/updateCredentials message when updating member', async () => {
      const { onPostMessage, user } = renderUpdateStep()

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(onPostMessage).toHaveBeenCalledWith('connect/updateCredentials', {
          institution: {
            guid: institutionData.institution.guid,
            code: institutionData.institution.code,
          },
          member_guid: member.member.guid,
        })
      })
    })

    it('calls onUpsertMember callback when member is updated', async () => {
      const { onUpsertMember, user } = renderUpdateStep()

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(
        () => {
          expect(onUpsertMember).toHaveBeenCalledWith(member.member)
        },
        { timeout: 1000 },
      )
    })

    it('includes member data in update request', async () => {
      const { mockApi, user } = renderUpdateStep()

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.updateMember).toHaveBeenCalledWith(
          expect.objectContaining({
            guid: member.member.guid,
          }),
          expect.any(Object),
          true,
        )
      })
    })
  })

  describe('Error in Update', () => {
    it('displays error in Credentials when member update fails', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      }
      const { user } = renderUpdateStep({
        apiOverrides: {
          updateMember: vi.fn().mockRejectedValue(errorResponse),
        },
      })

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })
  })

  describe('Integration', () => {
    it('disables the continue button while the member update is in flight', async () => {
      const { user } = renderUpdateStep({
        apiOverrides: {
          updateMember: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      })

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')

      const button = screen.getByTestId('credentials-continue')
      expect(button).not.toBeDisabled()

      await user.click(button)

      await waitFor(
        () => {
          const processingButton = screen.getByTestId('credentials-continue')
          expect(processingButton).toBeDisabled()
        },
        { timeout: 2000 },
      )
    })
  })
})
