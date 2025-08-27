export function memberIsBlockedForCostReasons(member: {
  institution_guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  const isChase =
    member?.name === 'Chase Bank' ||
    member.institution_guid === 'INS-78c7b591-6512-9c17-b092-1cddbd3c85ba' // PROD INS guid

  return isChase && member?.is_disabled_by_client === true
}

export function institutionIsBlockedForCostReasons(institution: {
  guid?: string | null
  is_disabled_by_client?: boolean | null
  name?: string | null
}) {
  const isChase =
    institution?.name === 'Chase Bank' ||
    institution.guid === 'INS-78c7b591-6512-9c17-b092-1cddbd3c85ba' // PROD INS guid

  return isChase && institution?.is_disabled_by_client === true
}
