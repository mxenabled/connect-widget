import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { OAuthStep } from 'src/views/oauth/OAuthStep'
import { apiValue } from 'src/const/apiProviderMock'
import { ApiProvider } from 'src/context/ApiContext'
import { OAUTH_STATE } from 'src/services/mockedData'

describe('OauthStep view', () => {
  describe('Ensure OAuthDefault is rendered', () => {
    const defaultProps = {
      institution: { guid: 'INS-123', name: 'MX Bank', instructional_data: {} },
      onGoBack: vi.fn(),
    }
    it('should go back to Oauth Default when Try Again button is clicked on the waitingForOAuth screen', async () => {
      const ref = React.createRef()
      const { user } = render(
        <ApiProvider apiValue={apiValue}>
          <OAuthStep {...defaultProps} ref={ref} />
        </ApiProvider>,
        {
          preloadedState: {
            connect: {
              members: [],
              currentMemberGuid: null,
              location: [{ step: 'SEARCH' }],
            },
          },
        },
      )
      const loginButton = await screen.findByTestId('continue-button')

      expect(loginButton).toBeInTheDocument()
      expect(screen.getByText('Log in at MX Bank')).toBeInTheDocument()
      await user.click(loginButton)
      const tryAgainButton = await screen.findByRole('button', { name: 'Try again' })
      expect(tryAgainButton).toBeInTheDocument()
      await waitFor(
        async () => {
          expect(tryAgainButton).not.toBeDisabled()
          await user.click(tryAgainButton)
        },
        { timeout: 5000 },
      )
      await screen.findByTestId('continue-button')
    })

    it('should prioritize existing member for OAuth URI generation when currentMemberGuid is present', async () => {
      const getOAuthWindowURISpy = vi.spyOn(apiValue, 'getOAuthWindowURI')
      const addMemberSpy = vi.spyOn(apiValue, 'addMember')

      const existingMember = {
        guid: 'MBR-EXISTING',
        institution_guid: 'INS-123',
        is_oauth: true,
      }

      render(
        <ApiProvider apiValue={apiValue}>
          <OAuthStep {...defaultProps} />
        </ApiProvider>,
        {
          preloadedState: {
            connect: {
              members: [existingMember],
              currentMemberGuid: 'MBR-EXISTING',
              location: [{ step: 'SEARCH' }],
            },
          },
        },
      )

      await waitFor(() => {
        expect(getOAuthWindowURISpy).toHaveBeenCalledWith('MBR-EXISTING', expect.anything())
      })
      expect(addMemberSpy).not.toHaveBeenCalled()
    })

    it('should update Redux state when handleOAuthSuccess is called with a member object from WaitingForOAuth', async () => {
      const loadOAuthStates = () =>
        Promise.resolve([{ ...OAUTH_STATE.oauth_state, guid: 'OAS-123', auth_status: 1 }])
      const loadOAuthState = () =>
        Promise.resolve({
          ...OAUTH_STATE.oauth_state,
          guid: 'OAS-123',
          auth_status: 2,
          inbound_member_guid: 'MBR-NEW',
        })
      const loadMemberByGuid = () => Promise.resolve({ guid: 'MBR-NEW', name: 'New Member' })

      const { user, store } = render(<OAuthStep {...defaultProps} />, {
        apiValue: { ...apiValue, loadOAuthStates, loadOAuthState, loadMemberByGuid },
        preloadedState: {
          connect: {
            members: [],
            currentMemberGuid: null,
            location: [{ step: 'SEARCH' }],
          },
        },
      })

      const loginButton = await screen.findByTestId('continue-button')
      await user.click(loginButton)

      await waitFor(
        () => {
          const state = store.getState()
          expect(state.connect.currentMemberGuid).toBe('MBR-NEW')
          expect(state.connect.members).toContainEqual({ guid: 'MBR-NEW', name: 'New Member' })
        },
        { timeout: 30000 },
      )
    }, 35000)
  })
})
