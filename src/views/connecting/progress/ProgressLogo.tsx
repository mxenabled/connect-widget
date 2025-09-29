import React, { ReactNode } from 'react'

export const ProgressLogo = ({ children }: { children: ReactNode }) => {
  const styles = {
    container: {
      // TODO: This background color needs to be different in dark mode
      backgroundColor: '#FFF',
      borderRadius: '8px',
      display: 'flex',
      padding: '2px',
      zIndex: 11,
    },
  } as const

  return <div style={styles.container}>{children}</div>
}
