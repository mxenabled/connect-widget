import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { defer } from 'rxjs'
import { Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'
import { __ } from 'src/utilities/Intl'
import { ViewTitle } from 'src/components/ViewTitle'
import { PhoneNumberInput } from 'src/components/PhoneNumberInput'

import * as connectActions from 'src/redux/actions/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'
import { useApi } from 'src/context/ApiContext'

export const MFAOtpInput: React.FC = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const { api } = useApi()

  const connectConfig = useSelector(selectConnectConfig)

  const [phone, setPhone] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isSubmitting || !phone) return () => {}
    const request$ = defer(() => api.createOTP(phone)).subscribe(
      (profile) =>
        dispatch({
          type: connectActions.ActionTypes.STEP_TO_VERIFY_OTP,
          payload: { phone, profile },
        }),
      () => {},
    )

    return () => request$.unsubscribe()
  }, [isSubmitting, phone])

  return (
    <div>
      <ViewTitle title={__('Log in with MX')} />
      <Text component="p" style={styles.paragraph} truncate={false} variant="Paragraph">
        {__('Use your phone number to sign in or sign up with MX to go faster next time.')}
      </Text>

      <PhoneNumberInput error={isSubmitting && !phone} onChange={setPhone} value={phone} />

      <Text style={styles.disclaimer} truncate={false} variant="ParagraphSmall">
        {__('By selecting "Continue", you agree to MX\'s Terms & Conditions')}
      </Text>

      <Button
        data-test="continue-button"
        fullWidth={true}
        onClick={() => {
          setIsSubmitting(true)
        }}
        style={styles.button}
        type="submit"
        variant="contained"
      >
        {__('Continue')}
      </Button>

      <Button
        data-test="mfa-get-help-button"
        fullWidth={true}
        onClick={() => {
          dispatch({ type: connectActions.ActionTypes.STEP_TO_NORMAL_FLOW, payload: connectConfig })
        }}
        variant="text"
      >
        {__('Continue as guest')}
      </Button>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    paragraph: {
      marginBottom: tokens.Spacing.Medium,
    },
    button: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.XSmall,
    },
    disclaimer: {
      color: tokens.TextColor.Secondary,
      display: 'block',
      marginTop: tokens.Spacing.Medium,
    },
  }
}
