import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OAuthStartError } from 'src/views/oauth/OAuthStartError'
import { render, screen } from 'src/utilities/testingLibrary'
import { institutionData } from 'src/services/mockedData'

describe('OAuthStartError', () => {
  const defaultProps = {
    institution: institutionData.institution,
    oauthStartError: {
      response: {
        status: 500,
      },
    },
    onOAuthTryAgain: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders InstitutionBlock with institution', () => {
      render(<OAuthStartError {...defaultProps} />)

      expect(screen.getByText(defaultProps.institution.name)).toBeInTheDocument()
    })

    it('renders MemberError with default error message', () => {
      render(<OAuthStartError {...defaultProps} />)

      expect(screen.getByText('Please try again or come back later.')).toBeInTheDocument()
    })

    it('renders MemberError error title', () => {
      render(<OAuthStartError {...defaultProps} />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('renders Try again button', () => {
      render(<OAuthStartError {...defaultProps} />)

      const tryAgainButton = screen.getByRole('button', { name: 'Try again' })
      expect(tryAgainButton).toBeInTheDocument()
    })
  })

  describe('Button Interaction', () => {
    it('calls onOAuthTryAgain when Try again button is clicked', async () => {
      const { user } = render(<OAuthStartError {...defaultProps} />)

      const tryAgainButton = screen.getByRole('button', { name: 'Try again' })
      await user.click(tryAgainButton)

      expect(defaultProps.onOAuthTryAgain).toHaveBeenCalledTimes(1)
    })

    it('does not call onOAuthTryAgain before button is clicked', () => {
      render(<OAuthStartError {...defaultProps} />)

      expect(defaultProps.onOAuthTryAgain).not.toHaveBeenCalled()
    })

    it('calls onOAuthTryAgain multiple times when button is clicked multiple times', async () => {
      const { user } = render(<OAuthStartError {...defaultProps} />)

      const tryAgainButton = screen.getByRole('button', { name: 'Try again' })
      await user.click(tryAgainButton)
      await user.click(tryAgainButton)
      await user.click(tryAgainButton)

      expect(defaultProps.onOAuthTryAgain).toHaveBeenCalledTimes(3)
    })
  })

  describe('Component Structure', () => {
    it('renders InstitutionBlock before MemberError', () => {
      const { container } = render(<OAuthStartError {...defaultProps} />)

      const text = container.textContent
      const institutionIndex = text?.indexOf(defaultProps.institution.name) ?? -1
      const errorIndex = text?.indexOf('Something went wrong') ?? -1

      expect(institutionIndex).toBeLessThan(errorIndex)
    })

    it('renders MemberError before Try again button', () => {
      const { container } = render(<OAuthStartError {...defaultProps} />)

      const text = container.textContent
      const errorIndex = text?.indexOf('Something went wrong') ?? -1
      const buttonIndex = text?.indexOf('Try again') ?? -1

      expect(errorIndex).toBeLessThan(buttonIndex)
    })
  })

  describe('Props Validation', () => {
    it('renders with different institution', () => {
      const customInstitution = {
        ...institutionData.institution,
        name: 'Custom Bank',
        guid: 'INS-999',
      }

      render(<OAuthStartError {...defaultProps} institution={customInstitution} />)

      expect(screen.getByText('Custom Bank')).toBeInTheDocument()
    })

    it('renders 403 error message when error status is 403', () => {
      const error403 = {
        response: {
          status: 403,
        },
      }

      render(<OAuthStartError {...defaultProps} oauthStartError={error403} />)

      expect(
        screen.getByText('Verification must be enabled to use this feature.'),
      ).toBeInTheDocument()
    })

    it('renders 409 error message when error status is 409', () => {
      const error409 = {
        response: {
          status: 409,
        },
      }

      render(<OAuthStartError {...defaultProps} oauthStartError={error409} />)

      expect(
        screen.getByText(
          'Oops! There was a problem. Please check your username and password, and try again.',
        ),
      ).toBeInTheDocument()
    })

    it('renders default error message for other error statuses', () => {
      const error500 = {
        response: {
          status: 500,
        },
      }

      render(<OAuthStartError {...defaultProps} oauthStartError={error500} />)

      expect(screen.getByText('Please try again or come back later.')).toBeInTheDocument()
    })

    it('calls custom onOAuthTryAgain callback', async () => {
      const customCallback = vi.fn()
      const { user } = render(
        <OAuthStartError {...defaultProps} onOAuthTryAgain={customCallback} />,
      )

      const tryAgainButton = screen.getByRole('button', { name: 'Try again' })
      await user.click(tryAgainButton)

      expect(customCallback).toHaveBeenCalledTimes(1)
      expect(defaultProps.onOAuthTryAgain).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('renders button with accessible role', () => {
      render(<OAuthStartError {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Try again' })
      expect(button).toBeInTheDocument()
    })

    it('renders button as a contained variant', () => {
      render(<OAuthStartError {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Try again' })
      expect(button).toHaveClass('MuiButton-contained')
    })

    it('renders button with full width', () => {
      render(<OAuthStartError {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Try again' })
      expect(button).toHaveClass('MuiButton-fullWidth')
    })
  })
})
