import _isEmpty from 'lodash/isEmpty'
import { AGG_MODE } from 'src/const/Connect'

import { ReadableStatuses } from 'src/const/Statuses'
import { canHandleActionableError } from 'src/views/actionableError/consts'

/**
 * Builds our useForm hooks initial values object
 *
 * Turns an array of objects like this
 * [
 *   {
 *     field_name: "username",
 *     field_type: 3,
 *     label: "username"
 *   },
 *   {
 *     field_name: "password",
 *     field_type: 1,
 *     label: "password"
 *   },
 * ]
 *
 * Into an object like this
 * {
 *    username: "",
 *    password: ""
 * }
 *
 * @param {array} loginFields
 * @returns {object}
 */
export const buildInitialValues = (loginFields) => {
  return loginFields.reduce((acc, currentField) => {
    return {
      ...acc,
      [currentField.field_name]: '',
    }
  }, {})
}

/**
 * Builds our useForm hooks form schema based on dynamic values
 *
 * Turns an array of objects like this
 * [
 *   {
 *     field_name: "username",
 *     field_type: 3,
 *     label: "username"
 *   },
 *   {
 *     field_name: "password",
 *     field_type: 1,
 *     label: "password"
 *   },
 * ]
 *
 * And turns it into an object like this
 * {
 *   username: {
 *     label: "username",
 *     required: true
 *   },
 *   password: {
 *     label: "password",
 *     required: true
 *   }
 * }
 *
 * @param {object} loginFields
 * @returns {object}
 */
export const buildFormSchema = (loginFields) => {
  return loginFields.reduce((acc, currentField) => {
    return {
      ...acc,
      [currentField.field_name]: {
        label: currentField.label,
        required: true,
      },
    }
  }, {})
}

// Determines if we should show the message box at the top of the credentials view
export const shouldShowMessageBox = (error, currentMember, mode = AGG_MODE) => {
  const noErrors = _isEmpty(error) // Error from API response
  const isDenied = currentMember.connection_status === ReadableStatuses.DENIED // Member connection_status
  const isErrorCodeCredentialRelated =
    currentMember?.error?.error_code &&
    canHandleActionableError(currentMember?.error?.error_code, mode) // This comes from the error_code originally from the job

  if (noErrors && isDenied) {
    return true
  } else if (isErrorCodeCredentialRelated) {
    return true
  } else {
    return false
  }
}
