import { Observable, defer, interval, of } from 'rxjs'
import { catchError, map, mergeMap, exhaustMap } from 'rxjs/operators'
import type { ApiContextTypes } from 'src/context/ApiContext'

type MemberUpdateApi = Required<Pick<ApiContextTypes, 'loadMemberByGuid' | 'loadJob'>>

export interface MemberUpdate {
  member?: MemberResponseType
  job?: JobResponseType
}

export interface MemberUpdateTransportOptions {
  pollingInterval?: number
  clientLocale?: string
}

export function createMemberUpdateTransport(
  api: MemberUpdateApi,
  memberGuid: string,
  options: MemberUpdateTransportOptions = {},
): Observable<MemberUpdate | Error> {
  const pollingInterval = options.pollingInterval || 3000
  const clientLocale = options.clientLocale || 'en'

  return interval(pollingInterval).pipe(
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
}
