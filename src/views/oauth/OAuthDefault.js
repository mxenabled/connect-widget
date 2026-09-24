import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { sha256 } from 'js-sha256'

import { Button } from '@mui/material'
import Stack from '@mui/material/Stack'

import { __ } from 'src/utilities/Intl'
import styles from './OAuthDefault.module.css'

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
import { PredirectInstructions } from 'src/views/oauth/experiments/PredirectInstructions'
import { Icon } from '@mxenabled/mxui'

export const OAuthDefault = (props) => {
  // Experiment code - Remove after experiment is over
  const language = window?.app?.options?.language || 'en-US'

  const hasPredirectInstructions =
    Array.isArray(props.institution?.oauth_predirect_instructions) &&
    props.institution?.oauth_predirect_instructions.length > 0

  const { api } = useApi()
  useAnalyticsPath(...PageviewInfo.CONNECT_OAUTH_INSTRUCTIONS, {
    institution_guid: props.institution.guid,
    institution_name: props.institution.name,
    language,
  })
  const sendAnalyticsEvent = useAnalyticsEvent()
  const getNextDelay = getDelay()
  const showExternalLinkPopup = useSelector(
    (state) => state.profiles.clientProfile.show_external_link_popup,
  )
  const isOauthLoading = useSelector((state) => state.connect.isOauthLoading)
  const oauthURL = useSelector((state) => state.connect.oauthURL)

  return (
    <Stack role="alert" spacing={3}>
      {hasPredirectInstructions ? (
        <>
          <PredirectInstructions institution={props?.institution} />
        </>
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
          className={styles.primaryButton}
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
          variant="contained"
        >
          <Stack direction="row" spacing={1}>
            {isOauthLoading ? __('Loading ...') : __('Go to log in')}
            {isOauthLoading ? null : <Icon className={styles.icon} name="open_in_new" />}
          </Stack>
        </Button>
      </SlideDown>
    </Stack>
  )
}

OAuthDefault.propTypes = {
  currentMember: PropTypes.object.isRequired,
  institution: PropTypes.object.isRequired,
  onSignInClick: PropTypes.func.isRequired,
  selectedInstructionalData: PropTypes.object.isRequired,
  setIsLeavingUrl: PropTypes.func.isRequired,
}
