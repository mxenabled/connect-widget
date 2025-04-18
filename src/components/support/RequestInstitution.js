import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { TextField } from 'src/privacy/input'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'

import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'
import { AriaLive } from 'src/components/AriaLive'
import { useForm } from 'src/hooks/useForm'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { useApi } from 'src/context/ApiContext'

export const RequestInstitution = React.forwardRef((props, requestInstitutionRef) => {
  const { handleClose, handleTicketSuccess, user } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_REQUEST_INSTITUTION)
  const { api } = useApi()
  const [submitting, setSubmitting] = useState(false)
  const initialForm = {
    email: user.email ?? '',
    institutionName: '',
    institutionWebsite: '',
    institutionLogin: '',
  }
  const schema = {
    email: {
      label: __('Your email address'),
      required: true,
      pattern: 'email',
    },
    institutionName: {
      label: __('Institution name'),
      required: true,
    },
    institutionWebsite: {
      label: __('Institution website'),
      required: true,
      pattern: 'url',
    },
    institutionLogin: {
      label: __('Institution login page (optional)'),
      required: false,
      pattern: 'url',
    },
  }
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    () => setSubmitting(true),
    schema,
    initialForm,
  )

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()

  const emailInputRef = useRef(null)
  const institutionNameInputRef = useRef(null)
  const institutionWebsiteInputRef = useRef(null)
  const institutionLoginInputRef = useRef(null)

  useEffect(() => {
    if (errors.email) {
      emailInputRef.current?.focus()
    } else if (errors.institutionName) {
      institutionNameInputRef.current?.focus()
    } else if (errors.institutionWebsite) {
      institutionWebsiteInputRef.current?.focus()
    } else if (errors.institutionLogin) {
      institutionLoginInputRef.current?.focus()
    }
  }, [errors])

  useEffect(() => {
    if (submitting) {
      const ticket = {
        email: values.email,
        message: `Institution Website : ${values.institutionWebsite} Institution Login Page : ${values.institutionLogin}`,
        title: `Institution Request: ${values.institutionName}`,
      }

      api
        .createSupportTicket(ticket)
        .then(() =>
          fadeOut(requestInstitutionRef.current, 'up', 300).then(() =>
            handleTicketSuccess(values.email),
          ),
        )
    }
  }, [submitting])

  const handleCancel = () => {
    fadeOut(requestInstitutionRef.current, 'up', 300).then(() => handleClose())
  }

  return (
    <div ref={requestInstitutionRef}>
      <SlideDown delay={getNextDelay()}>
        <Text style={styles.title} truncate={false} variant="H2">
          {__('Request an institution')}
        </Text>

        <Text component="p" style={styles.paragraph} truncate={false} variant="Paragraph">
          {__(
            "If you can't find your financial institution, you may submit a request to add it to our system.",
          )}
        </Text>
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          {!user.email && (
            <div style={styles.input}>
              <TextField
                autoComplete="off"
                autoFocus={!user.email}
                disabled={submitting}
                error={!!errors.email}
                fullWidth={true}
                helperText={errors.email}
                id="email"
                inputProps={{
                  'aria-describedby': errors.email ? 'email-error' : undefined,
                }}
                inputRef={emailInputRef}
                label={schema.email.label}
                name="email"
                onChange={handleTextInputChange}
                value={values.email}
              />
            </div>
          )}
          <div style={styles.input}>
            <TextField
              autoComplete="off"
              autoFocus={!!user.email}
              disabled={submitting}
              error={!!errors.institutionName}
              fullWidth={true}
              helperText={errors.institutionName}
              id="institutionName"
              inputProps={{
                'aria-describedby': errors.institutionName ? 'institutionName-error' : undefined,
              }}
              inputRef={institutionNameInputRef}
              label={schema.institutionName.label}
              name="institutionName"
              onChange={handleTextInputChange}
              value={values.institutionName}
            />
          </div>
          <div style={styles.input}>
            <TextField
              autoComplete="off"
              disabled={submitting}
              error={!!errors.institutionWebsite}
              fullWidth={true}
              helperText={errors.institutionWebsite}
              id="institutionWebsite"
              inputProps={{
                'aria-describedby': errors.institutionWebsite
                  ? 'institutionWebsite-error'
                  : undefined,
              }}
              inputRef={institutionWebsiteInputRef}
              label={schema.institutionWebsite.label}
              name="institutionWebsite"
              onChange={handleTextInputChange}
              value={values.institutionWebsite}
            />
          </div>
          <div style={styles.input}>
            <TextField
              aria-label={schema.institutionLogin.label}
              autoComplete="off"
              disabled={submitting}
              error={!!errors.institutionLogin}
              fullWidth={true}
              helperText={errors.institutionLogin}
              id="institutionLogin"
              inputProps={{
                'aria-describedby': errors.institutionLogin ? 'institutionLogin-error' : undefined,
              }}
              inputRef={institutionLoginInputRef}
              label={schema.institutionLogin.label}
              name="institutionLogin"
              onChange={handleTextInputChange}
              value={values.institutionLogin}
            />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <div style={styles.buttons}>
            <Button
              disabled={submitting}
              onClick={handleCancel}
              style={{ ...styles.firstButton, ...styles.button }}
              variant="outlined"
            >
              {__('Cancel')}
            </Button>
            <Button
              data-test="request-continue"
              disabled={submitting}
              onClick={(e) => {
                handleSubmit(e)
              }}
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
              : `${errors.email ?? ''} ${
                  errors.institutionName ?? ''
                } ${errors.institutionWebsite ?? ''} ${errors.institutionLogin ?? ''}`
          }
        />
      </form>
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
    marginBottom: tokens.Spacing.Large,
  },
  input: {
    marginBottom: tokens.Spacing.Large,
  },
  buttons: {
    display: 'inline-flex',
    marginTop: tokens.Spacing.XSmall,
    width: '100%',
  },
  firstButton: {
    marginRight: tokens.Spacing.Small,
  },
  button: {
    flexGrow: 1,
  },
})

RequestInstitution.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleTicketSuccess: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
}

RequestInstitution.displayName = 'RequestInstitution'
