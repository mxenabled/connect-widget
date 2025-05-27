import React, { useState } from 'react'
import _isEmpty from 'lodash/isEmpty'
import PropTypes from 'prop-types'
import { sha256 } from 'js-sha256'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { SelectionBox } from 'src/privacy/input'
import { Button, FormLabel } from '@mui/material'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { PageviewInfo, AnalyticEvents } from 'src/const/Analytics'

import { __, _p } from 'src/utilities/Intl'

export const MFAOptions = (props) => {
  const { currentMember, institution, isSubmitting, mfaCredentials, onSubmit } = props
  const sendPosthogEvent = useAnalyticsEvent()
  const isSAS = mfaCredentials[0].external_id === 'single_account_select'
  const pageView = isSAS
    ? PageviewInfo.CONNECT_MFA_SINGLE_ACCOUNT_SELECT
    : PageviewInfo.CONNECT_MFA_OPTIONS
  useAnalyticsPath(...pageView)

  // selected option is for css changes and to confirm that an option has been selected before submitting the form (this is par of the form validation)
  const [selectedOption, setSelectedOption] = useState({})
  // isSubmitted will help us to make sure that we only show validation errors if the form has been submitted otherwise the error would show every time there are no items selected
  const [isSubmitted, setIsSubmitted] = useState(false)

  // credentials are set upon selection and these credentialsToSubmit are fed to the parent and submitted on the update member
  const [credentialsToSubmit, setCredentials] = useState(
    mfaCredentials.map((cred) => ({ guid: cred.guid, value: null })),
  )

  const handleOnSubmit = () => {
    // when the user selects to Continue the setIsSubmitted is set to true
    setIsSubmitted(true)

    //if there are is no selectedOption then the errors will show
    if (_isEmpty(selectedOption)) {
      return false
    }

    //otherwise if there is an item selected to submit we submit those credentials
    return onSubmit(credentialsToSubmit)
  }

  const tokens = useTokens()
  const styles = getStyles(tokens)
  const mfaLabel = mfaCredentials.map((credential) => credential.label)
  const dynamicLabel = mfaLabel[0] ? mfaLabel[0] : __('Choose an authentication method.')

  return (
    <div>
      {!isSAS && (
        <FormLabel sx={{ display: 'flex' }}>
          <Text component="p" style={styles.label} truncate={false} variant="Paragraph">
            {dynamicLabel}
          </Text>
          <span style={{ color: '#E32727', fontSize: 15 }}>*</span>
        </FormLabel>
      )}
      {mfaCredentials.map((credential) => {
        return credential.options.map((option, i) => {
          const isSelected = selectedOption.guid === option.guid

          return (
            <span data-test={option.label.replace(/\s/g, '-')} key={`${option.guid}`}>
              <SelectionBox
                autoFocus={i === 0}
                checked={isSelected}
                disabled={isSubmitting}
                id={`${option.guid}`}
                key={`${option.guid}`}
                label={
                  <Text
                    bold={true}
                    data-test={option.label.replace(/\s/g, '-')}
                    truncate={false}
                    variant="Paragraph"
                  >
                    {option.label}
                  </Text>
                }
                name="options-selection-box"
                onChange={() => {
                  setSelectedOption({ guid: option.guid })
                  setCredentials(
                    credentialsToSubmit.map((cred) =>
                      credential.guid === option.credential_guid
                        ? { guid: option.credential_guid, value: option.guid }
                        : cred,
                    ),
                  )
                  sendPosthogEvent(AnalyticEvents.MFA_SELECTED_OPTION, {
                    institution_guid: institution.guid,
                    institution_name: institution.name,
                    selectedOption: option.value,
                    member_guid: sha256(currentMember.guid),
                  })
                }}
                required={true}
                style={styles.card}
                value={option.label}
                variant="radio"
              />
            </span>
          )
        })
      })}

      <span style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
        <span style={{ color: '#E32727', fontSize: 13 }}>*</span> {__('Required')}
      </span>

      {isSubmitted && _isEmpty(selectedOption) && (
        <section role="alert" style={styles.errorContent}>
          <AttentionFilled color={tokens.Color.Error300} />
          <p style={styles.errorMessage}>
            {isSAS ? __('Account selection is required.') : __('Choose an option')}
          </p>
        </section>
      )}
      <Button
        data-test="continue-button"
        fullWidth={true}
        onClick={handleOnSubmit}
        style={styles.submitButton}
        variant="contained"
      >
        {isSubmitting ? `${_p('Verifying', 'Checking')}...` : __('Continue')}
      </Button>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    label: {
      marginBottom: tokens.Spacing.Medium,
    },
    optionLabel: {
      textAlign: 'left',
      wordBreak: 'break-word',
    },
    card: {
      fontWeight: tokens.FontWeight.Bold,
      padding: tokens.Spacing.SelectionBoxPadding,
      marginBottom: tokens.Spacing.Small,
    },
    selected: {
      color: tokens.Color.Brand400,
      backgroundColor: tokens.BackgroundColor.SelectionBoxLinkHover,
    },
    errored: {
      border: `2px solid ${tokens.BorderColor.InputError}`,
    },
    checkMark: {
      backgroundColor: tokens.Color.NeutralWhite,
      borderRadius: '50%',
      border: `2px solid ${tokens.Color.NeutralWhite}`,
    },
    errorContent: {
      color: tokens.TextColor.Error,
      display: 'flex',
      alignItems: 'center',
    },
    errorMessage: {
      marginLeft: tokens.Spacing.Tiny,
    },
    submitButton: {
      marginTop: tokens.Spacing.Large,
    },
  }
}

MFAOptions.propTypes = {
  currentMember: PropTypes.object.isRequired,
  institution: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool,
  mfaCredentials: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
