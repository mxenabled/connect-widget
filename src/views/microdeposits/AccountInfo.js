import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'

import { Icon, Text } from '@mxenabled/mxui'
import { TextField, SelectionBox } from 'src/privacy/input'
import { Button, RadioGroup, FormControl, FormLabel, Stack } from '@mui/material'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo } from 'src/const/Analytics'
import { AriaLive } from 'src/components/AriaLive'
import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { FindAccountInfo } from 'src/components/FindAccountInfo'
import { ActionableUtilityRow } from 'src/components/ActionableUtilityRow'
import { fadeOut } from 'src/utilities/Animation'
import {
  AccountFields,
  AccountTypeLabels,
  ReadableAccountTypes,
} from 'src/views/microdeposits/const'
import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'
import RequiredFieldNote from 'src/components/RequiredFieldNote'
import styles from 'src/views/microdeposits/AccountInfo.module.css'

export const AccountInfo = (props) => {
  const { accountDetails, focus, onContinue } = props
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_ACCOUNT_INFO)
  const [showFindDetails, setShowFindDetails] = useState(false)
  const [accountType, setAccountType] = useState(
    accountDetails?.account_type ?? ReadableAccountTypes.CHECKING,
  )
  const initialForm = {
    accountNumber: accountDetails?.account_number ?? '',
    accountNumberConfirm: accountDetails?.account_number ?? '',
  }
  const schema = {
    accountNumber: {
      label: __('Account number'),
      required: true,
      pattern: 'digits',
      equalTo: 'accountNumberConfirm',
    },
    accountNumberConfirm: {
      label: __('Confirm account number'),
      required: true,
      pattern: 'digits',
      equalTo: 'accountNumber',
    },
  }
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    handleContinue,
    schema,
    initialForm,
  )
  const getNextDelay = getDelay()

  function handleContinue() {
    const newAccountDetails = {
      ...accountDetails,
      account_type: accountType,
      account_number: values.accountNumber,
    }

    fadeOut(containerRef.current, 'up', 300).then(() => onContinue(newAccountDetails))
  }

  if (showFindDetails) {
    return <FindAccountInfo onClose={() => setShowFindDetails(false)} step="accountInfo" />
  }

  return (
    <div ref={containerRef}>
      <SlideDown delay={getNextDelay()}>
        <Stack>
          <Text
            className={styles.title}
            component="h2"
            data-test="title-header"
            truncate={false}
            variant="H2"
          >
            {__('Enter account information')}
          </Text>
        </Stack>
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          <FormControl className={styles.formControl} component="fieldset">
            <FormLabel component="legend">{__('Account type')}</FormLabel>
            <RadioGroup className={styles.radioGroup} name="row-radio-buttons-group" row={true}>
              <SelectionBox
                autoFocus={
                  focus === AccountFields.ACCOUNT_TYPE &&
                  accountType === ReadableAccountTypes.CHECKING
                }
                id={AccountTypeLabels[ReadableAccountTypes.CHECKING]}
                message={AccountTypeLabels[ReadableAccountTypes.CHECKING]}
                name="accountType"
                onChange={() => setAccountType(ReadableAccountTypes.CHECKING)}
                selected={accountType === ReadableAccountTypes.CHECKING}
                value={AccountTypeLabels[ReadableAccountTypes.CHECKING]}
              />
              <SelectionBox
                autoFocus={
                  focus === AccountFields.ACCOUNT_TYPE &&
                  accountType === ReadableAccountTypes.SAVINGS
                }
                id={AccountTypeLabels[ReadableAccountTypes.SAVINGS]}
                message={AccountTypeLabels[ReadableAccountTypes.SAVINGS]}
                name="accountType"
                onChange={() => setAccountType(ReadableAccountTypes.SAVINGS)}
                selected={accountType === ReadableAccountTypes.SAVINGS}
                value={AccountTypeLabels[ReadableAccountTypes.SAVINGS]}
              />
            </RadioGroup>
          </FormControl>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <div className={styles.input}>
            <TextField
              autoComplete="off"
              autoFocus={focus === AccountFields.ACCOUNT_NUMBER}
              error={!!errors.accountNumber}
              fullWidth={true}
              helperText={errors.accountNumber}
              inputProps={{ 'data-test': 'account-number-input' }}
              label={schema.accountNumber.label}
              name="accountNumber"
              onChange={handleTextInputChange}
              required={true}
              // tel is functionally the same as text input but shows a keypad(instead of QWERTY)
              type="tel"
              value={values.accountNumber}
            />
          </div>
          <div>
            <TextField
              autoComplete="off"
              error={!!errors.accountNumberConfirm}
              fullWidth={true}
              helperText={errors.accountNumberConfirm}
              inputProps={{ 'data-test': 'confirm-account-number-input' }}
              label={schema.accountNumberConfirm.label}
              name="accountNumberConfirm"
              onChange={handleTextInputChange}
              required={true}
              // tel is functionally the same as text input but shows a keypad(instead of QWERTY)
              type="tel"
              value={values.accountNumberConfirm}
            />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <RequiredFieldNote />
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <Button
            aria-label={__('Continue to confirm details')}
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

        <SlideDown delay={getNextDelay()}>
          <ActionableUtilityRow
            icon={<Icon color="action" name="chevron_right" size={24} />}
            onClick={() => setShowFindDetails(true)}
            text={__('Help finding your account number')}
          />
        </SlideDown>

        <AriaLive
          level="assertive"
          message={
            _isEmpty(errors)
              ? ''
              : `${errors.accountNumber ?? ''} ${errors.accountNumberConfirm ?? ''}`
          }
        />
      </form>
    </div>
  )
}

AccountInfo.propTypes = {
  accountDetails: PropTypes.object,
  focus: PropTypes.string,
  onContinue: PropTypes.func.isRequired,
}
