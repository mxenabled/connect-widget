import { manualInstitution } from './institutions'
import { USR_GUID } from './users'

export interface Member {
  aggregation_status: any
  connection_status: number
  guid: string
  institution_guid: string
  institution_name: string | null
  institution_url: string
  instructional_data: any
  is_being_aggregated: boolean
  is_manual: boolean
  is_managed_by_user: boolean
  is_oauth: boolean
  last_job_guid: string | null
  last_job_status: any
  last_update_time: any
  metadata: any
  mfa: object
  most_recent_job_detail_code: any
  most_recent_job_guid: string | null
  needs_updated_credentials: boolean
  name: string
  process_status: any
  revision: number
  user_guid: string
  use_cases: string[]
  oauth_window_uri: string | null
  verification_is_enabled: boolean
  tax_statement_is_enabled: boolean
  successfully_aggregated_at: any
}

function createMember(data: Partial<Member> = {}): Member {
  return {
    aggregation_status: 0,
    connection_status: 0,
    guid: '',
    institution_guid: '',
    institution_name: null,
    institution_url: 'https://www.mx.com',
    instructional_data: null,
    is_being_aggregated: false,
    is_manual: false,
    is_managed_by_user: true,
    is_oauth: false,
    last_job_guid: null,
    last_job_status: null,
    last_update_time: null,
    metadata: null,
    mfa: {},
    most_recent_job_detail_code: null,
    most_recent_job_guid: null,
    needs_updated_credentials: false,
    name: '',
    process_status: null,
    revision: 1,
    user_guid: '',
    use_cases: [],
    oauth_window_uri: null,
    verification_is_enabled: true,
    tax_statement_is_enabled: false,
    successfully_aggregated_at: null,
    ...data,
  }
}

export function create(memberData: any, config: any) {
  const member = createMember({
    guid: `MBR-${Date.now()}`,
    institution_guid: memberData.institution_guid,
    user_guid: USR_GUID,
    use_cases: memberData.use_cases || [],
  })

  if (memberData.is_oauth) {
    member.connection_status = 21 // PENDING
    member.is_oauth = true
    member.oauth_window_uri = '/'
  } else {
    member.connection_status = 0
  }

  members.push(member)
  return member
}

export function get() {
  return members
}

export function getByGuid(guid: string) {
  return members.find((m) => m.guid === guid) || null
}

export function update(member: Partial<Member>) {
  const index = members.findIndex((m) => m.guid === member.guid)
  if (index !== -1) {
    members[index] = { ...members[index], ...member }
  }

  return { ...members[index] }
}

export function remove(member: Member) {
  const index = members.findIndex((m) => m.guid === member.guid)
  if (index !== -1) {
    members.splice(index, 1)
  }
}

const members: Member[] = [
  createMember({
    institution_guid: manualInstitution.guid,
    guid: 'MBR-MANUAL',
  }),
]
