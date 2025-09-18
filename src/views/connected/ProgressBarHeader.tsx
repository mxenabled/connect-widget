import React from 'react'
import { Box } from '@mui/material'
import { Icon, IconWeight } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

interface ProgressBarHeaderProps {
  activeStep?: number
}

export const ProgressBarHeader: React.FC<ProgressBarHeaderProps> = () => {
  const tokens = useTokens()

  const styles = {
    container: {
      width: '100%',
      maxWidth: '300px',
      margin: '0 auto',
      padding: tokens.Spacing.Medium,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.Spacing.Small,
    },
    iconContainer: {
      backgroundColor: '#4CAF50',
      color: 'white',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    connector: {
      height: 3,
      backgroundColor: '#4CAF50',
      width: 40,
      borderRadius: 1,
    },
  }

  return (
    <Box style={styles.container}>
      {/* Flight/Connect Icon */}
      <div style={styles.iconContainer}>
        <Icon
          className="material-symbols-rounded"
          name="flight_takeoff"
          size={20}
          weight={IconWeight.Dark}
        />
      </div>

      {/* Connector */}
      <div style={styles.connector} />

      {/* Circle/Process Icon */}
      <div style={styles.iconContainer}>
        <Icon
          className="material-symbols-rounded"
          name="radio_button_checked"
          size={20}
          weight={IconWeight.Dark}
        />
      </div>

      {/* Connector */}
      <div style={styles.connector} />

      {/* Download/Complete Icon */}
      <div style={styles.iconContainer}>
        <Icon
          className="material-symbols-rounded"
          name="download"
          size={20}
          weight={IconWeight.Dark}
        />
      </div>
    </Box>
  )
}

ProgressBarHeader.displayName = 'ProgressBarHeader'
