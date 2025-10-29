import { getExperimentalFeatures } from 'src/redux/reducers/experimentalFeaturesSlice'
import { institutionIsBlockedForCostReasons } from './institutionBlocks'
import { __ } from 'src/utilities/Intl'
import { useSelector } from 'react-redux'

export const InstitutionStatus = {
  CLIENT_BLOCKED_FOR_FEES: 'CLIENT_BLOCKED_FOR_FEES',
  OPERATIONAL: 'OPERATIONAL',
  UNAVAILABLE: 'UNAVAILABLE',
}

export function useInstitutionStatusMessage(institution: {
  guid: string
  name: string
  is_disabled_by_client?: boolean
}) {
  const { unavailableInstitutions } = useSelector(getExperimentalFeatures)
  const status = useInstitutionStatus(institution)

  if (!institution || !institution.name || !institution.guid) {
    throw new Error('Selected institution is not defined or missing name and guid')
  }

  if (!unavailableInstitutions || !Array.isArray(unavailableInstitutions)) {
    throw new Error('Experimental feature unavailableInstitutions is not defined or not an array')
  }

  switch (status) {
    case InstitutionStatus.CLIENT_BLOCKED_FOR_FEES:
      // At the moment, CLIENT_BLOCKED_FOR_FEES messaging is specific to fee-related blocking only.  Customers can block for other reasons,
      // but we don't have specific messaging for those blocks at this time.
      return {
        title: __('Free %1 Connections Are No Longer Available', institution.name),
        body: __(
          '%1 now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support %1 connections.',
          institution.name,
        ),
      }
    case InstitutionStatus.UNAVAILABLE:
      // At the moment, UNAVAILABLE messaging is specific to institutions that limit data sharing from their end.
      return {
        title: __('Connection not supported by %1', institution.name),
        body: __(
          "%1 currently limits how your data can be shared. We'll enable this connection once %1 opens access.",
          institution.name,
        ),
      }
    default:
      return {
        title: '',
        body: '',
      }
  }
}

export function useInstitutionStatus(
  institution: {
    guid: string
    name: string
    is_disabled_by_client?: boolean
  } | null,
) {
  // Right now the statuses are driven by experimental features.
  // We are waiting for backend support to drive these statuses more formally.
  // This design may SIGNIFICANTLY change in the future
  const { unavailableInstitutions } = useSelector(getExperimentalFeatures)

  return getInstitutionStatus(institution, unavailableInstitutions || [])
}

export function getInstitutionStatus(
  institution: {
    guid: string
    name: string
    is_disabled_by_client?: boolean
  } | null,
  unavailableInstitutions: { guid: string; name: string }[],
) {
  // If for some reason institution or unavailableInstitutions are not provided, return OPERATIONAL
  // to keep default behavior.  This CAN happen during initial renders.
  if (!institution || !Array.isArray(unavailableInstitutions)) {
    return InstitutionStatus.OPERATIONAL
  }

  // Return CLIENT_BLOCKED_FOR_FEES if the institution is blocked for cost reasons.
  // This is driven by a client choice to block an institution because of fees.
  if (institutionIsBlockedForCostReasons(institution)) {
    return InstitutionStatus.CLIENT_BLOCKED_FOR_FEES
  }

  // Return UNAVAILABLE if the institution is currently marked as unavailable.
  // This is driven by the experimental feature "unavailableInstitutions".
  // Each institution must be included manually into the npm package's props
  // ---> experimentalFeatures.unavailableInstitutions array.
  if (
    unavailableInstitutions.some(
      (unavailable) =>
        institution?.name === unavailable.name || institution?.guid === unavailable.guid,
    )
  ) {
    return InstitutionStatus.UNAVAILABLE
  }

  return InstitutionStatus.OPERATIONAL
}
