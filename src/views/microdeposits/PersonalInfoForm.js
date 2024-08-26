import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'
import { TextInput } from 'src/privacy/input'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { __ } from 'src/utilities/Intl'
import { AriaLive } from 'src/components/AriaLive'

import { SlideDown } from 'src/components/SlideDown'
import { GoBackButton } from 'src/components/GoBackButton'
import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'

import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'

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

export const PersonalInfoForm = ({ accountDetails, handleGoBack, onContinue }) => {
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_PERSONAL_INFO_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialFormValues = {
    firstName: accountDetails.first_name ?? '',
    lastName: accountDetails.last_name ?? '',
    email: accountDetails.email ?? '',
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
      <SlideDown delay={getNextDelay()}>
        {!showConnectGlobalNavigationHeader && <GoBackButton handleGoBack={handleGoBack} />}
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          <div style={styles.header}>
            <Text as="H2" data-test="title-header" style={styles.title}>
              {__('Enter account holder information')}
            </Text>
            <Text as="Paragraph" data-test="verify-paragraph" style={styles.subtitle}>
              {__(
                'This helps verify account ownership, and should match the first and last name on this account.',
              )}
            </Text>
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <div style={styles.inputStyle}>
            <TextInput
              autoFocus={true}
              data-test="first-name-input"
              errorText={errors.firstName}
              label={schema.firstName.label}
              name="firstName"
              onChange={handleTextInputChange}
              value={values.firstName}
            />
          </div>
          <div style={styles.inputStyle}>
            <TextInput
              data-test="last-name-input"
              errorText={errors.lastName}
              label={schema.lastName.label}
              name="lastName"
              onChange={handleTextInputChange}
              value={values.lastName}
            />
          </div>
          <div style={styles.inputStyle}>
            <TextInput
              data-test="email-input"
              errorText={errors.email}
              label={schema.email.label}
              name="email"
              onChange={handleTextInputChange}
              value={values.email}
            />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <Button
            aria-label={__('Continue to account details')}
            data-test="continue-button"
            onClick={handleSubmit}
            style={styles.button}
            type="submit"
            variant="primary"
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
  button: {
    width: '100%',
  },
})

PersonalInfoForm.propTypes = {
  accountDetails: PropTypes.object,
  handleGoBack: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
}
