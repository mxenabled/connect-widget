import { USR_GUID } from './users'
import * as members from './members'

export const JOB_TYPES = {
  AGGREGATION: 0,
  VERIFICATION: 1,
  IDENTIFICATION: 2,
  HISTORY: 3,
  STATEMENT: 4,
  ORDER: 5,
  REWARD: 6,
  BALANCE: 7,
  MICRO_DEPOSIT: 8,
  TAX: 9,
  CREDIT_REPORT: 10,
  COMBINATION: 11,
}

interface Job {
  guid: string
  has_processed_account_numbers: boolean
  member_guid: string
  user_guid: string
  status: number
  error_message: string | null
  is_authenticated: boolean
  job_type: number
  async_account_data_ready: boolean
  finished_at: number
  started_at: number
  updated_at: number
}

export function createJob(jobData: Partial<Job>): Job {
  console.log('createJob')
  if (!jobData.member_guid) {
    throw new Error('member_guid is required to create a job')
  }

  const newJobGuid = `JOB-${Date.now()}`

  const newJob: Job = {
    guid: newJobGuid,
    has_processed_account_numbers: false,
    member_guid: jobData.member_guid || 'MBR-',
    user_guid: USR_GUID,
    status: 0,
    error_message: null,
    is_authenticated: true,
    job_type: JOB_TYPES.AGGREGATION,
    async_account_data_ready: false,
    finished_at: 0,
    started_at: 0,
    updated_at: 0,
    ...jobData,
  }
  jobs.push(newJob)

  const member = members.getByGuid(jobData.member_guid)

  if (member) {
    members.update({
      guid: member.guid,
      // The most_recent_job_guid and last_job_guid are known to be confusing
      // Which one to rely on is unclear
      most_recent_job_guid: newJobGuid,
      last_job_guid: newJobGuid,
    })
  }

  console.log('MEMBERS with new job', members.get())

  return newJob
}

export function findByGuid(guid: string): Job | undefined {
  return jobs.find((job) => job.guid === guid)
}

const jobs: Job[] = []
