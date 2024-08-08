import _find from 'lodash/find'
import _every from 'lodash/every'

import { JOB_TYPES, JOB_STATUSES } from 'src/connect/consts'
import { VERIFY_MODE, AGG_MODE, REWARD_MODE, TAX_MODE } from 'src/connect/const/Connect'

const shouldUseComboJobs = (config, isComboJobsEnabled) => {
  if (!Array.isArray(config?.data_request?.products)) {
    return false
  }

  /**
   * If the posthog feature flag is configured as on, we've decided to always create combojobs.
   * Yes, even if it's just a single product.
   */
  const customerIsConfiguredToUseCombojobs =
    isComboJobsEnabled && config.data_request.products.length > 0

  /**
   * We know the customer is using products for their URL request if this returns true.
   * The only way to have multiple products using the mode/boolean strategy is to pass in
   * at least one of the existing booleans along with a mode:
   * - include_identity: true
   * - include_transactions: true
   */
  const customerOptedThemselvesIntoCombojobs =
    config.data_request.products.length > 1 &&
    !config.include_identity &&
    !config.include_transactions

  return customerIsConfiguredToUseCombojobs || customerOptedThemselvesIntoCombojobs
}

const getFirstWidgetJobType = (config, isComboJobsEnabled) => {
  if (shouldUseComboJobs(config, isComboJobsEnabled)) return JOB_TYPES.COMBINATION
  if (config.mode === VERIFY_MODE) return JOB_TYPES.VERIFICATION
  if (config.mode === AGG_MODE) return JOB_TYPES.AGGREGATION
  if (config.mode === REWARD_MODE) return JOB_TYPES.REWARD
  if (config.mode === TAX_MODE) return JOB_TYPES.TAX

  return JOB_TYPES.AGGREGATION
}

export const UNINITIALIZED = {
  isInitialized: false,
  jobs: [],
}

export const initialize = (member, recentJob, config, isComboJobsEnabled) => {
  const jobs = []
  const firstWidgetJobType = getFirstWidgetJobType(config, isComboJobsEnabled)

  /**
   * If the member is aggregating for a job other than what is configured, we
   * need to add it to the list of jobs as the active job
   */
  if (member.is_being_aggregated && recentJob.job_type !== firstWidgetJobType) {
    // Add the already running job and set ours to PENDING
    jobs.push({ type: recentJob.job_type, status: JOB_STATUSES.ACTIVE })
    jobs.push({ type: firstWidgetJobType, status: JOB_STATUSES.PENDING })
  } else {
    jobs.push({ type: firstWidgetJobType, status: JOB_STATUSES.ACTIVE })
  }

  // COMBINATION jobs are done in a single request so we don't add anything extra
  if (firstWidgetJobType !== JOB_TYPES.COMBINATION) {
    if (config.include_identity === true) {
      jobs.push({
        type: JOB_TYPES.IDENTIFICATION,
        status: JOB_STATUSES.PENDING,
      })
    }
  }

  return { isInitialized: true, jobs }
}

/**
 * Update the schedule with the finished job.
 * - Mark the finished job as DONE
 * - Find and update the next PENDING JOB
 *
 * @param  {Object} schedule   the jobSchedule object
 * @param  {Object} finishedJob the job that was just finished
 * @return {Object}             an updated jobSchedule
 */
export const onJobFinished = (schedule, finishedJob) => {
  let hasSetActiveJob = false

  const updatedJobs = schedule.jobs.map((scheduledJob) => {
    if (finishedJob.job_type === scheduledJob.type) {
      // If the finished job's type matched the scheduled one, mark it as done
      return { ...scheduledJob, status: JOB_STATUSES.DONE }
    } else if (!hasSetActiveJob && scheduledJob.status === JOB_STATUSES.PENDING) {
      // If we haven't set an active job and this one is pending, mark it as
      // active, we only have one active job at a time.
      hasSetActiveJob = true
      return { ...scheduledJob, status: JOB_STATUSES.ACTIVE }
    }

    return scheduledJob
  })

  return { isInitialized: true, jobs: updatedJobs }
}

export const areAllJobsDone = (schedule) => {
  return _every(schedule.jobs, (job) => job.status === JOB_STATUSES.DONE)
}

export const getActiveJob = (schedule) => {
  return _find(schedule.jobs, { status: JOB_STATUSES.ACTIVE })
}
