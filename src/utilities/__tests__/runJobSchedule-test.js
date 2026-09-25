import { Subject } from 'rxjs'

import { runJobSchedule$ } from 'src/utilities/runJobSchedule'
import { JOB_STATUSES, JOB_TYPES } from 'src/const/consts'
import { ReadableStatuses } from 'src/const/Statuses'

// CT-2332 pre-job update rules, driven through runJobSchedule$'s injected api and pollMember.

const MEMBER_GUID = 'MBR-1'
const OUR_JOB_GUID = 'JOB-1'

const verificationSchedule = () => ({
  isInitialized: true,
  jobs: [{ type: JOB_TYPES.VERIFICATION, status: JOB_STATUSES.ACTIVE }],
})

const member = (connectionStatus, extra = {}) => ({
  guid: MEMBER_GUID,
  connection_status: connectionStatus,
  is_being_aggregated: false,
  ...extra,
})

// Over websockets the polled job carries only the guid, never a job_type.
const doneState = (polledMember) => ({
  pollingIsDone: true,
  currentResponse: {
    member: polledMember,
    job: { guid: polledMember.most_recent_job_guid ?? null, async_account_data_ready: false },
  },
})

const verificationJob = (guid) => ({ guid, job_type: JOB_TYPES.VERIFICATION })

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const run = ({ api, member: startingMember }) => {
  const pollingStates$ = new Subject()
  const emissions = []

  const subscription = runJobSchedule$({
    api,
    pollMember: () => pollingStates$,
    member: startingMember,
    schedule: verificationSchedule(),
    config: {},
  }).subscribe({ next: (emission) => emissions.push(emission) })

  return { pollingStates$, emissions, subscription }
}

describe('runJobSchedule$ pre-job updates', () => {
  it('does not treat a CONNECTED member with most_recent_job_guid null as the finished job', async () => {
    const api = {
      runJob: vi.fn().mockResolvedValue({}),
      loadJob: vi.fn(async (guid) => verificationJob(guid)),
    }
    const { pollingStates$, emissions, subscription } = run({
      api,
      member: member(ReadableStatuses.PENDING, { most_recent_job_guid: null }),
    })
    await flush()

    // Firefly's pre-job CONNECTED update, delivered late.
    pollingStates$.next(
      doneState(member(ReadableStatuses.CONNECTED, { most_recent_job_guid: null })),
    )
    await flush()

    expect(emissions).toHaveLength(0)
    expect(api.loadJob).not.toHaveBeenCalled()

    const impeded = member(ReadableStatuses.IMPEDED, { most_recent_job_guid: OUR_JOB_GUID })
    pollingStates$.next(doneState(impeded))
    await flush()

    expect(emissions).toHaveLength(1)
    expect(emissions[0]).toMatchObject({ member: impeded, job: verificationJob(OUR_JOB_GUID) })

    subscription.unsubscribe()
  })

  it('does not treat an idle CONNECTED member still naming its previous job as the finished job', async () => {
    const returningMember = member(ReadableStatuses.CONNECTED, {
      most_recent_job_guid: 'JOB-old',
    })
    const api = {
      runJob: vi.fn().mockResolvedValue({}),
      loadJob: vi.fn(async (guid) => verificationJob(guid)),
    }
    const { pollingStates$, emissions, subscription } = run({ api, member: returningMember })
    await flush()

    // The same late update for a returning member names the old job.
    pollingStates$.next(doneState(returningMember))
    await flush()

    expect(emissions).toHaveLength(0)
    expect(api.loadJob).not.toHaveBeenCalled()

    const impeded = member(ReadableStatuses.IMPEDED, { most_recent_job_guid: OUR_JOB_GUID })
    pollingStates$.next(doneState(impeded))
    await flush()

    expect(emissions).toHaveLength(1)
    expect(emissions[0]).toMatchObject({ member: impeded, job: verificationJob(OUR_JOB_GUID) })

    subscription.unsubscribe()
  })

  it('observes the job firefly assigned when runJob is rejected with a 409, instead of treating it as the previous job', async () => {
    // Firefly started this job on the OAuth redirect. It is the job that matters: the
    // widget's own runJob is a duplicate and firefly rejects it with a 409.
    const FIREFLY_JOB_GUID = 'JOB-firefly'
    const memberWithFireflyJob = member(ReadableStatuses.CONNECTED, {
      most_recent_job_guid: FIREFLY_JOB_GUID,
    })
    const conflict = Object.assign(new Error('conflict'), { response: { status: 409 } })
    const api = {
      runJob: vi.fn().mockRejectedValue(conflict),
      loadJob: vi.fn(async (guid) => verificationJob(guid)),
    }
    const { pollingStates$, emissions, subscription } = run({ api, member: memberWithFireflyJob })
    await flush()

    expect(api.runJob).toHaveBeenCalledTimes(1)

    // The member still names firefly's job when it finishes. Had the 409 path recorded that
    // guid as "the previous job", this update would be ignored and Connecting would hang.
    pollingStates$.next(doneState(memberWithFireflyJob))
    await flush()

    expect(api.loadJob).toHaveBeenCalledWith(FIREFLY_JOB_GUID)
    expect(emissions).toHaveLength(1)
    expect(emissions[0].job).toEqual(verificationJob(FIREFLY_JOB_GUID))

    subscription.unsubscribe()
  })
})
