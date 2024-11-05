import React, { useState, useEffect, useRef, useContext } from 'react'
import Confetti from 'react-confetti'
import { useSelector } from 'react-redux'
import { RootState } from 'src/redux/Store'

import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'

import { Button } from '@mui/material'
import { Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Icon, IconWeight } from '@kyper/mui'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'

import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { AriaLive } from 'src/components/AriaLive'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo, AuthenticationMethods } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { focusElement } from 'src/utilities/Accessibility'

import { PostMessageContext } from 'src/ConnectWidget'

interface ConnectedProps {
  currentMember: { is_oauth: boolean }
  institution: { guid: string; name: string }
  onContinueClick: () => void
  onSuccessfulAggregation: (currentMember: object) => void
}

export const Connected: React.FC<ConnectedProps> = ({
  currentMember,
  institution,
  onContinueClick,
  onSuccessfulAggregation,
}) => {
  const [name, path] = PageviewInfo.CONNECT_CONNECTED
  useAnalyticsPath(name, path, {
    authentication_method: currentMember.is_oauth
      ? AuthenticationMethods.OAUTH
      : AuthenticationMethods.NON_OAUTH,
  })
  const containerRef = useRef(null)
  const continueButtonRef = useRef(null)
  const postMessageFunctions = useContext(PostMessageContext)
  const appName = useSelector((state: RootState) => state.profiles.client.oauth_app_name || null)

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const { name: institutionName } = institution

  const [ariaLiveRegionMessage] = useState(
    __('You have successfully connected to %1', institutionName),
  )

  useEffect(() => {
    if (onSuccessfulAggregation) onSuccessfulAggregation(currentMember)
  }, [])
  useEffect(() => {
    focusElement(continueButtonRef.current)
  }, [institutionName])

  return (
    <div ref={containerRef}>
      <Confetti
        aria-hidden={true}
        colors={['#3F9FEB', '#C331B6', '#30C434', '#F1CE31', '#EE3B7C']}
        gravity={0.05}
        initialVelocityX={7}
        initialVelocityY={8}
        numberOfPieces={200}
        recycle={false}
        run={true}
        style={{ zIndex: 3000 }}
      />

      <SlideDown>
        <div style={styles.header}>
          <Icon
            className="material-symbols-rounded"
            color={'success'}
            fill={true}
            name={'check_circle'}
            size={80}
            weight={IconWeight.Dark}
          />
        </div>
      </SlideDown>
      <SlideDown>
        <Text component="h2" data-test="connected-header" style={styles.title}>
          {__('Success')}
        </Text>
        {appName && (
          <div>
            <Text component="p" data-test="connected-secondary-text" style={styles.body}>
              {__('You have successfully connected %1 to', institutionName)}
            </Text>

            <Text component="p" style={{ ...styles.body, marginBottom: tokens.Spacing.XLarge }}>
              {__('%1.', appName)}
            </Text>
          </div>
        )}

        {!appName && (
          <Text
            component="p"
            data-test="connected-secondary-text"
            style={{ ...styles.body, marginBottom: tokens.Spacing.XLarge }}
          >
            {__('You have successfully connected to %1.', institutionName)}
          </Text>
        )}
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
          {__('Done')}
        </Button>
      </SlideDown>
      <SlideDown delay={getNextDelay()}>
        <PrivateAndSecure />
      </SlideDown>

      <AriaLive level="assertive" message={ariaLiveRegionMessage} timeout={100} />
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    header: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      marginBottom: tokens.Spacing.Large,
    },

    title: {
      textAlign: 'center' as const,
      fontSize: tokens.FontSize.H2,
      fontWeight: tokens.FontWeight.Bold,
      lineHeight: tokens.LineHeight.H2,
      marginBottom: tokens.Spacing.Tiny,
    },
    body: {
      textAlign: 'center' as const,
      fontSize: tokens.FontSize.Paragraph,
      fontWeight: tokens.FontWeight.Regular,
      lineHeight: tokens.LineHeight.Paragraph,
      whiteSpace: 'normal' as const,
    },
    button: {
      marginBottom: tokens.Spacing.Small,
    },
  }
}
