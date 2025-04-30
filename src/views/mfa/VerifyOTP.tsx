import React, { useState, useEffect, ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { defer, of } from 'rxjs'
import _isEmpty from 'lodash/isEmpty'
import { Text } from '@kyper/mui'
import { TextField } from 'src/privacy/input'
import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'
import { __ } from 'src/utilities/Intl'
import { ViewTitle } from 'src/components/ViewTitle'
import type { RootState } from 'reduxify/Store'

import * as connectActions from 'src/redux/actions/Connect'

export const VerifyOTP: React.FC = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const phone = useSelector((state: RootState) => state.connect.phone)

  const [code, setCode] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isSubmitting) return () => {}
    //TODO: Call the endpoint that verify the OTP
    const request$ = defer(() => of([{}])).subscribe(
      (members) => {
        if (!_isEmpty(members)) {
          //TODO:render List existing member view if we got back an arrray of members, otherwise render credentials step
          dispatch({
            type: connectActions.ActionTypes.STEP_TO_LIST_EXISTING_MEMBER,
          })
        } else {
          dispatch({ type: connectActions.ActionTypes.STEP_TO_CREDENTIALS })
        }
      },
      () => {},
    )

    return () => request$.unsubscribe()
  }, [isSubmitting])

  return (
    <div>
      <ViewTitle title={__('Verify your phone number')} />
      <Text component="p" truncate={false} variant="Paragraph">
        {__(`Enter the code sent to ••• ••• ${phone.substr(-4)}.`)}
      </Text>

      <TextField
        disabled={isSubmitting}
        error={!code}
        fullWidth={true}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value.trim())}
        value={code}
      />

      <Button
        data-test="continue-button"
        fullWidth={true}
        onClick={() => {
          if (code) {
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
          //TODO: Call the endpoint that resends the OTP
        }}
        variant="text"
      >
        {__('Resend code')}
      </Button>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    button: {
      marginTop: tokens.Spacing.Large,
      marginBottom: tokens.Spacing.XSmall,
    },
  }
}
