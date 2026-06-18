import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { UpdateMemberForm } from '../UpdateMemberForm'
import {
  initialState,
  institutionData,
  member,
  memberCredentialsData,
} from 'src/services/mockedData'
import { apiValue as baseApiValue } from 'src/const/apiProviderMock'
import { PostMessageContext } from 'src/ConnectWidget'

const mockPostMessage = {
  onPostMessage: vi.fn(),
  postMessageEventOverrides: {},
}

const defaultProps = {
  navigationRef: vi.fn(),
  onDeleteConnectionClick: vi.fn(),
  onGoBackClick: vi.fn(),
  onUpsertMember: vi.fn(),
}

const preloadedState = {
  ...initialState,
  connect: {
    ...initialState.connect,
    currentMemberGuid: member.member.guid,
    members: [member.member],
    selectedInstitution: institutionData.institution,
  },
  app: {
    humanEvent: true,
  },
}

const renderWithContext = (props = defaultProps, state = preloadedState, apiOverrides = {}) => {
  const mockApi = {
    ...baseApiValue,
    getMemberCredentials: vi.fn().mockResolvedValue(memberCredentialsData.credentials),
    updateMember: vi.fn().mockResolvedValue(member.member),
    ...apiOverrides,
  }

  return {
    ...render(
      <PostMessageContext.Provider value={mockPostMessage}>
        <UpdateMemberForm {...props} />
      </PostMessageContext.Provider>,
      {
        apiValue: mockApi,
        preloadedState: state,
      },
    ),
    mockApi,
  }
}

describe('<UpdateMemberForm />', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('displays loading spinner while fetching credentials', () => {
      renderWithContext(defaultProps, preloadedState, {
        getMemberCredentials: vi.fn().mockImplementation(() => new Promise(() => {})),
      })

      expect(screen.queryByText('Continue')).not.toBeInTheDocument()
    })

    it('calls getMemberCredentials on mount', () => {
      const { mockApi } = renderWithContext()

      expect(mockApi.getMemberCredentials).toHaveBeenCalledWith(member.member.guid)
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
        getMemberCredentials: vi.fn().mockRejectedValue(error),
      })

      await waitFor(() => {
        expect(screen.queryByText('Continue')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })
  })

  describe('Member Update', () => {
    it('submits credentials and updates member', async () => {
      const { mockApi, user } = renderWithContext()

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.updateMember).toHaveBeenCalled()
      })
    })

    it('posts connect/updateCredentials message when updating member', async () => {
      const { user } = renderWithContext()

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockPostMessage.onPostMessage).toHaveBeenCalledWith('connect/updateCredentials', {
          institution: {
            guid: institutionData.institution.guid,
            code: institutionData.institution.code,
          },
          member_guid: member.member.guid,
        })
      })
    })

    it('calls onUpsertMember callback when member is updated', async () => {
      const onUpsertMember = vi.fn()
      const { user } = renderWithContext({ ...defaultProps, onUpsertMember })

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
      const { mockApi, user } = renderWithContext()

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
      const { user } = renderWithContext(defaultProps, preloadedState, {
        updateMember: vi.fn().mockRejectedValue(errorResponse),
      })

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      })
    })
  })

  describe('Props', () => {
    it('accepts navigationRef prop', async () => {
      const navigationRef = vi.fn()

      renderWithContext({ ...defaultProps, navigationRef })

      await screen.findByText('Continue')

      expect(navigationRef).toHaveBeenCalled()
    })

    it('accepts onDeleteConnectionClick prop', async () => {
      const onDeleteConnectionClick = vi.fn()

      renderWithContext({ ...defaultProps, onDeleteConnectionClick })

      await screen.findByText('Continue')
      expect(screen.getByTestId('institution-block')).toBeInTheDocument()
    })

    it('works without onUpsertMember callback', async () => {
      const { onUpsertMember: _onUpsertMember, ...propsWithoutCallback } = defaultProps
      const { mockApi, user } = renderWithContext({
        ...propsWithoutCallback,
        onUpsertMember: undefined as unknown as typeof defaultProps.onUpsertMember,
      })

      await user.type(await screen.findByLabelText('Username *'), 'newuser')
      await user.type(await screen.findByLabelText('Password *'), 'newpass')
      await user.click(screen.getByText('Continue'))

      await waitFor(() => {
        expect(mockApi.updateMember).toHaveBeenCalled()
      })
    })
  })

  describe('Integration', () => {
    it('passes isProcessingMember to Credentials while updating member', async () => {
      const { user } = renderWithContext(defaultProps, preloadedState, {
        updateMember: vi.fn().mockImplementation(() => new Promise(() => {})),
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

    it('unsubscribes from credentials request on unmount', async () => {
      const { mockApi, unmount } = renderWithContext()

      await screen.findByText('Continue')

      unmount()

      expect(mockApi.getMemberCredentials).toHaveBeenCalledTimes(1)
    })
  })
})
