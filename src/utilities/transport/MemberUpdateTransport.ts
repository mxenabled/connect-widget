import { Observable, defer, interval, of, merge } from 'rxjs'
import { catchError, map, mergeMap, exhaustMap, filter, scan } from 'rxjs/operators'
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

  if (useWebSockets && webSocket?.webSocketMessages$ && webSocket?.isConnected?.()) {
    const socket$ = webSocket.webSocketMessages$.pipe(
      filter(
        (msg) =>
          (msg.event === 'members/updated' || msg.event === 'members/priority_data_ready') &&
          msg.payload?.guid === memberGuid,
      ),
      scan((previousUpdate: MemberUpdate, msg) => {
        // The priority_data_ready event does not send full member data,
        // so we need to use the previous member data and adjust async_account_data_ready
        const isMembersUpdated = msg.event === 'members/updated'
        const member = isMembersUpdated ? msg.payload : previousUpdate?.member

        const job = {
          guid: member?.most_recent_job_guid,
          async_account_data_ready:
            // The priority_data_ready event fires once, keep the flag true once it is received
            previousUpdate.job?.async_account_data_ready ||
            msg.event === 'members/priority_data_ready',
        } as JobResponseType

        return { member, job }
      }, {} as MemberUpdate),
      // If we don't have member data yet, wait for the next members/updated event to populate it.
      filter((update) => !!update.member),

      // If the websocket errors out, we don't want to kill the polling stream.
      // We just want to stop receiving messages from the socket and let polling continue.
      catchError(() => of()),
    )
    transport$ = merge(polling$, socket$)
  }

  return transport$
}
