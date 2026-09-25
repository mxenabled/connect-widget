import { waitFor } from 'src/utilities/testingLibrary'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'
import { JOB_TYPES } from 'src/const/consts'
import { STEPS, VERIFY_MODE } from 'src/const/Connect'
import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'
import {
  createFakeBackend,
  createFakeBrokaw,
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
 * runJobSchedule$ drives the Connecting step's job schedule. These tests run it through the
 * real <Connecting /> (real store, hook and transport); only the API and brokaw are faked.
 *
 * CT-2332: firefly sets an OAuth member CONNECTED on the redirect before any job exists.
 * Over websockets, a copy of that member update can reach the widget *after* it has started
 * its own job. It looks finished (CONNECTED, not aggregating) but names no job, or the job the
 * member had before. The widget must not mistake it for its job finishing.
 */

const OUR_JOB_GUID = `JOB-${JOB_TYPES.VERIFICATION}`

// The member as firefly leaves it on the OAuth redirect: CONNECTED, idle, no job yet.
const connectedWithNoJob: Member = {
  ...staleOAuthMember,
  connection_status: ReadableStatuses.CONNECTED,
}

const runningJob = (jobGuid: string): Member => ({
  ...connectedWithNoJob,
  is_being_aggregated: true,
  most_recent_job_guid: jobGuid,
})

const finishedJob = (jobGuid: string): Member => ({
  ...connectedWithNoJob,
  most_recent_job_guid: jobGuid,
})

const impededWithNoEligibleAccounts = (jobGuid: string): Member => ({
  ...staleOAuthMember,
  connection_status: ReadableStatuses.IMPEDED,
  most_recent_job_guid: jobGuid,
  error: { error_code: ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS },
})

const expectNoEligibleAccountsScreen = async (widget: ReturnType<typeof renderConnecting>) => {
  // Wait for Connecting to route anywhere, then check where. Before the fix it routed to
  // CONNECTED as soon as the stale update arrived.
  await waitFor(() => expect(widget.currentStep()).toBeDefined(), { timeout: 4000 })
  expect(widget.currentStep()).toBe(STEPS.ACTIONABLE_ERROR)
  expect(widget.onPostMessage).not.toHaveBeenCalledWith(
    POST_MESSAGES.MEMBER_CONNECTED,
    expect.anything(),
  )
}

describe('runJobSchedule$ through <Connecting /> over websockets', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ignores the late CONNECTED update with no job and shows the real outcome of the job it started', async () => {
    // Given a first-time OAuth member: no job has ever run on it.
    const backend = createFakeBackend()
    const brokaw = createFakeBrokaw()
    const widget = renderConnecting(
      backend,
      { mode: VERIFY_MODE },
      { webSocket: brokaw.connection },
    )

    // When the widget starts its verification job...
    await widget.runJobCalled()
    // ...and firefly's pre-job update arrives late, looking finished but naming no job...
    await brokaw.memberUpdated(connectedWithNoJob)
    // ...then the widget's job actually finishes with no eligible accounts.
    await brokaw.memberUpdated(impededWithNoEligibleAccounts(OUR_JOB_GUID))

    // Then the widget shows the error, never a success.
    await expectNoEligibleAccountsScreen(widget)
  })

  it('ignores the late CONNECTED update that still names a returning member’s previous job', async () => {
    // Given a returning member whose previous job was also a verification. Attributing that
    // old job by type would wrongly complete the schedule.
    const PREVIOUS_JOB_GUID = 'JOB-old'
    const returningMember = finishedJob(PREVIOUS_JOB_GUID)
    const backend = createFakeBackend({ member: returningMember })
    backend.jobs[PREVIOUS_JOB_GUID] = { guid: PREVIOUS_JOB_GUID, job_type: JOB_TYPES.VERIFICATION }
    const brokaw = createFakeBrokaw()
    const widget = renderConnecting(
      backend,
      { mode: VERIFY_MODE },
      { webSocket: brokaw.connection, member: returningMember },
    )

    // When the widget starts a new verification job...
    await widget.runJobCalled()
    // ...and firefly's pre-job update arrives late, still naming the previous job...
    await brokaw.memberUpdated(returningMember)
    // ...then the new job finishes with no eligible accounts.
    await brokaw.memberUpdated(impededWithNoEligibleAccounts(OUR_JOB_GUID))

    // Then the widget shows the error, never a success.
    await expectNoEligibleAccountsScreen(widget)
  })

  it('observes the job firefly assigned when its own runJob is rejected with a 409', async () => {
    // Given firefly already started the verification job on the redirect
    // (disable_background_agg clients), so the widget's own runJob is a duplicate.
    const backend = createFakeBackend()
    backend.runJob.mockImplementationOnce(async () => {
      backend.startJob(REDIRECT_JOB_GUID, JOB_TYPES.VERIFICATION)
      throw new HttpError(409)
    })
    const brokaw = createFakeBrokaw()
    const widget = renderConnecting(
      backend,
      { mode: VERIFY_MODE },
      { webSocket: brokaw.connection },
    )

    // When the widget's runJob is rejected...
    await widget.runJobCalled()
    // ...the late pre-job update is still ignored...
    await brokaw.memberUpdated(connectedWithNoJob)
    // ...and firefly's job is seen running, then finishing.
    await brokaw.memberUpdated(runningJob(REDIRECT_JOB_GUID))
    await brokaw.memberUpdated(finishedJob(REDIRECT_JOB_GUID))

    // Then the widget completes against firefly's job without starting another.
    await expectMemberConnected(widget.onPostMessage)
    expect(backend.runJob).toHaveBeenCalledTimes(1)
    expect(backend.loadJob).toHaveBeenCalledWith(REDIRECT_JOB_GUID)
  })
})
