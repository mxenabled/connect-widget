import React from 'react'
import { Store } from 'redux'
import { createTestReduxStore, render, screen, waitFor } from 'src/utilities/testingLibrary'

import { OAuthError, getOAuthErrorMessage } from 'src/views/oauth/OAuthError'
import { WaitForInstitution } from 'src/hooks/useFetchInstitution'
import { OAUTH_ERROR_REASONS } from 'src/const/Connect'
import { handleOAuthError } from 'src/redux/actions/Connect'

declare const global: {
  app: { userFeatures: any }
} & Window
describe('OAuthError', () => {
  const defaultProps = {
    currentMember: { guid: 'MBR-123', name: 'MX Bank' },
    onRetry: vi.fn(),
    onReturnToSearch: vi.fn(),
  }
  let store: Store

  beforeAll(() => {
    global.app.userFeatures = [
      {
        feature_guid: 'FTR-123',
        feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',
        guid: 'URF-123',
        user_guid: 'USR-123',
        is_enabled: false,
      },
    ]
    store = createTestReduxStore()
    store.dispatch(
      handleOAuthError({ memberGuid: 'MBR-123', errorReason: OAUTH_ERROR_REASONS.DENIED }),
    )
  })

  it('renders correctly and calls onRetry when Try again button is clicked', async () => {
    const { user } = render(
      <WaitForInstitution>
        <OAuthError {...defaultProps} ref={React.createRef()} />
      </WaitForInstitution>,
      { store },
    )

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument())

    expect(screen.getByText('Try again')).toBeInTheDocument()

    await user.click(screen.getByText('Try again'))

    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders correctly and calls onReturnToSearch when Cancel button is clicked', async () => {
    const { user } = render(
      <WaitForInstitution>
        <OAuthError {...defaultProps} ref={React.createRef()} />
      </WaitForInstitution>,
    )

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument())

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))

    expect(defaultProps.onReturnToSearch).toHaveBeenCalledTimes(1)
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
