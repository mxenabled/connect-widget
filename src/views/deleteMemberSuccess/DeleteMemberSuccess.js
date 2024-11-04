import React from 'react'
import PropTypes from 'prop-types'

import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'

import { getDelay } from 'src/utilities/getDelay'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

export const DeleteMemberSuccess = ({ institution, onContinueClick }) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DELETE_MEMBER_SUCCESS)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  return (
    <React.Fragment>
      <SlideDown delay={getNextDelay()}>
        <p data-test="disconnected-primary-text" style={styles.primaryText}>
          {__('Disconnected')}
        </p>
        <p data-test="disconnected-secondary-text" style={styles.secondaryText}>
          {__('You have successfully disconnected %1.', institution.name)}
        </p>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          data-test="done-button"
          fullWidth={true}
          onClick={onContinueClick}
          variant="contained"
        >
          {__('Done')}
        </Button>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <PrivateAndSecure />
      </SlideDown>
    </React.Fragment>
  )
}

const getStyles = (tokens) => {
  return {
    primaryText: {
      fontSize: tokens.FontSize.H2,
      fontWeight: tokens.FontWeight.Bold,
      color: tokens.TextColor.Default,
    },
    secondaryText: {
      fontSize: tokens.FontSize.Paragraph,
      marginBottom: tokens.Spacing.XLarge,
      color: tokens.TextColor.Default,
    },
  }
}

DeleteMemberSuccess.propTypes = {
  institution: PropTypes.object.isRequired,
  onContinueClick: PropTypes.func.isRequired,
}
