/**
 * Builds our useForm hooks initial values object
 *
 * Turns an array of objects like this
 * [
 *   {
 *     field_name: "What is your mother's maiden name?",
 *     field_type: 0,
 *     label: "What is your mother's maiden name?"
 *   },
 *   {
 *     field_name: "What city where you born in?",
 *     field_type: 0,
 *     label: "What city where you born in?"
 *   },
 * ]
 *
 * Into an object like this
 * {
 *    What is your mother's maiden name?: "",
 *    What city where you born in?: ""
 * }
 *
 * @param {array} mfaFields
 * @returns {object}
 */
export const buildInitialValues = (mfaFields) => {
  return mfaFields.reduce((acc, currentField) => {
    return {
      ...acc,
      [currentField.label]: '',
    }
  }, {})
}

/**
 * Builds our useForm hooks form schema based on dynamic values
 *
 * Turns an array of objects like this
 * [
 *   {
 *     field_name: "What is your mother's maiden name?",
 *     field_type: 0,
 *     label: "What is your mother's maiden name?"
 *   },
 *   {
 *     field_name: "What city where you born in?",
 *     field_type: 0,
 *     label: "What city where you born in?"
 *   },
 * ]
 *
 * And turns it into an object like this
 * {
 *   What is your mother's maiden name?: {
 *     label: "What is your mother's maiden name?",
 *     required: true
 *   },
 *   What city where you born in?: {
 *     label: "What city where you born in?",
 *     required: true
 *   }
 * }
 *
 * @param {object} mfaFields
 * @returns {object}
 */
export const buildFormSchema = (mfaFields) => {
  return mfaFields.reduce((acc, currentField) => {
    return {
      ...acc,
      [currentField.field_name || currentField.label]: {
        label: currentField.label,
        required: true,
      },
    }
  }, {})
}

/**
 *
 * @description This will return the credential type or a null if the type cannot be determined
 * @param {Array} mfaCredentials
 * @returns {string | null}
 */
export const getMFAFieldType = (mfaCredentials) => {
  if (!Array.isArray(mfaCredentials) || mfaCredentials.length < 1) {
    return null
  }

  const mfaCredential = mfaCredentials[0]

  if (!('field_type' in mfaCredential) && !('type' in mfaCredential)) {
    return null
  }

  // Using ?? because 0 might be a valid type
  return mfaCredential.field_type ?? mfaCredential.type
}
