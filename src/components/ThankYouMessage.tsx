import React from 'react'
import { createPortal } from 'react-dom'

import { __ } from 'src/utilities/Intl'

import { Text } from '@kyper/mui'
import { Button } from '@mui/material'
import { CheckmarkFilled } from '@kyper/icon/CheckmarkFilled'
import { useTokens } from '@kyper/tokenprovider'

import { SlideDown } from 'src/components/SlideDown'

interface ThankYouMessageProps {
  handleDone: () => void
  portalTo?: string
}

export const ThankYouMessage: React.FC<ThankYouMessageProps> = ({
  handleDone,
  portalTo = 'connect-wrapper',
}) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)
  return createPortal(
    <div style={styles.container}>
      <div style={styles.thankYouContainer}>
        <SlideDown>
          <div style={styles.checkMarkIcon}>
            <CheckmarkFilled color="#12875E" size={80} />
          </div>
        </SlideDown>
        <Text component="h2" style={styles.thankYouMessage} truncate={false} variant="H2">
          {__('Thank you for your feedback')}
        </Text>
        <Button fullWidth={true} onClick={handleDone} style={styles.button} variant="contained">
          {__('Done')}
        </Button>
      </div>
    </div>,
    document.getElementById(portalTo)!,
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => ({
  container: {
    top: 0,
    margin: '0 auto',
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: tokens.ZIndex.Modal,
    backgroundColor: tokens.BackgroundColor.Container,
  } as React.CSSProperties,
  checkMarkIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
  thankYouContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '400px',
    margin: '80px auto 0',
    padding: '0 24px',
  } as React.CSSProperties,
  thankYouMessage: {
    marginTop: '24px',
  },
  button: {
    marginTop: '32px',
  },
})
