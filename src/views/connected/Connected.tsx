import React, { useState, useEffect, useRef, useContext, useImperativeHandle } from 'react'
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
import { ConnectUserFeedback } from 'src/components/ConnectUserFeedback'
import { AriaLive } from 'src/components/AriaLive'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo, AuthenticationMethods } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { focusElement } from 'src/utilities/Accessibility'

import { PostMessageContext } from 'src/ConnectWidget'
import { AnalyticContext } from 'src/Connect'

interface ConnectedProps {
  currentMember: { is_oauth: boolean }
  institution: { guid: string; name: string }
  onContinueClick: () => void
  onSuccessfulAggregation: (currentMember: object) => void
}

export const Connected = React.forwardRef<HTMLInputElement, ConnectedProps>(
  ({ currentMember, institution, onContinueClick, onSuccessfulAggregation }, navigationRef) => {
    const [name, path] = PageviewInfo.CONNECT_CONNECTED
    useAnalyticsPath(name, path, {
      authentication_method: currentMember.is_oauth
        ? AuthenticationMethods.OAUTH
        : AuthenticationMethods.NON_OAUTH,
    })
    const containerRef = useRef(null)
    const continueButtonRef = useRef(null)
    const connectUserFeedbackRef = useRef(null)
    const postMessageFunctions = useContext(PostMessageContext)
    const { onSubmitAnalyticSurvey } = useContext(AnalyticContext)
    const appName = useSelector((state: RootState) => state.profiles.client.oauth_app_name || null)

    const tokens = useTokens()
    const styles = getStyles(tokens)
    const getNextDelay = getDelay()

    const [showFeedBack, setShowFeedBack] = useState(false)

    const { name: institutionName } = institution

    const [ariaLiveRegionMessage] = useState(
      __('You have successfully connected to %1', institutionName),
    )

    const handleDone = () => {
      postMessageFunctions.onPostMessage('connect/connected/primaryAction')
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)
      fadeOut(containerRef.current, 'up', 500).then(() => onContinueClick())
    }
    useImperativeHandle(navigationRef, () => {
      return {
        handleBackButton() {
          connectUserFeedbackRef.current.handleUserFeedbackBackButton()
        },
        showBackButton() {
          return showFeedBack
        },
      }
    }, [showFeedBack])

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

        {showFeedBack ? (
          <ConnectUserFeedback
            handleBack={() => setShowFeedBack(false)}
            handleDone={handleDone}
            onSubmitAnalyticSurvey={onSubmitAnalyticSurvey}
            ref={connectUserFeedbackRef}
          />
        ) : (
          <React.Fragment>
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
                    {__('You have successfully connected %1 to %2.', institutionName, appName)}
                  </Text>
                </div>
              )}

              {!appName && (
                <Text component="p" data-test="connected-secondary-text" style={styles.body}>
                  {__('You have successfully connected to %1.', institutionName)}
                </Text>
              )}
            </SlideDown>
            <SlideDown delay={getNextDelay()}>
              <Button
                data-test="done-button"
                fullWidth={true}
                onClick={handleDone}
                ref={continueButtonRef}
                style={styles.button}
                variant="contained"
              >
                {__('Done')}
              </Button>
            </SlideDown>
            <SlideDown delay={getNextDelay()}>
              <Button
                data-test="give-feedback"
                fullWidth={true}
                onClick={() => {
                  setShowFeedBack(true)
                }}
                variant={'text'}
              >
                {__('Give feedback')}
              </Button>
            </SlideDown>
            <SlideDown delay={getNextDelay()}>
              <PrivateAndSecure />
            </SlideDown>
          </React.Fragment>
        )}

        <AriaLive level="assertive" message={ariaLiveRegionMessage} timeout={100} />
      </div>
    )
  },
)

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
      marginBottom: tokens.Spacing.XLarge,
    },
    button: {
      marginBottom: tokens.Spacing.Small,
    },
  }
}

Connected.displayName = 'Connected'
