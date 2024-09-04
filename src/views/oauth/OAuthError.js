import React, { useEffect, useImperativeHandle, useContext } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Button } from '@kyper/button'
import { Text } from '@kyper/text'
import { MessageBox } from '@kyper/messagebox'
import { useTokens } from '@kyper/tokenprovider'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { OAUTH_ERROR_REASONS } from 'src/const/Connect'
import { PostMessageContext } from 'src/ConnectWidget'

import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'

export const OAuthError = React.forwardRef((props, navigationRef) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_OAUTH_ERROR)
  const { currentMember, onRetry, onReturnToSearch } = props

  const postMessageFunctions = useContext(PostMessageContext)
  const errorReason = useSelector((state) => state.connect.oauthErrorReason)
  const selectedInstitution = useSelector((state) => state.connect.selectedInstitution)
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  useImperativeHandle(navigationRef, () => {
    return {
      handleBackButton() {
        postMessageFunctions.onPostMessage('connect/backToSearch')
        onReturnToSearch()
      },
      showBackButton() {
        return true
      },
    }
  }, [])

  // If we have an oauth error, send the post message.
  useEffect(() => {
    postMessageFunctions.onPostMessage('connect/oauthError', {
      member_guid: currentMember.guid,
      error_reason: errorReason ?? OAUTH_ERROR_REASONS.SERVER_ERROR,
    })
  }, [])

  return (
    <React.Fragment>
      <SlideDown delay={getNextDelay()}>
        <InstitutionBlock institution={selectedInstitution} />
        <MessageBox variant="error">
          <Text as="Body" role="alert" style={styles.errorTitle}>
            {__('Something went wrong')}
          </Text>
          <Text as="ParagraphSmall" role="alert" tag="p">
            {getOAuthErrorMessage(errorReason, currentMember?.name)}
          </Text>
        </MessageBox>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          autoFocus={true}
          onClick={() => {
            onRetry()
          }}
          style={styles.button}
          variant="primary"
        >
          {__('Try again')}
        </Button>

        {!showConnectGlobalNavigationHeader && (
          <Button
            onClick={() => {
              onReturnToSearch()
            }}
            style={styles.neutralButton}
            variant={'transparent'}
          >
            {__('Cancel')}
          </Button>
        )}
      </SlideDown>
    </React.Fragment>
  )
})

OAuthError.propTypes = {
  currentMember: PropTypes.object.isRequired,
  onRetry: PropTypes.func.isRequired,
  onReturnToSearch: PropTypes.func.isRequired,
}

OAuthError.displayName = 'OAuthError'

const getStyles = (tokens) => {
  return {
    errorTitle: {
      fontWeight: tokens.FontWeight.Semibold,
    },
    button: {
      marginTop: tokens.Spacing.XLarge,
      width: '100%',
    },
    neutralButton: {
      marginTop: tokens.Spacing.XSmall,
      width: '100%',
    },
  }
}

/**
 * Function to get the error message based on the error reason and member name.
 *
 * @param {string} errorReason - The reason for the OAuth error.
 * @param {string} [memberName=null] - The name of the member.
 * @return {string} The error message corresponding to the error reason.
 */
export const getOAuthErrorMessage = (errorReason, memberName = null) => {
  switch (errorReason) {
    case OAUTH_ERROR_REASONS.CANCELLED:
      return __(
        'Looks like you declined to share your account info with this app. If this was a mistake, please try again. If you change your mind, you can connect your account later.',
      )
    case OAUTH_ERROR_REASONS.DENIED:
      return __('Looks like there was a problem logging in. Please try again.')
    case OAUTH_ERROR_REASONS.PROVIDER_ERROR:
      return __('Please try again or come back later.')
    case OAUTH_ERROR_REASONS.IMPEDED:
      if (memberName) {
        return __(
          "Your attention is needed at this institution's website. Please log in to the appropriate website for %1 and follow the steps to resolve the issue.",
          memberName,
        )
      }

      // Fallback message if membername is not available
      return __(
        "Your attention is needed at this institution's website. Please log in to their website and follow the steps to resolve the issue.",
      )
    default:
      return __('Oops! There was an error trying to connect your account. Please try again.')
  }
}

export default OAuthError
