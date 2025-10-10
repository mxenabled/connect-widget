import React, { ReactNode } from 'react'
import { useTokens } from '@kyper/tokenprovider'

export const ProgressLogo = ({ children }: { children: ReactNode }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return <div style={styles.container}>{children}</div>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      borderRadius: '8px',
      display: 'flex',
      zIndex: 11,
    },
  }
}
