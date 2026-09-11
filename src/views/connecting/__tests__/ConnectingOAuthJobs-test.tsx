import React from 'react'
import { createTestReduxStore, render, waitFor } from 'src/utilities/testingLibrary'
import { Connecting, MAX_FOREIGN_JOB_RETRIES } from '../Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'
import { JOB_TYPES } from 'src/const/consts'
import { VERIFY_MODE } from 'src/const/Connect'

/**
 * CT-2495: after OAuth the widget lands on Connecting holding the member it
 * created before the user left for the institution. That copy is PENDING, is not
 * being aggregated and has no most_recent_job_guid, while firefly has already
 * created (and may still be running) a job on the redirect. These tests drive
 * the real redux store, job schedule and member polling through the situations
 * that used to leave the widget on this screen forever.
 */

const MEMBER_GUID = 'MBR-oauth'
const USER_GUID = 'USR-1'
const REDIRECT_JOB_GUID = 'JOB-redirect'

type Member = {
  guid: string
  user_guid: string
  connection_status: number
  is_being_aggregated: boolean
  most_recent_job_guid: string | null
  is_oauth: boolean
}

type Job = { guid: string; job_type: number; async_account_data_ready?: boolean }

const createHttpError = (status: number, message = 'Request failed') =>
  Object.assign(new Error(message), { response: { status } })

const staleOAuthMember: Member = {
  guid: MEMBER_GUID,
  user_guid: USER_GUID,
  connection_status: ReadableStatuses.PENDING,
  is_being_aggregated: false,
  most_recent_job_guid: null,
  is_oauth: true,
}

const connectedMemberRunning = (jobGuid: string): Member => ({
  ...staleOAuthMember,
  connection_status: ReadableStatuses.CONNECTED,
  is_being_aggregated: true,
  most_recent_job_guid: jobGuid,
})

const createStore = () =>
  createTestReduxStore({
    connect: {
      currentMemberGuid: MEMBER_GUID,
      members: [staleOAuthMember],
      jobSchedule: { isInitialized: false, jobs: [] },
      location: [],
      selectedInstitution: {},
    },
    experimentalFeatures: {
      memberPollingMilliseconds: 10,
      optOutOfEarlyUserRelease: false,
      unavailableInstitutions: [],
      useWebSockets: false,
    },
  })

const createFakeBackend = ({ pollsUntilDone = 2, earlyDataRelease = false } = {}) => {
  const backend = {
    member: { ...staleOAuthMember } as Member,
    jobs: {} as Record<string, Job>,
    pollsWhileRunning: 0,

    startJob(guid: string, jobType: number) {
      // With early data release the job reports its data as ready while it is
      // still running, which makes member polling stop before the job finishes.
      backend.jobs[guid] = { guid, job_type: jobType, async_account_data_ready: earlyDataRelease }
      backend.member = connectedMemberRunning(guid)
    },

    loadMemberByGuid: vi.fn(async (): Promise<Member> => {
      if (backend.member.is_being_aggregated) {
        backend.pollsWhileRunning += 1

        if (backend.pollsWhileRunning >= pollsUntilDone) {
          backend.pollsWhileRunning = 0
          backend.member = { ...backend.member, is_being_aggregated: false }
        }
      }

      return backend.member
    }),

    loadJob: vi.fn(async (guid: string): Promise<Job> => {
      const job = backend.jobs[guid]

      if (!job) {
        throw createHttpError(404)
      }

      return job
    }),

    runJob: vi.fn(async (jobType: number): Promise<Record<string, never>> => {
      if (backend.member.is_being_aggregated) {
        // Firefly returns a 409 when the member already has a running job.
        throw createHttpError(409)
      }

      backend.startJob(`JOB-${jobType}`, jobType)

      return {}
    }),
  }

  return backend
}

const renderConnecting = (
  backend: ReturnType<typeof createFakeBackend>,
  connectConfig: Record<string, unknown>,
) => {
  const onPostMessage = vi.fn()
  const api = {
    loadMemberByGuid: backend.loadMemberByGuid,
    loadJob: backend.loadJob,
    runJob: backend.runJob,
  } as unknown as ApiContextTypes

  render(
    <ApiProvider apiValue={api}>
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <Connecting connectConfig={connectConfig} institution={{}} uiMessageVersion={4} />
      </PostMessageContext.Provider>
    </ApiProvider>,
    { store: createStore() },
  )

  return { onPostMessage }
}

const expectMemberConnected = (onPostMessage: ReturnType<typeof vi.fn>) =>
  waitFor(
    () =>
      expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MEMBER_CONNECTED, {
        user_guid: USER_GUID,
        member_guid: MEMBER_GUID,
      }),
    { timeout: 5000 },
  )

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
      throw createHttpError(409)
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
      throw createHttpError(409)
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

  it('stops waiting after repeated foreign jobs and moves on', async () => {
    const backend = createFakeBackend()
    backend.jobs[REDIRECT_JOB_GUID] = { guid: REDIRECT_JOB_GUID, job_type: JOB_TYPES.AGGREGATION }
    backend.member = { ...connectedMemberRunning(REDIRECT_JOB_GUID), is_being_aggregated: false }
    backend.runJob.mockImplementation(async () => {
      throw createHttpError(409)
    })

    const { onPostMessage } = renderConnecting(backend, { mode: VERIFY_MODE })

    await expectMemberConnected(onPostMessage)

    expect(backend.runJob).toHaveBeenCalledTimes(1 + MAX_FOREIGN_JOB_RETRIES)
  })

  it('still finishes when the completed job cannot be loaded', async () => {
    const backend = createFakeBackend()
    backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)

    let idleJobLoads = 0
    backend.loadJob.mockImplementation(async (guid: string) => {
      if (!backend.member.is_being_aggregated) {
        idleJobLoads += 1
        if (idleJobLoads > 1) {
          throw createHttpError(500)
        }
      }

      return backend.jobs[guid]
    })

    const { onPostMessage } = renderConnecting(backend, { mode: VERIFY_MODE })

    await expectMemberConnected(onPostMessage)
  })
})
