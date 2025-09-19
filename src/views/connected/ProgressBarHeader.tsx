import React from 'react'
import { Box } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { useTokens } from '@kyper/tokenprovider'

interface ProgressBarHeaderProps {
  activeStep?: number
}

export const ProgressBarHeader: React.FC<ProgressBarHeaderProps> = () => {
  const tokens = useTokens()

  const styles = {
    container: {
      margin: '0 auto',
      maxWidth: '320px', // Same as connecting progress bar
      textAlign: 'center' as const,
    },
    barContainer: {
      display: 'flex',
      alignItems: 'center',
      margin: `${tokens.Spacing.Large}px auto`,
      justifyContent: 'center',
    },
    progressLine: {
      width: '32px', // Wider lines for better spacing with 3 checkmarks
      minWidth: '32px',
      height: '2px',
      background: tokens.TextColor.Active, // Active state since all are completed
      borderRadius: '1px',
      zIndex: 10,
    },
    outerProgressLine: {
      flex: 1, // Outer lines expand to fill available space
      height: '2px',
      background: tokens.TextColor.Active,
      borderRadius: '1px',
      zIndex: 10,
    },
    checkMark: {
      height: '24px',
      width: '24px',
      zIndex: 20,
    },
  }

  return (
    <Box style={styles.container}>
      <div style={styles.barContainer}>
        {/* Left line */}
        <div style={styles.outerProgressLine} />

        {/* First checkmark */}
        <div style={styles.checkMark}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
        </div>

        {/* Middle line */}
        <div style={styles.progressLine} />

        {/* Second checkmark */}
        <div style={styles.checkMark}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
        </div>

        {/* Right line */}
        <div style={styles.progressLine} />

        {/* Third checkmark */}
        <div style={styles.checkMark}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
        </div>

        {/* Final line */}
        <div style={styles.outerProgressLine} />
      </div>
    </Box>
  )
}

ProgressBarHeader.displayName = 'ProgressBarHeader'
