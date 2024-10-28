import React from 'react'
import { render, screen, waitFor } from 'src/utilities/testingLibrary'

import { OAuthError, getOAuthErrorMessage } from 'src/views/oauth/OAuthError'
import { OAUTH_ERROR_REASONS } from 'src/const/Connect'
import { institutionData } from 'src/services/mockedData'

describe('OAuthError', () => {
  const defaultProps = {
    currentMember: { guid: 'MBR-123', name: 'MX Bank' },
    onRetry: vi.fn(),
    onReturnToSearch: vi.fn(),
  }
  const initialState = {
    connect: {
      currentMemberGuid: 'MBR-123',
      oauthErrorReason: OAUTH_ERROR_REASONS.DENIED,
      selectedInstitution: institutionData.institution,
    },
  }

  it('renders correctly and calls onRetry when Try again button is clicked', async () => {
    const { user } = render(<OAuthError {...defaultProps} ref={React.createRef()} />, {
      preloadedState: initialState,
    })

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument())

    expect(screen.getByText('Try again')).toBeInTheDocument()

    await user.click(screen.getByText('Try again'))

    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
  })

  describe('getOAuthErrorMessage util', () => {
    it('DEFAULT message is returned when given a blank reason', () => {
      expect(getOAuthErrorMessage('Default/Fallback')).toEqual(
        'Oops! There was an error trying to connect your account. Please try again.',
      )
    })

    it('IMPEDED fallback message is returned when missing member name', () => {
      expect(getOAuthErrorMessage(OAUTH_ERROR_REASONS.IMPEDED)).toEqual(
        "Your attention is needed at this institution's website. Please log in to their website and follow the steps to resolve the issue.",
      )
    })

    it('IMPEDED message is returned when member name is available', () => {
      expect(getOAuthErrorMessage(OAUTH_ERROR_REASONS.IMPEDED, 'MX Bank')).toEqual(
        "Your attention is needed at this institution's website. Please log in to the appropriate website for MX Bank and follow the steps to resolve the issue.",
      )
    })

    it('PROVIDER_ERROR message is returned when missing member name', () => {
      expect(getOAuthErrorMessage(OAUTH_ERROR_REASONS.PROVIDER_ERROR)).toEqual(
        'Please try again or come back later.',
      )
    })

    it('DENIED message is returned', () => {
      expect(getOAuthErrorMessage(OAUTH_ERROR_REASONS.DENIED)).toEqual(
        'Looks like there was a problem logging in. Please try again.',
      )
    })

    it('CANCELLED message is returned', () => {
      expect(getOAuthErrorMessage(OAUTH_ERROR_REASONS.CANCELLED)).toEqual(
        'Looks like you declined to share your account info with this app. If this was a mistake, please try again. If you change your mind, you can connect your account later.',
      )
    })
  })
})
