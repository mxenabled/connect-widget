import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'

import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { SlideDown } from 'src/connect/components/SlideDown'
import { InstructionList } from 'src/connect/components/InstructionList'
import { getDelay } from 'src/connect/utilities/getDelay'
import { fadeOut } from 'src/connect/utilities/Animation'

export const HowItWorks = ({ onContinue }) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_HOW_IT_WORKS)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <div ref={containerRef}>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.body}>
          <Text as="H2" data-test="title-header">
            {__('Connect your institution with account numbers')}
          </Text>
          <InstructionList
            items={[
              __('Enter your account information.'),
              __("You'll receive two small deposits."),
              __('Return to verify the deposit amounts.'),
            ]}
          />
        </div>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          data-test="continue-button"
          onClick={() => fadeOut(containerRef.current, 'up', 300).then(() => onContinue())}
          style={styles.button}
          variant="primary"
        >
          {__('Continue')}
        </Button>
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    body: {
      display: 'flex',
      flexDirection: 'column',
    },
    button: {
      marginTop: tokens.Spacing.Medium,
      width: '100%',
    },
  }
}

HowItWorks.propTypes = {
  onContinue: PropTypes.func.isRequired,
}
