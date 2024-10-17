import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { TextInput, SelectionBox } from 'src/privacy/input'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { PageviewInfo } from 'src/const/Analytics'
import { AriaLive } from 'src/components/AriaLive'
import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/connect/components/SlideDown'
import { FindAccountInfo } from 'src/connect/components/FindAccountInfo'
import { ActionableUtilityRow } from 'src/connect/components/ActionableUtilityRow'
import { fadeOut } from 'src/connect/utilities/Animation'
import {
  AccountFields,
  AccountTypeLabels,
  ReadableAccountTypes,
} from 'src/views/microdeposits/const'
import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'

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
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    handleContinue,
    schema,
    initialForm,
  )
  const tokens = useTokens()
  const styles = getStyles(tokens)
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
        <div style={styles.header}>
          <Text as="H2" data-test="title-header" style={styles.title}>
            {__('Enter account information')}
          </Text>
        </div>
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          <label data-test="account-type-label" style={styles.label}>
            {__('Account Type')}
          </label>
          <div data-test="selection-boxes" style={styles.selectBoxes}>
            <SelectionBox
              autoFocus={
                focus === AccountFields.ACCOUNT_TYPE &&
                accountType === ReadableAccountTypes.CHECKING
              }
              checked={accountType === ReadableAccountTypes.CHECKING}
              id={AccountTypeLabels[ReadableAccountTypes.CHECKING]}
              label={AccountTypeLabels[ReadableAccountTypes.CHECKING]}
              name="accountType"
              onChange={() => setAccountType(ReadableAccountTypes.CHECKING)}
              style={styles.selectBox}
              value={AccountTypeLabels[ReadableAccountTypes.CHECKING]}
            />
            <SelectionBox
              autoFocus={
                focus === AccountFields.ACCOUNT_TYPE && accountType === ReadableAccountTypes.SAVINGS
              }
              checked={accountType === ReadableAccountTypes.SAVINGS}
              id={AccountTypeLabels[ReadableAccountTypes.SAVINGS]}
              label={AccountTypeLabels[ReadableAccountTypes.SAVINGS]}
              name="accountType"
              onChange={() => setAccountType(ReadableAccountTypes.SAVINGS)}
              style={styles.selectBox}
              value={AccountTypeLabels[ReadableAccountTypes.SAVINGS]}
            />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <div style={styles.inputStyle}>
            <TextInput
              autoComplete="off"
              autoFocus={focus === AccountFields.ACCOUNT_NUMBER}
              data-test="account-number-input"
              errorText={errors.accountNumber}
              label={schema.accountNumber.label}
              name="accountNumber"
              onChange={handleTextInputChange}
              // tel is functionally the same as text input but shows a keypad(instead of QWERTY)
              type="tel"
              value={values.accountNumber}
            />
          </div>
          <div style={styles.inputStyle}>
            <TextInput
              autoComplete="off"
              data-test="confirm-account-number-input"
              errorText={errors.accountNumberConfirm}
              label={schema.accountNumberConfirm.label}
              name="accountNumberConfirm"
              onChange={handleTextInputChange}
              // tel is functionally the same as text input but shows a keypad(instead of QWERTY)
              type="tel"
              value={values.accountNumberConfirm}
            />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <Button
            aria-label={__('Continue to confirm details')}
            data-test="continue-button"
            onClick={handleSubmit}
            style={styles.button}
            type="submit"
            variant="primary"
          >
            {__('Continue')}
          </Button>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <ActionableUtilityRow
            icon={<ChevronRight color={tokens.TextColor.ButtonLinkTertiary} size={16} />}
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

const getStyles = (tokens) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: tokens.Spacing.Medium,
  },
  label: {
    fontSize: tokens.FontSize.InputLabel,
    paddingLeft: tokens.Spacing.InputLabelPaddingLeft,
    paddingRight: tokens.Spacing.InputLabelPaddingRight,
    backgroundColor: tokens.BackgroundColor.InputLabelDefault,
    color: tokens.TextColor.InputLabel,
    lineHeight: tokens.LineHeight.Small,
  },
  selectBoxes: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 0 32px 0',
    marginTop: tokens.Spacing.XSmall,
  },
  selectBox: {
    width: '48%',
  },
  inputStyle: {
    marginBottom: tokens.Spacing.XLarge,
  },
  button: {
    marginBottom: tokens.Spacing.Small,
    width: '100%',
  },
})

AccountInfo.propTypes = {
  accountDetails: PropTypes.object,
  focus: PropTypes.string,
  onContinue: PropTypes.func.isRequired,
}
