import React from 'react'
import Stack from '@mui/material/Stack'
import { Text } from '@mxenabled/mxui'
import Button from '@mui/material/Button'

import { __ } from 'src/utilities/Intl'
import styles from './returnUserExperience.module.css'

export const RuxPhoneNumber = () => {
  return (
    <>
      {/* OTP Style Input */}
      OTP Style Input
      <Stack className={styles.buttonContainer} spacing="8px">
        <Button>{__('Get code')}</Button>
        <Text variant="subtitle2">Resend code in (10 seconds)</Text>
      </Stack>
    </>
  )
}

export default RuxPhoneNumber
