import { getBlockedInstitutions } from 'src/utilities/institutionStatus'

export function memberIsBlockedForCostReasons(member: {
  institution_guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  const blockedInstitutions = getBlockedInstitutions()
  const isBlockedInstitution = blockedInstitutions.some(
    (blocked) => member?.name === blocked.name || member?.institution_guid === blocked.guid,
  )

  return isBlockedInstitution && member?.is_disabled_by_client === true
}

// TODO - move this to institutionStatus.ts
export function institutionIsBlockedForCostReasons(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  const blockedInstitutions = getBlockedInstitutions()
  const isBlockedInstitution = blockedInstitutions.some(
    (blocked) => institution?.name === blocked.name || institution?.guid === blocked.guid,
  )

  return isBlockedInstitution && institution?.is_disabled_by_client === true
}
