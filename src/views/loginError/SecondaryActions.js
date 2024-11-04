import React from 'react'

import { __ } from 'src/utilities/Intl'
import PropTypes from 'prop-types'

// External Dependencies
import { goToUrlLink } from 'src/utilities/global'
import { getInstitutionLoginUrl } from 'src/utilities/Institution'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { AnalyticEvents } from 'src/const/Analytics'

import {
  GET_HELP,
  DISCONNECT_INSTITUTION,
  VISIT_WEBSITE,
  TRY_ANOTHER_INSTITUTION,
} from 'src/views/loginError/consts'

export const SecondaryActions = ({
  actions,
  institution,
  isDeleteInstitutionOptionEnabled,
  member,
  showSupport,
  showExternalLinkPopup,
  onGetHelpClick,
  onTryAnotherInstitutionClick,
  onDeleteConnectionClick,
  setIsLeaving,
}) => {
  const sendPosthogEvent = useAnalyticsEvent()
  const tokens = useTokens()
  const styles = getStyles(tokens)

  const actionMap = [
    {
      key: VISIT_WEBSITE,
      title: __("Go to bank's website"),
      onClick: () => {
        if (showExternalLinkPopup) {
          setIsLeaving(true)
        } else {
          const url = getInstitutionLoginUrl(institution)

          goToUrlLink(url)
        }
      },
      shouldShow: true,
    },
    {
      key: TRY_ANOTHER_INSTITUTION,
      title: __('Try another institution'),
      onClick: () => {
        onTryAnotherInstitutionClick()
      },
      shouldShow: true,
    },
    {
      key: GET_HELP,
      title: __('Get help'),
      onClick: () => {
        sendPosthogEvent(AnalyticEvents.LOGIN_ERROR_CLICKED_GET_HELP)
        onGetHelpClick()
      },
      shouldShow: showSupport,
    },
    {
      key: DISCONNECT_INSTITUTION,
      title: __('Disconnect this institution'),
      onClick: () => {
        onDeleteConnectionClick()
      },
      shouldShow:
        member.is_managed_by_user && !member.is_being_aggreated && isDeleteInstitutionOptionEnabled,
    },
  ]

  return (
    <div style={styles.container}>
      {actionMap.map((action) => {
        if (!action.shouldShow) return false
        if (!actions.includes(action.key)) return false

        return (
          <Button
            data-test={`${action.title.replace(/\s+/g, '-')}-button`}
            fullWidth={true}
            key={action.key}
            onClick={action.onClick}
            role={action.key === VISIT_WEBSITE ? 'link' : 'button'}
            variant="text"
          >
            {action.title}
          </Button>
        )
      })}
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: tokens.Spacing.XSmall,
    },
  }
}

SecondaryActions.propTypes = {
  actions: PropTypes.array.isRequired,
  institution: PropTypes.object.isRequired,
  isDeleteInstitutionOptionEnabled: PropTypes.bool.isRequired,
  member: PropTypes.object.isRequired,
  onDeleteConnectionClick: PropTypes.func.isRequired,
  onGetHelpClick: PropTypes.func.isRequired,
  onTryAnotherInstitutionClick: PropTypes.func.isRequired,
  setIsLeaving: PropTypes.func.isRequired,
  showExternalLinkPopup: PropTypes.bool.isRequired,
  showSupport: PropTypes.bool.isRequired,
}
