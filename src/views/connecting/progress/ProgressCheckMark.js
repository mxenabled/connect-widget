import React from 'react'
import { Icon } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

export const ProgressCheckMark = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return <Icon color="primary" fill={true} name="check_circle" size={26} style={styles.container} />
}

const getStyles = (tokens) => {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      zIndex: 20,
    },
  }
}
