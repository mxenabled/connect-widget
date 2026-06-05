import React from 'react'

import { useTheme } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { Text } from '@mxenabled/mxui'
import { Link } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { TextField } from 'src/privacy/input'
import { PageviewInfo } from 'src/const/Analytics'
import styles from './returnUserExperience.module.css'

export const RuxPhoneNumber = ({
  handleContinueWithoutPhone,
  handleRuxContinue,
  userEnteredPhone,
  setUserEnteredPhone,
}: {
  handleContinueWithoutPhone: () => void
  handleRuxContinue: () => void
  userEnteredPhone: string
  setUserEnteredPhone: (phone: string) => void
}) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_RUX_PHONE_NUMBER)
  const { palette } = useTheme()

  return (
    <>
      <Stack className={styles.titleContainer} spacing="6px">
        <Text bold={true} className={styles.centerText} truncate={false} variant="h2">
          {__('Connect faster with your phone number')}
        </Text>
        <Text className={styles.centerText} truncate={false} variant="subtitle1">
          {__('Login or sign up with MX to securely access your saved accounts. ')}
          <Link
            className={styles.primaryLink}
            href="https://mx.com/learn-more"
            rel="noopener noreferrer"
            sx={{
              color: palette.primary.main,
              fontWeight: 'normal',
              marginLeft: 0,
              textDecoration: 'underline',
            }}
            target="_blank"
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ paddingLeft: '10px', paddingRight: '16px' }} variant="body1">
                  Phone
                </Text>
                <Text sx={{ fontWeight: 400 }} variant="h2">
                  +1
                </Text>
              </div>
            </InputAdornment>
          ),
          style: {
            paddingRight: '14px',
            margin: '40px 0',
            fontSize: '23px',
            fontWeight: '400',
            height: 'auto',
            maxHeight: '60px',
          },
        }}
        fullWidth={true}
        name="phoneNumber"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUserEnteredPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
        }
        required={true}
        value={formatPhone(userEnteredPhone)}
      />

      <Stack spacing="8px">
        <Text truncate={false} variant="caption">
          {/* --TR: Full string 'By selecting "Get code", you agree to MX's Terms & Conditions' */}
          {__('By selecting "Continue", you agree to ')}
          <Link
            href="https://www.mx.com/terms/"
            rel="noopener noreferrer"
            sx={{
              fontWeight: 'normal',
              marginLeft: 0,
              marginRight: 0,
              textDecoration: 'underline',
            }}
            target="_blank"
            underline="always"
            variant="caption"
          >
            {/* TODO: Do we translate this below? */}
            {__("MX's Terms & Conditions")}
          </Link>
        </Text>
        <Button name="continue" onClick={handleRuxContinue} variant="contained">
          {__('Continue')}
        </Button>
        <Button name="continueWithoutPhone" onClick={handleContinueWithoutPhone} variant="text">
          {__('Continue without phone number')}
        </Button>
      </Stack>
    </>
  )
}

export default RuxPhoneNumber

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)

  if (digits.length === 0) return digits
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`
}
