export const ActionTypes = {
  ACCEPT_DISCLOSURE: 'connect/accept_disclosure',
  ACTIONABLE_ERROR_CONNECT_DIFFERENT_INSTITUTION:
    'connect/actionable_error_connect_different_institution',
  ACTIONABLE_ERROR_LOG_IN_AGAIN: 'connect/actionable_error_log_in_again',
  ADD_MANUAL_ACCOUNT_SUCCESS: 'connect/add_manual_account_success',
  CREATE_MEMBER_SUCCESS: 'connect/create_member_success',
  EXIT_MICRODEPOSITS: 'connect/exit_microdeposits',
  FINISH_MICRODEPOSITS: 'connect/finish_microdeposits',
  GO_BACK_CREDENTIALS: 'connect/go_back_credentials',
  GO_BACK_CONSENT: 'connect/go_back_consent',
  GO_BACK_MANUAL_ACCOUNT: 'connect/go_back_manual_account',
  GO_BACK_OAUTH: 'connect/go_back_oauth',
  GO_BACK_POST_MESSAGE: 'connect/go_back_post_message',
  HAS_INVALID_DATA: 'connect/has_invalid_data',
  INIT_JOB_SCHEDULE: 'connect/init_job_schedule',
  DELETE_MEMBER_SUCCESS: 'connect/delete_member_success',
  DELETE_MEMBER_SUCCESS_RESET: 'connect/delete_member_success_reset',
  STEP_TO_DELETE_MEMBER_SUCCESS: 'connect/step_to_member_delete_success',
  LOAD_CONNECT: 'connect/load_connect',
  LOAD_CONNECT_SUCCESS: 'connect/load_connect_success',
  LOAD_CONNECT_ERROR: 'connect/load_connect_error',
  STEP_TO_UPDATE_CREDENTIALS: 'connect/step_to_update_credentials',
  STEP_TO_MFA: 'connect/step_to_mfa',
  STEP_TO_CONNECTING: 'connect/step_to_connecting',
  STEP_TO_MICRODEPOSIT: 'connect/step_to_microdeposit',
  STEP_TO_VERIFY_EXISTING_MEMBER: 'connect/step_to_verify_existing_member',
  STEP_TO_ADD_MANUAL_ACCOUNT: 'connect/step_to_add_manual_account',
  RESET_CONNECT: 'connect/reset_connect',
  RESET_WIDGET_CONNECTED: 'connect/reset_widget_connected',
  RESET_WIDGET_MFA_STEP: 'connect/reset_widget_mfa_step',
  SELECT_INSTITUTION: 'connect/select_institution',
  SELECT_INSTITUTION_SUCCESS: 'connect/select_institution_success',
  SELECT_INSTITUTION_ERROR: 'connect/select_institution_error',
  RETRY_OAUTH: 'connect/retry_oauth',
  START_OAUTH: 'connect/start_oauth',
  START_OAUTH_SUCCESS: 'connect/start_oauth_success',
  OAUTH_COMPLETE_SUCCESS: 'connect/oauth_complete/success',
  OAUTH_COMPLETE_ERROR: 'connect/oauth_complete/error',
  JOB_COMPLETE: 'connect/job_complete',
  CONNECT_COMPLETE: 'connect/complete',
  VERIFY_DIFFERENT_CONNECTION: 'connect/verify_different_connection',
  VERIFY_EXISTING_CONNECTION: 'connect/verify_existing_connection',
  UPDATE_MEMBER_SUCCESS: 'connect/update_member_success',
  USER_CONSENTED: 'connect/user_consented',
  MFA_CONNECT_SUBMIT: 'connect/mfa_connect_submit',
  MFA_CONNECT_SUBMIT_ERROR: 'conenct/mfa_connect_submit_error',
  MFA_CONNECT_SUBMIT_SUCCESS: 'connect/mfa_connect_submit_success',
  LOGIN_ERROR_START_OVER: 'connect/login_error_start_over',
  CONNECT_GO_BACK: 'connect/go_back',
}

export const loadConnect = (config = {}) => ({ type: ActionTypes.LOAD_CONNECT, payload: config })
export const loadConnectSuccess = (dependencies = {}) => ({
  type: ActionTypes.LOAD_CONNECT_SUCCESS,
  payload: dependencies,
})

export const loadConnectError = (err) => ({
  type: ActionTypes.LOAD_CONNECT_ERROR,
  payload: err,
})

export const selectInstitutionError = (err) => ({
  type: ActionTypes.SELECT_INSTITUTION_ERROR,
  payload: err,
})

export const initializeJobSchedule = (member, job, config, isComboJobsEnabled) => ({
  type: ActionTypes.INIT_JOB_SCHEDULE,
  payload: { member, job, config, isComboJobsEnabled },
})

export const startOauth = (member, institution) => ({
  type: ActionTypes.START_OAUTH,
  payload: { member, institution },
})

export const startOauthSuccess = (member, oauthWindowURI) => ({
  type: ActionTypes.START_OAUTH_SUCCESS,
  payload: { member, oauthWindowURI },
})

export const jobComplete = (member, job) => ({
  type: ActionTypes.JOB_COMPLETE,
  payload: { member, job },
})

export const connectComplete = () => ({
  type: ActionTypes.CONNECT_COMPLETE,
})

export const handleOAuthError = ({ memberGuid, errorReason }) => ({
  type: ActionTypes.OAUTH_COMPLETE_ERROR,
  payload: { memberGuid, errorReason },
})
export const handleOAuthSuccess = (memberGuid) => ({
  type: ActionTypes.OAUTH_COMPLETE_SUCCESS,
  payload: memberGuid,
})

export const deleteMemberSuccess = (memberGuid) => ({
  type: ActionTypes.DELETE_MEMBER_SUCCESS,
  payload: { memberGuid },
})

export const stepToDeleteMemberSuccess = (memberGuid) => ({
  type: ActionTypes.STEP_TO_DELETE_MEMBER_SUCCESS,
  payload: { memberGuid },
})

export const stepToUpdateCredentials = () => ({ type: ActionTypes.STEP_TO_UPDATE_CREDENTIALS })
export const stepToConnecting = () => ({ type: ActionTypes.STEP_TO_CONNECTING })
export const stepToAddManualAccount = () => ({ type: ActionTypes.STEP_TO_ADD_MANUAL_ACCOUNT })
export const stepToVerifyExistingMember = () => ({
  type: ActionTypes.STEP_TO_VERIFY_EXISTING_MEMBER,
})
export const resetConnect = () => ({ type: ActionTypes.RESET_CONNECT })
export const stepToMicrodeposits = () => ({ type: ActionTypes.STEP_TO_MICRODEPOSIT })
export const retryOAuth = () => ({ type: ActionTypes.RETRY_OAUTH })
export const verifyDifferentConnection = () => ({
  type: ActionTypes.VERIFY_DIFFERENT_CONNECTION,
})
export const verifyExistingConnection = (member, institution) => ({
  type: ActionTypes.VERIFY_EXISTING_CONNECTION,
  payload: { member, institution },
})
export const send = (actionType, payload) => ({ type: actionType, payload })
export const addManualAccountSuccess = (account, member, institution) => ({
  type: ActionTypes.ADD_MANUAL_ACCOUNT_SUCCESS,
  payload: { account, member, institution },
})
