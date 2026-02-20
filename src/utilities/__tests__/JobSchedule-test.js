import * as JobSchedule from 'src/utilities/JobSchedule'
import { JOB_TYPES, JOB_STATUSES } from 'src/const/consts'
import { VERIFY_MODE, AGG_MODE } from 'src/const/Connect'

describe('JobSchedule.initialize', () => {
  const nonAggregatingMember = { guid: 'MBR-1', is_being_aggregated: false }
  const aggingMember = { guid: 'MBR-1', is_being_aggregated: true }
  const aggJob = { guid: 'JOB-1', job_type: JOB_TYPES.AGGREGATION }
  const aggMode = { mode: AGG_MODE }
  const includeIdentity = { include_identity: true }
  const verfiyMode = { mode: VERIFY_MODE }

  test('when the member is aggregating with same job as mode', () => {
    const schedule = JobSchedule.initialize(aggingMember, aggJob, aggMode)

    expect(schedule.isInitialized).toBe(true)
    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.AGGREGATION,
        status: JOB_STATUSES.ACTIVE,
      },
    ])
  })

  test('when the member is aggregating with a different job than the mode', () => {
    const schedule = JobSchedule.initialize(aggingMember, aggJob, verfiyMode)

    expect(schedule.isInitialized).toBe(true)
    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.AGGREGATION,
        status: JOB_STATUSES.ACTIVE,
      },
      {
        type: JOB_TYPES.VERIFICATION,
        status: JOB_STATUSES.PENDING,
      },
    ])
  })

  test('when the member is not aggregating, should use mode', () => {
    const schedule = JobSchedule.initialize(nonAggregatingMember, aggJob, verfiyMode)

    expect(schedule.isInitialized).toBe(true)
    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.VERIFICATION,
        status: JOB_STATUSES.ACTIVE,
      },
    ])
  })

  test('when the member has no previously ran jobs', () => {
    const schedule = JobSchedule.initialize(nonAggregatingMember, null, verfiyMode)

    expect(schedule.isInitialized).toBe(true)
    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.VERIFICATION,
        status: JOB_STATUSES.ACTIVE,
      },
    ])
  })

  test('include identity with agg mode', () => {
    const schedule = JobSchedule.initialize(nonAggregatingMember, null, {
      ...aggMode,
      ...includeIdentity,
    })

    expect(schedule.isInitialized).toBe(true)
    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.AGGREGATION,
        status: JOB_STATUSES.ACTIVE,
      },
      {
        type: JOB_TYPES.IDENTIFICATION,
        status: JOB_STATUSES.PENDING,
      },
    ])
  })

  test('include identity with verfiy mode', () => {
    const schedule = JobSchedule.initialize(nonAggregatingMember, null, {
      ...verfiyMode,
      ...includeIdentity,
    })

    expect(schedule.isInitialized).toBe(true)
    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.VERIFICATION,
        status: JOB_STATUSES.ACTIVE,
      },
      {
        type: JOB_TYPES.IDENTIFICATION,
        status: JOB_STATUSES.PENDING,
      },
    ])
  })

  describe('combo jobs inferred logic', () => {
    const member = { is_being_aggregated: false }
    const recentJob = null
    const isComboJobFeatureFlagOn = false // This covers the feature flag behavior, when true it means combo jobs are expected
    const baseConfig = {
      data_request: {
        products: ['foo'],
      },
      mode: undefined,
      include_identity: false,
    }

    test('schedules COMBINATION job when inferred is false, and single product', () => {
      const config = {
        ...baseConfig,
        data_request: { ...baseConfig.data_request, inferred: false },
      }
      const schedule = JobSchedule.initialize(member, recentJob, config, isComboJobFeatureFlagOn)
      expect(schedule.jobs[0].type).toBe(JOB_TYPES.COMBINATION)
    })

    test('schedules COMBINATION job when inferred is false and multiple products', () => {
      const config = { ...baseConfig, data_request: { products: ['foo', 'bar'], inferred: false } }
      const schedule = JobSchedule.initialize(member, recentJob, config, isComboJobFeatureFlagOn)
      expect(schedule.jobs[0].type).toBe(JOB_TYPES.COMBINATION)
    })

    test('does not schedule COMBINATION job when inferred is true, single product', () => {
      const config = { ...baseConfig, data_request: { ...baseConfig.data_request, inferred: true } }
      const schedule = JobSchedule.initialize(member, recentJob, config, isComboJobFeatureFlagOn)
      expect(schedule.jobs[0].type).not.toBe(JOB_TYPES.COMBINATION)
    })

    test('does not schedule COMBINATION job when inferred is true, multiple products', () => {
      const config = { ...baseConfig, data_request: { products: ['foo', 'bar'], inferred: true } }
      const schedule = JobSchedule.initialize(member, recentJob, config, isComboJobFeatureFlagOn)
      expect(schedule.jobs[0].type).not.toBe(JOB_TYPES.COMBINATION)
    })

    test('does not schedule COMBINATION job when inferred is undefined and feature flag is off', () => {
      const config = { ...baseConfig, data_request: { products: ['foo', 'bar'] } }
      const schedule = JobSchedule.initialize(member, recentJob, config, isComboJobFeatureFlagOn)
      expect(schedule.jobs[0].type).not.toBe(JOB_TYPES.COMBINATION)
    })

    test('does schedule COMBINATION job when inferred is undefined and feature flag is on', () => {
      const config = { ...baseConfig, data_request: { products: ['foo', 'bar'] } }
      const schedule = JobSchedule.initialize(member, recentJob, config, true)
      expect(schedule.jobs[0].type).toBe(JOB_TYPES.COMBINATION)
    })

    test('does schedule COMBINATION job when inferred is true and feature flag is on', () => {
      const config = { ...baseConfig, data_request: { products: ['foo', 'bar'], inferred: true } }
      const schedule = JobSchedule.initialize(member, recentJob, config, true)
      expect(schedule.jobs[0].type).toBe(JOB_TYPES.COMBINATION)
    })
  })
})

describe('JobSchedule.onJobFinished', () => {
  const aggJob = { guid: 'JOB-1', job_type: JOB_TYPES.AGGREGATION }

  test('when the finished job is the only job', () => {
    const prevSchedule = {
      isInitialized: true,
      jobs: [
        {
          type: JOB_TYPES.AGGREGATION,
          status: JOB_STATUSES.ACTIVE,
        },
      ],
    }

    const schedule = JobSchedule.onJobFinished(prevSchedule, aggJob)

    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.AGGREGATION,
        status: JOB_STATUSES.DONE,
      },
    ])
  })

  test('when there are still jobs to run', () => {
    const prevSchedule = {
      isInitialized: true,
      jobs: [
        {
          type: JOB_TYPES.AGGREGATION,
          status: JOB_STATUSES.ACTIVE,
        },
        {
          type: JOB_TYPES.VERIFICATION,
          status: JOB_STATUSES.PENDING,
        },
        {
          type: JOB_TYPES.IDENTIFICATION,
          status: JOB_STATUSES.PENDING,
        },
      ],
    }

    const schedule = JobSchedule.onJobFinished(prevSchedule, aggJob)

    expect(schedule.jobs).toEqual([
      {
        type: JOB_TYPES.AGGREGATION,
        status: JOB_STATUSES.DONE,
      },
      {
        type: JOB_TYPES.VERIFICATION,
        status: JOB_STATUSES.ACTIVE,
      },
      {
        type: JOB_TYPES.IDENTIFICATION,
        status: JOB_STATUSES.PENDING,
      },
    ])
  })
})
