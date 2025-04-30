import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { defer, of } from 'rxjs'
import { Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'
import { __ } from 'src/utilities/Intl'
import { ViewTitle } from 'src/components/ViewTitle'
import { PhoneNumberInput } from 'src/components/PhoneNumberInput'

import * as connectActions from 'src/redux/actions/Connect'

export const MFAOtpInput: React.FC = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const [phone, setPhone] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isSubmitting) return () => {}
    //TODO: Call the endpoint that send the OTP
    const request$ = defer(() => of({})).subscribe(
      () => dispatch({ type: connectActions.ActionTypes.STEP_TO_VERIFY_OTP, payload: phone }),
      () => {},
    )

    return () => request$.unsubscribe()
  }, [isSubmitting, phone])

  return (
    <div>
      <ViewTitle title={__('Log in with MX')} />
      <Text component="p" style={styles.paragraph} truncate={false} variant="Paragraph">
        {__(
          'Please enter your phone number to log in or create an account with MX for faster logins.',
        )}
      </Text>

      <PhoneNumberInput error={!phone} onChange={setPhone} value={phone} />

      <Button
        data-test="continue-button"
        fullWidth={true}
        onClick={() => {
          if (phone) {
            setIsSubmitting(true)
          }
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
          dispatch({ type: connectActions.ActionTypes.STEP_TO_CREDENTIALS })
        }}
        variant="text"
      >
        {__('skip')}
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
  }
}
