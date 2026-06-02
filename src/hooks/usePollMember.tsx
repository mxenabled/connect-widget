import { useMemo } from 'react'
import { DEFAULT_POLLING_STATE, handlePollingResponse } from 'src/utilities/pollers'
import { useApi } from 'src/context/ApiContext'
import { useWebSocket } from 'src/context/WebSocketContext'
import { useSelector } from 'react-redux'
import { getExperimentalFeatures } from 'src/redux/reducers/experimentalFeaturesSlice'

import { scan, distinctUntilChanged } from 'rxjs/operators'
import _isEqual from 'lodash/isEqual'
import {
  createMemberUpdateTransport,
  MemberUpdate,
} from 'src/utilities/transport/MemberUpdateTransport'
import type { RootState } from 'src/redux/Store'

export interface PollingState {
  isError: boolean
  currentResponse?: MemberUpdate | Record<string, never>
  previousResponse?: MemberUpdate | Record<string, never>
  pollingIsDone: boolean
  userMessage?: string
  initialDataReady?: boolean
}

export function usePollMember() {
  const { api } = useApi()
  const webSocket = useWebSocket()

  const clientLocale = useMemo(() => {
    return document.querySelector('html')?.getAttribute('lang') || 'en'
  }, [document.querySelector('html')?.getAttribute('lang')])

  const { optOutOfEarlyUserRelease, memberPollingMilliseconds, useWebSockets } =
    useSelector(getExperimentalFeatures)
  const mode = useSelector((state: RootState) => state.config?.mode)

  const pollingInterval = memberPollingMilliseconds || 3000

  const pollMember = (memberGuid: string) => {
    const loadMemberByGuid =
      api.loadMemberByGuid ||
      (() => Promise.reject(new Error('api.loadMemberByGuid is required for member polling')))

    const updateStream$ = createMemberUpdateTransport(
      {
        loadMemberByGuid,
        loadJob: api.loadJob,
      },
      memberGuid,
      {
        pollingInterval,
        clientLocale,
        useWebSockets,
      },
      webSocket,
    )

    return updateStream$.pipe(
      scan(
        (acc: PollingState, response) => {
          const isError = response instanceof Error

          const pollingState: PollingState = {
            // only track if the most recent poll was an error
            isError,
            // dont update previous response if this is an error
            previousResponse: isError ? acc.previousResponse : acc.currentResponse,
            // dont update current response if this is an error
            currentResponse: isError ? acc.currentResponse : response,
            // preserve the initialDataReadySent flag
            initialDataReady: acc.initialDataReady,
            pollingIsDone: false,
            userMessage: acc.userMessage,
          }

          if (
            !isError &&
            !acc.initialDataReady &&
            response?.job?.async_account_data_ready &&
            !optOutOfEarlyUserRelease
          ) {
            pollingState.initialDataReady = true
          }

          const [shouldStopPolling, messageKey] = handlePollingResponse(pollingState, mode)

          const finalState = {
            ...pollingState,
            // we should keep polling based on the member
            pollingIsDone: isError ? false : shouldStopPolling,
            userMessage: messageKey,
          }

          return finalState
        },
        { ...DEFAULT_POLLING_STATE } as PollingState,
      ),
      // Deduplicate consecutive identical polling states to prevent unnecessary re-renders.
      // This must live here — after the scan — so the scan always sees every update
      // and can correctly track previousResponse/currentResponse transitions. Placing
      // distinctUntilChanged earlier (in the transport) caused the scan to miss
      // identical consecutive polls, breaking isNotAggregatingAtAll detection in
      // handlePollingResponse and causing OAuth members to poll indefinitely.
      distinctUntilChanged((prev: PollingState, curr: PollingState) => {
        if (prev.isError !== curr.isError) return false
        if (prev.pollingIsDone !== curr.pollingIsDone) return false
        if (prev.userMessage !== curr.userMessage) return false
        if (prev.initialDataReady !== curr.initialDataReady) return false

        const prevMember = (prev.currentResponse as MemberUpdate)?.member
        const currMember = (curr.currentResponse as MemberUpdate)?.member
        const prevJob = (prev.currentResponse as MemberUpdate)?.job
        const currJob = (curr.currentResponse as MemberUpdate)?.job

        // Return true to *prevent* emitting the event
        // Return false to emit the event
        return (
          prevMember?.connection_status === currMember?.connection_status &&
          _isEqual(prevMember?.mfa, currMember?.mfa) &&
          prevMember?.is_being_aggregated === currMember?.is_being_aggregated &&
          prevMember?.most_recent_job_detail_code === currMember?.most_recent_job_detail_code &&
          prevMember?.error?.error_code === currMember?.error?.error_code &&
          prevJob?.guid === currJob?.guid &&
          prevJob?.async_account_data_ready === currJob?.async_account_data_ready
        )
      }),
    )
  }

  return pollMember
}
