import { useMemo } from 'react'
import { DEFAULT_POLLING_STATE, handlePollingResponse } from 'src/utilities/pollers'
import { useApi } from 'src/context/ApiContext'
import { useWebSocket } from 'src/context/WebSocketContext'
import { useSelector } from 'react-redux'
import { getExperimentalFeatures } from 'src/redux/reducers/experimentalFeaturesSlice'

import { scan } from 'rxjs/operators'
import {
  createMemberUpdateTransport,
  MemberUpdate,
} from 'src/utilities/transport/MemberUpdateTransport'

export interface PollingState {
  isError: boolean
  pollingCount: number
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
            // always increase polling count
            pollingCount: acc.pollingCount + 1,
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

          const [shouldStopPolling, messageKey] = handlePollingResponse(pollingState)

          return {
            ...pollingState,
            // we should keep polling based on the member
            pollingIsDone: isError ? false : shouldStopPolling,
            userMessage: messageKey,
          }
        },
        { ...DEFAULT_POLLING_STATE } as PollingState,
      ),
    )
  }

  return pollMember
}
