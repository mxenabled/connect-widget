import { ACTIONABLE_ERROR_CODES } from 'src/views/actionableError/consts'

// AED Step 3: Add codes or statuses to show new ACTIONABLE_ERROR
export const shouldUseActionableError = (member: MemberResponseType) => {
  return [ACTIONABLE_ERROR_CODES.NO_ELIGIBLE_ACCOUNTS].includes(
    member?.most_recent_job_detail_code ?? -1,
  )
  // || [].includes(member.connection_status)
  // The above line can be used to add statuses to the list of actionable errors
}
