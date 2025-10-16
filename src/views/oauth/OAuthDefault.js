import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { sha256 } from 'js-sha256'

import { useTokens } from '@kyper/tokenprovider'
import { Export } from '@kyper/icon/Export'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'

import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { SlideDown } from 'src/components/SlideDown'
import { ViewTitle } from 'src/components/ViewTitle'
import { InstructionalText } from 'src/components/InstructionalText'
import { InstructionList } from 'src/components/InstructionList'

import { getDelay } from 'src/utilities/getDelay'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'
import { useApi } from 'src/context/ApiContext'
import { getUserFeatures } from 'src/redux/reducers/userFeaturesSlice'
import {
  WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME,
  WellsFargoInstructions,
} from 'src/views/oauth/experiments/WellsFargoInstructions'

export const OAuthDefault = (props) => {
  // Experiment code - Remove after experiment is over
  const userFeatures = useSelector(getUserFeatures)
  const isWellsFargoInstructionsFeatureEnabled =
    userFeatures.some(
      (feature) =>
        feature.feature_name === WELLS_FARGO_INSTRUCTIONS_FEATURE_NAME &&
        feature.is_enabled === 'test',
    ) && props.institution.guid === 'INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867' // Wells Fargo PROD guid

  const { api } = useApi()
  useAnalyticsPath(...PageviewInfo.CONNECT_OAUTH_INSTRUCTIONS, {
    institution_guid: props.institution.guid,
    institution_name: props.institution.name,
  })
  const sendAnalyticsEvent = useAnalyticsEvent()
  const getNextDelay = getDelay()
  const showExternalLinkPopup = useSelector(
    (state) => state.profiles.clientProfile.show_external_link_popup,
  )
  const isOauthLoading = useSelector((state) => state.connect.isOauthLoading)
  const oauthURL = useSelector((state) => state.connect.oauthURL)
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div role="alert">
      {isWellsFargoInstructionsFeatureEnabled ? (
        // This experiment removes the institution block and completely changes the instructional text
        <WellsFargoInstructions
          institutionName={props?.institution?.name}
          title={props?.selectedInstructionalData?.title}
        />
      ) : (
        <>
          <InstitutionBlock institution={props.institution} />
          <ViewTitle
            title={
              props.selectedInstructionalData.title ?? __('Log in at %1', props.institution.name)
            }
          />
          <SlideDown delay={getNextDelay()}>
            {props.selectedInstructionalData.description && (
              <InstructionalText
                instructionalText={props.selectedInstructionalData.description}
                setIsLeavingUrl={props.setIsLeavingUrl}
                showExternalLinkPopup={showExternalLinkPopup}
              />
            )}
            <InstructionList
              items={
                props.selectedInstructionalData.steps?.length > 0
                  ? props.selectedInstructionalData.steps
                  : [
                      __('You’ll be sent to %1 to securely log in.', props.institution.name),
                      __('Then you’ll return here to finish connecting.'),
                    ]
              }
              setIsLeavingUrl={props.setIsLeavingUrl}
              showExternalLinkPopup={showExternalLinkPopup}
            />
          </SlideDown>
        </>
      )}

      <SlideDown delay={getNextDelay()}>
        <Button
          data-test="continue-button"
          disabled={isOauthLoading || !oauthURL}
          fullWidth={true}
          onClick={() => {
            sendAnalyticsEvent(AnalyticEvents.OAUTH_DEFAULT_GO_TO_INSTITUTION, {
              institution_guid: props.institution.guid,
              institution_name: props.institution.name,
              member_guid: sha256(props.currentMember.guid),
            })
            api?.oAuthStart({
              member: props.currentMember,
            })

            props.onSignInClick()
          }}
          role="link"
          style={styles.primaryButton}
          variant="contained"
        >
          {isOauthLoading ? __('Loading ...') : __('Go to log in')}
          {isOauthLoading ? null : <Export style={styles.export} />}
        </Button>
      </SlideDown>
    </div>
  )
}

OAuthDefault.propTypes = {
  currentMember: PropTypes.object.isRequired,
  institution: PropTypes.object.isRequired,
  onSignInClick: PropTypes.func.isRequired,
  selectedInstructionalData: PropTypes.object.isRequired,
  setIsLeavingUrl: PropTypes.func.isRequired,
}

const getStyles = (tokens) => ({
  primaryButton: {
    display: 'flex',
    marginTop: tokens.Spacing.XLarge,
  },
  neutralButton: {
    marginTop: tokens.Spacing.XSmall,
  },
  export: {
    marginLeft: tokens.Spacing.XSmall,
    display: 'flex',
    alignItems: 'center',
  },
})
