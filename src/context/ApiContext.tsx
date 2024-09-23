import * as React from 'react'
import { configType } from 'src/redux/reducers/configSlice'

// ADD TYPES AS YOU GO
export type ApiContextTypes = {
  // Accounts
  createAccount: (data: AccountCreateType) => Promise<AccountResponseType>
  // Members
  addMember: (
    addMember: object,
    config: configType,
    isHuman: boolean,
  ) => Promise<MemberResponseType>
  deleteMember: (member: MemberDeleteType) => Promise<void>
  getMemberCredentials: (memberGuid: string) => Promise<CredentialResponseType[]>
  loadMemberByGuid: (guid: string) => Promise<MemberResponseType>
  loadMembers: () => Promise<MemberResponseType[]>
  updateMember: (
    member: object,
    config: configType,
    isHuman: boolean,
  ) => Promise<MemberResponseType>
  // Institutions
  getInstitutionCredentials: (institutionGuid: string) => Promise<CredentialResponseType[]>
  loadDiscoveredInstitutions: () => Promise<InstitutionResponseType[]>
  loadInstitutionByCode: (code: string) => Promise<InstitutionResponseType>
  loadInstitutions: (data: {
    routing_number: string
    account_verification_is_enabled: boolean
    account_identification_is_enabled: boolean
  }) => Promise<InstitutionResponseType[]>
  loadInstitutionByGuid: (guid: string) => Promise<InstitutionResponseType>
  loadPopularInstitutions: (params: object) => Promise<InstitutionResponseType[]>
  // Microdeposits
  loadMicrodepositByGuid: (guid: string) => Promise<MicrodepositResponseType>
  refreshMicrodepositStatus: (guid: string) => Promise<void>
  verifyRoutingNumber: (
    routingNumber: string,
    includeIdentity: boolean,
  ) => Promise<BlockedRoutingNumberType | object>
  createMicrodeposit: (data: MicrodepositCreateType) => Promise<MicrodepositResponseType>
  updateMicrodeposit: (
    guid: string,
    data: MicrodepositUpdateType,
  ) => Promise<MicrodepositResponseType>
  verifyMicrodeposit: (
    guid: string,
    data: MicroDepositVerifyType,
  ) => Promise<MicrodepositResponseType>
  //OAuth
  loadOAuthState: (oauthStateGuid: string) => Promise<OAuthStateResponseType>
  loadOAuthStates: ({
    outbound_member_guid,
    auth_status,
  }: {
    outbound_member_guid: string
    auth_status: string
  }) => Promise<OAuthStateResponseType[]>
  getOAuthWindowURI: (memberGuid: string, config: configType) => Promise<OAuthWindowURIResponseType>
  //MFA
  updateMFA: (member: object, config: configType, isHuman: boolean) => Promise<MemberResponseType>
  // Support
  createSupportTicket: (data: SupportTicketType) => Promise<void>
  //Job
  loadJob: (jobGuid: string) => Promise<JobResponseType>
  runJob: (
    jobType: string,
    memberGuid: string,
    config: configType,
    isHuman: boolean,
  ) => Promise<MemberResponseType>
  // User
  updateUserProfile: ({
    userProfile,
    too_small_modal_dismissed_at,
  }: {
    userProfile: object
    too_small_modal_dismissed_at: string
  }) => Promise<UserProfileResponseType>
}

type ApiProviderTypes = { apiValue: ApiContextTypes; children: React.ReactNode }

// ADD DEFAULTS AS YOU GO
const defaultApiValue: ApiContextTypes = {
  // Accounts
  createAccount: () => Promise.resolve({} as AccountResponseType),
  // Members
  addMember: () => Promise.resolve({} as MemberResponseType),
  deleteMember: () => Promise.resolve(),
  getMemberCredentials: () => Promise.resolve([] as CredentialResponseType[]),
  loadMemberByGuid: () => Promise.resolve({} as MemberResponseType),
  loadMembers: () => Promise.resolve([] as MemberResponseType[]),
  // Institutions
  getInstitutionCredentials: () => Promise.resolve([] as CredentialResponseType[]),
  loadDiscoveredInstitutions: () => Promise.resolve([] as InstitutionResponseType[]),
  loadInstitutionByCode: () => Promise.resolve({} as InstitutionResponseType),
  loadInstitutions: () => Promise.resolve([] as InstitutionResponseType[]),
  loadInstitutionByGuid: () => Promise.resolve({} as InstitutionResponseType),
  // Microdeposits
  createMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  loadMicrodepositByGuid: () => Promise.resolve({} as MicrodepositResponseType),
  loadPopularInstitutions: () => Promise.resolve([] as InstitutionResponseType[]),
  refreshMicrodepositStatus: () => Promise.resolve(),
  updateMember: () => Promise.resolve({} as MemberResponseType),
  updateMFA: () => Promise.resolve({} as MemberResponseType),
  updateMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyRoutingNumber: () => Promise.resolve({} as BlockedRoutingNumberType),
  //OAuth
  loadOAuthState: () => Promise.resolve({} as OAuthStateResponseType),
  loadOAuthStates: () => Promise.resolve([] as OAuthStateResponseType[]),
  getOAuthWindowURI: () => Promise.resolve({} as OAuthWindowURIResponseType),
  // Support
  createSupportTicket: () => Promise.resolve(),
  //Job
  loadJob: () => Promise.resolve({} as JobResponseType),
  runJob: () => Promise.resolve({} as MemberResponseType),
  // User
  updateUserProfile: () => Promise.resolve({} as UserProfileResponseType),
}

const ApiContext = React.createContext<ApiContextTypes>(defaultApiValue)

const ApiProvider = ({ apiValue, children }: ApiProviderTypes) => {
  return (
    <ApiContext.Provider value={{ ...defaultApiValue, ...apiValue }}>
      {children}
    </ApiContext.Provider>
  )
}

const useApi = () => {
  const context = React.useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within a ApiProvider')
  }
  return { api: context }
}

export { ApiProvider, useApi }
