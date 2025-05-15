import React, { useState, useEffect, ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { defer } from 'rxjs'
import _isEmpty from 'lodash/isEmpty'
import { Text } from '@kyper/mui'
import Alert from '@mui/material/Alert'
import { TextField } from 'src/privacy/input'
import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'
import { __ } from 'src/utilities/Intl'
import { ViewTitle } from 'src/components/ViewTitle'
import type { RootState } from 'reduxify/Store'

import * as connectActions from 'src/redux/actions/Connect'
import { useApi } from 'src/context/ApiContext'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'

export const VerifyOTP: React.FC = () => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const { api } = useApi()

  const phone = useSelector((state: RootState) => state.connect.phone)
  const connectConfig = useSelector(selectConnectConfig)

  const [code, setCode] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isSubmitting || !code) return () => {}

    const request$ = defer(() => api.verifyOTP(phone, code)).subscribe(
      (response) => {
        if (response.success) {
          if (!_isEmpty(response?.members)) {
            dispatch({
              type: connectActions.ActionTypes.STEP_TO_LIST_EXISTING_MEMBER,
              payload: response.members,
            })
          } else {
            dispatch({
              type: connectActions.ActionTypes.STEP_TO_NORMAL_FLOW,
              payload: connectConfig,
            })
          }
          setError(null)
        } else {
          setError(new Error('Failed to verify OTP'))
        }

        setIsSubmitting(false)
      },
      (error) => {
        setIsSubmitting(false)
        setError(error)
      },
    )

    return () => request$.unsubscribe()
  }, [isSubmitting, code])

  return (
    <div>
      <ViewTitle title={__('Verify your phone number')} />
      <Text component="p" style={styles.paragraph} truncate={false} variant="Paragraph">
        {__(
          ` Enter the code sent to ••• ••• ${phone.substr(-4)} to access your saved Connections.`,
        )}
      </Text>

      {error && (
        <Alert severity="error" sx={{ background: '#FFEBEE', marginBottom: '24px' }}>
          {__('Your code was incorrect or expired. Please try again.')}
        </Alert>
      )}

      <TextField
        error={isSubmitting && !code}
        fullWidth={true}
        helperText={
          <span>
            <span style={{ color: '#E32727' }}>*</span> {__('Required')}
          </span>
        }
        label={
          <span>
            {__('Code')}
            <span style={{ verticalAlign: 'top', color: '#E32727' }}> *</span>
          </span>
        }
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setIsSubmitting(false)
          setCode(e.target.value.trim())
        }}
        sx={{
          '& .MuiFormHelperText-root': {
            margin: '16px 0px 0px',
            fontSize: '13px',
            lineHeight: '20px',
          },
        }}
        value={code}
      />

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
