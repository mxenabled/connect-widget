import { manualInstitution } from './institutions'
import { USR_GUID } from './users'

export const CONNECTION_STATUSES = {
  CREATED: 0,
  PREVENTED: 1,
  DENIED: 2,
  CHALLENGED: 3,
  REJECTED: 4,
  LOCKED: 5,
  CONNECTED: 6,
  IMPEDED: 7,
  RECONNECTED: 8,
  DEGRADED: 9,
  DISCONNECTED: 10,
  DISCONTINUED: 11,
  CLOSED: 12,
  DELAYED: 13,
  FAILED: 14,
  UPDATED: 15,
  DISABLED: 16,
  IMPORTED: 17,
  RESUMED: 18,
  EXPIRED: 19,
  IMPAIRED: 20,
  PENDING: 21,
}

const STATUS_CHANGES = {
  aggregation: [CONNECTION_STATUSES.CREATED, CONNECTION_STATUSES.CONNECTED],
  verificationWithSAS: [
    CONNECTION_STATUSES.CREATED,
    CONNECTION_STATUSES.CHALLENGED,
    CONNECTION_STATUSES.RESUMED,
    CONNECTION_STATUSES.CONNECTED,
  ],
}

export interface Member {
  aggregation_status: number
  connection_status: number
  guid: string
  institution_guid: string
  institution_name: string | null
  institution_url: string
  instructional_data: object | null
  is_being_aggregated: boolean
  is_manual: boolean
  is_managed_by_user: boolean
  is_oauth: boolean
  last_job_guid: string | null
  last_job_status?: number | null
  last_update_time?: string | null
  metadata?: object | null
  mfa: MemberMFA
  most_recent_job_detail_code?: number | null
  most_recent_job_guid: string | null
  needs_updated_credentials: boolean
  name: string
  process_status?: number | null
  revision: number
  user_guid: string
  use_cases: string[]
  oauth_window_uri: string | null
  verification_is_enabled: boolean
  tax_statement_is_enabled: boolean
  successfully_aggregated_at?: string | null
}

export interface MemberMFA {
  credentials?:
    | Array<{
        nullify: null
        guid: string
        institution_guid: string
        label: string
        field_name: null
        opt: null
        type: number
        display_order: null
        external_id: string
        data_source_guid: null
        field_type: number
        optional: null
        editable: null
        mfa: boolean
        optional_mfa: null
        aggregator_guid: string
        question_field_type: null
        answer_field_type: null
        escaped: null
        value_identifier: null
        value_mask: null
        size: null
        max_length: null
        created_at: string
        updated_at: string
        legacy_question_field_type: null
        response_field_type: null
        sequence: null
        meta_data: null
        display_name: null
        status_code: number
        job_guid: string
        options: Array<{
          nullify: null
          guid: string
          label: string
          external_id: null
          value: string
          credential_guid: string
          created_at: string
          updated_at: string
          external_guid: null
          data_uri: null
          status_code: number
        }>
      }>
    | null
    | object
}

const memberMFA: MemberMFA = {
  credentials: [
    {
      nullify: null,
      guid: 'CRD-8b47756f-78ad-4a64-ad12-f695a215aa16',
      institution_guid: 'INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9',
      label: 'Please select an account:',
      field_name: null,
      opt: null,
      type: 2,
      display_order: null,
      external_id: 'single_account_select',
      data_source_guid: null,
      field_type: 2,
      optional: null,
      editable: null,
      mfa: true,
      optional_mfa: null,
      aggregator_guid: 'AGG-213f513f-cd6b-cf3d-f4dc-01a40ce64871',
      question_field_type: null,
      answer_field_type: null,
      escaped: null,
      value_identifier: null,
      value_mask: null,
      size: null,
      max_length: null,
      created_at: '2025-08-19T16:41:25.000+00:00',
      updated_at: '2025-08-19T16:41:25.000+00:00',
      legacy_question_field_type: null,
      response_field_type: null,
      sequence: null,
      meta_data: null,
      display_name: null,
      status_code: 200,
      job_guid: 'JOB-743beeb2-5105-4a9c-993f-3d5603d261fa',
      options: [
        {
          nullify: null,
          guid: 'CRO-c19c0bb6-fb65-4ab4-b0dc-0fd4ab798166',
          label: 'Example Savings',
          external_id: null,
          value: 'account-62a9b503-b042-4626-8ed6-c3cc47d781cb',
          credential_guid: 'CRD-8b47756f-78ad-4a64-ad12-f695a215aa16',
          created_at: '2025-08-19T16:41:25.000+00:00',
          updated_at: '2025-08-19T16:41:25.000+00:00',
          external_guid: null,
          data_uri: null,
          status_code: 200,
        },
        {
          nullify: null,
          guid: 'CRO-dfe7457c-9c31-4ee8-8657-c63f914ae88d',
          label: 'Example Checking',
          external_id: null,
          value: 'account-d1e886a8-2b36-46b5-8d17-4f5f7dbd17ae',
          credential_guid: 'CRD-8b47756f-78ad-4a64-ad12-f695a215aa16',
          created_at: '2025-08-19T16:41:25.000+00:00',
          updated_at: '2025-08-19T16:41:25.000+00:00',
          external_guid: null,
          data_uri: null,
          status_code: 200,
        },
      ],
    },
  ],
}

function createMember(data: Partial<Member> = {}): Member {
  return {
    aggregation_status: 0,
    connection_status: CONNECTION_STATUSES.CREATED,
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

export function create(memberData: Partial<Member>, config: { use_cases: string[] }) {
  const member = createMember({
    guid: `MBR-${Date.now()}`,
    institution_guid: memberData.institution_guid,
    user_guid: USR_GUID,
    use_cases: memberData.use_cases || config.use_cases || [],
  })

  if (memberData.is_oauth) {
    member.connection_status = CONNECTION_STATUSES.PENDING
    member.is_oauth = true
    member.oauth_window_uri = '/'
  } else {
    member.connection_status = CONNECTION_STATUSES.CREATED
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

export function updateToNextConnectionStatus(member: Member) {
  // If the member is in a CHALLENGED state, don't automatically update the status, but add the MFA prompts
  if (
    member.connection_status === CONNECTION_STATUSES.CHALLENGED &&
    window?.bootstrap?.clientConfig?.mode === 'verification'
  ) {
    // Single Account Select mfa
    member.mfa = memberMFA
    return update(member)
  }

  const flow =
    window?.bootstrap?.clientConfig?.mode === 'aggregation' ? 'aggregation' : 'verificationWithSAS'
  const currentStatus = member.connection_status
  const nextStatus = STATUS_CHANGES[flow].indexOf(currentStatus) + 1

  // Update the connection_status
  if (
    nextStatus < STATUS_CHANGES[flow].length &&
    member.connection_status !== CONNECTION_STATUSES.CHALLENGED
  ) {
    member.connection_status = STATUS_CHANGES[flow][nextStatus]
  } else {
    member.connection_status = CONNECTION_STATUSES.CONNECTED // Default to CONNECTED if no next status
    member.is_being_aggregated = false
  }

  // Update the status
  return update(member)
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
