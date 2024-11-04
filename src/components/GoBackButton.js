import React from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import { IconButton } from '@mui/material'
import { ChevronLeft } from '@kyper/icon/ChevronLeft'

import { __ } from 'src/utilities/Intl'

export const GoBackButton = (props) => {
  const { handleGoBack } = props
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <IconButton
      aria-label={__('Go Back')}
      data-test="back-button"
      onClick={handleGoBack}
      style={styles}
    >
      <ChevronLeft
        color={tokens.TextColor.Default}
        height={tokens.Spacing.Large}
        width={tokens.Spacing.Large}
      />
    </IconButton>
  )
}

const getStyles = (tokens) => ({
  height: '44px',
  margin: `0px ${tokens.Spacing.XSmall}px ${tokens.Spacing.XSmall}px -${tokens.Spacing.Medium}px`,
  padding: `0px 8px`,
  width: '44px',
})

GoBackButton.propTypes = {
  handleGoBack: PropTypes.func.isRequired,
}
