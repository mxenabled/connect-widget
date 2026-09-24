import React from 'react'
import { Subject } from 'rxjs'
import { createTestReduxStore, render, waitFor } from 'src/utilities/testingLibrary'
import { Connecting } from 'src/views/connecting/Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'
import { WebSocketConnection, WebSocketProvider } from 'src/context/WebSocketContext'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'
import { JOB_TYPES } from 'src/const/consts'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import { EXTRA_ITERATIONS_ALLOWED } from 'src/utilities/runJobSchedule'

// fadeOut (Velocity) never resolves in jsdom; Connecting's error path dispatches inside its .then.
vi.mock('src/utilities/Animation', () => ({ fadeOut: vi.fn(() => Promise.resolve()) }))

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
  error?: { error_code: number } | null
}

type Job = { guid: string; job_type: number; async_account_data_ready?: boolean }

class HttpError extends Error {
  response: { status: number }

  constructor(status: number, message = 'Request failed') {
    super(message)
    this.name = 'HttpError'
    this.response = { status }
  }
}

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

const createStore = ({ member = staleOAuthMember, useWebSockets = false } = {}) =>
  createTestReduxStore({
    connect: {
      currentMemberGuid: MEMBER_GUID,
      members: [member],
      jobSchedule: { isInitialized: false, jobs: [] },
      location: [],
      selectedInstitution: {},
    },
    experimentalFeatures: {
      // With websockets on, frames drive the observation and polling is effectively off.
      memberPollingMilliseconds: useWebSockets ? 60_000 : 10,
      optOutOfEarlyUserRelease: false,
      unavailableInstitutions: [],
      useWebSockets,
    },
  })

const createFakeBackend = ({
  pollsUntilDone = 2,
  earlyDataRelease = false,
  member = staleOAuthMember,
} = {}) => {
  const backend = {
    member: { ...member } as Member,
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
        throw new HttpError(404)
      }

      return job
    }),

    runJob: vi.fn(async (jobType: number): Promise<Record<string, never>> => {
      if (backend.member.is_being_aggregated) {
        // Firefly returns a 409 when the member already has a running job.
        throw new HttpError(409)
      }

      backend.startJob(`JOB-${jobType}`, jobType)

      return {}
    }),
  }

  return backend
}

/**
 * Connecting throws `connectingError` during render so the host's error
 * boundary can take over. Tests need a boundary of their own to observe that.
 */
class TestErrorBoundary extends React.Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? <div data-testid="connecting-error" /> : this.props.children
  }
}

const renderConnecting = (
  backend: ReturnType<typeof createFakeBackend>,
  connectConfig: Record<string, unknown>,
  { webSocket, member }: { webSocket?: WebSocketConnection; member?: Member } = {},
) => {
  const onPostMessage = vi.fn()
  const onError = vi.fn()
  const api = {
    loadMemberByGuid: backend.loadMemberByGuid,
    loadJob: backend.loadJob,
    runJob: backend.runJob,
  } as unknown as ApiContextTypes
  const store = createStore({ member, useWebSockets: !!webSocket })

  const connecting = (
    <ApiProvider apiValue={api}>
      <PostMessageContext.Provider value={{ onPostMessage }}>
        <Connecting connectConfig={connectConfig} institution={{}} uiMessageVersion={4} />
      </PostMessageContext.Provider>
    </ApiProvider>
  )

  render(
    <TestErrorBoundary onError={onError}>
      {webSocket ? (
        <WebSocketProvider value={webSocket}>{connecting}</WebSocketProvider>
      ) : (
        connecting
      )}
    </TestErrorBoundary>,
    { store },
  )

  return { onPostMessage, onError, store }
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

/**
 * CT-2332: firefly sets the member CONNECTED on the OAuth redirect before any job exists,
 * and over websockets that frame can arrive after the widget has started its job.
 */
describe('<Connecting /> after OAuth over websockets', () => {
  const createWebSocket = () => {
    // Plain Subject: like brokaw, no replay for late subscribers.
    const messages$ = new Subject<{ event: string; payload: Member }>()
    const connection: WebSocketConnection = {
      isConnected: () => true,
      webSocketMessages$: messages$.asObservable(),
    }

    return { messages$, connection }
  }

  const memberUpdated = (payload: Member) => ({ event: 'members/updated', payload })

  const impededMember = (jobGuid: string): Member => ({
    ...staleOAuthMember,
    connection_status: ReadableStatuses.IMPEDED,
    most_recent_job_guid: jobGuid,
    error: { error_code: ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS },
  })

  // Lets runJob settle so the schedule has subscribed to the socket before frames are sent.
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

  const expectActionableErrorInsteadOfSuccess = async (
    store: ReturnType<typeof createStore>,
    onPostMessage: ReturnType<typeof vi.fn>,
  ) => {
    const lastStep = () => {
      const { location } = store.getState().connect
      return location[location.length - 1]?.step
    }

    // Wait for any step, then assert which: before the fix this routes to CONNECTED at once.
    await waitFor(() => expect(lastStep()).toBeDefined(), { timeout: 4000 })
    expect(lastStep()).toBe(STEPS.ACTIONABLE_ERROR)
    expect(onPostMessage).not.toHaveBeenCalledWith(
      POST_MESSAGES.MEMBER_CONNECTED,
      expect.anything(),
    )
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ignores a late CONNECTED update with no job and lands on the actionable error when the job we started is impeded', async () => {
    const backend = createFakeBackend()
    const { messages$, connection } = createWebSocket()

    const { onPostMessage, store } = renderConnecting(
      backend,
      { mode: VERIFY_MODE },
      { webSocket: connection },
    )

    await waitFor(() => expect(backend.runJob).toHaveBeenCalled())
    await settle()

    messages$.next(
      memberUpdated({ ...staleOAuthMember, connection_status: ReadableStatuses.CONNECTED }),
    )
    await settle()
    messages$.next(memberUpdated(impededMember(`JOB-${JOB_TYPES.VERIFICATION}`)))

    await expectActionableErrorInsteadOfSuccess(store, onPostMessage)
  })

  it('ignores a late CONNECTED update that still names a returning member’s previous job', async () => {
    const PREVIOUS_JOB_GUID = 'JOB-old'
    const returningMember: Member = {
      ...staleOAuthMember,
      connection_status: ReadableStatuses.CONNECTED,
      most_recent_job_guid: PREVIOUS_JOB_GUID,
    }
    const backend = createFakeBackend({ member: returningMember })
    // The previous job was also a verification, so attributing it by type would end the schedule.
    backend.jobs[PREVIOUS_JOB_GUID] = { guid: PREVIOUS_JOB_GUID, job_type: JOB_TYPES.VERIFICATION }
    const { messages$, connection } = createWebSocket()

    const { onPostMessage, store } = renderConnecting(
      backend,
      { mode: VERIFY_MODE },
      { webSocket: connection, member: returningMember },
    )

    await waitFor(() => expect(backend.runJob).toHaveBeenCalled())
    await settle()

    messages$.next(memberUpdated(returningMember))
    await settle()
    messages$.next(memberUpdated(impededMember(`JOB-${JOB_TYPES.VERIFICATION}`)))

    await expectActionableErrorInsteadOfSuccess(store, onPostMessage)
  })
})
