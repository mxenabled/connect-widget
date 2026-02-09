import { useMemo } from 'react'
import { DEFAULT_POLLING_STATE, handlePollingResponse } from 'src/utilities/pollers'
import { useApi } from 'src/context/ApiContext'
import { useSelector } from 'react-redux'
import { getExperimentalFeatures } from 'src/redux/reducers/experimentalFeaturesSlice'

import { defer, interval, of } from 'rxjs'
import { catchError, scan, map, mergeMap, exhaustMap } from 'rxjs/operators'

export function usePollMember() {
  const { api } = useApi()

  const clientLocale = useMemo(() => {
    return document.querySelector('html')?.getAttribute('lang') || 'en'
  }, [document.querySelector('html')?.getAttribute('lang')])

  const { optOutOfEarlyUserRelease, memberPollingMilliseconds } =
    useSelector(getExperimentalFeatures)

  const pollingInterval = memberPollingMilliseconds || 3000

  const pollMember = (memberGuid: string) => {
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
