import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Text as ProtectedText } from 'src/privacy/components'
import { Button } from '@kyper/button'

import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'

import { SlideDown } from 'src/components/SlideDown'
import ComeBackSVG from 'src/images/ComeBackGraphic.svg'
import { fadeOut } from 'src/utilities/Animation'
import { PostMessageContext } from 'src/ConnectWidget'

export const ComeBack = ({ microdeposit, onDone }) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_COME_BACK)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const postMessageFunctions = useContext(PostMessageContext)

  return (
    <div ref={containerRef}>
      <SlideDown delay={100}>
        <div aria-hidden={true} data-test="svg-header" style={styles.svg}>
          <ComeBackSVG />
        </div>
      </SlideDown>

      <SlideDown delay={100}>
        <div style={styles.header}>
          <Text as="H2" data-test="title-header" style={styles.title}>
            {__('Check back soon')}
          </Text>
          <ProtectedText as="Paragraph" data-test="thanks-paragraph" role="text">
            {
              /* --TR: Full string "Thanks for submitting your account info. Check back soon! In the next few days you should find two small deposits less than a dollar each in your {accountName} account. When you see them, come back here and enter the amounts." */
              __(
                'Thanks for submitting your account info. Check back soon! In the next few days you should find two small deposits less than a dollar each in your %1 account. When you see them, come back here and enter the amounts.',
                microdeposit.account_name,
              )
            }
          </ProtectedText>
        </div>
      </SlideDown>

      <SlideDown delay={100}>
        <Button
          data-test="done-button"
          onClick={() => {
            postMessageFunctions.onPostMessage('connect/microdeposits/comeBack/primaryAction')
            postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)
            return fadeOut(containerRef.current, 'up', 300).then(() => onDone())
          }}
          style={styles.button}
          variant="primary"
        >
          {__('Done')}
        </Button>
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
  },
  svg: {
    margin: '0 auto',
    width: 200,
  },
  title: {
    marginBottom: tokens.Spacing.XSmall,
  },
  button: {
    marginTop: tokens.Spacing.XLarge,
    width: '100%',
  },
})

ComeBack.propTypes = {
  microdeposit: PropTypes.object.isRequired,
  onDone: PropTypes.func.isRequired,
}
