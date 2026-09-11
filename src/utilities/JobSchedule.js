import _find from 'lodash/find'
import _every from 'lodash/every'

import { JOB_TYPES, JOB_STATUSES } from 'src/const/consts' // TODO: Clean up const directories
import { VERIFY_MODE, AGG_MODE, REWARD_MODE, TAX_MODE } from 'src/const/Connect'

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
   * We know the customer is explicitly using products in their widget URL request if inferred is type-equal to false.
   * When the product values are not inferred, the widget SHOULD USE COMBOJOBS for this session.
   */
  const customerOptedThemselvesIntoCombojobs = config.data_request?.inferred === false

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
  if (member.is_being_aggregated && recentJob && recentJob.job_type !== firstWidgetJobType) {
    // Add the already running job and set ours to PENDING
    jobs.push({ type: recentJob.job_type, status: JOB_STATUSES.ACTIVE })
    jobs.push({ type: firstWidgetJobType, status: JOB_STATUSES.PENDING })
  } else {
    jobs.push({ type: firstWidgetJobType, status: JOB_STATUSES.ACTIVE })
  }

  // COMBINATION jobs are done in a single request so we don't add anything extra
  if (firstWidgetJobType !== JOB_TYPES.COMBINATION) {
    if (config.include_identity === true) {
      jobs.push({ type: JOB_TYPES.IDENTIFICATION, status: JOB_STATUSES.PENDING })
    }
  }

  return { isInitialized: true, jobs }
}

/**
 * Update the schedule with the finished job.
 * - Mark the finished job as DONE
 * - If nothing is left ACTIVE, promote the next PENDING job
 *
 * The finished job is not always the ACTIVE one. Firefly starts a job of its
 * own when an OAuth member is redirected back and background aggregation is disabled,
 * and that job can be the one that finishes while our scheduled job is still waiting
 * to run. In that case the ACTIVE job must stay ACTIVE so Connecting can start it;
 * promoting a PENDING job as well would leave two ACTIVE jobs and nothing would ever
 * pick up the second one.
 *
 * @param  {Object} schedule   the jobSchedule object
 * @param  {Object} finishedJob the job that was just finished
 * @return {Object}             an updated jobSchedule
 */
export const onJobFinished = (schedule, finishedJob) => {
  const jobs = schedule.jobs.map((scheduledJob) =>
    finishedJob?.job_type === scheduledJob.type
      ? { ...scheduledJob, status: JOB_STATUSES.DONE }
      : scheduledJob,
  )

  const hasActiveJob = jobs.some((job) => job.status === JOB_STATUSES.ACTIVE)

  if (!hasActiveJob) {
    const nextPendingIndex = jobs.findIndex((job) => job.status === JOB_STATUSES.PENDING)

    if (nextPendingIndex !== -1) {
      jobs[nextPendingIndex] = { ...jobs[nextPendingIndex], status: JOB_STATUSES.ACTIVE }
    }
  }

  return { isInitialized: true, jobs }
}

export const areAllJobsDone = (schedule) => {
  return _every(schedule.jobs, (job) => job.status === JOB_STATUSES.DONE)
}

export const getActiveJob = (schedule) => {
  return _find(schedule.jobs, { status: JOB_STATUSES.ACTIVE })
}
