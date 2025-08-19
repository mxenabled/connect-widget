import { USR_GUID } from './users'

interface Microdeposit {
  guid: string
  user_guid: string
  institution_guid: string | null
  member_guid: string | null
  account_type: number
  account_name: string
  routing_number: string
  account_number: string
  status: number
  status_name: string
  updated_at: number
  deposit_expected_at: string
  can_auto_verify: boolean
  email: string
  first_name: string
  last_name: string
}

export const MicrodepositsStatuses = {
  INITIATED: 0, // Job started
  REQUESTED: 1, // Micro deposits requested from provider
  DEPOSITED: 2, // Micro deposits deposited in account; ready for verification
  VERIFIED: 3, // Micro deposits verified by user
  ERRORED: 4, // Unable to create micro deposits.  Typically an ACH error on the provider side (MicrodepositErrors.js)
  DENIED: 5, // User entered incorrect amounts (VerifyDeposits.js)
  PREVENTED: 6, // Too many invalid verification attempts (MicrodepositErrors.js)
  CONFLICTED: 7, // There is an existing micro deposit request (Auto load to step based off existing MD status)
  REJECTED: 8, // Rejected either because validation failed on our side, or the provider didn't like something (MicrodepositErrors.js)
  PREINITIATED: 9, // Pre-initiated micro deposit with user info(first name, last name, and email) from client.
}

export function create(data: Partial<Microdeposit> = {}): Microdeposit {
  const microdeposit: Microdeposit = {
    guid: data.guid || `MIC-${Date.now()}`,
    user_guid: USR_GUID,
    institution_guid: data.institution_guid ?? null,
    member_guid: data.member_guid ?? null,
    account_type: data.account_type || 0,
    account_name: data.account_name || '',
    routing_number: data.routing_number || '',
    account_number: data.account_number || '',
    status: data.status || MicrodepositsStatuses.INITIATED,
    status_name: data.status_name || '',
    updated_at: data.updated_at || 0,
    deposit_expected_at: data.deposit_expected_at || '',
    can_auto_verify: data.can_auto_verify || false,
    email: data.email || '',
    first_name: data.first_name || '',
    last_name: data.last_name || '',
  }

  localStorage.setItem('microdeposit', JSON.stringify(microdeposit))
  return microdeposit
}

export function getByGuid(guid: string): Microdeposit | undefined {
  const microdepositJson = localStorage.getItem('microdeposit')
  if (!microdepositJson) return undefined

  const microdeposit: Microdeposit = JSON.parse(microdepositJson)

  // Advance the MD to DEPOSITED if it is INITIATED
  // Otherwise, leave it alone
  if (microdeposit.status === MicrodepositsStatuses.INITIATED) {
    microdeposit.status = MicrodepositsStatuses.DEPOSITED
  }

  return microdeposit.guid === guid ? { ...microdeposit } : undefined
}

export function update(guid: string, data: Partial<Microdeposit>): Microdeposit | undefined {
  const microdeposit = getByGuid(guid)
  if (!microdeposit) return undefined

  const updatedMicrodeposit = { ...microdeposit, ...data }
  localStorage.setItem('microdeposit', JSON.stringify(updatedMicrodeposit))
  return updatedMicrodeposit
}

export function clear(): void {
  localStorage.removeItem('microdeposit')
}
