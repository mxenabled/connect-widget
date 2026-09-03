import React from 'react'
import { createPortal } from 'react-dom'

import { __ } from 'src/utilities/Intl'

import { Icon, Text } from '@mxenabled/mxui'
import { Button, Stack } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import styles from 'src/components/ThankYouMessage.module.css'

interface ThankYouMessageProps {
  handleDone: () => void
  portalTo?: string
}

export const ThankYouMessage: React.FC<ThankYouMessageProps> = ({
  handleDone,
  portalTo = 'connect-wrapper',
}) => {
  return createPortal(
    <Stack alignItems="center" className={styles.container}>
      <Stack className={styles.content} spacing={3}>
        <SlideDown>
          <Stack alignItems="center">
            <Icon color="success" fill={true} name="check_circle" size={80} />
          </Stack>
        </SlideDown>
        <Stack spacing={4}>
          <Text className={styles.message} component="h2" truncate={false} variant="H2">
            {__('Thank you for your feedback')}
          </Text>
          <Button fullWidth={true} onClick={handleDone} variant="contained">
            {__('Done')}
          </Button>
        </Stack>
      </Stack>
    </Stack>,
    document.getElementById(portalTo)!,
  )
}
