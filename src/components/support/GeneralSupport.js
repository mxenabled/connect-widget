import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { TextInput, TextArea } from 'src/privacy/input'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'

import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'
import { useForm } from 'src/hooks/useForm'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { AriaLive } from 'src/components/AriaLive'
import { useApi } from 'src/context/ApiContext'

export const GeneralSupport = React.forwardRef((props, generalSupportRef) => {
  const { handleClose, handleTicketSuccess, user } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_GENERAL)
  const { api } = useApi()
  const [submitting, setSubmitting] = useState(false)
  const initialForm = {
    email: user.email ?? '',
    issueDescription: '',
    issueDetails: '',
  }
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    () => setSubmitting(true),
    schema,
    initialForm,
  )

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  useEffect(() => {
    if (submitting) {
      const ticket = {
        email: values.email,
        message: values.issueDetails,
        title: values.issueDescription,
      }

      api
        .createSupportTicket(ticket)
        .then(() =>
          fadeOut(generalSupportRef.current, 'up', 300).then(() =>
            handleTicketSuccess(values.email),
          ),
        )
    }
  }, [submitting])

  return (
    <div ref={generalSupportRef}>
      <SlideDown delay={getNextDelay()}>
        <Text style={styles.title} tag="h2">
          {__('Request support')}
        </Text>

        <Text as="Paragraph" style={styles.paragraph} tag="p">
          {__(
            'Please use this form for technical issues about connecting your account. Do not include private or financial information, such as account number or password. For financial issues about transactions, bill pay, transfers, loans, rewards and so on, please contact the appropriate customer service department directly.',
          )}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        {!user.email && (
          <div style={styles.input}>
            <TextInput
              autoComplete="off"
              autoFocus={!user.email}
              disabled={submitting}
              errorText={errors.email}
              label={schema.email.label}
              name="email"
              onChange={handleTextInputChange}
              showErrorIcon={true}
              value={values.email}
            />
          </div>
        )}
        <div style={styles.input}>
          <TextInput
            autoComplete="off"
            autoFocus={user.email}
            disabled={submitting}
            errorText={errors.issueDescription}
            label={schema.issueDescription.label}
            name="issueDescription"
            onChange={handleTextInputChange}
            showErrorIcon={true}
            value={values.issueDescription}
          />
        </div>
        <div style={styles.input}>
          <TextArea
            autoComplete="off"
            disabled={submitting}
            errorText={errors.issueDetails}
            label={schema.issueDetails.label}
            name="issueDetails"
            onChange={handleTextInputChange}
            showErrorIcon={true}
            value={values.issueDetails}
          />
        </div>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <div style={styles.buttons}>
          <Button
            disabled={submitting}
            onClick={() => fadeOut(generalSupportRef.current, 'up', 300).then(() => handleClose())}
            style={{ ...styles.firstButton, ...styles.button }}
            type="submit"
            variant="outlined"
          >
            {__('Cancel')}
          </Button>
          <Button
            disabled={submitting}
            onClick={handleSubmit}
            style={styles.button}
            type="submit"
            variant="contained"
          >
            {__('Continue')}
          </Button>
        </div>
        <PrivateAndSecure />
      </SlideDown>

      <AriaLive
        level="assertive"
        message={
          _isEmpty(errors)
            ? ''
            : `${errors.email ?? ''} ${errors.issueDescription ?? ''} ${errors.issueDetails ?? ''}`
        }
      />
    </div>
  )
})

const getStyles = (tokens) => ({
  title: {
    display: 'block',
    marginBottom: tokens.Spacing.XSmall,
  },
  paragraph: {
    display: 'block',
    marginBottom: tokens.Spacing.Medium,
  },
  input: {
    marginBottom: tokens.Spacing.Medium,
  },
  buttons: {
    display: 'flex',
    marginTop: tokens.Spacing.XSmall,
  },
  firstButton: {
    marginRight: tokens.Spacing.Small,
  },
  button: {
    flexGrow: 1,
  },
})

GeneralSupport.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleTicketSuccess: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
}

GeneralSupport.displayName = 'GeneralSupport'

const schema = {
  email: {
    label: __('Your email address'),
    required: true,
    pattern: 'email',
  },
  issueDescription: {
    label: __('Brief description of the issue'),
    required: true,
  },
  issueDetails: {
    label: __('Details of the issue'),
    required: true,
  },
}
