import { defer, interval, of } from 'rxjs'
import { catchError, scan, filter, map, mergeMap, exhaustMap } from 'rxjs/operators'

import { ErrorStatuses, ProcessingStatuses, ReadableStatuses } from 'src/const/Statuses'

import { __ } from 'src/utilities/Intl'
import { OauthState } from 'src/const/consts'

export const CONNECTING_MESSAGES = {
  STARTING: __('Starting'),
  MFA: __('Additional Information Required'),
  VERIFYING: __('Verifying credentials'),
  SYNCING: __('Syncing data'),
  FINISHING: __('Finishing'),
  OAUTH: __('Waiting for authentication'),
  ERROR: __('Error has occurred'),
}

export const DEFAULT_POLLING_STATE = {
  isError: false, // whether or not the last poll was an error
  pollingCount: 0, // used to count how many times we have polled
  previousResponse: {}, // previous response from last poll
  currentResponse: {}, // current response
  pollingIsDone: false, // whether or not we should stop polling
  userMessage: CONNECTING_MESSAGES.STARTING, // message to show the end user
  initialDataReady: false, // whether the initial data ready event has been sent
}

export function pollMember(
  memberGuid,
  api,
  clientLocale,
  optOutOfEarlyUserRelease = false,
  memberPollingMilliseconds = undefined,
) {
  const pollingInterval = memberPollingMilliseconds || 3000
  return interval(pollingInterval).pipe(
    /**
     * used to be switchMap
     * exhaustMap ignores new emissions from the source while the current inner observable is still active.
     *
     * This ensures that we do not start a new poll request until the previous one has completed,
     * preventing overlapping requests and potential race conditions.
     */
    exhaustMap(() =>
      // Poll the currentMember. Catch errors but don't handle it here
      // the scan will handle it below
      defer(() => api.loadMemberByGuid(memberGuid, clientLocale)).pipe(
        mergeMap((member) =>
          defer(() => api.loadJob(member.most_recent_job_guid)).pipe(
            map((job) => ({ member, job })),
          ),
        ),
        catchError((error) => of(error)),
      ),
    ),
    scan(
      (acc, response) => {
        const isError = response instanceof Error

        const pollingState = {
          // only track if the most recent poll was an error
          isError,
          // always increase polling count
          pollingCount: acc.pollingCount + 1,
          // dont update previous response if this is an error
          previousResponse: isError ? acc.previousResponse : acc.currentResponse,
          // dont update current response if this is an error
          currentResponse: isError ? acc.currentResponse : response,
          // preserve the initialDataReadySent flag
          initialDataReady: acc.initialDataReady,
        }

        if (
          !isError &&
          !acc.initialDataReady &&
          response?.job?.async_account_data_ready &&
          !optOutOfEarlyUserRelease
        ) {
          pollingState.initialDataReady = true
        }

        const [shouldStopPolling, messageKey] = handlePollingResponse(pollingState)

        return {
          ...pollingState,
          // we should keep polling based on the member
          pollingIsDone: isError ? false : shouldStopPolling,
          userMessage: messageKey,
        }
      },
      { ...DEFAULT_POLLING_STATE },
    ),
  )
}

export function handlePollingResponse(pollingState) {
  const polledMember = pollingState.currentResponse?.member || {}
  const previousMember = pollingState.previousResponse?.member || {}
  const initialDataReady = pollingState.initialDataReady

  const justFinishedAggregating =
    previousMember.is_being_aggregated === true && polledMember.is_being_aggregated === false
  const isNotAggregatingAtAll =
    previousMember.is_being_aggregated === false && polledMember.is_being_aggregated === false

  // If we are challenged update the message and stop polling
  if (polledMember.connection_status === ReadableStatuses.CHALLENGED) {
    return [true, CONNECTING_MESSAGES.MFA]
  }

  // If we are still processing update the message but keep polling
  if (ProcessingStatuses.indexOf(polledMember.connection_status) !== -1) {
    return [false, CONNECTING_MESSAGES.VERIFYING]
  }

  if (initialDataReady) {
    return [true, CONNECTING_MESSAGES.FINISHING]
  }

  if (polledMember.connection_status === ReadableStatuses.CONNECTED) {
    // if we are still being aggregated keep polling
    if (polledMember.is_being_aggregated) {
      return [false, CONNECTING_MESSAGES.SYNCING]
    }

    return [true, CONNECTING_MESSAGES.FINISHING]
  }

  // At this point we are probably in an error state, but we need to wait for
  // aggregation to finish to know for sure.
  if (polledMember.is_being_aggregated) {
    return [false, CONNECTING_MESSAGES.VERIFYING]
  }

  // if we aren't aggregating whatsoever and in an error state, stop polling
  if (isNotAggregatingAtAll && ErrorStatuses.includes(polledMember.connection_status)) {
    return [true, CONNECTING_MESSAGES.ERROR]
  }

  /**
   * If this is an OAuth member, we could be stuck 'connecting' forever if the
   * user bails out of the authentication process, leaving the member in the
   * same state we started with.
   *
   * We will keep polling oauth members until they either fit a condition above,
   * or the member goes from
   * - `is_being_aggregated: true` to `is_being_aggregated: false`
   */
  if (polledMember.is_oauth && justFinishedAggregating === false) {
    return [false, CONNECTING_MESSAGES.OAUTH]
  }

  return [true, CONNECTING_MESSAGES.ERROR]
}

/**
 * Poll an oauth state until it is SUCCESS OR COMPLETED
 *
 * @param {string} oauthStateGuid the guid of oauthstate to poll
 */
export function pollOauthState(oauthStateGuid, api) {
  return interval(1000).pipe(
    /**
     * used to be switchMap
     * exhaustMap ignores new emissions from the source while the current inner observable is still active.
     *
     * This ensures that we do not start a new poll request until the previous one has completed,
     * preventing overlapping requests and potential race conditions.
     */
    exhaustMap(() =>
      // Poll the oauthstate. Catch errors but don't handle it here
      // the scan will handle it below
      defer(() => api.loadOAuthState(oauthStateGuid)).pipe(catchError((error) => of(error))),
    ),
    scan(
      (acc, response) => {
        const isError = response instanceof Error

        return {
          // only track if the most recent poll was an error
          isError,
          // always increase polling count
          pollingCount: acc.pollingCount + 1,
          // dont update previous response if this is an error
          previousResponse: isError ? acc.previousResponse : acc.currentResponse,
          // dont update current response if this is an error
          currentResponse: isError ? acc.currentResponse : response,
        }
      },
      { ...DEFAULT_POLLING_STATE },
    ),
    filter((pollingState) => {
      return pollingState.isError
        ? false
        : [OauthState.AuthStatus.SUCCESS, OauthState.AuthStatus.ERRORED].includes(
            pollingState.currentResponse?.auth_status,
          )
    }),
  )
}
