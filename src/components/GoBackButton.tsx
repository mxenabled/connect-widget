/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import { IconButton } from '@mui/material'
import { ChevronLeft } from '@kyper/icon/ChevronLeft'

import { __ } from 'src/utilities/Intl'

interface GoBackButtonProps {
  handleGoBack: () => void
}

export const GoBackButton = forwardRef<HTMLButtonElement, GoBackButtonProps>((props, ref) => {
  const defaultRef = useRef(null)
  const { handleGoBack } = props
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <IconButton
      aria-label={__('Go Back')}
      data-test="back-button"
      onClick={handleGoBack}
      ref={ref ?? defaultRef}
      style={styles}
    >
      <ChevronLeft
        color={tokens.TextColor.Default}
        height={tokens.Spacing.Large}
        width={tokens.Spacing.Large}
      />
    </IconButton>
  )
})

const getStyles = (tokens: any) => ({
  height: '44px',
  margin: `0px ${tokens.Spacing.XSmall}px ${tokens.Spacing.XSmall}px -${tokens.Spacing.Medium}px`,
  padding: `0px 8px`,
  width: '44px',
})

GoBackButton.propTypes = {
  handleGoBack: PropTypes.func.isRequired,
}

GoBackButton.displayName = 'GoBackButton'
