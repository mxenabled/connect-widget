import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { CreateMemberForm } from '../CreateMemberForm'
import {
  initialState,
  institutionCredentialsData,
  institutionData,
  member,
} from 'src/services/mockedData'
import { apiValue as baseApiValue } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'
import { ReadableStatuses } from 'src/const/Statuses'

const mockPostMessage = {
  onPostMessage: vi.fn(),
  postMessageEventOverrides: {},
}

const defaultProps = {
  navigationRef: vi.fn(),
  onGoBackClick: vi.fn(),
  onUpsertMember: vi.fn(),
}

const preloadedState = {
  ...initialState,
  connect: {
    ...initialState.connect,
    selectedInstitution: institutionData.institution,
    members: [],
  },
  app: {
    humanEvent: true,
  },
}

const renderWithContext = (props = defaultProps, state = preloadedState, apiOverrides = {}) => {
  const mockApi = {
    ...baseApiValue,
    addMember: vi.fn().mockResolvedValue(member),
    getInstitutionCredentials: vi.fn().mockResolvedValue(institutionCredentialsData.credentials),
    loadMemberByGuid: vi.fn().mockResolvedValue(member.member),
    updateMember: vi.fn().mockResolvedValue(member.member),
    ...apiOverrides,
  }

  return {
    ...render(
      <PostMessageContext.Provider value={mockPostMessage}>
        <CreateMemberForm {...props} />
      </PostMessageContext.Provider>,
      {
        apiValue: mockApi,
        preloadedState: state,
      },
    ),
    mockApi,
  }
}

describe('<CreateMemberForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('displays loading spinner while fetching credentials', () => {
      renderWithContext(defaultProps, preloadedState, {
        getInstitutionCredentials: vi.fn().mockImplementation(() => new Promise(() => {})),
      })

      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })

    it('calls getInstitutionCredentials on mount', () => {
      const { mockApi } = renderWithContext()

      expect(mockApi.getInstitutionCredentials).toHaveBeenCalledWith(
        institutionData.institution.guid,
      )
    })
  })

  describe('Credentials Display', () => {
    it('renders Credentials component after loading credentials', async () => {
      renderWithContext()

      expect(await screen.findByText('Continue')).toBeInTheDocument()
    })

    it('passes credentials to Credentials component', async () => {
      renderWithContext()

      expect(await screen.findByLabelText('Username *')).toBeInTheDocument()
      expect(await screen.findByLabelText('Password *')).toBeInTheDocument()
    })

    it('renders institution header', async () => {
      renderWithContext()

      await screen.findByText('Continue')

      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles error when fetching credentials fails', async () => {
      const error = new Error('Failed to fetch credentials')
      renderWithContext(defaultProps, preloadedState, {
        getInstitutionCredentials: vi.fn().mockRejectedValue(error),
      })

      await waitFor(() => {
        expect(screen.queryByText('Continue')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Member Creation', () => {
    it('submits credentials and creates member', async () => {
      const { mockApi, user } = renderWithContext()

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.addMember).toHaveBeenCalled()
      })
    })

    it('posts connect/enterCredentials message when creating member', async () => {
      const { user } = renderWithContext()

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockPostMessage.onPostMessage).toHaveBeenCalledWith('connect/enterCredentials', {
          institution: {
            guid: institutionData.institution.guid,
            code: institutionData.institution.code,
          },
        })
      })
    })

    it('calls onUpsertMember callback when member is created', async () => {
      const onUpsertMember = vi.fn()
      const { user } = renderWithContext({ ...defaultProps, onUpsertMember })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(
        () => {
          expect(onUpsertMember).toHaveBeenCalledWith(member.member)
        },
        { timeout: 1000 },
      )
    })

    it('includes institution data in member creation request', async () => {
      const { mockApi, user } = renderWithContext()

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
    })
  })

  describe('409 Conflict Handling', () => {
    it('handles 409 error when member already exists and is challenged', async () => {
      const existingMemberGuid = 'MBR-EXISTING'
      const challengedMember = {
        guid: existingMemberGuid,
        connection_status: ReadableStatuses.CHALLENGED,
      }

      const stateWithMember = {
        ...preloadedState,
        connect: {
          ...preloadedState.connect,
          members: [challengedMember],
        },
      } as unknown as typeof preloadedState

      const { mockApi, user } = renderWithContext(defaultProps, stateWithMember, {
        addMember: vi.fn().mockRejectedValue({
          response: {
            status: 409,
            data: { guid: existingMemberGuid },
          },
        }),
        loadMemberByGuid: vi.fn().mockResolvedValue(challengedMember),
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.loadMemberByGuid).toHaveBeenCalledWith(existingMemberGuid, 'en')
      })
    })

    it('handles 409 error when member exists and needs update', async () => {
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

      const stateWithMember = {
        ...preloadedState,
        connect: {
          ...preloadedState.connect,
          members: [existingMember],
        },
      } as unknown as typeof preloadedState

      const { mockApi, user } = renderWithContext(defaultProps, stateWithMember, {
        addMember: vi.fn().mockRejectedValue({
          response: {
            status: 409,
            data: { guid: existingMemberGuid },
          },
        }),
        loadMemberByGuid: vi.fn().mockResolvedValue(existingMember),
        updateMember: vi.fn().mockResolvedValue(updatedMember),
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(
        () => {
          expect(mockApi.updateMember).toHaveBeenCalled()
        },
        { timeout: 1000 },
      )
    })

    it('calls onUpsertMember when updating existing member', async () => {
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

      const onUpsertMember = vi.fn()
      const stateWithMember = {
        ...preloadedState,
        connect: {
          ...preloadedState.connect,
          members: [existingMember],
        },
      } as unknown as typeof preloadedState

      const { user } = renderWithContext({ ...defaultProps, onUpsertMember }, stateWithMember, {
        addMember: vi.fn().mockRejectedValue({
          response: {
            status: 409,
            data: { guid: existingMemberGuid },
          },
        }),
        loadMemberByGuid: vi.fn().mockResolvedValue(existingMember),
        updateMember: vi.fn().mockResolvedValue(updatedMember),
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(
        () => {
          expect(onUpsertMember).toHaveBeenCalledWith(updatedMember)
        },
        { timeout: 1000 },
      )
    })
  })

  describe('Props', () => {
    it('accepts navigationRef prop', async () => {
      const navigationRef = vi.fn()

      renderWithContext({ ...defaultProps, navigationRef })

      await screen.findByText('Continue')

      expect(navigationRef).toHaveBeenCalled()
    })

    it('works without onUpsertMember callback', async () => {
      const { onUpsertMember: _onUpsertMember, ...propsWithoutCallback } = defaultProps
      const { mockApi, user } = renderWithContext({
        ...propsWithoutCallback,
        onUpsertMember: undefined as unknown as typeof defaultProps.onUpsertMember,
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.addMember).toHaveBeenCalled()
      })
    })
  })

  describe('Integration', () => {
    it('passes isProcessingMember to Credentials while creating member', async () => {
      const { user } = renderWithContext(defaultProps, preloadedState, {
        addMember: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
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
      const { user } = renderWithContext(defaultProps, preloadedState, {
        addMember: vi.fn().mockRejectedValue(errorResponse),
      })

      await user.type(await screen.findByLabelText('Username *'), 'testuser')
      await user.type(await screen.findByLabelText('Password *'), 'testpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })

    it('unsubscribes from credentials request on unmount', async () => {
      const { mockApi, unmount } = renderWithContext()

      await screen.findByText('Continue')

      unmount()
      expect(mockApi.getInstitutionCredentials).toHaveBeenCalledTimes(1)
    })
  })
})
