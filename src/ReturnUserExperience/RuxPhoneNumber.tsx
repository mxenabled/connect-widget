import React from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { Text } from '@mxenabled/mxui'
import { Link } from '@mui/material'

import { TextField } from 'src/privacy/input'
import { __ } from 'src/utilities/Intl'
import styles from './returnUserExperience.module.css'

export const RuxPhoneNumber = ({
  userEnteredPhone,
  setUserEnteredPhone,
}: {
  userEnteredPhone: string
  setUserEnteredPhone: (phone: string) => void
}) => {
  return (
    <>
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
        <Button>{__('Get code')}</Button>
      </Stack>
    </>
  )
}

export default RuxPhoneNumber
