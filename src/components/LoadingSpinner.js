import React from 'react'
import PropTypes from 'prop-types'

import CircularProgress from '@mui/material/CircularProgress'
import { useTokens } from '@kyper/tokenprovider'
import { __ } from 'src/utilities/Intl'

export const LoadingSpinner = ({ showText = false, size = 48 }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.container}>
      <CircularProgress size={size} sx={{ color: tokens.Color.Brand300 }} />
      {showText && <div style={styles.text}>{__('Loading ...')}</div>}
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: '#999',
      fontSize: tokens.FontSize.Tiny,
      fontWeight: tokens.FontWeight.SemiBold,
      textAlign: 'center',
      marginTop: '16px',
    },
  }
}

LoadingSpinner.propTypes = {
  showText: PropTypes.bool,
  size: PropTypes.number,
}
