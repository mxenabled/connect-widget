import { concat, defer, EMPTY, of, throwError } from 'rxjs'
import { catchError, filter, map, mergeMap, retry, take, tap } from 'rxjs/operators'

import * as JobSchedule from 'src/utilities/JobSchedule'
import { JOB_STATUSES } from 'src/const/consts'
import { ReadableStatuses } from 'src/const/Statuses'

/**
 * How many extra loop iterations we allow beyond one per scheduled job. Each
 * extra iteration is a job we did not start (Firefly's redirect job, a 409 race)
 * that we observed and reconciled against the schedule.
 */
export const EXTRA_ITERATIONS_ALLOWED = 3

export class JobScheduleExhaustedError extends Error {
  constructor(iterations, schedule) {
    const remaining = schedule.jobs
      .filter((job) => job.status !== JOB_STATUSES.DONE)
      .map((job) => job.type)
      .join(', ')

    super(`Gave up running the job schedule after ${iterations} attempts; remaining: ${remaining}`)
    this.name = 'JobScheduleExhaustedError'
    this.schedule = schedule
  }
}

const isSafeConflictError = (error) => error?.response?.status === 409

const isConnectedWithoutError = (member) =>
  member?.connection_status === ReadableStatuses.CONNECTED && !member?.error?.error_code

const NOT_STARTED_BY_US = { type: null, previousJobGuid: null }

// Firefly sets an OAuth member CONNECTED on the redirect before any job exists, and over
// websockets that update can arrive after we started ours (CT-2332). It names the job the
// member had before runJob: null for a first job, the previous job for a returning member.
// `undefined` passes because hosts are not required to send the field.
const isPreJobUpdate = (member, started) => {
  const guid = member?.most_recent_job_guid

  return guid === null || guid === started.previousJobGuid
}

/**
 * Work out which job just finished, in order of trust:
 *  - the job we loaded fresh off the polled member
 *  - the job the poller itself loaded (may lack job_type over websockets)
 *  - if we started the job ourselves and could not load it, assume it was ours
 */
const resolveFinishedJob = (loadedJob, polledJob, startedType) => {
  if (loadedJob?.job_type !== undefined) return loadedJob
  if (polledJob?.job_type !== undefined) return polledJob
  if (startedType !== null && startedType !== undefined) {
    return { ...(loadedJob || polledJob || {}), job_type: startedType }
  }

  return loadedJob ?? polledJob ?? null
}

/**
 * Drive a job schedule to completion against the backend, treating the backend
 * as the source of truth for what is actually running.
 *
 * The widget is not the only thing that starts jobs on a member: Firefly starts
 * one on the OAuth redirect, and a race can produce a 409 from `runJob`. Rather
 * than special-casing "foreign" jobs, every loop iteration does the same thing:
 *
 *   1. If the member is being aggregated (by anyone), poll until that job is
 *      observable, then mark its type DONE in the schedule if it matches.
 *   2. Otherwise start the schedule's active job. A 409 just means someone beat
 *      us to it; go back to 1 and observe.
 *   3. Stop when every job is DONE, when the member leaves the CONNECTED state
 *      (MFA / error – the caller routes on it), or when we hit the iteration cap.
 *
 * Emits `{ member, job }` once per observed job completion so the caller can
 * dispatch `jobComplete` and keep the progress UI in sync. Errors with
 * `JobScheduleExhaustedError` if the cap is hit, or with whatever `runJob`
 * rejected with for non-409 failures.
 *
 * @param {Object}   deps
 * @param {Object}   deps.api          needs runJob and loadJob
 * @param {Function} deps.pollMember   from usePollMember()
 * @param {Object}   deps.member       the member to run jobs against (fresh)
 * @param {Object}   deps.schedule     an initialized JobSchedule
 * @param {Object}   deps.config       connect config passed through to runJob
 * @param {Function} [deps.onPoll]     called with every polling state (UI messaging, timeout)
 * @return {Observable<{ member: Object, job: Object|null }>}
 */
export const runJobSchedule$ = ({
  api,
  pollMember,
  member,
  schedule,
  config,
  onPoll = () => {},
}) => {
  const maxIterations = schedule.jobs.length + EXTRA_ITERATIONS_ALLOWED

  const loadJob = (memberToLoad) => {
    if (!memberToLoad?.most_recent_job_guid) return of(null)

    return defer(() => api.loadJob(memberToLoad.most_recent_job_guid)).pipe(
      // Sometimes this is too fast in sand and it 404s. Long standing backend problem.
      retry(1),
      catchError(() => of(null)),
    )
  }

  /**
   * Poll until the member polling logic says the UI may move on, then decide
   * whether the *schedule* may move on. Early data release stops polling while
   * the job is still running; that is only acceptable when there is nothing
   * else scheduled after it, otherwise we keep polling until the member is idle
   * so the next job can be started.
   */
  const observeRunningJob = (memberGuid, currentSchedule, started) =>
    pollMember(memberGuid).pipe(
      // onPoll runs before the gate on purpose: it is where the Connecting timeout lives.
      tap(onPoll),
      // Error and MFA states route on the member alone; only CONNECTED needs a real finished job.
      filter((pollingState) => {
        const polledMember = pollingState.currentResponse?.member

        return (
          pollingState.pollingIsDone &&
          !(isConnectedWithoutError(polledMember) && isPreJobUpdate(polledMember, started))
        )
      }),
      take(1),
      map((pollingState) => pollingState.currentResponse),
      mergeMap((polledResponse) =>
        loadJob(polledResponse.member).pipe(
          map((job) => ({
            member: polledResponse.member,
            job: resolveFinishedJob(job, polledResponse.job, started.type),
          })),
        ),
      ),
      mergeMap(({ member: polledMember, job }) => {
        const hasMoreWork = !JobSchedule.areAllJobsDone(
          JobSchedule.onJobFinished(currentSchedule, job),
        )
        const stillRunning =
          isConnectedWithoutError(polledMember) && polledMember.is_being_aggregated === true

        if (!hasMoreWork || !stillRunning) return of({ member: polledMember, job })

        return pollMember(memberGuid).pipe(
          tap(onPoll),
          map((pollingState) => pollingState.currentResponse?.member),
          filter((m) => m?.is_being_aggregated === false),
          take(1),
          map((idleMember) => ({ member: idleMember, job })),
        )
      }),
    )

  const observeThenContinue = (memberGuid, currentSchedule, iteration, started) =>
    observeRunningJob(memberGuid, currentSchedule, started).pipe(
      mergeMap(({ member: observedMember, job }) => {
        const emitted = of({ member: observedMember, job })

        if (!isConnectedWithoutError(observedMember)) return emitted

        const nextSchedule = JobSchedule.onJobFinished(currentSchedule, job)

        return concat(emitted, iterate(observedMember, nextSchedule, iteration + 1))
      }),
    )

  const iterate = (currentMember, currentSchedule, iteration) =>
    defer(() => {
      if (JobSchedule.areAllJobsDone(currentSchedule)) return EMPTY

      if (iteration > maxIterations) {
        return throwError(() => new JobScheduleExhaustedError(iteration - 1, currentSchedule))
      }

      if (currentMember.is_being_aggregated !== false) {
        return observeThenContinue(
          currentMember.guid,
          currentSchedule,
          iteration,
          NOT_STARTED_BY_US,
        )
      }

      const activeJob = JobSchedule.getActiveJob(currentSchedule)

      return defer(() => api.runJob(activeJob.type, currentMember.guid, config, true)).pipe(
        map(() => ({
          type: activeJob.type,
          previousJobGuid: currentMember.most_recent_job_guid ?? null,
        })),
        catchError((error) => {
          // 409 is usually the job Firefly created on the OAuth redirect.
          // It gets observed and reconciled like any other running job.
          if (isSafeConflictError(error)) return of(NOT_STARTED_BY_US)

          return throwError(() => error)
        }),
        mergeMap((started) =>
          observeThenContinue(currentMember.guid, currentSchedule, iteration, started),
        ),
      )
    })

  return iterate(member, schedule, 1)
}
