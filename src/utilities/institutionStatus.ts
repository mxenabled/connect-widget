import { institutionIsBlockedForCostReasons } from './institutionBlocks'

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

export function isBlocked(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  return institutionIsBlockedForCostReasons(institution)
}
