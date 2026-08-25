import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { OAuthStartError } from 'src/views/oauth/OAuthStartError'
import { OAuthStep } from 'src/views/oauth/OAuthStep'
import { render, screen } from 'src/utilities/testingLibrary'
import { apiValue as apiValueMock } from 'src/const/apiProviderMock'
import { institutionData, member } from 'src/services/mockedData'

describe('OAuthStartError', () => {
  const defaultProps = {
    institution: institutionData.institution,
    oauthStartError: { response: { status: 500 } },
    onOAuthTryAgain: () => {},
  }

  describe('Rendering', () => {
    it('renders the institution, the error title and message, and a Try again button', () => {
      render(<OAuthStartError {...defaultProps} />)

      expect(screen.getByText(institutionData.institution.name)).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Please try again or come back later.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })

    it('shows the 403 error message when verification is not enabled', () => {
      render(<OAuthStartError {...defaultProps} oauthStartError={{ response: { status: 403 } }} />)

      expect(
        screen.getByText('Verification must be enabled to use this feature.'),
      ).toBeInTheDocument()
    })

    it('shows the 409 error message for a conflicting request', () => {
      render(<OAuthStartError {...defaultProps} oauthStartError={{ response: { status: 409 } }} />)

      expect(
        screen.getByText(
          'Oops! There was a problem. Please check your username and password, and try again.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('Try again', () => {
    it('restarts the OAuth flow and shows the sign-in view when clicked', async () => {
      const OAuthStepComponent = OAuthStep as unknown as React.ComponentType<{
        institution: typeof institutionData.institution
        onGoBack: () => void
      }>
      const addMember = vi
        .fn()
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValue({ member: member.member })

      const { user } = render(
        <OAuthStepComponent institution={institutionData.institution} onGoBack={() => {}} />,
        {
          apiValue: { ...apiValueMock, addMember } as unknown as typeof apiValueMock,
        },
      )

      expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Try again' }))
      expect(
        await screen.findByText(`Log in at ${institutionData.institution.name}`),
      ).toBeInTheDocument()
    })
  })
})
