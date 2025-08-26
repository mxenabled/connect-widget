import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { sha256 } from 'js-sha256'

import { useTokens } from '@kyper/tokenprovider'
import { TextField } from 'src/privacy/input'
import { Button, Typography } from '@mui/material'

import { __, _p } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { PageviewInfo, AnalyticEvents } from 'src/const/Analytics'

import { useForm } from 'src/hooks/useForm'
import { buildInitialValues, buildFormSchema } from 'src/views/mfa/utils'
import { focusElement } from 'src/utilities/Accessibility'
import { AriaLive } from 'src/components/AriaLive'
import RequiredFieldNote from 'src/components/RequiredFieldNote'

export const DefaultMFA = (props) => {
  const { currentMember, institution, isSubmitting, mfaCredentials, onSubmit } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_MFA_DEFAULT)
  const sendAnalyticsEvent = useAnalyticsEvent()
  const buttonRef = useCallback((button) => {
    focusElement(button)
  }, [])

  const tokens = useTokens()
  const styles = getStyles(tokens)

  const credentials = mfaCredentials.map((credential) => credential)

  // initialFormValues is used to build out the form in order to use the useForm validation hook we first build the initialValues based on the data structure
  // we then build out the formSchema which is then send out to the useForm hook along with the initialValues to validate those fields
  const initialFormValues = buildInitialValues(credentials)
  const formSchema = buildFormSchema(credentials)
  const { values, handleTextInputChange, handleSubmit, errors } = useForm(
    submitMFA,
    formSchema,
    initialFormValues,
  )

  const [needToSendAnalyticEvent, setNeedToSendAnalyticEvent] = useState(true)

  const handleMFACodeChange = (e) => {
    if (needToSendAnalyticEvent) {
      sendAnalyticsEvent(AnalyticEvents.MFA_ENTERED_INPUT, {
        institution_guid: institution.guid,
        institution_name: institution.name,
        member_guid: sha256(currentMember.guid),
      })

      setNeedToSendAnalyticEvent(false)
    }

    handleTextInputChange(e)
  }

  //when we submitMFA this function maps over those credentials and finds the value based on the credential.label value if there are errors those errors
  //continue to show and if part of the form no longer have errors those are cleared out we only submit the form until all errors have been cleared out
  function submitMFA() {
    const credentialsPayload = credentials.map((credential) => {
      return {
        guid: credential.guid,
        value: values[credential.label],
      }
    })

    onSubmit(credentialsPayload)
  }

  return (
    <React.Fragment>
      {mfaCredentials.map((credential, i) => {
        const metaData = credential.meta_data || credential.image_data
        const asteriskColor = '#E32727'

        return (
          <div key={credential.label} style={styles.label}>
            <Typography
              id={`label-for-mfa-text-field`}
              style={styles.challengeLabel}
              variant="subtitle1"
            >
              {credential.label}{' '}
              <Typography
                component="span"
                sx={{
                  color: asteriskColor,
                }}
              >
                *
              </Typography>
            </Typography>
            {metaData ? (
              <div style={styles.metaData}>
                <img alt={__('Challenge Image')} src={metaData} style={styles.mfaImage} />
              </div>
            ) : null}
            <TextField
              disabled={isSubmitting}
              error={!!errors[credential.label]}
              fullWidth={true}
              helperText={errors[credential.label]}
              inputProps={{ 'aria-labelledby': `label-for-mfa-text-field` }}
              inputRef={i === 0 ? buttonRef : null}
              name={credential.label}
              onChange={handleMFACodeChange}
              required={true}
              value={values[credential.label] || ''}
            />
          </div>
        )
      })}
      <RequiredFieldNote />
      <Button
        data-test="continue-button"
        fullWidth={true}
        onClick={handleSubmit}
        type="submit"
        variant="contained"
      >
        {isSubmitting ? `${_p('Verifying', 'Checking')}...` : __('Continue')}
      </Button>

      <AriaLive
        level="assertive"
        message={Object.values(errors)
          .map((msg) => `${msg}, `)
          .join()}
      />
    </React.Fragment>
  )
}

const getStyles = (tokens) => {
  return {
    label: {
      marginTop: tokens.Spacing.Medium,
    },
    challengeLabel: {
      marginBottom: tokens.Spacing.Tiny,
      lineHeight: '24px',
    },
    metaData: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: `${tokens.Spacing.Medium}px 0px`,
    },
    mfaImage: {
      display: 'block',
      maxWidth: '100%',
      objectFit: 'contain',
      width: 'auto',
      height: 'auto',
      borderRadius: tokens.BorderRadius.Medium,
    },
  }
}

DefaultMFA.propTypes = {
  currentMember: PropTypes.object.isRequired,
  institution: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool,
  mfaCredentials: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
