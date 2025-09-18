import React, { useState, useEffect, useRef, useContext, useImperativeHandle } from 'react'
import Confetti from 'react-confetti'

import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'

import { Button } from '@mui/material'
import { Text } from '@mxenabled/mxui'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { ProgressBarHeader } from 'src/views/connected/ProgressBarHeader'

import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { ConnectSuccessSurvey } from 'src/components/ConnectSuccessSurvey'
import { AriaLive } from 'src/components/AriaLive'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo, AuthenticationMethods } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { focusElement } from 'src/utilities/Accessibility'

import { PostMessageContext } from 'src/ConnectWidget'
import { AnalyticContext } from 'src/Connect'

interface Connectedv2Props {
  currentMember: { is_oauth: boolean }
  institution: { guid: string; name: string }
  onContinueClick: () => void
  onSuccessfulAggregation: (currentMember: object) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Connectedv2 = React.forwardRef<any, Connectedv2Props>(
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

    const styles = getStyles()
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
          <div ref={containerRef}>
            {/* Success Title */}
            <SlideDown>
              <Text
                component="h2"
                data-test="connected-header"
                style={styles.title}
                truncate={false}
                variant="H2"
              >
                {__('Success!')}
              </Text>
            </SlideDown>

            {/* Progress Bar */}
            <SlideDown delay={getNextDelay()}>
              <ProgressBarHeader />
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

            {/* Give Feedback Link */}
            {typeof onShowConnectSuccessSurvey === 'function' && (
              <SlideDown delay={getNextDelay()}>
                <Button
                  data-test="give-feedback"
                  fullWidth={true}
                  onClick={() => {
                    onShowConnectSuccessSurvey()
                    setShowFeedBack(true)
                  }}
                  variant={'text'}
                >
                  {__('Give feedback')}
                </Button>
              </SlideDown>
            )}

            {/* Powered by MX */}
            <SlideDown delay={getNextDelay()}>
              <PrivateAndSecure />
            </SlideDown>
          </div>
        )}

        <AriaLive level="assertive" message={ariaLiveRegionMessage} timeout={100} />
      </div>
    )
  },
)

const getStyles = () => {
  return {
    title: {
      marginTop: '32px',
      textAlign: 'center' as const,
      marginBottom: '4px',
    },
    button: {
      marginTop: '48px',
      marginBottom: '8px',
    },
  }
}

Connectedv2.displayName = 'Connectedv2'
