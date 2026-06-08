import React from 'react'
import Stack from '@mui/material/Stack'
import { Text } from '@mxenabled/mxui'
import Button from '@mui/material/Button'

import { __ } from 'src/utilities/Intl'
import styles from './returnUserExperience.module.css'
import { OTPInput } from 'src/ReturnUserExperience/OTPInput/OTPInput'

export const RuxOtp = () => {
  const [otp, setOtp] = React.useState('')

  return (
    <>
      <Stack className={styles.titleContainer} spacing="6px">
        <Text bold={true} className={styles.centerText} truncate={false} variant="h2">
          {__('Verify your phone number')}
        </Text>
        <Text className={styles.centerText} truncate={false} variant="subtitle1">
          {__('Enter the code sent to ••• ••• 1234.')}
        </Text>
      </Stack>

      <OTPInput onChange={setOtp} value={otp} />

      <Stack className={styles.buttonContainer}>
        <Button onClick={() => {}} variant="contained">
          {__('Continue')}
        </Button>
      </Stack>
    </>
  )
}

export default RuxOtp
