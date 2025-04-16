/**
 * The utility functions in this file should each help make decisions based on
 * a populated member object.  If you are writing a function that does not act
 * on properties of a member, consider placing it in another location
 */
import _get from 'lodash/get'

import {
  ErrorStatuses,
  MFAStatuses,
  ProcessingStatuses,
  ReadableStatuses,
} from 'src/const/Statuses'

/**
 *
 * @param {Object} member - populated member object
 * @returns {boolean} Returns true when member has credentials, AND the member has an MFA status
 * (Challenged | Rejected) ... we left out Expired?
 */
export const hasMFA = (member) => {
  const credentials = _get(member, ['credentials'], [])

  return MFAStatuses.indexOf(member.connection_status) !== -1 && credentials.length > 0
}

/**
 *
 * @param {Object} member - populated member object
 * @returns {boolean} true|false if status indicates an error
 */
export const hasError = (member) => {
  return ErrorStatuses.indexOf(member.connection_status) !== -1
}

/**
 *
 * @param {Object} member populated member object
 * @returns {boolean}
 */
export const hasAnyKindOfError = (member) => {
  return hasMFA(member) || hasError(member)
}

/**
 *
 * @param {Object} member populated member object
 * @returns {boolean}
 */
export const isProcessing = (member) => {
  return (
    ProcessingStatuses.indexOf(member.connection_status) !== -1 &&
    !member.is_manual &&
    member.is_managed_by_user &&
    member.is_being_aggregated
  )
}

/**
 *
 * @param {Object} member populated member object
 * @returns true if there are no SAS options to choose from
 */
export const hasNoSingleAccountSelectOptions = (member) => {
  const mfaCredentials = _get(member, 'mfa.credentials', [])
  const isSAS = mfaCredentials[0]?.external_id === 'single_account_select'
  const hasOptions = mfaCredentials[0]?.options?.length > 0

  if (member.connection_status === ReadableStatuses.CHALLENGED && isSAS && !hasOptions) {
    return true
  }

  return false
}
