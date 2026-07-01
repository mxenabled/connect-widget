import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestReduxStore, render, screen, waitFor } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { ConnectWidgetWithoutReduxProvider } from 'src/ConnectWidget'
import { initialState, institutionData, masterData, member } from 'src/services/mockedData'
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
    it('does not render the credentials form while fetching credentials', () => {
      renderUpdateStep({
        apiOverrides: {
          getMemberCredentials: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      })

      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })
  })

  describe('Credentials Display', () => {
    it('renders the credentials form with institution header after loading', async () => {
      renderUpdateStep()

      expect(await screen.findByText('Continue')).toBeInTheDocument()
      expect(screen.getByLabelText('Username *')).toBeInTheDocument()
      expect(screen.getByLabelText('Password *')).toBeInTheDocument()
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
    it('submits credentials and updates the member with the member data', async () => {
      const { mockApi, onPostMessage, user } = renderUpdateStep()

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

      expect(onPostMessage).toHaveBeenCalledWith('connect/updateCredentials', {
        institution: {
          guid: institutionData.institution.guid,
          code: institutionData.institution.code,
        },
        member_guid: member.member.guid,
      })
    })

    it('calls the consumer onUpsertMember callback when a member is updated', async () => {
      const onUpsertMember = vi.fn()

      const { user } = render(
        <ConnectWidgetWithoutReduxProvider
          clientConfig={{
            mode: 'aggregation',
            current_member_guid: member.member.guid,
            update_credentials: true,
          }}
          language={{ locale: 'en', localizedContent: {} }}
          onUpsertMember={onUpsertMember}
          profiles={{
            ...masterData,
            clientProfile: { ...masterData.clientProfile, uses_oauth: false },
          }}
          showTooSmallDialog={false}
          userFeatures={{}}
        />,
        { apiValue: baseApiValue, store: createTestReduxStore() },
      )

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(onUpsertMember).toHaveBeenCalledWith(member.member)
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
