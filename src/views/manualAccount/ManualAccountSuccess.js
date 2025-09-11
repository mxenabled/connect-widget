import React, { useEffect, useRef, useContext } from 'react'
import PropTypes from 'prop-types'
import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@kyper/button'
import { Text } from '@mxenabled/mxui'

import { fadeOut } from 'src/utilities/Animation'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { POST_MESSAGE_CONTEXT } from 'src/const/postMessages'

import { SlideDown } from 'src/components/SlideDown'
import { AccountTypeNames } from 'src/views/manualAccount/constants'
import { focusElement } from 'src/utilities/Accessibility'
import { getDelay } from 'src/utilities/getDelay'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'
import { AriaLive } from 'src/components/AriaLive'

import { PostMessageContext } from 'src/ConnectWidget'

export const ManualAccountSuccess = (props) => {
  const containerRef = useRef(null)
  const doneButtonRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MANUAL_ACCOUNT_SUCCESS)
  const postMessageFunctions = useContext(PostMessageContext)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const handleDone = () => fadeOut(containerRef.current, 'up', 300).then(() => props.handleDone())

  const manualAccountSuccessMessage = __(
    'Your account has been saved manually. You can edit or delete it later.',
  )

  useEffect(() => {
    focusElement(doneButtonRef.current)
  }, [])

  useEffect(() => {
    if (props.onManualAccountAdded) {
      props.onManualAccountAdded()
    }
  }, [])

  return (
    <div ref={containerRef} style={styles.container}>
      <SlideDown delay={getNextDelay()}>
        <StyledAccountTypeIcon
          icon={props.accountType}
          iconSize={40}
          size={64}
          style={styles.icon}
        />
        <Text
          data-test="manual-account-success-header"
          style={styles.title}
          truncate={false}
          variant="H2"
        >
          {__('%1 added', AccountTypeNames[props.accountType])}
        </Text>
        <Text
          component="p"
          data-test="manual-account-success-paragraph"
          style={styles.paragraph}
          truncate={false}
          variant="Paragraph"
        >
          {manualAccountSuccessMessage}
        </Text>
      </SlideDown>
      <SlideDown delay={getNextDelay()}>
        <Button
          data-test="manual-success-done-button"
          onClick={() => {
            postMessageFunctions.onPostMessage('connect/backToSearch', {
              context: POST_MESSAGE_CONTEXT.MANUAL_ACCOUNT_ADDED,
            })

            handleDone()
          }}
          style={styles.button}
          variant="primary"
        >
          {__('Done')}
        </Button>
      </SlideDown>
      <AriaLive level="assertive" message={manualAccountSuccessMessage} timeout={100} />
    </div>
  )
}

const getStyles = (tokens) => ({
  container: {
    textAlign: 'center',
  },
  icon: {
    margin: `${tokens.Spacing.XLarge}px auto`,
  },
  title: {
    display: 'block',
    paddingBottom: tokens.Spacing.XSmall,
  },
  button: {
    marginTop: tokens.Spacing.XLarge,
    width: '100%',
  },
})

ManualAccountSuccess.propTypes = {
  accountType: PropTypes.number.isRequired,
  handleDone: PropTypes.func.isRequired,
  onManualAccountAdded: PropTypes.func,
}
