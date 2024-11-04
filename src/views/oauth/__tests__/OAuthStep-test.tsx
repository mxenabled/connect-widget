import React from 'react'
import { NEW_MEMBER } from 'src/services/mockedData'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { OAuthStep } from 'src/views/oauth/OAuthStep'

describe('OauthStep view', () => {
  describe('Ensure OAuthDefault is rendered', () => {
    const defaultProps = {
      institution: { guid: 'INS-123', name: 'MX Bank', instructional_data: {} },
      onGoBack: vi.fn(),
    }
    it('should go back to Oauth Default when Try Again button is clicked on the waitingForOAuth screen', async () => {
      const ref = React.createRef()
      const { user } = render(<OAuthStep {...defaultProps} ref={ref} />, {
        preloadedState: {
          connect: { members: [NEW_MEMBER], currentMemberGuid: NEW_MEMBER.guid },
        },
      })
      const loginButton = await screen.findByTestId('continue-button')

      expect(loginButton).toBeInTheDocument()
      expect(screen.getByText('Log in at MX Bank')).toBeInTheDocument()
      await user.click(loginButton)
      const tryAgainButton = await screen.findByRole('button', { name: 'Try again' })
      expect(tryAgainButton).toBeInTheDocument()
      waitFor(
        async () => {
          expect(tryAgainButton).not.toBeDisabled()
          await user.click(tryAgainButton)
        },
        { timeout: 2500 },
      )
      waitFor(() => {
        expect(loginButton).toBeInTheDocument()
      })
    })
  })
})
