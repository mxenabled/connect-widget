import React, { useState, useEffect, useRef, useContext, useImperativeHandle } from 'react'
import Confetti from 'react-confetti'

import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'

import { Button } from '@mui/material'
import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { ConnectSuccessSurvey } from 'src/components/ConnectSuccessSurvey'
import { AriaLive } from 'src/components/AriaLive'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo, AuthenticationMethods } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { focusElement } from 'src/utilities/Accessibility'

import { PostMessageContext } from 'src/ConnectWidget'
import { AnalyticContext } from 'src/Connect'

// Import progress bar component
import { ProgressBar } from 'src/views/connecting/progress/ProgressBar'

interface ConnectedProps {
  currentMember: { is_oauth: boolean }
  institution: { guid: string; name: string; logo_url?: string }
  onContinueClick: () => void
  onSuccessfulAggregation: (currentMember: object) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Connected = React.forwardRef<any, ConnectedProps>(
  ({ currentMember, institution, onContinueClick, onSuccessfulAggregation }, navigationRef) => {
    const [name, path] = PageviewInfo.CONNECT_CONNECTED
    useAnalyticsPath(name, path, {
      authentication_method: currentMember.is_oauth
        ? AuthenticationMethods.OAUTH
        : AuthenticationMethods.NON_OAUTH,
    })
    const containerRef = useRef(null)
    const continueButtonRef = useRef(null)
    const connectSuccessSurveyRef = useRef<ConnectSuccessImperativeHandle | null>(null)
    const postMessageFunctions = useContext(PostMessageContext)
    const { onShowConnectSuccessSurvey } = useContext(AnalyticContext)

    // Create a completed job schedule for the progress bar
    const completedJobSchedule = {
      isInitialized: true,
      jobs: [
        { status: 'DONE', type: 'aggregate' },
        { status: 'DONE', type: 'identify' },
        { status: 'DONE', type: 'verify' },
      ],
    }

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
          connectSuccessSurveyRef.current?.handleConnectSuccessSurveyBackButton()
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
          <ConnectSuccessSurvey
            handleBack={() => setShowFeedBack(false)}
            handleDone={handleDone}
            ref={connectSuccessSurveyRef}
          />
        ) : (
          <React.Fragment>
            <SlideDown>
              <div style={styles.progressBarContainer}>
                <ProgressBar
                  institution={{
                    guid: institution.guid,
                    logo_url: institution.logo_url || '',
                  }}
                  jobSchedule={completedJobSchedule}
                />
              </div>
            </SlideDown>
            <SlideDown delay={getNextDelay()}>
              <Text
                component="h1"
                data-test="connected-header"
                style={styles.title}
                truncate={false}
                variant="H2"
              >
                {__('Success!')}
              </Text>
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
            {typeof onShowConnectSuccessSurvey === 'function' && (
              <SlideDown delay={getNextDelay()}>
                <Button
                  data-test="give-feedback"
                  fullWidth={true}
                  onClick={() => {
                    onShowConnectSuccessSurvey()
                    setShowFeedBack(true)
                  }}
                  style={styles.feedbackButton}
                  variant={'text'}
                >
                  {__('Give feedback')}
                </Button>
              </SlideDown>
            )}
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

    progressBarContainer: {
      marginBottom: tokens.Spacing.XLarge,
    },
    title: {
      textAlign: 'center' as const,
      marginBottom: tokens.Spacing.XLarge,
    },
    body: {
      textAlign: 'center' as const,
      whiteSpace: 'normal' as const,
      marginBottom: tokens.Spacing.XLarge,
    },
    button: {
      marginBottom: tokens.Spacing.Small,
    },
    feedbackButton: {
      color: tokens.Color.Primary300,
    },
  }
}

Connected.displayName = 'Connected'
