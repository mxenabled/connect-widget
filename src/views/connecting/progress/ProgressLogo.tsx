import React, { ReactNode } from 'react'

export const ProgressLogo = ({
  children,
  containerStyle,
}: {
  children: ReactNode
  containerStyle: {
    left?: string
    right?: string
  }
}) => {
  const styles = {
    container: {
      backgroundColor: '#FFF',
      borderRadius: '8px',
      ...containerStyle,
      position: 'absolute',
      zIndex: 11,
    },
  } as const

  return <div style={styles.container}>{children}</div>
}
