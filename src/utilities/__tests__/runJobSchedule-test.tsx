import { Subject } from 'rxjs'
import { waitFor } from 'src/utilities/testingLibrary'
import { WebSocketConnection } from 'src/context/WebSocketContext'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'
import { JOB_TYPES } from 'src/const/consts'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import {
  connectedMemberRunning,
  createFakeBackend,
  createStore,
  expectMemberConnected,
  HttpError,
  Member,
  REDIRECT_JOB_GUID,
  renderConnecting,
  staleOAuthMember,
} from 'src/utilities/test/connectingOAuthHarness'

// fadeOut (Velocity) never resolves in jsdom; Connecting's error path dispatches inside its .then.
vi.mock('src/utilities/Animation', () => ({ fadeOut: vi.fn(() => Promise.resolve()) }))

/**
 * runJobSchedule$ drives the Connecting step's job schedule. These tests exercise it through the
 * real <Connecting /> (real store, hook and transport) with the network and brokaw faked.
 *
 * CT-2332: firefly sets the member CONNECTED on the OAuth redirect before any job exists, and
 * over websockets that frame can arrive after the widget has started its job.
 */
describe('runJobSchedule$ through <Connecting /> over websockets', () => {
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

  it('observes the job firefly assigned when its own runJob is rejected with a 409', async () => {
    const backend = createFakeBackend()
    const { messages$, connection } = createWebSocket()

    // disable_background_agg clients: firefly started the job on the redirect and rejects the
    // widget's duplicate. Firefly's job is the one that matters from here on.
    backend.runJob.mockImplementationOnce(async () => {
      backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)
      throw new HttpError(409)
    })

    const { onPostMessage } = renderConnecting(
      backend,
      { mode: VERIFY_MODE },
      { webSocket: connection },
    )

    await waitFor(() => expect(backend.runJob).toHaveBeenCalled())
    await settle()

    // The late pre-job update is still ignored on this path.
    messages$.next(
      memberUpdated({ ...staleOAuthMember, connection_status: ReadableStatuses.CONNECTED }),
    )
    await settle()
    messages$.next(memberUpdated(connectedMemberRunning(REDIRECT_JOB_GUID)))
    await settle()
    messages$.next(
      memberUpdated({ ...connectedMemberRunning(REDIRECT_JOB_GUID), is_being_aggregated: false }),
    )

    await expectMemberConnected(onPostMessage)
    expect(backend.runJob).toHaveBeenCalledTimes(1)
    expect(backend.loadJob).toHaveBeenCalledWith(REDIRECT_JOB_GUID)
  })
})
