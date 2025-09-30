import React from 'react'
import { Icon } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

export const ProgressCheckMark = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.container}>
      <Icon color="primary" fill={true} name="check_circle" size={24} />
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      border: `2px solid ${tokens.TextColor.Active}`,
      borderRadius: '20px',
      boxSizing: 'border-box',
      height: '24px',
      width: '24px',
      minWidth: '24px',
      padding: '2px',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }
}
