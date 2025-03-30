/* eslint-disable @typescript-eslint/no-explicit-any */
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

export const getInstitutionLoginUrl = (institution: any) => institution.login_url ?? institution.url

/**
 * Validate if the institution(data provider) supports
 * the requested products and returns a boolean.
 */
export const instutionSupportRequestedProducts = (config: ClientConfigType, institution: any) => {
  const products = config?.data_request?.products

  if (Array.isArray(products)) {
    if (products.includes(COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER)) {
      return institution.account_verification_is_enabled
    }
    if (products.includes(COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER)) {
      return institution.account_identification_is_enabled
    }
  }
  return true
}
