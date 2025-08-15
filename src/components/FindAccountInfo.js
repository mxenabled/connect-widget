import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { Button } from '@mui/material'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'

import AccountCheckImage from 'src/images/CheckAccountNumber.svg'
import RoutingCheckImage from 'src/images/CheckRoutingNumber.svg'
import { VIEWS } from 'src/views/microdeposits/Microdeposits'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'

export const FindAccountInfo = ({ onClose, step }) => {
  const containerRef = useRef(null)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const type = step === VIEWS.ACCOUNT_INFO ? __('account') : __('routing')

  const handleClose = () => fadeOut(containerRef.current, 'up', 300).then(onClose)

  return (
    <div ref={containerRef} style={styles.container}>
      <SlideDown delay={getNextDelay()}>
        <Text component="h2" truncate={false} variant="H2">
          {
            // --TR: Full string "Find your {account/routing} number"
            __('Find your %1 number', type)
          }
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text component="h3" style={styles.title} truncate={false} variant="H3">
          {__('Mobile app or online portal')}
        </Text>
        <Text truncate={false} variant="Paragraph">
          {
            // --TR: Full string "Log in and look for an account details section that usually includes your {account/routing} number."
            __(
              'Log in and look for an account details section that usually includes your %1 number.',
              type,
            )
          }
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text component="h3" style={styles.title} truncate={false} variant="H3">
          {__('Paper check')}
        </Text>
        <div aria-hidden={true} style={styles.svg}>
          {step === VIEWS.ACCOUNT_INFO ? <AccountCheckImage /> : <RoutingCheckImage />}
        </div>
        <Text truncate={false} variant="Paragraph">
          {
            // --TR: Full string "Your {account/routing} number is on the bottom of your checks."
            __('Your %1 number is on the bottom of your checks.', type)
          }
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text component="h3" style={styles.title} truncate={false} variant="H3">
          {__('Bank statement')}
        </Text>
        <Text truncate={false} variant="Paragraph">
          {
            // --TR: Full string "Your {account/routing} number is usually included on your bank statement."
            __('Your %1 number is usually included on your bank statement.', type)
          }
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          fullWidth={true}
          onClick={handleClose}
          style={{ marginTop: tokens.Spacing.XLarge }}
          variant="contained"
        >
          {__('Continue')}
        </Button>
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
    maxWidth: 375,
  },
  title: {
    display: 'block',
    marginBottom: tokens.Spacing.Tiny,
    marginTop: tokens.Spacing.Large,
  },
  svg: {
    marginBottom: tokens.Spacing.XSmall,
    marginTop: tokens.Spacing.Tiny,
    width: '100%',
  },
})

FindAccountInfo.propTypes = {
  onClose: PropTypes.func.isRequired,
  step: PropTypes.string.isRequired,
}
