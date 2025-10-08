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

// Import progress bar components
import { ProgressCheckMark } from 'src/views/connecting/progress/ProgressCheckMark'
import { ProgressLine } from 'src/views/connecting/progress/ProgressLine'
import { ProgressLogo } from 'src/views/connecting/progress/ProgressLogo'
import { ProgressBackgroundImage } from 'src/views/connecting/progress/ProgressBackgroundImage'
import { ClientLogo } from 'src/components/ClientLogo'
import { InstitutionLogo } from '@mxenabled/mxui'
import { useSelector } from 'react-redux'
import { getClientGuid } from 'src/redux/reducers/profilesSlice'
import { PoweredByFooter } from 'src/components/PoweredByFooter'

interface ConnectedProps {
  currentMember: { is_oauth: boolean }
  institution: { guid: string; name: string; logo_url?: string; aggregatorDisplayName?: string }
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
    const clientGuid = useSelector(getClientGuid)

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
      <div ref={containerRef} style={styles.pageContainer}>
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

        <div style={styles.content}>
          {showFeedBack ? (
            <ConnectSuccessSurvey
              handleBack={() => setShowFeedBack(false)}
              handleDone={handleDone}
              ref={connectSuccessSurveyRef}
            />
          ) : (
            <React.Fragment>
              <SlideDown>
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
                <div style={styles.progressBarContainer}>
                  <div style={styles.barContainer}>
                    <div style={styles.logosContainer}>
                      <ProgressLogo>
                        <ClientLogo
                          alt="Client logo"
                          clientGuid={clientGuid}
                          size={64}
                          style={styles.logo}
                        />
                      </ProgressLogo>
                      <ProgressBackgroundImage style={styles.backgroundImage} />
                      <ProgressLogo>
                        <InstitutionLogo
                          alt="Institution logo"
                          institutionGuid={institution.guid}
                          logoUrl={institution.logo_url || ''}
                          size={64}
                          style={styles.logo}
                        />
                      </ProgressLogo>
                    </div>
                    <ProgressLine isActive={true} />
                    <ProgressCheckMark />
                    <ProgressLine isActive={true} isCentralLine={true} />
                    <ProgressCheckMark />
                    <ProgressLine isActive={true} isCentralLine={true} />
                    <ProgressCheckMark />
                    <ProgressLine isActive={true} />
                  </div>
                </div>
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

        <div style={styles.footer}>
          <PoweredByFooter aggregator={institution.aggregatorDisplayName} />
        </div>
      </div>
    )
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    pageContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: '100%',
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      marginBottom: tokens.Spacing.Large,
    },

    progressBarContainer: {
      marginBottom: tokens.Spacing.XLarge,
      textAlign: 'center' as const,
    },
    barContainer: {
      alignItems: 'center',
      display: 'flex',
      height: '80px',
      justifyContent: 'center',
    },
    logosContainer: {
      alignItems: 'center',
      boxSizing: 'border-box' as const,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '28px',
      paddingRight: '28px',
      position: 'absolute' as const,
      width: '100%',
    },
    logo: {
      borderRadius: '8px',
    },
    backgroundImage: {
      height: '80px',
      width: '80px',
      zIndex: 1,
    },
    title: {
      textAlign: 'center' as const,
      marginBottom: tokens.Spacing.XLarge,
      marginTop: tokens.Spacing.XLarge,
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
    footer: {
      marginTop: '24px',
      marginBottom: '24px',
    },
  }
}

Connected.displayName = 'Connected'
