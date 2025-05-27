import {
  ActionTypes,
  connectComplete,
  deleteMemberSuccess,
  jobComplete,
  handleOAuthSuccess,
  handleOAuthError,
  initializeJobSchedule,
  loadConnect,
  loadConnectError,
  loadConnectSuccess,
  retryOAuth,
  startOauthSuccess,
  stepToDeleteMemberSuccess,
  stepToMicrodeposits,
  verifyDifferentConnection,
  verifyExistingConnection,
} from 'src/redux/actions/Connect'
import { ReadableStatuses } from 'src/const/Statuses'
import { OAUTH_ERROR_REASONS, VERIFY_MODE, AGG_MODE, STEPS } from 'src/const/Connect'
import { defaultState, connect as reducer } from 'src/redux/reducers/Connect'
import { genMember } from 'src/utilities/generators/Members'
import { genInstitution } from 'src/utilities/generators/Institution'
import { JOB_TYPES, JOB_STATUSES } from 'src/const/consts'
import { MicrodepositsStatuses } from 'src/views/microdeposits/const'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

describe('Connect redux store', () => {
  const credential1 = { guid: 'CRD-123' }
  const credential2 = { guid: 'CRD-234' }
  const credentials = [credential1, credential2]
  const widgetProfile = { enable_support_requests: true, display_disclosure_in_connect: false }

  it('should have initial state', () => {
    const initState = reducer(undefined, {})

    expect(initState).toEqual(defaultState)
  })

  describe('resetConnect', () => {
    it('should reset mounted, selectedInstitution, and step with RESET_CONNECT', () => {
      const afterState = reducer(
        {
          ...defaultState,
          location: [{ step: STEPS.ACTIONABLE_ERROR }],
          currentMemberGuid: 'MBR-123',
          widgetProfile,
        },
        { type: ActionTypes.RESET_CONNECT },
      )

      expect(afterState.location).toEqual([])
      expect(afterState.selectedInstitution).toEqual(defaultState.selectedInstitution)
      expect(afterState.currentMemberGuid).toEqual(defaultState.currentMemberGuid)
    })
  })

  it('should step to update creds with STEP_TO_UPDATE_CREDENTIALS', () => {
    const afterState = reducer(defaultState, { type: ActionTypes.STEP_TO_UPDATE_CREDENTIALS })

    expect(afterState.location[afterState.location.length - 1].step).toEqual(
      STEPS.ENTER_CREDENTIALS,
    )
    expect(afterState.updateCredentials).toEqual(true)
  })

  it('should step to connecting with STEP_TO_CONNECTING', () => {
    const afterState = reducer(defaultState, { type: ActionTypes.STEP_TO_CONNECTING })

    expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTING)
  })

  it('should step to MFA with STEP_TO_MFA', () => {
    const afterState = reducer(defaultState, { type: ActionTypes.STEP_TO_MFA, payload: 'MBR-123' })

    expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.MFA)
    expect(afterState.currentMemberGuid).toEqual('MBR-123')
  })

  it('should step to verifyExistingMember if STEP_TO_VERIFY_EXISTING_MEMBER is sent', () => {
    const afterState = reducer(defaultState, { type: ActionTypes.STEP_TO_VERIFY_EXISTING_MEMBER })

    expect(afterState.location[afterState.location.length - 1].step).toEqual(
      STEPS.VERIFY_EXISTING_MEMBER,
    )
  })

  it('should set isComponentLoading to true when loadConnect is called and isComponentLoading is false', () => {
    const afterState = reducer(
      { ...defaultState, isComponentLoading: false },
      loadConnect({ updateCredentials: false }),
    )

    expect(afterState.isComponentLoading).toEqual(true)
  })

  it('should reset other state that may have changed to default state when loading', () => {
    const beforeState = { ...defaultState, location: [{ step: STEPS.CONNECTING }] }
    const afterState = reducer(beforeState, loadConnect({}))

    expect(afterState.location).toEqual([])
    expect(afterState.isComponentLoading).toEqual(true)
  })

  describe('loading Connect reducers', () => {
    it('should have a default state of true for componentLoading', () => {
      expect(defaultState.isComponentLoading).toBe(true)
    })
  })

  describe('loadConnectSuccess', () => {
    it('should set loading to false with loadConnectSuccess', () => {
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true },
        loadConnectSuccess({ widgetProfile }),
      )

      expect(afterState.isComponentLoading).toBe(false)
    })

    it('should end isComponentLoading', () => {
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true },
        {
          type: ActionTypes.LOAD_CONNECT_SUCCESS,
          payload: { config: { mode: VERIFY_MODE }, members: [], widgetProfile },
        },
      )

      expect(afterState.isComponentLoading).toEqual(false)
    })

    it('should end isComponentLoading on LOAD_CONNECT_SUCCESS and go to disclosure if no valid members', () => {
      const members = [
        {
          guid: 'MBR-1',
          institution_guid: 'INST-1',
        },
        {
          guid: 'MBR-2',
          institution_guid: 'INST-2',
        },
      ]
      const widgetProfile = { display_disclosure_in_connect: true }
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true, iavMembers: [], widgetProfile },
        {
          type: ActionTypes.LOAD_CONNECT_SUCCESS,
          payload: { members, mode: VERIFY_MODE, widgetProfile },
        },
      )

      expect(afterState.iavMembers).toHaveLength(0)
      expect(afterState.isComponentLoading).toEqual(false)
      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.DISCLOSURE)
    })

    it('should set the step to update credentials if there is a member and update_credentials is true', () => {
      const member = genMember({ guid: 'MBR-1' })
      const institution = genInstitution({ guid: 'INS-1', credentials })
      const config = { update_credentials: true }
      const afterState = reducer(defaultState, loadConnectSuccess({ member, institution, config }))

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
      expect(afterState.isComponentLoading).toEqual(false)
      expect(afterState.currentMemberGuid).toEqual(member.guid)
    })

    it('should set the step to disclosure if there is an institution guid configured and disclosure flag is enabled', () => {
      const institution = { guid: 'INST-1', credentials }
      const config = { current_institution_guid: 'INST-1' }
      const widgetProfile = { display_disclosure_in_connect: true }
      const afterState = reducer(
        defaultState,
        loadConnectSuccess({ institution, config, widgetProfile }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.DISCLOSURE)
      expect(afterState.isComponentLoading).toBe(false)
    })

    it('should set the step to enter_credentials if there is an institution guid configured and disclosure flag is disabled', () => {
      const institution = { guid: 'INST-1', credentials }
      const config = { current_institution_guid: 'INST-1' }
      const widgetProfile = { display_disclosure_in_connect: false }
      const afterState = reducer(
        defaultState,
        loadConnectSuccess({ institution, config, widgetProfile }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
      expect(afterState.isComponentLoading).toBe(false)
    })

    it('should set the step to disclosure if there is an institution code configured', () => {
      const institution = { code: 'gringotts', credentials }
      const config = { current_institution_code: 'gringotts' }
      const widgetProfile = { display_disclosure_in_connect: true }
      const afterState = reducer(
        defaultState,
        loadConnectSuccess({ institution, config, widgetProfile }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.DISCLOSURE)
      expect(afterState.isComponentLoading).toBe(false)
    })

    it('should set the step based off the configured member if there is no udpate_credentials with a member', () => {
      const member = genMember({ guid: 'MBR-1', connection_status: ReadableStatuses.CHALLENGED })
      const institution = genInstitution({ guid: 'INS-1', credentials })
      const config = { current_member_guid: 'MBR-1' }
      const afterState = reducer(defaultState, loadConnectSuccess({ member, institution, config }))

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.MFA)
      expect(afterState.isComponentLoading).toBe(false)
      expect(afterState.currentMemberGuid).toEqual(member.guid)
    })

    it('should set step to Microdeposits and save guid if there is a Microdeposit guid configured thats PREINITIATED', () => {
      const microdeposit = { guid: 'MIC-123', status: MicrodepositsStatuses.PREINITIATED }
      const members = []
      const config = { current_microdeposit_guid: microdeposit.guid, mode: 'verification' }
      const afterState = reducer(
        defaultState,
        loadConnectSuccess({
          config,
          members,
          microdeposit,
          widgetProfile: { display_disclosure_in_connect: true },
        }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.DISCLOSURE)
      expect(afterState.currentMicrodepositGuid).toEqual(microdeposit.guid)
      expect(afterState.isComponentLoading).toBe(false)
    })

    it('should set step to Microdeposits and save guid if there is a Microdeposit guid configured thats not PREINITIATED', () => {
      const microdeposit = { guid: 'MIC-123', status: MicrodepositsStatuses.DEPOSITED }
      const config = { current_microdeposit_guid: 'MIC-123', mode: 'verification' }
      const afterState = reducer(
        defaultState,
        loadConnectSuccess({
          config,
          microdeposit,
        }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.MICRODEPOSITS)
      expect(afterState.currentMicrodepositGuid).toEqual(microdeposit.guid)
      expect(afterState.isComponentLoading).toBe(false)
    })

    it('should handle loading PENDING members', () => {
      const member = genMember({ guid: 'MBR-1', connection_status: ReadableStatuses.PENDING })
      const institution = genInstitution({ guid: 'INS-1', credentials })
      const config = { current_member_guid: 'MBR-1' }
      const afterState = reducer(defaultState, loadConnectSuccess({ member, institution, config }))

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
      expect(afterState.isComponentLoading).toBe(false)
      expect(afterState.currentMemberGuid).toEqual(member.guid)
    })

    it('should set selectInstitution based off the configured institution', () => {
      const institution = { guid: 'INS-1', credentials }
      const config = { current_institution_guid: 'INS-1' }
      const afterState = reducer(
        defaultState,
        loadConnectSuccess({ institution, config, widgetProfile }),
      )

      expect(afterState.selectedInstitution).toEqual(institution)
    })

    it('should set updateCredentials and step if a selected non-oauth member is in DENIED', () => {
      const institution = { guid: 'INS-1', credentials }
      const member = { connection_status: ReadableStatuses.DENIED, is_oauth: false, guid: 'MBR-1' }
      const afterState = reducer(defaultState, loadConnectSuccess({ institution, member }))
      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
      expect(afterState.updateCredentials).toEqual(true)
    })

    it('should set members to the loaded members result', () => {
      const members = [
        {
          guid: 'MBR-1',
          institution_guid: 'INST-1',
        },
        {
          guid: 'MBR-2',
          institution_guid: 'INST-2',
        },
      ]
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true },
        {
          type: ActionTypes.LOAD_CONNECT_SUCCESS,
          payload: { members, widgetProfile },
        },
      )

      expect(afterState.members).toHaveLength(2)
      expect(afterState.members[0]).toEqual({ guid: 'MBR-1', institution_guid: 'INST-1' })
    })
  })

  describe('loadConnectError', () => {
    it('should set the load error with LOAD_CONNECT_ERROR', () => {
      const error = { status: 404 }
      const afterState = reducer(defaultState, loadConnectError(error))

      expect(afterState.loadError).toEqual(error)
      expect(afterState.isComponentLoading).toEqual(false)
    })
  })

  describe('selectInstitutionSuccess', () => {
    it('should step to ENTER_CREDENTIALS if only an institution is present', () => {
      const institution = { guid: 'INT-123', credentials }
      const beforeState = { ...defaultState }
      const afterState = reducer(beforeState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: institution,
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
    })

    it('should step to ENTER_CREDENTIALS if the clientProfile does not support oauth even though the institution does', () => {
      const institution = { guid: 'INST-1', supports_oauth: true, credentials }
      const clientProfile = { uses_oauth: false }
      const afterState = reducer(defaultState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: { institution, clientProfile },
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
    })

    it('should step to ENTER_CREDENTIALS if this is an oauth institution AND the client profile does as well', () => {
      const institution = { guid: 'INST-1', supports_oauth: true, credentials }
      const clientProfile = { uses_oauth: true }
      const afterState = reducer(defaultState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: { institution, clientProfile },
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
    })

    it('should set the selectedInstitution', () => {
      const institution = { credentials, guid: 'INT-123' }
      const beforeState = { ...defaultState }
      const afterState = reducer(beforeState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: { institution },
      })

      expect(afterState.selectedInstitution).toEqual(institution)
    })
    it('should load connect in search step if it is a new user', () => {
      const config = { mode: VERIFY_MODE }
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true },
        {
          type: ActionTypes.LOAD_CONNECT_SUCCESS,
          payload: { config, members: [], widgetProfile },
        },
      )
      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.SEARCH)
    })
    it('should load connect in ACTIONALBE_ERROR step if it is a member with no sas accounts', () => {
      const config = { mode: VERIFY_MODE, current_member_guid: 'MBR-1' }
      const member = {
        connection_status: ReadableStatuses.CHALLENGED,
        is_oauth: false,
        guid: 'MBR-1',
        mfa: { credentials: [{ external_id: 'single_account_select', options: [] }] },
      }
      const members = [member]
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true },
        {
          type: ActionTypes.LOAD_CONNECT_SUCCESS,
          payload: { config, member, members, widgetProfile },
        },
      )
      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ACTIONABLE_ERROR,
      )
    })
    // TODO: Key test here
    it('should load connect in ACTIONABLE_ERROR step if it is a member with no dda accounts', () => {
      const config = { mode: VERIFY_MODE, current_member_guid: 'MBR-1' }
      const member = {
        connection_status: ReadableStatuses.CONNECTED,
        error: {
          error_code: 1000,
          error_message: 'Test',
          error_type: 'MEMBER',
          locale: 'en',
          user_message: 'Test',
        },
        is_oauth: false,
        guid: 'MBR-1',
      }
      const members = [member]
      const afterState = reducer(
        { ...defaultState, isComponentLoading: true },
        {
          type: ActionTypes.LOAD_CONNECT_SUCCESS,
          payload: { config, member, members, accounts: [], widgetProfile },
        },
      )
      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ACTIONABLE_ERROR,
      )
    })

    it('should set the step to CONSENT when the consentIsEnabled is enabled and products are not offered', () => {
      const institution = { guid: 'INST-1', account_verification_is_enabled: true, credentials }
      const afterState = reducer(defaultState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: {
          institution,
          consentIsEnabled: true,
          additionalProductOption: null,
        },
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONSENT)
    })

    it('should set the step to ADDITIONAL_PRODUCT when the institution supports verification and the additional product option is account number', () => {
      const institution = { guid: 'INST-1', account_verification_is_enabled: true, credentials }
      const afterState = reducer(defaultState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: { institution, additionalProductOption: COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER },
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ADDITIONAL_PRODUCT,
      )
    })

    it('should set the step to ADDITIONAL_PRODUCT when the additional product option is transactions', () => {
      const institution = { guid: 'INST-1', credentials }
      const afterState = reducer(defaultState, {
        type: ActionTypes.SELECT_INSTITUTION_SUCCESS,
        payload: { institution, additionalProductOption: COMBO_JOB_DATA_TYPES.TRANSACTIONS },
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ADDITIONAL_PRODUCT,
      )
    })
  })

  describe('LOAD_CONNECT', () => {
    it('should set updateCredentials to the config value or false if not present', () => {
      const afterState = reducer(defaultState, {
        type: ActionTypes.LOAD_CONNECT,
        payload: {
          update_credentials: true,
        },
      })

      expect(afterState.updateCredentials).toEqual(true)
    })
  })

  describe('oauth actions', () => {
    it('should finish the loader with START_OAUTH_SUCCESS', () => {
      const afterState = reducer(
        { ...defaultState, isOauthLoading: true },
        startOauthSuccess({ guid: 'MBR-1' }, 'something.com'),
      )

      expect(afterState.isOauthLoading).toBe(false)
      expect(afterState.oauthURL).toBe('something.com')
    })

    it('should set some oauth error state when OAUTH_COMPLETE_ERROR happens', () => {
      const beforeState = {
        ...defaultState,
        location: [{ step: STEPS.CONNECTING }],
        oauthURL: 'something.com',
      }

      const afterState = reducer(
        beforeState,
        handleOAuthError({ memberGuid: 'MBR-1', errorReason: OAUTH_ERROR_REASONS.CANCELLED }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.OAUTH_ERROR)
      expect(afterState.oauthURL).toEqual(null)
      expect(afterState.oauthErrorReason).toEqual(OAUTH_ERROR_REASONS.CANCELLED)
    })
  })

  describe('JOB_COMPLETE action', () => {
    it('should step based on the member', () => {
      const afterState = reducer(
        defaultState,
        jobComplete({ guid: 'MBR-1', connection_status: ReadableStatuses.CHALLENGED }),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.MFA)
      expect(afterState.currentMemberGuid).toEqual('MBR-1')
    })

    it('should stay on CONNECTING if we are connected but there are jobs to run', () => {
      const afterState = reducer(
        {
          ...defaultState,
          location: [{ step: STEPS.CONNECTING }],
          jobSchedule: {
            isInitialized: true,
            jobs: [
              {
                type: JOB_TYPES.VERIFICATION,
                status: JOB_STATUSES.ACTIVE,
              },
              {
                type: JOB_TYPES.AGGREGATION,
                status: JOB_STATUSES.PENDING,
              },
              {
                type: JOB_TYPES.IDENTIFICATION,
                status: JOB_STATUSES.PENDING,
              },
            ],
          },
        },
        jobComplete(
          { guid: 'MBR-1', connection_status: ReadableStatuses.CONNECTED },
          { job_type: JOB_TYPES.VERIFICATION },
        ),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTING)
      expect(afterState.jobSchedule).toEqual({
        isInitialized: true,
        jobs: [
          {
            type: JOB_TYPES.VERIFICATION,
            status: JOB_STATUSES.DONE,
          },
          {
            type: JOB_TYPES.AGGREGATION,
            status: JOB_STATUSES.ACTIVE,
          },
          {
            type: JOB_TYPES.IDENTIFICATION,
            status: JOB_STATUSES.PENDING,
          },
        ],
      })
    })

    it('should still stay in CONNECTING if the member is connected and no more jobs to run', () => {
      const afterState = reducer(
        {
          ...defaultState,
          members: [
            ...defaultState.members,
            { guid: 'MBR-1', connection_status: ReadableStatuses.DENIED },
          ],
          location: [{ step: STEPS.CONNECTING }],
          jobSchedule: {
            isInitialized: true,
            jobs: [
              {
                type: JOB_TYPES.AGGREGATION,
                status: JOB_STATUSES.ACTIVE,
              },
            ],
          },
        },
        jobComplete(
          { guid: 'MBR-1', connection_status: ReadableStatuses.CONNECTED },
          { job_type: JOB_TYPES.AGGREGATION },
        ),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTING)
      expect(afterState.members).toEqual([
        { guid: 'MBR-1', connection_status: ReadableStatuses.CONNECTED },
      ])
      expect(afterState.jobSchedule).toEqual({
        isInitialized: true,
        jobs: [
          {
            type: JOB_TYPES.AGGREGATION,
            status: JOB_STATUSES.DONE,
          },
        ],
      })
    })
  })

  describe('connectComplete', () => {
    it('should just go to the CONNECTED step', () => {
      const afterState = reducer(
        {
          ...defaultState,
          location: [{ step: STEPS.CONNECTING }],
          jobSchedule: {
            isInitialized: true,
            jobs: [
              {
                type: JOB_TYPES.AGGREGATION,
                status: JOB_STATUSES.ACTIVE,
              },
            ],
          },
        },
        connectComplete(
          { guid: 'MBR-1', connection_status: ReadableStatuses.CONNECTED },
          { job_type: JOB_TYPES.AGGREGATION },
        ),
      )

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTED)
    })
  })

  describe('initalizeJobSchedule action', () => {
    const nonAggregatingMember = { guid: 'MBR-1', is_being_aggregated: false }
    const aggingMember = { guid: 'MBR-1', is_being_aggregated: true }
    const aggJob = { guid: 'JOB-1', job_type: JOB_TYPES.AGGREGATION }

    test('when the member is not aggregating in agg mode', () => {
      const afterState = reducer(
        defaultState,
        initializeJobSchedule(nonAggregatingMember, aggJob, { mode: AGG_MODE }),
      )

      expect(afterState.jobSchedule.isInitialized).toBe(true)
      expect(afterState.jobSchedule.jobs).toEqual([
        {
          type: JOB_TYPES.AGGREGATION,
          status: JOB_STATUSES.ACTIVE,
        },
      ])
    })

    test('when the member is aggregating with same job as mode', () => {
      const afterState = reducer(
        defaultState,
        initializeJobSchedule(aggingMember, aggJob, { mode: AGG_MODE }),
      )

      expect(afterState.jobSchedule.isInitialized).toBe(true)
      expect(afterState.jobSchedule.jobs).toEqual([
        {
          type: JOB_TYPES.AGGREGATION,
          status: JOB_STATUSES.ACTIVE,
        },
      ])
    })

    test('when the member is aggregating with a different job than the mode', () => {
      const afterState = reducer(
        defaultState,
        initializeJobSchedule(aggingMember, aggJob, { mode: VERIFY_MODE }),
      )

      expect(afterState.jobSchedule.isInitialized).toBe(true)
      expect(afterState.jobSchedule.jobs).toEqual([
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
  })

  describe('RETRY_OAUTH action', () => {
    it('should reset the oauth state and move back from CONNECTING to ENTER_CREDENTIALS', () => {
      const beforeState = {
        ...defaultState,
        oauthURL: 'something.com',
        location: [
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
          { step: STEPS.OAUTH_ERROR },
        ],
      }

      const afterState = reducer(beforeState, retryOAuth())

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
      expect(afterState.oauthURL).toEqual(defaultState.oauthURL)
    })

    it('should clear the OAuth error and reason if we are in the oauth error step', () => {
      const beforeState = {
        ...defaultState,
        oauthErrorReason: OAUTH_ERROR_REASONS.CANCELLED,
        location: [
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
          { step: STEPS.OAUTH_ERROR },
        ],
      }

      const afterState = reducer(beforeState, retryOAuth())

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ENTER_CREDENTIALS,
      )
      expect(afterState.oauthErrorReason).toEqual(defaultState.oauthErrorReason)
    })
  })

  describe('verifyDifferentConnection action', () => {
    it('should set step to SEARCH when verifyDifferentConnection is fired', () => {
      const beforeState = {
        ...defaultState,
        currentMicrodepositGuid: 'MIC-123',
      }

      const afterState = reducer(beforeState, verifyDifferentConnection())

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.SEARCH)
    })
  })

  describe('finishMicrodeposits', () => {
    it('should reset currentMicrodepositGuid and step to SEARCH when fired', () => {
      const beforeState = {
        ...defaultState,
        step: STEPS.MICRODEPOSITS,
        currentMicrodepositGuid: 'MIC-123',
      }

      const afterState = reducer(beforeState, { type: ActionTypes.FINISH_MICRODEPOSITS })

      expect(afterState.currentMicrodepositGuid).toEqual(null)
      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.SEARCH)
    })
  })
  describe('exitMicrodeposits', () => {
    it('should maintain currentMicrodepositGuid and step to SEARCH when fired', () => {
      const beforeState = {
        ...defaultState,
        step: STEPS.MICRODEPOSITS,
        currentMicrodepositGuid: 'MIC-123',
      }

      const afterState = reducer(beforeState, { type: ActionTypes.EXIT_MICRODEPOSITS })

      expect(afterState.currentMicrodepositGuid).toEqual('MIC-123')
      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.SEARCH)
    })
  })

  describe('stepToMicrodeposits action', () => {
    it('should reset to defaultState except step, currentMicrodepositGuid, and loading/mounting related state', () => {
      const selectedInstitution = { guid: 'INS-1', credentials }
      const beforeState = {
        ...defaultState,
        selectedInstitution,
        step: STEPS.ENTER_CREDENTIALS,
        currentMicrodepositGuid: 'MIC-123',
        oauthURL: 'http://www.oauthURL.com',
      }

      const afterState = reducer(beforeState, stepToMicrodeposits())

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.MICRODEPOSITS)
      expect(afterState.currentMicrodepositGuid).toEqual('MIC-123')
      expect(afterState.oauthURL).toEqual(null)
      expect(afterState.selectedInstitution).toEqual({})
    })
  })

  test('should go to connecting with handleOAuthSuccess', () => {
    const beforeState = {
      ...defaultState,
      step: STEPS.ENTER_CREDENTIALS,
    }

    const afterState = reducer(beforeState, handleOAuthSuccess('MBR-1'))

    expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTING)
  })

  describe('verifyExistingConnection', () => {
    test('should go to CONNECTING step and set the member/instittuion', () => {
      const member = { guid: 'MBR-1', institution_guid: 'INST-1' }
      const institution = { guid: 'INST-1' }
      const afterState = reducer(defaultState, verifyExistingConnection(member, institution))

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTING)
      expect(afterState.selectedInstitution).toEqual(institution)
      expect(afterState.currentMemberGuid).toEqual('MBR-1')
    })
  })

  describe('MFA_CONNECT_SUBMIT action ', () => {
    it('should go to CONNECTING step and set currentMemberGuid/members when MFA_CONNECT_SUBMIT_SUCCESS happens ', () => {
      const member = { guid: 'MBR-1' }
      const afterState = reducer(defaultState, {
        type: ActionTypes.MFA_CONNECT_SUBMIT_SUCCESS,
        payload: { item: member },
      })
      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.CONNECTING)
      expect(afterState.currentMemberGuid).toEqual(member.guid)
      expect(afterState.members).toEqual([member])
    })
    it('should go to ACTIONABLE_ERROR step when MFA_CONNECT_SUBMIT_ERROR happens ', () => {
      const afterState = reducer(defaultState, {
        type: ActionTypes.MFA_CONNECT_SUBMIT_ERROR,
      })
      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.ACTIONABLE_ERROR,
      )
    })
  })

  describe('Deleting Members', () => {
    it('stepToDeleteMemberSuccess - Removes a member and sets the step', () => {
      const beforeState = {
        ...defaultState,
        members: [{ guid: '111' }, { guid: '222' }],
        location: [{ step: STEPS.ENTER_CREDENTIALS }],
      }

      const afterState = reducer(beforeState, stepToDeleteMemberSuccess('222'))

      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.DELETE_MEMBER_SUCCESS,
      )
      expect(afterState.members).toHaveLength(1)
      expect(afterState.members[0].guid).toBe('111')
    })

    it('deleteMemberSuccess - Removes a member from state', () => {
      const beforeState = {
        ...defaultState,
        members: [{ guid: '111' }, { guid: '222' }],
      }

      const afterState = reducer(beforeState, deleteMemberSuccess('222'))

      expect(afterState.members).toHaveLength(1)
      expect(afterState.members[0].guid).toBe('111')
    })
  })

  describe('addManualAccount', () => {
    it('should add the member to members', () => {
      const beforeState = { ...defaultState, members: [{ guid: 'MBR-1' }] }
      const afterState = reducer(beforeState, {
        type: ActionTypes.ADD_MANUAL_ACCOUNT_SUCCESS,
        payload: { member: { guid: 'MBR-2' } },
      })

      expect(afterState.members).toHaveLength(2)
      expect(afterState.members[1]).toEqual({ guid: 'MBR-2' })
    })

    it('should do nothing if there is no member', () => {
      const afterState = reducer(defaultState, {
        type: ActionTypes.ADD_MANUAL_ACCOUNT_SUCCESS,
        payload: {},
      })

      expect(afterState).toEqual(defaultState)
    })
  })

  describe('loginErrorStartOver', () => {
    const beforeState = {
      members: [
        {
          guid: 'MBR-1',
          verification_is_enabled: true,
          connection_status: ReadableStatuses.DEGRADED,
        },
      ],
      location: [],
    }

    it('should go to VERIFY_EXISTING_MEMBER, if mode is verification and there is an iav member', () => {
      const afterState = reducer(beforeState, {
        type: ActionTypes.LOGIN_ERROR_START_OVER,
        payload: { mode: VERIFY_MODE },
      })
      expect(afterState.location[afterState.location.length - 1].step).toEqual(
        STEPS.VERIFY_EXISTING_MEMBER,
      )
    })
    it('should go to SEARCH, if mode is other than verification', () => {
      const afterState = reducer(beforeState, {
        type: ActionTypes.LOGIN_ERROR_START_OVER,
        payload: { mode: AGG_MODE },
      })

      expect(afterState.location[afterState.location.length - 1].step).toEqual(STEPS.SEARCH)
    })
  })

  describe('goBackCredentials', () => {
    it('should go back to SEARCH', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
        ],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_CREDENTIALS,
      })

      expect(afterState.location).toEqual([
        { step: STEPS.VERIFY_EXISTING_MEMBER },
        { step: STEPS.SEARCH },
      ])
    })
    it('should go back to SEARCH if VERIFY_EXISTING_MEMBER is not available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [{ step: STEPS.SEARCH }, { step: STEPS.ENTER_CREDENTIALS }],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_CREDENTIALS,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })

  describe('goBackManualAccount', () => {
    it('should go back to VERIFY_EXISTING_MEMBER if available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.MANUAL_ACCOUNT },
        ],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.VERIFY_EXISTING_MEMBER }])
    })
    it('should go back to SEARCH if VERIFY_EXISTING_MEMBER is not available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [{ step: STEPS.SEARCH }, { step: STEPS.MANUAL_ACCOUNT }],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_MANUAL_ACCOUNT,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })

  describe('goBackOAuth', () => {
    it('should go back to Search', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
        ],
      }
      const afterState = reducer(beforeState, { type: ActionTypes.GO_BACK_OAUTH })

      expect(afterState.location).toEqual([
        { step: STEPS.VERIFY_EXISTING_MEMBER },
        { step: STEPS.SEARCH },
      ])
    })
    it('should go back to SEARCH if VERIFY_EXISTING_MEMBER is not available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [{ step: STEPS.SEARCH }, { step: STEPS.ENTER_CREDENTIALS }],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_OAUTH,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })

  describe('goBackPostMessage', () => {
    it('should go back to VERIFY_EXISTING_MEMBER if available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
        ],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_POST_MESSAGE,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.VERIFY_EXISTING_MEMBER }])
    })
    it('should go back to SEARCH if VERIFY_EXISTING_MEMBER is not available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [{ step: STEPS.SEARCH }, { step: STEPS.ENTER_CREDENTIALS }],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.GO_BACK_POST_MESSAGE,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })

  describe('resetWidgetMFAStep', () => {
    it('should go back to VERIFY_EXISTING_MEMBER if available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
          { step: STEPS.MFA },
        ],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.RESET_WIDGET_MFA_STEP,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.VERIFY_EXISTING_MEMBER }])
    })
    it('should go back to SEARCH if VERIFY_EXISTING_MEMBER is not available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [{ step: STEPS.SEARCH }, { step: STEPS.ENTER_CREDENTIALS }, { step: STEPS.MFA }],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.RESET_WIDGET_MFA_STEP,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })

  describe('resetWidget reducers', () => {
    it('should go back to VERIFY_EXISTING_MEMBER if available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
          { step: STEPS.CONNECTED },
        ],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.RESET_WIDGET_MFA_STEP,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.VERIFY_EXISTING_MEMBER }])
    })
    it('should go back to SEARCH if VERIFY_EXISTING_MEMBER is not available', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        location: [
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
          { step: STEPS.CONNECTED },
        ],
      }
      const afterState = reducer(beforeState, {
        type: ActionTypes.RESET_WIDGET_MFA_STEP,
        payload: {
          mode: VERIFY_MODE,
        },
      })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })
  describe('connectGoBack', () => {
    it('should go back a step if the current location has multiple steps', () => {
      const beforeState = {
        ...defaultState,
        location: [{ step: STEPS.SEARCH }, { step: STEPS.ENTER_CREDENTIALS }],
      }
      const afterState = reducer(beforeState, { type: ActionTypes.CONNECT_GO_BACK })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
    })
  })

  describe('resetWidgetConnected', () => {
    it('should reset state and reset location to only SEARCH', () => {
      const beforeState = {
        members: [
          {
            guid: 'MBR-1',
            verification_is_enabled: true,
            connection_status: ReadableStatuses.DEGRADED,
          },
        ],
        currentMemberGuid: 'MBR-1',
        connectConfig: {
          mode: VERIFY_MODE,
        },
        location: [
          { step: STEPS.VERIFY_EXISTING_MEMBER },
          { step: STEPS.SEARCH },
          { step: STEPS.ENTER_CREDENTIALS },
          { step: STEPS.CONNECTED },
        ],
        selectedInstitution: {
          guid: 'INS-1',
          name: 'Institution 1',
        },
      }
      const afterState = reducer(beforeState, { type: ActionTypes.RESET_WIDGET_CONNECTED })

      expect(afterState.location).toEqual([{ step: STEPS.SEARCH }])
      expect(afterState.currentMemberGuid).toEqual('')
      expect(afterState.selectedInstitution).toEqual({})
    })
  })
})
