import { Observable, defer, interval, of, merge } from 'rxjs'
import { catchError, map, mergeMap, exhaustMap, filter, distinctUntilChanged } from 'rxjs/operators'
import _isEqual from 'lodash/isEqual'
import type { ApiContextTypes } from 'src/context/ApiContext'
import { WebSocketConnection } from 'src/context/WebSocketContext'

type MemberUpdateApi = Required<Pick<ApiContextTypes, 'loadMemberByGuid' | 'loadJob'>>

export interface MemberUpdate {
  member?: MemberResponseType
  job?: JobResponseType
}

export interface MemberUpdateTransportOptions {
  pollingInterval?: number
  clientLocale?: string
  useWebSockets?: boolean
}

export function createMemberUpdateTransport(
  api: MemberUpdateApi,
  memberGuid: string,
  options: MemberUpdateTransportOptions = {},
  webSocket?: WebSocketConnection,
): Observable<MemberUpdate | Error> {
  const pollingInterval = options.pollingInterval || 3000
  const clientLocale = options.clientLocale || 'en'
  const useWebSockets = options.useWebSockets || false

  const polling$ = interval(pollingInterval).pipe(
    exhaustMap(() =>
      defer(() => api.loadMemberByGuid(memberGuid, clientLocale)).pipe(
        mergeMap((member: MemberResponseType) =>
          defer(() =>
            api.loadJob((member as { most_recent_job_guid: string }).most_recent_job_guid),
          ).pipe(map((job: JobResponseType) => ({ member, job }))),
        ),
        catchError((error) => of(error)),
      ),
    ),
  )

  let transport$: Observable<MemberUpdate | Error> = polling$

  if (useWebSockets && webSocket?.webSocketMessages$) {
    const socket$ = webSocket.webSocketMessages$.pipe(
      filter(
        (msg) =>
          (msg.topic === 'members/updated' || msg.topic === 'members/priority_data_ready') &&
          msg.data?.guid === memberGuid,
      ),
      map((msg) => ({
        member: msg.data,
        job:
          msg.topic === 'members/priority_data_ready'
            ? ({ async_account_data_ready: true } as JobResponseType)
            : undefined,
      })),
    )
    transport$ = merge(polling$, socket$)
  }

  return transport$.pipe(
    distinctUntilChanged((prev, curr) => {
      // Don't deduplicate errors
      if (prev instanceof Error || curr instanceof Error) return false

      const prevMember = prev.member
      const currMember = curr.member

      // Compare status, MFA, and async data ready flag to determine if we should emit
      return (
        prevMember?.connection_status === currMember?.connection_status &&
        _isEqual(prevMember?.mfa, currMember?.mfa) &&
        prev.job?.async_account_data_ready === curr.job?.async_account_data_ready
      )
    }),
  )
}
