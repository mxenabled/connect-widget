import React from 'react'

import { useTokens } from '@kyper/tokenprovider'

interface ContainerProps {
  children?: React.ReactNode
}

/**
 * Our root container to handle our widgets min/max widths, positioning and padding for all views
 */
export const Container: React.FC<ContainerProps> = (props) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div data-test="container" style={styles.container}>
      <div style={styles.content}>{props.children}</div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    container: {
      backgroundColor: tokens.BackgroundColor.Container,
      minHeight: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    content: {
      maxWidth: '400px', // Our max content width (does not include side margin)
      minWidth: '270px', // Our min content width (does not include side margin)
      width: '100%', // We want this container to shrink and grow between our min-max
      margin: tokens.Spacing.Large,
    },
  }
}
