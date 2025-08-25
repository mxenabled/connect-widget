import React from 'react'
import PropTypes from 'prop-types'

import { Button } from '@mui/material'

import { useTokens } from '@kyper/tokenprovider'

import { SlideDown } from 'src/components/SlideDown'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { MemberError } from 'src/components/MemberError'
import { getDelay } from 'src/utilities/getDelay'

import { __ } from 'src/utilities/Intl'

export const OAuthStartError = (props) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <div>
      <SlideDown delay={getNextDelay()}>
        <InstitutionBlock institution={props.institution} />
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <MemberError error={props.oAuthStartError} institution={props.institution} />
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          fullWidth={true}
          onClick={props.onOAuthTryAgain}
          style={styles.primaryButton}
          variant="contained"
        >
          {__('Try again')}
        </Button>
      </SlideDown>
    </div>
  )
}

const getStyles = (tokens) => ({
  spinner: {
    marginTop: tokens.Spacing.XLarge,
  },
  primaryButton: {
    display: 'inline-block',
    marginTop: tokens.Spacing.Large,
  },
  neutralButton: {
    marginTop: tokens.Spacing.Small,
  },
})

OAuthStartError.propTypes = {
  institution: PropTypes.object.isRequired,
  oAuthStartError: PropTypes.object.isRequired,
  onOAuthTryAgain: PropTypes.func.isRequired,
}
