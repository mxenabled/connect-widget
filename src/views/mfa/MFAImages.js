import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'

import { css } from '@mxenabled/cssinjs'
import { __, _p } from 'src/utilities/Intl'

import { focusElement } from 'src/utilities/Accessibility'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { PageviewInfo, AnalyticEvents } from 'src/const/Analytics'

import { CheckmarkFilled } from '@kyper/icon/CheckmarkFilled'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'
import { Button } from '@mui/material'

export const MFAImages = (props) => {
  const { institution, isSubmitting, mfaCredentials, onSubmit } = props
  useAnalyticsPath(...PageviewInfo.CONNECT_MFA_IMAGE_OPTIONS)
  const sendPosthogEvent = useAnalyticsEvent()
  const buttonRef = useCallback((button) => {
    focusElement(button)
  }, [])
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const [selectedOption, setSelectedOption] = useState({})

  const [credentialsToSubmit, setCredentials] = useState(
    mfaCredentials.map((cred) => ({ guid: cred.guid, value: null })),
  )

  const mfaLabel = mfaCredentials.map((credential) => credential.label)

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleOnSubmit = () => {
    setIsSubmitted(true)

    if (_isEmpty(selectedOption)) {
      return false
    }

    return onSubmit(credentialsToSubmit)
  }

  return (
    <React.Fragment>
      <Text component="p" style={styles.label} truncate={false} variant="Paragraph">
        {mfaLabel}
      </Text>
      <div style={styles.imageWrapper}>
        {mfaCredentials.map((credential) => {
          return credential.options.map((option, i) => {
            const isSelected = selectedOption.guid === option.guid

            const imageStyle =
              _isEmpty(selectedOption) && isSubmitted
                ? { ...styles.imageButton, ...styles.errored }
                : styles.imageButton

            return (
              <Button
                disabled={isSubmitting}
                key={option.guid}
                onClick={() => {
                  setSelectedOption({ guid: option.guid })
                  setCredentials(
                    credentialsToSubmit.map((cred) =>
                      credential.guid === option.credential_guid
                        ? { guid: option.credential_guid, value: option.guid }
                        : cred,
                    ),
                  )
                  sendPosthogEvent(AnalyticEvents.MFA_SELECTED_IMAGE, {
                    institution_guid: institution.guid,
                    institution_name: institution.name,
                  })
                }}
                ref={i === 0 ? buttonRef : null}
                style={imageStyle}
                type="button"
              >
                <img
                  alt={`${credential.label} - ${option.label}`}
                  className={css(styles.mfaImage, isSelected && styles.selected)}
                  key={option.label}
                  src={option.data_uri}
                />
                {isSelected ? (
                  <CheckmarkFilled
                    aria-label={__('%1 Selected', option.label)}
                    color={tokens.Color.Primary300}
                    role="status"
                    size={16}
                    style={styles.checkMark}
                  />
                ) : null}
              </Button>
            )
          })
        })}
      </div>
      {isSubmitted && _isEmpty(selectedOption) && (
        <section role="alert" style={styles.errorContent}>
          <AttentionFilled color={tokens.Color.Error300} />
          <p style={styles.errorMessage}>{__('Choose an image')}</p>
        </section>
      )}
      <Button
        fullWidth={true}
        onClick={handleOnSubmit}
        style={styles.submitButton}
        variant="contained"
      >
        {isSubmitting ? `${_p('Verifying', 'Checking')}...` : __('Continue')}
      </Button>
    </React.Fragment>
  )
}

const getStyles = (tokens) => {
  return {
    label: {
      marginBottom: tokens.Spacing.Medium,
    },
    imageWrapper: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2 , 1fr)',
      gridRowGap: tokens.Spacing.Small,
      gridColumnGap: tokens.Spacing.Small,
    },
    imageButton: {
      cursor: 'pointer',
      padding: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      ':focus': {
        borderRadius: tokens.BorderRadius.Medium,
        border: `2px solid ${tokens.BorderColor.InputFocus}`,
        boxShadow: 'none',
      },
    },
    selected: {
      opacity: '70%',
    },
    errored: {
      border: `2px solid ${tokens.BorderColor.InputError}`,
      borderRadius: tokens.BorderRadius.Medium,
    },
    mfaImage: {
      borderRadius: tokens.BorderRadius.Medium,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      ':hover': {
        opacity: '70%',
      },
    },
    checkMark: {
      backgroundColor: tokens.Color.NeutralWhite,
      borderRadius: '50%',
      border: `2px solid ${tokens.Color.NeutralWhite}`,
      position: 'absolute',
      top: tokens.Spacing.XSmall,
      right: tokens.Spacing.XSmall,
    },
    errorContent: {
      marginTop: tokens.Spacing.XSmall,
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

MFAImages.propTypes = {
  institution: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool,
  mfaCredentials: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
