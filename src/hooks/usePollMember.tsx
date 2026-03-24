import { useContext, useMemo } from 'react'
import { DEFAULT_POLLING_STATE, handlePollingResponse } from 'src/utilities/pollers'
import { useApi } from 'src/context/ApiContext'
import { WebSocketContext } from 'src/context/WebSocketContext'
import { useSelector } from 'react-redux'
import { getExperimentalFeatures } from 'src/redux/reducers/experimentalFeaturesSlice'
import { ReadableStatuses } from 'src/const/Statuses'

import { defer, EMPTY, interval, merge, of } from 'rxjs'
import { catchError, scan, map, mergeMap, exhaustMap, filter } from 'rxjs/operators'

export function usePollMember() {
  const { api } = useApi()
  const socketConnection = useContext(WebSocketContext)

  const clientLocale = useMemo(() => {
    return document.querySelector('html')?.getAttribute('lang') || 'en'
  }, [document.querySelector('html')?.getAttribute('lang')])

  const { optOutOfEarlyUserRelease, memberPollingMilliseconds } =
    useSelector(getExperimentalFeatures)

  const pollingInterval = memberPollingMilliseconds || 3000

  const pollMember = (memberGuid: string) => {
    const pollMember$ = interval(pollingInterval).pipe(
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
        // @ts-expect-error: cannot invoke a method that might be undefined
        defer(() => api.loadMemberByGuid(memberGuid, clientLocale)).pipe(
          mergeMap((member) =>
            defer(() => api.loadJob(member.most_recent_job_guid as string)).pipe(
              map((job) => ({ member, job })),
            ),
          ),
          catchError((error) => of(error)),
        ),
      ),
    )

    // To minimize the "blast radius" of using websockets, only the mfa event is being handled for now.
    // In the future, we want to utilize websockets to remove polling entirely, and fall back to polling
    // only when absolutely necessary, when websocket connections fail
    // CAUTION: websockets do not return the credentials for the membmer.. so an API call is still required.
    const websocketMfa$ = socketConnection?.webSocketMessages$
      ? socketConnection.webSocketMessages$.pipe(
          filter(
            (message) =>
              message?.event === 'members/updated' &&
              message?.payload?.connection_status === ReadableStatuses.CHALLENGED &&
              (!message?.payload?.guid || message.payload.guid === memberGuid),
          ),
          mergeMap((message) =>
            defer(() =>
              // @ts-expect-error: cannot invoke a method that might be undefined
              api.loadMemberByGuid(message?.payload?.guid || memberGuid, clientLocale),
            ).pipe(
              map((member) => ({
                member,
              })),
              catchError((error) => of(error)),
            ),
          ),
        )
      : EMPTY

    return merge(pollMember$, websocketMfa$).pipe(
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

  return pollMember
}
