/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { useTokens } from '@kyper/tokenprovider'

interface StickyComponentContainerProps {
  children?: React.ReactNode
  header?: React.ReactElement | null
  footer?: React.ReactElement | null
}

const StickyComponentContainer = React.forwardRef<HTMLInputElement, StickyComponentContainerProps>(
  ({ children, header = null, footer = null }, ref) => {
    const tokens = useTokens()
    const styles = getStyles(tokens)

    return (
      <div ref={ref} style={styles.container}>
        {header && <div style={styles.header}>{header}</div>}
        <div style={styles.content}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    )
  },
)

StickyComponentContainer.displayName = 'StickyComponentContainer'

const getStyles = (tokens: any) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column' as any,
      height: '100%',
    },
    content: {
      flexGrow: 1,
    },
    footer: {
      width: '100%',
      position: 'sticky' as any,
      bottom: 0,
      backgroundColor: tokens.BackgroundColor.Container,
      borderTop: `1px solid ${tokens.BackgroundColor.HrLight}`,
      borderRadius: '0',
      marginBottom: `-${tokens.Spacing.Large}px`,
    },
    header: {
      width: '100%',
      position: 'sticky' as any,
      top: 0,
      backgroundColor: tokens.BackgroundColor.Container,
      zIndex: 10,
      borderRadius: '0',
    },
  }
}

export default StickyComponentContainer
