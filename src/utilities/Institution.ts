/* eslint-disable @typescript-eslint/no-explicit-any */
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

export const getInstitutionLoginUrl = (institution: any) => institution.login_url ?? institution.url

/**
 * Validate if the institution(data provider) supports
 * the requested products and returns a boolean.
 */
export const instutionSupportRequestedProducts = (
  config: ClientConfigType,
  institution: InstitutionResponseType,
) => {
  const products = config?.data_request?.products

  if (Array.isArray(products) && products.length > 0) {
    return products.every((product) => {
      switch (product) {
        case COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER:
          return institution.account_verification_is_enabled
        case COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER:
          return institution.account_identification_is_enabled
        default:
          return true // For any other product, return true.
      }
    })
  }

  // Returns true if the products array is not provided or is empty.
  // This can happen when configurations are passed via postMessage,
  // as we don't yet have proper validations for the "mode" and "include" flags strategy.
  return true
}
