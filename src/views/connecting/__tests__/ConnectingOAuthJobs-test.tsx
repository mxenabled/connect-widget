import { waitFor } from 'src/utilities/testingLibrary'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'
import { JOB_TYPES } from 'src/const/consts'
import { VERIFY_MODE } from 'src/const/Connect'
import { EXTRA_ITERATIONS_ALLOWED } from 'src/utilities/runJobSchedule'
import {
  createFakeBackend,
  expectMemberConnected,
  HttpError,
  REDIRECT_JOB_GUID,
  renderConnecting,
  staleOAuthMember,
} from 'src/utilities/test/connectingOAuthHarness'

/**
 * CT-2495: after OAuth the widget lands on Connecting holding the member it
 * created before the user left for the institution. That copy is PENDING, is not
 * being aggregated and has no most_recent_job_guid, while firefly has already
 * created (and may still be running) a job on the redirect. These tests drive
 * the real redux store, job schedule and member polling through the situations
 * that used to leave the widget on this screen forever.
 */

describe('<Connecting /> after OAuth', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('refreshes the stale member and waits for the job firefly created on the redirect instead of starting its own', async () => {
    const backend = createFakeBackend()
    // By the time Connecting mounts, firefly has created a verification job.
    backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)

    const { onPostMessage } = renderConnecting(backend, {
      mode: VERIFY_MODE,
      include_identity: true,
    })

    await expectMemberConnected(onPostMessage)

    // Verification was already running, so only identification is started by the widget.
    expect(backend.runJob.mock.calls.map((call) => call[0])).toEqual([JOB_TYPES.IDENTIFICATION])
  })

  it('recovers from a 409 when its job conflicts with the job firefly created on the redirect', async () => {
    const backend = createFakeBackend()

    // The refresh still sees the pre-OAuth member, so the widget tries to start
    // verification itself. Firefly has created that job in the meantime and
    // rejects the duplicate.
    backend.runJob.mockImplementationOnce(async () => {
      backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)
      throw new HttpError(409)
    })

    const { onPostMessage } = renderConnecting(backend, {
      mode: VERIFY_MODE,
      include_identity: true,
    })

    await expectMemberConnected(onPostMessage)

    expect(backend.runJob.mock.calls.map((call) => call[0])).toEqual([
      JOB_TYPES.VERIFICATION,
      JOB_TYPES.IDENTIFICATION,
    ])
    // The stale member has no job guid. Before the fix this was requested as
    // GET /jobs/null, which 404s and killed the stream.
    expect(backend.loadJob).not.toHaveBeenCalledWith(null)
    expect(backend.loadJob).not.toHaveBeenCalledWith(undefined)
  })

  it('starts the scheduled job once a different job finishes', async () => {
    const backend = createFakeBackend()

    backend.runJob.mockImplementationOnce(async () => {
      backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.AGGREGATION)
      throw new HttpError(409)
    })

    const { onPostMessage } = renderConnecting(backend, { mode: VERIFY_MODE })

    await expectMemberConnected(onPostMessage)

    expect(backend.runJob.mock.calls.map((call) => call[0])).toEqual([
      // Shows verification twice because the first call failed with 409 and the 2nd call succeeded
      JOB_TYPES.VERIFICATION,
      JOB_TYPES.VERIFICATION,
    ])
    expect(backend.jobs[`JOB-${JOB_TYPES.VERIFICATION}`]).toBeDefined()
  })

  it('waits for a still-running job to finish before starting the next scheduled job', async () => {
    const backend = createFakeBackend({ pollsUntilDone: 4, earlyDataRelease: true })
    backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)

    const { onPostMessage } = renderConnecting(backend, {
      mode: VERIFY_MODE,
      include_identity: true,
    })

    await expectMemberConnected(onPostMessage)

    expect(backend.runJob.mock.calls.map((call) => call[0])).toEqual([JOB_TYPES.IDENTIFICATION])
    expect(backend.jobs[`JOB-${JOB_TYPES.IDENTIFICATION}`]).toBeDefined()
    expect(
      onPostMessage.mock.calls.filter((call) => call[0] === 'connect/initialDataReady'),
    ).toHaveLength(1)
  })

  it('runs every scheduled job after a foreign job that was already running', async () => {
    const backend = createFakeBackend()
    // Firefly kicked off a plain aggregation on the redirect; the widget wants
    // verification + identity. All three must run, in order, exactly once.
    backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.AGGREGATION)

    const { onPostMessage } = renderConnecting(backend, {
      mode: VERIFY_MODE,
      include_identity: true,
    })

    await expectMemberConnected(onPostMessage)

    expect(backend.runJob.mock.calls.map((call) => call[0])).toEqual([
      JOB_TYPES.VERIFICATION,
      JOB_TYPES.IDENTIFICATION,
    ])
  })

  it('still releases the user early when the running job satisfies the schedule', async () => {
    // Early data release is a product feature: once the job reports its data is
    // ready we hand off before aggregation finishes. Waiting to idle must only
    // happen when there is more scheduled work to do.
    const backend = createFakeBackend({ pollsUntilDone: 1000, earlyDataRelease: true })
    backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)

    const { onPostMessage } = renderConnecting(backend, { mode: VERIFY_MODE })

    await expectMemberConnected(onPostMessage)

    expect(backend.member.is_being_aggregated).toBe(true)
    expect(backend.runJob).not.toHaveBeenCalled()
  })

  it('gives up with an error instead of retrying forever when the backend keeps rejecting the job', async () => {
    const backend = createFakeBackend()
    // The member reports idle but every runJob is rejected as a conflict, so no
    // iteration can ever make progress.
    backend.jobs[REDIRECT_JOB_GUID] = { guid: REDIRECT_JOB_GUID, job_type: JOB_TYPES.AGGREGATION }
    backend.member = {
      ...staleOAuthMember,
      connection_status: ReadableStatuses.CONNECTED,
      is_being_aggregated: false,
      most_recent_job_guid: REDIRECT_JOB_GUID,
    }
    backend.runJob.mockImplementation(async () => {
      throw new HttpError(409)
    })

    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { onPostMessage, onError } = renderConnecting(backend, { mode: VERIFY_MODE })

    await waitFor(() => expect(onError).toHaveBeenCalled(), { timeout: 5000 })
    expect(onError.mock.calls[0][0].name).toBe('JobScheduleExhaustedError')

    // One attempt per scheduled job plus a small allowance for jobs we did not
    // start. With a 10ms poll interval the old code made hundreds of calls here.
    const scheduledJobs = 1
    expect(backend.runJob).toHaveBeenCalledTimes(scheduledJobs + EXTRA_ITERATIONS_ALLOWED)
    expect(onPostMessage).not.toHaveBeenCalledWith(
      POST_MESSAGES.MEMBER_CONNECTED,
      expect.anything(),
    )

    const callsAtError = backend.runJob.mock.calls.length
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(backend.runJob.mock.calls.length).toBe(callsAtError)
  })

  it('still finishes when the completed job cannot be loaded', async () => {
    const backend = createFakeBackend()
    backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)

    let idleJobLoads = 0
    backend.loadJob.mockImplementation(async (guid: string) => {
      if (!backend.member.is_being_aggregated) {
        idleJobLoads += 1
        if (idleJobLoads > 1) {
          throw new HttpError(500)
        }
      }

      return backend.jobs[guid]
    })

    const { onPostMessage } = renderConnecting(backend, { mode: VERIFY_MODE })

    await expectMemberConnected(onPostMessage)
  })
})
