import React from 'react'
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
      const { user } = render(<OAuthStep {...defaultProps} ref={ref} />)
      const loginButton = await screen.findByTestId('continue-button')
      const cancelButton = await screen.findByRole('button', { name: 'Cancel' })

      expect(loginButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
      expect(screen.getByText('Log in at MX Bank')).toBeInTheDocument()
      user.click(loginButton)
      const tryAgainButton = await screen.findByRole('button', { name: 'Try again' })
      expect(tryAgainButton).toBeInTheDocument()
      user.click(tryAgainButton)
      waitFor(() => {
        expect(loginButton).toBeInTheDocument()
      })
    })

    it('should go back to search when Cancel button is clicked on the waitingForOAuth screen', async () => {
      const ref = React.createRef()
      const { user } = render(<OAuthStep {...defaultProps} ref={ref} />)
      const loginButton = await screen.findByTestId('continue-button')
      const cancelButton = await screen.findByRole('button', { name: 'Cancel' })

      expect(loginButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
      expect(screen.getByText('Log in at MX Bank')).toBeInTheDocument()
      user.click(loginButton)
      expect(cancelButton).toBeInTheDocument()
      user.click(cancelButton)
      waitFor(async () => {
        expect(await screen.findByText('Select your institution')).toBeInTheDocument()
      })
    })
  })
})
