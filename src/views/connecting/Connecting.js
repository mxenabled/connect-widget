import React, { useEffect, useState, useRef, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { defer, of } from 'rxjs'
import {
  filter,
  take,
  pluck,
  tap,
  mergeMap,
  concatMap,
  catchError,
  map,
  retry,
} from 'rxjs/operators'
import { useSelector, useDispatch } from 'react-redux'

import { Text } from '@mxenabled/mxui'
import { useTokens } from '@kyper/tokenprovider'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { pollMember, CONNECTING_MESSAGES } from 'src/utilities/pollers'
import { STEPS } from 'src/const/Connect'
import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'
import { ProgressBar } from 'src/views/connecting/progress/ProgressBar'
import * as JobSchedule from 'src/utilities/JobSchedule'
import { AriaLive } from 'src/components/AriaLive'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { useApi } from 'src/context/ApiContext'
import { getCurrentMember, getSelectedInstitution } from 'src/redux/selectors/Connect'
import { isConnectComboJobsEnabled } from 'src/redux/reducers/userFeaturesSlice'

import { ErrorStatuses, ReadableStatuses } from 'src/const/Statuses'

import {
  connectComplete,
  initializeJobSchedule,
  jobComplete,
  ActionTypes,
} from 'src/redux/actions/Connect'
import PostMessage from 'src/utilities/PostMessage'

import { fadeOut } from 'src/utilities/Animation'
import { __ } from 'src/utilities/Intl'
import { PageviewInfo, AuthenticationMethods } from 'src/const/Analytics'
import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { POST_MESSAGES } from 'src/const/postMessages'
import { AnalyticContext } from 'src/Connect'
import { PostMessageContext } from 'src/ConnectWidget'

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
  const sendPosthogEvent = useAnalyticsEvent()
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
  const { api } = useApi()

  const [message, setMessage] = useState(CONNECTING_MESSAGES.STARTING)
  const [timedOut, setTimedOut] = useState(false)
  const [connectingError, setConnectingError] = useState(null)

  const activeJob = JobSchedule.getActiveJob(jobSchedule)
  const needsToInitializeJobSchedule = jobSchedule.isInitialized === false

  function handleMemberPoll(pollingState) {
    // If we have been polling for more than 15 attempts (60 seconds)
    // show the timeout message
    // Unless this is a PENDING member, then we don't show the timeout
    // since PENDING may take much longer to resolve.
    if (
      pollingState.pollingCount > 15 &&
      pollingState.currentResponse?.connection_status !== ReadableStatuses.PENDING
    ) {
      setTimedOut(true)
    }

    const overrideStatusChanged =
      postMessageEventOverrides?.memberStatusUpdate?.getHasStatusChanged({
        currentMember: pollingState.currentResponse,
        previousMember: pollingState.previousResponse,
      })

    const overrideEventData = postMessageEventOverrides?.memberStatusUpdate?.createEventData?.({
      institution: selectedInstitution,
      member: pollingState.currentResponse,
    })

    const statusChanged =
      pollingState.previousResponse?.connection_status !==
      pollingState.currentResponse?.connection_status

    const eventData = overrideEventData || {
      member_guid: pollingState.currentResponse.guid,
      connection_status: pollingState.currentResponse.connection_status,
    }

    // if status changes during connecting or timeout send out a post message
    if (pollingState.previousResponse != null && (statusChanged || overrideStatusChanged)) {
      onPostMessage('connect/memberStatusUpdate', eventData)
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
   * @returns true if currentUseCases doesn't have all the newUseCases
   */
  const memberIsMissingAConfiguredUseCase = () => {
    const currentUseCases = currentMember?.use_cases

    if (!currentUseCases || !Array.isArray(currentUseCases)) {
      return true
    }

    const newUseCases = connectConfig.use_cases

    return newUseCases.some((useCase) => currentUseCases.includes(useCase) === false)
  }

  // When we mount, try to initialize the jobSchedule, but first we need the
  // most recent job details
  useEffect(() => {
    if (!needsToInitializeJobSchedule) return () => {}

    let sub$ = null
    const loadJob$ = defer(() => {
      // If we have a most recent job guid, get it, otherwise, just pass null
      if (currentMember.most_recent_job_guid) {
        return defer(() => api.loadJob(currentMember.most_recent_job_guid)).pipe(
          // I have to retry here because sometimes this is too fast in sand and
          // it 404s. This is a long standing backend problem.
          retry(1),
          // If we do error for real, just act as if there is no job
          catchError(() => of(null)),
        )
      } else {
        return of(null)
      }
    })

    if (
      memberUseCasesWereProvidedInConfig() &&
      (memberIsMissingAConfiguredUseCase() ||
        currentMember.connection_status === ReadableStatuses.PENDING)
    ) {
      api.updateMember({ ...currentMember }, connectConfig).then((updatedMember) => {
        sub$ = loadJob$.subscribe((job) => {
          if (onUpsertMember) {
            onUpsertMember(updatedMember)
          }

          dispatch({
            type: ActionTypes.UPDATE_MEMBER_SUCCESS,
            payload: { item: updatedMember },
          })

          return dispatch(
            initializeJobSchedule(currentMember, job, connectConfig, isComboJobsEnabled),
          )
        })
      })
    } else {
      sub$ = loadJob$.subscribe((job) =>
        dispatch(initializeJobSchedule(currentMember, job, connectConfig, isComboJobsEnabled)),
      )
    }

    return () => sub$?.unsubscribe()
  }, [needsToInitializeJobSchedule])

  /**
   * If the member is not aggregating, start a job, otherwise, poll the
   * member until it's done aggregating.
   */
  useEffect(() => {
    // If we still need to initialize the job schedule, do nothing
    if (needsToInitializeJobSchedule || !activeJob) return () => {}

    const connectMember$ = defer(() => {
      const needsJobStarted = currentMember.is_being_aggregated === false

      const startJob$ = defer(() =>
        api.runJob(activeJob?.type, currentMember.guid, connectConfig, true),
      ).pipe(
        mergeMap(() => api.loadMemberByGuid(currentMember.guid, clientLocale)),

        catchError((error) => {
          // We control the scenarios of a 409 error (job already running, or member already exists).
          // We can safely continue forward if that is the error we got back.
          const isSafeConflictError = error?.response?.status === 409
          if (isSafeConflictError) {
            return of(currentMember)
          }

          // Prevent the Connecting component from trying to continue
          // when a bad error occurs.
          setConnectingError(error)
          throw error
        }),
      )

      // If the current member is not being aggregated, start a job
      // otherwise, just go with the member we have now
      return needsJobStarted ? startJob$ : of(currentMember)
    })
      .pipe(
        concatMap((member) =>
          pollMember(member.guid, api, onPostMessage, sendPosthogEvent, clientLocale).pipe(
            tap((pollingState) => handleMemberPoll(pollingState)),
            filter((pollingState) => pollingState.jobIsDone),
            pluck('currentResponse'),
            take(1),
            mergeMap((polledMember) => {
              const loadLatestJob$ = defer(() => api.loadJob(member.most_recent_job_guid)).pipe(
                map((job) => ({ member: polledMember, job })),
              )

              return loadLatestJob$
            }),
          ),
        ),
      )
      .subscribe(({ member, job }) => {
        if (onUpsertMember) {
          onUpsertMember(member)
        }

        // if we are in an error state, fade out to ease the transition away
        // from this view
        if (ErrorStatuses.includes(member.connection_status)) {
          return fadeOut(connectingRef.current, 'down').then(() => {
            dispatch(jobComplete(member, job))
          })
        } else {
          return dispatch(jobComplete(member, job))
        }
      })

    return () => connectMember$.unsubscribe()
  }, [needsToInitializeJobSchedule, activeJob])

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
    <div ref={connectingRef} style={styles.container}>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.logoHeader}>
          <ConnectLogoHeader
            institutionGuid={institution.guid}
            institutionLogo={institution.logo_url}
          />
        </div>
        <Text component="h2" style={styles.subHeader} truncate={false} variant="H2">
          {__('Connecting to %1', institution.name)}
        </Text>
      </SlideDown>

      <SlideDown delay={getNextDelay()}>
        <ProgressBar jobSchedule={jobSchedule} />
      </SlideDown>
      <AriaLive level="assertive" message={message} timeout={500} />
    </div>
  )
}

const getStyles = (tokens) => ({
  container: {
    textAlign: 'center',
  },
  logoHeader: {
    marginTop: tokens.Spacing.Medium,
    marginBottom: tokens.Spacing.Small,
  },
  message: {
    marginTop: tokens.Spacing.XLarge,
  },
  subHeader: {
    paddingTop: tokens.Spacing.Large,
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
