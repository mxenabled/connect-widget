import React from 'react'
import { useSelector } from 'react-redux'

import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { Text } from '@mxenabled/mxui'
import { Link } from '@mui/material'

import { RootState } from 'src/redux/Store'
import { __ } from 'src/utilities/Intl'
import { TextField } from 'src/privacy/input'
import styles from './returnUserExperience.module.css'

export const RuxPhoneNumber = ({
  userEnteredPhone,
  setUserEnteredPhone,
}: {
  userEnteredPhone: string
  setUserEnteredPhone: (phone: string) => void
}) => {
  const appName = useSelector(
    (state: RootState) => state.profiles.client.oauth_app_name || 'This app',
  )

  return (
    <>
      <Stack className={styles.titleContainer} spacing="6px">
        <Text bold={true} className={styles.centerText} truncate={false} variant="h2">
          {__('Connect your accounts')}
        </Text>
        <Text className={styles.centerText} truncate={false} variant="subtitle1">
          {__('%1 uses MX to connect your accounts.', appName)}
          <Link
            href="https://mx.com/learn-more"
            sx={{ color: 'tokens.TextColor.ButtonLink', marginLeft: 0 }}
            underline="always"
            variant="subtitle1"
          >
            {__('Learn more about MX.')}
          </Link>
        </Text>
      </Stack>

      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <div>
                <Text variant="body1">Phone</Text>
                <Text bold={true} variant="h2">
                  +1
                </Text>
              </div>
            </InputAdornment>
          ),
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserEnteredPhone(e.target.value)}
        required={true}
        value={userEnteredPhone}
      />

      <Stack className={styles.buttonContainer} spacing="8px">
        <Text variant="caption">
          {/* --TR: Full string 'By selecting "Get code", you agree to MX's Terms & Conditions' */}
          {__('By selecting "Get code", you agree to')}
          <Link href="https://www.mx.com/terms/" variant="caption">
            {/* TODO: Do we translate this below? */}
            {__("MX's Terms & Conditions")}
          </Link>
          .
        </Text>
        <Button fullWidth={true} onClick={() => {}}>
          {__('Continue')}
        </Button>
        <Button fullWidth={true} onClick={() => {}} variant="outlined">
          {__('Continue without phone number')}
        </Button>
      </Stack>
    </>
  )
}

export default RuxPhoneNumber
