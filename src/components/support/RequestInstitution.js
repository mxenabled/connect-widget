import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@kyper/button'
import { Text } from '@kyper/text'
import { TextInput } from 'src/privacy/input'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { GoBackButton } from 'src/components/GoBackButton'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'

import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'
import { AriaLive } from 'src/components/AriaLive'
import { useForm } from 'src/hooks/useForm'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import connectAPI from 'src/services/api'

import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'

export const RequestInstitution = React.forwardRef((props, requestInstitutionRef) => {
  const { handleClose, handleTicketSuccess, user } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_SUPPORT_REQUEST_INSTITUTION)
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
  const [submitting, setSubmitting] = useState(false)
  const initialForm = {
    email: user.email ?? '',
    institutionName: '',
    institutionWebsite: '',
    institutionLogin: '',
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
        message: `Institution Website : ${values.institutionWebsite} Institution Login Page : ${values.institutionLogin}`,
        title: `Institution Request: ${values.institutionName}`,
      }

      connectAPI
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
        {!showConnectGlobalNavigationHeader && <GoBackButton handleGoBack={handleCancel} />}

        <Text style={styles.title} tag="h2">
          {__('Request an institution')}
        </Text>

        <Text as="Paragraph" style={styles.paragraph} tag="p">
          {__(
            "If you can't find your financial institution, you may submit a request to add it to our system.",
          )}
        </Text>
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
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
              errorText={errors.institutionName}
              label={schema.institutionName.label}
              name="institutionName"
              onChange={handleTextInputChange}
              showErrorIcon={true}
              value={values.institutionName}
            />
          </div>
          <div style={styles.input}>
            <TextInput
              autoComplete="off"
              disabled={submitting}
              errorText={errors.institutionWebsite}
              label={schema.institutionWebsite.label}
              name="institutionWebsite"
              onChange={handleTextInputChange}
              showErrorIcon={true}
              value={values.institutionWebsite}
            />
          </div>
          <div style={styles.input}>
            <TextInput
              aria-label={schema.institutionLogin.label}
              autoComplete="off"
              disabled={submitting}
              errorText={errors.institutionLogin}
              label={schema.institutionLogin.label}
              name="institutionLogin"
              onChange={handleTextInputChange}
              showErrorIcon={true}
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
              variant="neutral"
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
              variant="primary"
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
