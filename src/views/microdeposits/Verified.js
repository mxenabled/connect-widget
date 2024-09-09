import React, { useContext, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'

import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { selectIsMobileWebView } from 'src/redux/reducers/configSlice'

import { SlideDown } from 'src/components/SlideDown'
import VerifiedSVG from 'src/images/VerifiedGraphic.svg'
import { fadeOut } from 'src/utilities/Animation'
import { AnalyticContext } from 'src/Connect'
import { PostMessageContext } from 'src/ConnectWidget'

export const Verified = ({ microdeposit, onDone }) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_VERIFIED)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const postMessageFunctions = useContext(PostMessageContext)
  const is_mobile_webview = useSelector(selectIsMobileWebView)
  const analyticFunctions = useContext(AnalyticContext)

  useEffect(() => {
    postMessageFunctions.onPostMessage(POST_MESSAGES.MICRODEPOSIT_VERIFIED, {
      microdeposit_guid: microdeposit.guid,
    })

    analyticFunctions.onAnalyticEvent(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
      type: is_mobile_webview ? 'url' : 'message',
    })
  }, [])

  return (
    <div ref={containerRef} style={styles.container}>
      <SlideDown>
        <div aria-hidden={true} data-test="svg-header" style={styles.svg}>
          <VerifiedSVG />
        </div>
      </SlideDown>

      <SlideDown delay={100}>
        <div style={styles.header}>
          <Text as="H2" data-test="title-header" style={styles.title}>
            {__('Deposits verified')}
          </Text>
          <Text as="Paragraph" data-test="verified-paragraph">
            {__("You're almost done setting things up. Continue to your institution.")}
          </Text>
        </div>
      </SlideDown>

      <SlideDown delay={200}>
        <Button
          onClick={() => {
            postMessageFunctions.onPostMessage('connect/microdeposits/verified/primaryAction')

            postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)

            return fadeOut(containerRef.current, 'down').then(() => onDone())
          }}
          style={styles.button}
          variant="primary"
        >
          {__('Continue')}
        </Button>
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => ({
  container: {
    position: 'relative',
  },
  svg: {
    margin: '0 auto',
    width: 200,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: tokens.Spacing.XSmall,
  },
  textBold: {
    fontWeight: tokens.FontWeight.Bold,
  },
  button: {
    marginTop: tokens.Spacing.XLarge,
    width: '100%',
  },
})

Verified.propTypes = {
  microdeposit: PropTypes.object.isRequired,
  onDone: PropTypes.func.isRequired,
}
