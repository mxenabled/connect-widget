import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { TextField } from 'src/privacy/input'
import { Button } from '@mui/material'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { __ } from 'src/utilities/Intl'
import { AriaLive } from 'src/components/AriaLive'

import { SlideDown } from 'src/components/SlideDown'
import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'

export const PersonalInfoForm = ({ accountDetails, onContinue }) => {
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_PERSONAL_INFO_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialFormValues = {
    firstName: accountDetails.first_name ?? '',
    lastName: accountDetails.last_name ?? '',
    email: accountDetails.email ?? '',
  }
  const schema = {
    firstName: {
      label: __('First name'),
      required: true,
    },
    lastName: {
      label: __('Last name'),
      required: true,
    },
    email: {
      label: __('Email'),
      required: true,
      pattern: 'email',
    },
  }
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    () => setIsSubmitting(true),
    schema,
    initialFormValues,
  )
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!isSubmitting) return () => {}

    fadeOut(containerRef.current, 'up', 300).then(() => {
      setIsSubmitting(false)
      onContinue({
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
      })
    })
  }, [isSubmitting])

  return (
    <div ref={containerRef}>
      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          <div style={styles.header}>
            <Text data-test="title-header" style={styles.title} truncate={false} variant="H2">
              {__('Enter account holder information')}
            </Text>
            <Text
              data-test="verify-paragraph"
              style={styles.subtitle}
              truncate={false}
              variant="Paragraph"
            >
              {__(
                'This helps verify account ownership, and should match the first and last name on this account.',
              )}
            </Text>
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <div style={styles.inputStyle}>
            <TextField
              autoFocus={true}
              error={errors.firstName}
              fullWidth={true}
              helperText={!!errors.firstName}
              inputProps={{ 'data-test': 'first-name-input' }}
              label={schema.firstName.label}
              name="firstName"
              onChange={handleTextInputChange}
              required={true}
              value={values.firstName}
            />
          </div>
          <div style={styles.inputStyle}>
            <TextField
              error={errors.lastName}
              fullWidth={true}
              helperText={!!errors.lastName}
              inputProps={{ 'data-test': 'last-name-input' }}
              label={schema.lastName.label}
              name="lastName"
              onChange={handleTextInputChange}
              required={true}
              value={values.lastName}
            />
          </div>
          <div>
            <TextField
              error={!!errors.email}
              fullWidth={true}
              helperText={errors.email}
              inputProps={{ 'data-test': 'email-input' }}
              label={schema.email.label}
              name="email"
              onChange={handleTextInputChange}
              required={true}
              value={values.email}
            />
          </div>
        </SlideDown>
        <div style={{ marginTop: 16, marginBottom: 32 }}>
          <span style={{ color: '#666', fontSize: 13 }}>
            <span style={{ color: '#E32727', fontSize: 13 }}>*</span> {__('Required')}
          </span>
        </div>
        <SlideDown delay={getNextDelay()}>
          <Button
            aria-label={__('Continue to account details')}
            data-test="continue-button"
            fullWidth={true}
            onClick={handleSubmit}
            type="submit"
            variant="contained"
          >
            {__('Continue')}
          </Button>
        </SlideDown>
        <AriaLive level="assertive" message={Object.values(errors).join(', ')} />
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
    marginBottom: tokens.Spacing.XSmall,
  },
  subtitle: {
    marginBottom: tokens.Spacing.Large,
  },
  inputStyle: {
    marginBottom: tokens.Spacing.XLarge,
  },
})

PersonalInfoForm.propTypes = {
  accountDetails: PropTypes.object,
  onContinue: PropTypes.func.isRequired,
}
