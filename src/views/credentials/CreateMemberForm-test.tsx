import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestReduxStore, render, screen, waitFor } from 'src/utilities/testingLibrary'
import RenderConnectStep from 'src/components/RenderConnectStep'
import { ConnectWidgetWithoutReduxProvider } from 'src/ConnectWidget'
import { initialState, institutionData, masterData, member } from 'src/services/mockedData'
import { apiValue as baseApiValue } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'
import { STEPS } from 'src/const/Connect'
import { ReadableStatuses } from 'src/const/Statuses'

type RenderCredentialsStepOptions = {
  apiOverrides?: Partial<typeof baseApiValue>
  members?: unknown[]
  onUpsertMember?: ReturnType<typeof vi.fn>
}

const renderCredentialsStep = ({
  apiOverrides = {},
  members = [],
  onUpsertMember = vi.fn(),
}: RenderCredentialsStepOptions = {}) => {
  const onPostMessage = vi.fn()
  const navigationRef = React.createRef()

  const mockApi = {
    ...baseApiValue,
    addMember: vi.fn(baseApiValue.addMember),
    getInstitutionCredentials: vi.fn(baseApiValue.getInstitutionCredentials),
    loadMemberByGuid: vi.fn(baseApiValue.loadMemberByGuid),
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
      members,
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

describe('<CreateMemberForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('does not render the credentials form while fetching credentials', () => {
      renderCredentialsStep({
        apiOverrides: {
          getInstitutionCredentials: vi.fn().mockImplementation(() => new Promise(() => {})),
        },
      })

      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })
  })

  describe('Credentials Display', () => {
    it('renders the credentials form with institution header after loading', async () => {
      renderCredentialsStep()

      expect(await screen.findByText('Continue')).toBeInTheDocument()
      expect(screen.getByLabelText('Username *')).toBeInTheDocument()
      expect(screen.getByLabelText('Password *')).toBeInTheDocument()
      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles error when fetching credentials fails', async () => {
      const error = new Error('Failed to fetch credentials')
      renderCredentialsStep({
        apiOverrides: {
          getInstitutionCredentials: vi.fn().mockRejectedValue(error),
        },
      })

      await waitFor(() => {
        expect(screen.queryByText('Continue')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Member Creation', () => {
    it('submits credentials and creates a member with the institution data', async () => {
      const { mockApi, onPostMessage, user } = renderCredentialsStep()

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.addMember).toHaveBeenCalledWith(
          expect.objectContaining({
            institution_guid: institutionData.institution.guid,
            rawInstitutionData: institutionData.institution,
          }),
          expect.any(Object),
          true,
        )
      })

      expect(onPostMessage).toHaveBeenCalledWith('connect/enterCredentials', {
        institution: {
          guid: institutionData.institution.guid,
          code: institutionData.institution.code,
        },
      })
    })

    it('calls the consumer onUpsertMember callback when a member is created', async () => {
      const onUpsertMember = vi.fn()

      const { user } = render(
        <ConnectWidgetWithoutReduxProvider
          clientConfig={{
            mode: 'aggregation',
            current_institution_guid: institutionData.institution.guid,
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

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(onUpsertMember).toHaveBeenCalledWith(member.member)
      })
    })
  })

  describe('409 Conflict Handling', () => {
    it('handles 409 error when member already exists and is challenged', async () => {
      const existingMemberGuid = 'MBR-EXISTING'
      const challengedMember = {
        guid: existingMemberGuid,
        connection_status: ReadableStatuses.CHALLENGED,
      }

      const { mockApi, user } = renderCredentialsStep({
        members: [challengedMember],
        apiOverrides: {
          addMember: vi.fn().mockRejectedValue({
            response: {
              status: 409,
              data: { guid: existingMemberGuid },
            },
          }),
          loadMemberByGuid: vi.fn().mockResolvedValue(challengedMember),
        },
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith(existingMemberGuid, 'en')
      })
    })

    it('updates the existing member and calls onUpsertMember on a 409 conflict', async () => {
      const existingMemberGuid = 'MBR-EXISTING'
      const existingMember = {
        guid: existingMemberGuid,
        connection_status: ReadableStatuses.CONNECTED,
        use_cases: ['verification'],
      }
      const updatedMember = {
        ...existingMember,
        connection_status: ReadableStatuses.CONNECTED,
      }

      const { mockApi, onUpsertMember, user } = renderCredentialsStep({
        members: [existingMember],
        apiOverrides: {
          addMember: vi.fn().mockRejectedValue({
            response: {
              status: 409,
              data: { guid: existingMemberGuid },
            },
          }),
          loadMemberByGuid: vi.fn().mockResolvedValue(existingMember),
          updateMember: vi.fn().mockResolvedValue(updatedMember),
        },
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(onUpsertMember).toHaveBeenCalledWith(updatedMember)
      })
      expect(mockApi.updateMember).toHaveBeenCalled()
    })
  })

  describe('Integration', () => {
    it('disables the continue button while the member creation is in flight', async () => {
      const { user } = renderCredentialsStep({
        apiOverrides: {
          addMember: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        },
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')

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

    it('displays error in Credentials when member creation fails', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      }
      const { user } = renderCredentialsStep({
        apiOverrides: {
          addMember: vi.fn().mockRejectedValue(errorResponse),
        },
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })
  })
})
