import React, { useState, useEffect, useRef, useContext } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'

import { Text } from '@kyper/text'
import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'
import { getDelay } from 'src/utilities/getDelay'

import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { AriaLive } from 'src/components/AriaLive'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo, AuthenticationMethods } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { focusElement } from 'src/utilities/Accessibility'

import { PostMessageContext } from 'src/ConnectWidget'

export const Connected = ({
  currentMember,
  institution,
  onContinueClick,
  onSuccessfulAggregation,
}) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_CONNECTED, {
    authentication_method: currentMember.is_oauth
      ? AuthenticationMethods.OAUTH
      : AuthenticationMethods.NON_OAUTH,
  })
  const containerRef = useRef(null)
  const continueButtonRef = useRef(null)
  const postMessageFunctions = useContext(PostMessageContext)
  const appName = useSelector((state) => state.profiles.client.oauth_app_name || null)

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const { guid: institutionGuid, name: institutionName } = institution

  const [ariaLiveRegionMessage] = useState(
    __('You have successfully connected to %1!', institutionName),
  )

  useEffect(() => {
    if (onSuccessfulAggregation) onSuccessfulAggregation(currentMember)
  }, [])

  useEffect(() => {
    focusElement(continueButtonRef.current)
  }, [institutionName])

  return (
    <div ref={containerRef}>
      <React.Fragment>
        <SlideDown delay={getNextDelay()}>
          <div style={styles.logoHeader}>
            <ConnectLogoHeader institutionGuid={institutionGuid} />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <Text data-test="connected-header" style={styles.title} tag="h2">
            {__('Connected')}
          </Text>
          <Text as="Paragraph" data-test="connected-secondary-text" style={styles.body} tag="p">
            {appName
              ? __('You have successfully connected %1 to %2', institutionName, appName)
              : __('You have successfully connected to %1!', institutionName)}
          </Text>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <Button
            data-test="continue-button"
            fullWidth={true}
            onClick={() => {
              postMessageFunctions.onPostMessage('connect/connected/primaryAction')
              postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)
              fadeOut(containerRef.current, 'up', 500).then(() => onContinueClick())
            }}
            ref={continueButtonRef}
            style={styles.button}
            variant="contained"
          >
            {__('Continue')}
          </Button>
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          <PrivateAndSecure />
        </SlideDown>
      </React.Fragment>

      <AriaLive level="assertive" message={ariaLiveRegionMessage} timeout={100} />
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    logoHeader: {
      marginTop: tokens.Spacing.Medium,
      marginBottom: tokens.Spacing.Small,
    },
    title: {
      marginBottom: tokens.Spacing.Tiny,
      paddingTop: tokens.Spacing.Large,
    },
    body: {
      marginBottom: tokens.Spacing.XLarge,
    },
    button: {
      marginBottom: tokens.Spacing.Small,
    },
  }
}
Connected.propTypes = {
  currentMember: PropTypes.object.isRequired,
  institution: PropTypes.object.isRequired,
  onContinueClick: PropTypes.func.isRequired,
  onSuccessfulAggregation: PropTypes.func,
}
