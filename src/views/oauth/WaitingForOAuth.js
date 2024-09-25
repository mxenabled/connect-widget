import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { of, defer } from 'rxjs'
import { map, mergeMap, delay, pluck } from 'rxjs/operators'

import { Button } from '@kyper/button'
import { Text } from '@kyper/text'
import { useTokens } from '@kyper/tokenprovider'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { pollOauthState } from 'src/utilities/pollers'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'
import { OauthState } from 'src/const/consts'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { useApi } from 'src/context/ApiContext'
import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'

import { __ } from 'src/utilities/Intl'

export const WaitingForOAuth = ({
  institution,
  member,
  onOAuthError,
  onOAuthRetry,
  onOAuthSuccess,
  onReturnToSearch,
}) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_OAUTH_WAITING, {
    institution_guid: institution.guid,
    institution_name: institution.name,
  })

  const sendPosthogEvent = useAnalyticsEvent()
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
  const [disableOauthButtons, setDisableOauthButtons] = useState(true)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const { api } = useApi()

  useEffect(() => {
    /**
     * This gets the most recent PENDING oauth state for the member and polls that
     * state until it goes from PENDING to ERRORED or SUCCESS.
     *
     * NOTE: the pause and retreival of the most recent oauth state is a little
     * weird. Ideally we would know which oauth state to poll for ahead of time,
     * but we don't since it is created when the user visits the oauth url.
     *
     * Once that is refactored in this issue:
     *  https://gitlab.mx.com/mx/connectivity/connect/connect-issues/-/issues/1836
     *
     * We could potentially have the member create and oauth uri endpoints return
     * the oauth state created and know which oauth state to retreive ahead of time.
     */
    const oauthStateCompleted$ = of(member).pipe(
      delay(1500),
      mergeMap(() =>
        defer(() =>
          api.loadOAuthStates({
            outbound_member_guid: member.guid,
            auth_status: OauthState.AuthStatus.PENDING,
          }),
        ),
      ),
      pluck(0), // get the first response. Should be sorted by newest first
      mergeMap((latestState) => pollOauthState(latestState.guid, api)),
      map((pollingState) => {
        const oauthState = pollingState.currentResponse

        return {
          error: oauthState.auth_status === OauthState.AuthStatus.ERRORED,
          errorReason: OauthState.ReadableErrorReason[oauthState.error_reason],
          memberGuid: oauthState.inbound_member_guid,
        }
      }),
    )

    /**
     * Race the poller and the postmessages, the poller emitting is treated
     * the same as oauth success, the post messages can be error or success
     */
    const sub$ = oauthStateCompleted$.subscribe(
      (resp) => {
        if (!resp.error) {
          onOAuthSuccess(resp.memberGuid)
        } else {
          onOAuthError(resp.memberGuid, resp.errorReason)
        }
      },
      // on any uncaught error, just go to the error view.
      () => onOAuthError(member.guid),
    )

    return () => sub$.unsubscribe()
  }, [])

  /**
   * This useEffect disables "Try again" and "Cancel" buttons
   * For 2 seconds when the component loads.
   *
   */
  useEffect(() => {
    setTimeout(() => setDisableOauthButtons(false), 2000)
  }, [])

  return (
    <React.Fragment>
      <SlideDown delay={getNextDelay()}>
        <InstitutionBlock institution={institution} />
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Text tag="h2">{__('Waiting for permission')}</Text>
        <Text tag="p">
          {__(
            'You should have been directed to %1 to sign in and connect your account.',
            institution.name,
          )}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <div style={styles.spinner}>
          <LoadingSpinner />
        </div>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <Button
          disabled={disableOauthButtons}
          onClick={() => {
            sendPosthogEvent(AnalyticEvents.WAITING_FOR_OAUTH_TRYAGAIN, {
              institution_guid: institution.guid,
              institution_name: institution.name,
            })
            onOAuthRetry()
          }}
          style={styles.button}
          variant="primary"
        >
          {__('Try again')}
        </Button>
        {!showConnectGlobalNavigationHeader && (
          <Button
            disabled={disableOauthButtons}
            onClick={() => {
              sendPosthogEvent(AnalyticEvents.WAITING_FOR_OAUTH_CANCEL, {
                institution_guid: institution.guid,
                institution_name: institution.name,
              })
              onReturnToSearch()
            }}
            style={styles.neutralButton}
          >
            {__('Cancel')}
          </Button>
        )}
      </SlideDown>
    </React.Fragment>
  )
}

const getStyles = (tokens) => ({
  spinner: {
    marginTop: tokens.Spacing.XLarge,
  },
  button: {
    marginTop: tokens.Spacing.XLarge,
    width: '100%',
  },
  neutralButton: {
    marginTop: tokens.Spacing.Small,
    width: '100%',
  },
})

WaitingForOAuth.propTypes = {
  institution: PropTypes.object.isRequired,
  member: PropTypes.object.isRequired,
  onOAuthError: PropTypes.func.isRequired,
  onOAuthRetry: PropTypes.func.isRequired,
  onOAuthSuccess: PropTypes.func.isRequired,
  onReturnToSearch: PropTypes.func.isRequired,
}
