import React, { useEffect, useState, useRef, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { defer, of } from 'rxjs'
import { mergeMap, catchError, map, retry } from 'rxjs/operators'
import { useSelector, useDispatch } from 'react-redux'

import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { CONNECTING_MESSAGES } from 'src/utilities/pollers'
import { STEPS } from 'src/const/Connect'
import { ProgressBar } from 'src/views/connecting/progress/ProgressBar'
import * as JobSchedule from 'src/utilities/JobSchedule'
import { runJobSchedule$ } from 'src/utilities/runJobSchedule'
import { AriaLive } from 'src/components/AriaLive'
import { PoweredByFooter } from 'src/components/PoweredByFooter'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { useApi } from 'src/context/ApiContext'
import { getCurrentMember, getSelectedInstitution } from 'src/redux/selectors/Connect'
import { isConnectComboJobsEnabled } from 'src/redux/reducers/userFeaturesSlice'

import { ErrorStatuses, ReadableStatuses } from 'src/const/Statuses'

import { connectComplete, initializeJobSchedule, jobComplete } from 'src/redux/actions/Connect'
import PostMessage from 'src/utilities/PostMessage'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'
import { PageviewInfo, AuthenticationMethods, AnalyticEvents } from 'src/const/Analytics'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { POST_MESSAGES } from 'src/const/postMessages'
import { AnalyticContext } from 'src/Connect'
import { PostMessageContext } from 'src/ConnectWidget'
import { Stack } from '@mui/material'
import { usePollMember } from 'src/hooks/usePollMember'

export const CONNECTING_TIMEOUT_MS = 60000

export const Connecting = (props) => {
  const {
    connectConfig,
    institution,
    uiMessageVersion,
    hasAtriumAPI,
    isMobileWebview,
    onUpsertMember,
  } = props

  const selectedInstitution = useSelector(getSelectedInstitution)
  const sendAnalyticsEvent = useAnalyticsEvent()
  const clientLocale = useMemo(() => {
    return document.querySelector('html')?.getAttribute('lang') || 'en'
  }, [document.querySelector('html')?.getAttribute('lang')])
  const currentMember = useSelector(getCurrentMember)
  const isComboJobsEnabled = useSelector(isConnectComboJobsEnabled)
  const jobSchedule = useSelector((state) => state.connect.jobSchedule)
  useAnalyticsPath(...PageviewInfo.CONNECT_CONNECTING, {
    authentication_method: currentMember.is_oauth
      ? AuthenticationMethods.OAUTH
      : AuthenticationMethods.NON_OAUTH,
  })
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const dispatch = useDispatch()

  const analyticFunctions = useContext(AnalyticContext)
  const { onPostMessage, postMessageEventOverrides } = useContext(PostMessageContext)
  const connectingRef = useRef(null)
  const pollingStartedAtRef = useRef(null)
  const { api } = useApi()

  const [message, setMessage] = useState(CONNECTING_MESSAGES.STARTING)
  const [timedOut, setTimedOut] = useState(false)
  const [connectingError, setConnectingError] = useState(null)
  const initialDataReadySentRef = useRef(false)

  const pollMember = usePollMember()

  const needsToInitializeJobSchedule = jobSchedule.isInitialized === false

  function handleMemberPoll(pollingState) {
    // If polling has run longer than the timeout threshold, show timeout.
    // Unless this is a PENDING member, then we don't show the timeout
    // since PENDING may take much longer to resolve.
    if (
      pollingStartedAtRef.current !== null &&
      Date.now() - pollingStartedAtRef.current > CONNECTING_TIMEOUT_MS &&
      pollingState.currentResponse?.member?.connection_status !== ReadableStatuses.PENDING
    ) {
      setTimedOut(true)
    }

    const overrideStatusChanged =
      postMessageEventOverrides?.memberStatusUpdate?.getHasStatusChanged({
        currentMember: pollingState.currentResponse?.member,
        previousMember: pollingState.previousResponse?.member,
      })

    const overrideEventData = postMessageEventOverrides?.memberStatusUpdate?.createEventData?.({
      institution: selectedInstitution,
      member: pollingState.currentResponse?.member,
    })

    const statusChanged =
      pollingState.previousResponse?.member?.connection_status !==
      pollingState.currentResponse?.member?.connection_status

    const eventData = overrideEventData || {
      member_guid: pollingState.currentResponse?.member?.guid,
      connection_status: pollingState.currentResponse?.member?.connection_status,
    }

    // if status changes during connecting or timeout send out a post message
    if (pollingState.previousResponse != null && (statusChanged || overrideStatusChanged)) {
      onPostMessage('connect/memberStatusUpdate', eventData)
    }

    if (pollingState.initialDataReady && !initialDataReadySentRef.current) {
      initialDataReadySentRef.current = true
      // Deprecated: send initial data ready post message Oct 17, 2025
      onPostMessage('connect/initialDataReady', {
        member_guid: pollingState.currentResponse?.member?.guid,
      })
      sendAnalyticsEvent(AnalyticEvents.INITIAL_DATA_READY, {
        member_guid: pollingState.currentResponse?.member?.guid,
      })
    }

    setMessage(pollingState.userMessage)
  }

  // If all jobs are done, fade out and move onto the connected step
  useEffect(() => {
    if (!needsToInitializeJobSchedule && JobSchedule.areAllJobsDone(jobSchedule)) {
      // give the animation a bit more time for the user to see the complete
      // state

      // send member connected post message before analytic event, this allows clients to show their own "connected" window before the connect complete step.
      if (uiMessageVersion === 4) {
        const eventOverride = postMessageEventOverrides?.memberConnected?.createEventData?.({
          institution: selectedInstitution,
          member: currentMember,
        })

        const event = eventOverride || {
          user_guid: currentMember.user_guid,
          member_guid: currentMember.guid,
        }

        onPostMessage(POST_MESSAGES.MEMBER_CONNECTED, event)
        analyticFunctions.onAnalyticEvent(`connect_${POST_MESSAGES.MEMBER_CONNECTED}`, {
          type: connectConfig.is_mobile_webview ? 'url' : 'message',
        })
      } else if (hasAtriumAPI && isMobileWebview === true) {
        PostMessage.setWebviewUrl(`atrium://memberAdded/${currentMember.guid}`)
      } else {
        PostMessage.send('mxConnect:memberAdded', {
          member_guid: currentMember.guid,
          user_guid: currentMember.user_guid,
        })
      }

      fadeOut(connectingRef.current, 'down').then(() => {
        dispatch(connectComplete())
      }, 1500)
    }
  }, [needsToInitializeJobSchedule, jobSchedule])

  const memberUseCasesWereProvidedInConfig = () => Boolean(connectConfig?.use_cases?.length)

  /**
   * @returns true if the member's use cases don't include all the configured ones
   */
  const memberIsMissingAConfiguredUseCase = (member) => {
    const currentUseCases = member?.use_cases

    if (!currentUseCases || !Array.isArray(currentUseCases)) {
      return true
    }

    const newUseCases = connectConfig.use_cases

    return newUseCases.some((useCase) => currentUseCases.includes(useCase) === false)
  }

  const loadMostRecentJob = (member) => {
    if (!member?.most_recent_job_guid) return of(null)

    return defer(() => api.loadJob(member.most_recent_job_guid)).pipe(
      // I have to retry here because sometimes this is too fast in sand and
      // it 404s. This is a long standing backend problem.
      retry(1),
      // If we do error for real, just act as if there is no job
      catchError(() => of(null)),
    )
  }

  useEffect(() => {
    if (!needsToInitializeJobSchedule) return () => {}

    const refreshMember$ = defer(() =>
      api.loadMemberByGuid
        ? api.loadMemberByGuid(currentMember.guid, clientLocale)
        : Promise.resolve(currentMember),
    ).pipe(catchError(() => of(currentMember)))

    const syncUseCases = (member) => {
      const needsUseCaseUpdate =
        memberUseCasesWereProvidedInConfig() &&
        (memberIsMissingAConfiguredUseCase(member) ||
          member.connection_status === ReadableStatuses.PENDING)

      if (!needsUseCaseUpdate) return of(member)

      return defer(() => api.updateMember({ ...member }, connectConfig)).pipe(
        catchError(() => of(member)),
      )
    }

    const sub$ = refreshMember$
      .pipe(
        mergeMap(syncUseCases),
        mergeMap((member) => loadMostRecentJob(member).pipe(map((job) => ({ member, job })))),
      )
      .subscribe(({ member, job }) => {
        if (member !== currentMember && onUpsertMember) {
          onUpsertMember(member)
        }

        dispatch(initializeJobSchedule(member, job, connectConfig, isComboJobsEnabled))
      })

    return () => sub$.unsubscribe()
  }, [needsToInitializeJobSchedule])

  /**
   * Once the schedule is initialized, run it to completion. runJobSchedule$
   * owns the start-job / poll / reconcile loop (including jobs we did not
   * start, 409 conflicts and the iteration cap); this effect only translates
   * what it observes into redux and UI transitions.
   *
   * It deliberately runs once per initialization rather than once per active
   * job: the loop tracks the schedule itself and redux is kept in step through
   * jobComplete, which applies the same JobSchedule.onJobFinished.
   */
  useEffect(() => {
    if (needsToInitializeJobSchedule || !JobSchedule.getActiveJob(jobSchedule)) return () => {}

    pollingStartedAtRef.current = Date.now()

    const schedule$ = runJobSchedule$({
      api,
      pollMember,
      member: currentMember,
      schedule: jobSchedule,
      config: connectConfig,
      onPoll: handleMemberPoll,
    }).subscribe({
      next: ({ member, job }) => {
        if (onUpsertMember) {
          onUpsertMember(member)
        }

        // if we are in an error state, fade out to ease the transition away
        // from this view
        if (ErrorStatuses.includes(member.connection_status)) {
          fadeOut(connectingRef.current, 'down').then(() => {
            dispatch(jobComplete(member, job, connectConfig.mode))
          })
          return
        }

        dispatch(jobComplete(member, job, connectConfig.mode))
      },
      // Non-409 runJob failures and an exhausted schedule both end up here.
      // Throwing from render hands off to the host's error boundary.
      error: (error) => setConnectingError(error),
    })

    return () => {
      pollingStartedAtRef.current = null
      schedule$.unsubscribe()
    }
  }, [needsToInitializeJobSchedule])

  /**
   * We removed the timeout step, but customer's relied on the timeout value in
   * the step change event to do things in their UI, so we need to bring the
   * message back in a way that makes sense.
   *
   * Now send the 'stepChange' event with the expected values when we move into
   * the timeout message here.
   */
  useEffect(() => {
    if (timedOut === true) {
      onPostMessage('connect/stepChange', {
        previous: STEPS.CONNECTING,
        current: 'timeOut',
      })
    }
  }, [timedOut])

  if (connectingError !== null) {
    throw connectingError
  }

  return (
    <div ref={connectingRef} style={styles.pageContainer}>
      <div style={styles.content}>
        <SlideDown delay={getNextDelay()}>
          <Stack spacing="32px">
            <Stack spacing="2px">
              <Text color="text.secondary" truncate={false} variant="subtitle2">
                {__('Connecting to')}
              </Text>
              <Text variant="h2">{institution.name}</Text>
            </Stack>
            <ProgressBar institution={institution} jobSchedule={jobSchedule} />
          </Stack>
        </SlideDown>
        <AriaLive level="assertive" message={message} timeout={500} />
      </div>
      <div style={styles.footer}>
        <PoweredByFooter aggregator={institution.aggregatorDisplayName} />
      </div>
    </div>
  )
}

const getStyles = (tokens) => ({
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    marginTop: '24px',
    marginBottom: '24px',
  },
  message: {
    marginTop: tokens.Spacing.XLarge,
  },
  spinner: {
    marginTop: tokens.Spacing.XLarge,
  },
})

Connecting.propTypes = {
  connectConfig: PropTypes.object.isRequired,
  hasAtriumAPI: PropTypes.bool,
  institution: PropTypes.object.isRequired,
  isMobileWebview: PropTypes.bool,
  onUpsertMember: PropTypes.func,
  uiMessageVersion: PropTypes.number,
}
