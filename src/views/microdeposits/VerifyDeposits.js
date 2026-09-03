import React, { useEffect, useReducer, useRef } from 'react'
import PropTypes from 'prop-types'
import { defer } from 'rxjs'
import styles from './VerifyDeposits.module.css'

import { Text } from '@mxenabled/mxui'
import { Text as ProtectedText } from 'src/privacy/components'
import Alert from '@mui/material/Alert'
import { TextField } from 'src/privacy/input'
import { Button, Stack } from '@mui/material'

import { AriaLive } from 'src/components/AriaLive'
import { __ } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { useForm } from 'src/hooks/useForm'
import { SlideDown } from 'src/components/SlideDown'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { fadeOut } from 'src/utilities/Animation'
import { useApi } from 'src/context/ApiContext'
import RequiredFieldNote from 'src/components/RequiredFieldNote'

const ACTIONS = {
  SET_SUBMITTING: 'verifyDeposits/set_submitting',
  SUBMITTING_ERROR: 'verifyDeposits/submitting_error',
}
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_SUBMITTING:
      return { ...state, isSubmitting: true }
    case ACTIONS.SUBMITTING_ERROR:
      return { ...state, isSubmitting: false, submittingError: true }
    default:
      return state
  }
}

export const VerifyDeposits = ({ microdeposit, onSuccess }) => {
  const containerRef = useRef(null)
  const firstInputRef = useRef(null)
  const secondInputRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_VERIFY_DEPOSITS)
  const { api } = useApi()
  const initialForm = { firstAmount: '', secondAmount: '' }
  const schema = {
    firstAmount: {
      label: __('Amount 1'),
      pattern: 'number',
      required: true,
      min: 0.01,
      max: 0.09,
    },
    secondAmount: {
      label: __('Amount 2'),
      pattern: 'number',
      required: true,
      min: 0.01,
      max: 0.09,
    },
  }
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    () => dispatch({ type: ACTIONS.SET_SUBMITTING }),
    schema,
    initialForm,
  )
  const [state, dispatch] = useReducer(reducer, { isSubmitting: false, submittingError: false })

  useEffect(() => {
    if (!state.isSubmitting) return () => {}

    const amountData = {
      deposit_amount_1: values.firstAmount.split('.')[1],
      deposit_amount_2: values.secondAmount.split('.')[1],
    }

    const verifyMicrodeposit$ = defer(() => api.verifyMicrodeposit(microdeposit.guid, amountData))

    const subscription = verifyMicrodeposit$.subscribe(
      () => fadeOut(containerRef.current, 'down').then(() => onSuccess()),
      () => dispatch({ type: ACTIONS.SUBMITTING_ERROR }),
    )

    return () => subscription.unsubscribe()
  }, [state.isSubmitting])

  useEffect(() => {
    if (errors.firstAmount) {
      firstInputRef.current.focus()
    } else if (errors.secondAmount) {
      secondInputRef.current.focus()
    }
  }, [errors])

  return (
    <div ref={containerRef}>
      <Stack spacing={1.5}>
        <SlideDown>
          <Stack spacing={1}>
            <Text component="h2" data-test="title-header" truncate={false} variant="h2">
              {__('Enter deposit amounts')}
            </Text>
            <ProtectedText data-test="deposit-paragraph" truncate={false} variant="subtitle1">
              {
                /* --TR: Full string "Please find the two small deposits less than a dollar each in your {accountName} account, and enter the amounts here." */
                __(
                  'Please find the two small deposits less than a dollar each in your %1 account, and enter the amounts here.',
                  microdeposit.account_name,
                )
              }
            </ProtectedText>
          </Stack>
        </SlideDown>

        {(microdeposit.status === MicrodepositsStatuses.DENIED || state.submittingError) && (
          <SlideDown>
            <Alert data-test="input-error-messagebox" role="alert" severity="error">
              <Text data-test="input-error-text" truncate={false} variant="subtitle1">
                {state.submittingError
                  ? __("We're unable to submit your deposit amounts. Please try again.")
                  : __('One or more of the amounts was incorrect. Please try again.')}
              </Text>
            </Alert>
          </SlideDown>
        )}

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <Stack spacing={2}>
            <SlideDown>
              <Stack direction="row" spacing={2}>
                <TextField
                  FormHelperTextProps={{ id: 'firstAmount-error' }}
                  autoComplete="off"
                  error={!!errors.firstAmount}
                  helperText={errors.firstAmount}
                  id={schema.firstAmount.label}
                  inputProps={{
                    'data-test': 'amount-1-input',
                    'aria-describedby': errors.firstAmount ? 'firstAmount-error' : undefined,
                  }}
                  inputRef={firstInputRef}
                  label={schema.firstAmount.label}
                  name="firstAmount"
                  onChange={handleTextInputChange}
                  placeholder="0.00"
                  required={true}
                  value={values.firstAmount}
                />
                <TextField
                  FormHelperTextProps={{ id: 'secondAmount-error' }}
                  autoComplete="off"
                  error={!!errors.secondAmount}
                  helperText={errors.secondAmount}
                  id={schema.secondAmount.label}
                  inputProps={{
                    'data-test': 'amount-2-input',
                    'aria-describedby': errors.secondAmount ? 'secondAmount-error' : undefined,
                  }}
                  inputRef={secondInputRef}
                  label={schema.secondAmount.label}
                  name="secondAmount"
                  onChange={handleTextInputChange}
                  placeholder="0.00"
                  required={true}
                  value={values.secondAmount}
                />
              </Stack>
            </SlideDown>
            <RequiredFieldNote styles={{ marginBottom: 16 }} />
            <SlideDown>
              <Button
                className={styles.button}
                data-test="continue-button"
                fullWidth={true}
                onClick={handleSubmit}
                type="submit"
                variant="contained"
              >
                {__('Continue')}
              </Button>
            </SlideDown>
          </Stack>
          <AriaLive level="assertive" message={Object.values(errors).join(', ')} />
        </form>
      </Stack>
    </div>
  )
}

VerifyDeposits.propTypes = {
  microdeposit: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
}
