import { institutionIsBlockedForCostReasons } from './institutionBlocks'
import { __ } from 'src/utilities/Intl'

export const InstitutionStatus = {
  BLOCKED: 'BLOCKED',
  OPERATIONAL: 'OPERATIONAL',
  UNAVAILABLE: 'UNAVAILABLE',
}

// This is a hard-coded source of institutions for now, because we don't yet have a backend supported feature
// to manage unavailable institutions.  This is the beginning of a larger initiative for "Institution messaging".
export function getUnavailableInstitutions() {
  return [
    {
      name: 'PayPal',
      guid: 'INS-f78cd062-8ec2-5bc2-cd48-ebb8bf032b2d', // PROD INS guid
    },
  ]
}

// This is a hard-coded source of institutions for now.  So far we've only designed blocking for Chase Bank.
// The goal is to eventually take full advantage of the institution blocking feature for any institution.
export function getBlockedInstitutions() {
  return [
    {
      name: 'Chase Bank',
      guid: 'INS-78c7b591-6512-9c17-b092-1cddbd3c85ba', // PROD INS guid
    },
  ]
}

export function useInstitutionStatusMessage(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  const status = getInstitutionStatus(institution)

  switch (status) {
    case InstitutionStatus.BLOCKED:
      // This is Chase specific messaging, until we fully design for blocking.  The problem is blocking is used for more than just Chase's blocking for cost reasons.
      // So in the widget we are going to ony show blocking for Chase.
      return {
        title: __('Free %1 Connections Are No Longer Available', institution.name),
        body: __(
          '%1 now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support %1 connections.',
          institution.name,
        ),
      }
    case InstitutionStatus.UNAVAILABLE:
      // This is PayPal specific messaging for now...  Because we don't actually have a backend feature that
      // tells us when an institution is unavailable.  The widget is essentially choosing to make PayPal unavailable.
      // This does limit the unavailable to widget implementations for now.
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

export function getInstitutionStatus(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  if (isBlocked(institution)) {
    return InstitutionStatus.BLOCKED
  }

  if (isUnavailable(institution)) {
    return InstitutionStatus.UNAVAILABLE
  }

  return InstitutionStatus.OPERATIONAL
}

export function isUnavailable(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  const unavailableInstitutions = getUnavailableInstitutions()

  return unavailableInstitutions.some(
    (unavailable) =>
      institution?.name === unavailable.name || institution?.guid === unavailable.guid,
  )
}

// Note - Blocked as of today means Chase blocking for cost reasons
export function isBlocked(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  return institutionIsBlockedForCostReasons(institution)
}
