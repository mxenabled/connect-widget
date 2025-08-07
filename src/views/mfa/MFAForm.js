import _get from 'lodash/get'
import PropTypes from 'prop-types'
import React from 'react'
import { useTokens } from '@kyper/tokenprovider'
import { sha256 } from 'js-sha256'

import { ViewTitle } from 'src/components/ViewTitle'
import { MFAOptions } from 'src/views/mfa/MFAOptions'
import { DefaultMFA } from 'src/views/mfa/DefaultMFA'
import { MFAImages } from 'src/views/mfa/MFAImages'

import { __ } from 'src/utilities/Intl'
import { CredentialTypes } from 'src/const/Credential'
import { getMFAFieldType } from 'src/views/mfa/utils'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { AnalyticEvents } from 'src/const/Analytics'

export const MFAForm = (props) => {
  const { currentMember, institution, isSubmitting, onSubmit } = props
  const sendPosthogEvent = useAnalyticsEvent()
  const tokens = useTokens()

  const mfaCredentials = _get(currentMember, 'mfa.credentials', [])
  const mfaType = getMFAFieldType(mfaCredentials)
  const isSAS = mfaCredentials[0].external_id === 'single_account_select'

  const styles = getStyles(tokens)

  // When a user submits any of the forms we want to see an END analytic event for Connect
  // Consumers don't need to know Connect's analytics, so we add them here
  const handleSubmit = (credentials) => {
    const posthogEventMetadata = {
      institution_guid: institution.guid,
      institution_name: institution.name,
      member_guid: sha256(currentMember.guid),
    }

    if (mfaType === CredentialTypes.OPTIONS) {
      sendPosthogEvent(AnalyticEvents.MFA_SUBMITTED_OPTION, posthogEventMetadata)
    } else if (mfaType === CredentialTypes.IMAGE_OPTIONS) {
      sendPosthogEvent(AnalyticEvents.MFA_SUBMITTED_IMAGE, posthogEventMetadata)
    } else {
      sendPosthogEvent(AnalyticEvents.MFA_SUBMITTED_INPUT, posthogEventMetadata)
    }
    onSubmit(credentials)
  }

  //Default Form
  let Form = (
    <DefaultMFA
      currentMember={currentMember}
      institution={institution}
      isSubmitting={isSubmitting}
      mfaCredentials={mfaCredentials}
      onSubmit={handleSubmit}
    />
  )

  //Multiple Choice/ Options Form
  if (mfaType === CredentialTypes.OPTIONS) {
    Form = (
      <MFAOptions
        currentMember={currentMember}
        institution={institution}
        isSubmitting={isSubmitting}
        mfaCredentials={mfaCredentials}
        onSubmit={handleSubmit}
      />
    )
  }

  //Multiple Image Choice
  if (mfaType === CredentialTypes.IMAGE_OPTIONS) {
    Form = (
      <MFAImages
        institution={institution}
        isSubmitting={isSubmitting}
        mfaCredentials={mfaCredentials}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div style={styles.title}>
        <ViewTitle title={isSAS ? __('Account selection') : __('Verify identity')} />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>{Form}</form>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      height: '100%',
    },
    title: {
      marginBottom: tokens.Spacing.Medium,
    },
    credentialLabel: {
      lineHeight: tokens.LineHeight.Paragraph,
      marginBottom: tokens.Spacing.Medium,
    },
    buttonSpacing: {
      marginTop: tokens.Spacing.Medium,
    },
  }
}

MFAForm.propTypes = {
  currentMember: PropTypes.object.isRequired,
  institution: PropTypes.object.isRequired,
  isSubmitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
}
