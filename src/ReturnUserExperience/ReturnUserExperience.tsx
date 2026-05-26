import React from 'react'
import styles from './returnUserExperience.module.css'

import { RootState } from 'src/redux/Store'
import { useSelector } from 'react-redux'
import { __ } from 'src/utilities/Intl'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { Text } from '@mxenabled/mxui'
import { MXLogoCopyrightIcon } from '@mxenabled/mxui'

export const ReturnUserExperience = () => {
  const appName = useSelector(
    (state: RootState) => state.profiles.client.oauth_app_name || 'This app',
  )

  return (
    <div className={styles.pageContainer}>
      {/* Temporary alert while in development */}
      <Alert severity="warning" style={{ fontWeight: 800, textAlign: 'left' }} variant="filled">
        This feature is currently in development. Contact MX to enable/disable this feature.
      </Alert>

      {/* Missing the logos graphic */}

      <Stack spacing="6px">
        <Text bold={true} truncate={false} variant="h2">
          {__('Connect your accounts')}
        </Text>
        <Text truncate={false} variant="subtitle1">
          {__('%1 uses MX to connect your accounts.', appName)}{' '}
          <Link color="primary" href="https://mx.com/learn-more" variant="subtitle1">
            Learn more about MX.
          </Link>
        </Text>
      </Stack>

      {/* Missing info section */}

      <Stack spacing="8px">
        <Button
          endIcon={<MXLogoCopyrightIcon size={32} />}
          fullWidth={true}
          onClick={() => {}}
          variant="contained"
        >
          {__('Connect faster by signing into')}
        </Button>
        <Button fullWidth={true} onClick={() => {}} variant="outlined">
          {__('Continue as guest')}
        </Button>
      </Stack>
    </div>
  )
}

export default ReturnUserExperience
