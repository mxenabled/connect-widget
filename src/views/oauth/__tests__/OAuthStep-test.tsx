import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { OAuthStep } from 'src/views/oauth/OAuthStep'
import { apiValue } from 'src/const/apiProviderMock'
import { ApiProvider } from 'src/context/ApiContext'

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
        { timeout: 2500 },
      )
      await waitFor(
        () => {
          const newLoginButton = screen.queryByTestId('continue-button')
          expect(newLoginButton).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })
  })
})
