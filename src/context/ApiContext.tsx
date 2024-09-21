/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { configType } from 'src/redux/reducers/configSlice'

// ADD TYPES AS YOU GO
type ApiContextTypes = {
  // Accounts
  createAccount: (data: AccountType) => Promise<AccountType>
  // Members
<<<<<<< HEAD
  addMember: (addMember: object, config: configType, isHuman: boolean) => Promise<MemberType>
  getMemberCredentials: (memberGuid: string) => Promise<CredentialType[]>
  loadMemberByGuid: (guid: string) => Promise<MemberType>
  updateMember: (member: object, config: configType, isHuman: boolean) => Promise<MemberType>
  // Institutions
  getInstitutionCredentials: (institutionGuid: string) => Promise<CredentialType[]>
  loadDiscoveredInstitutions: () => Promise<InstitutionType[]>
=======
  deleteMember: (member: MemberDeleteType) => Promise<void>
  loadMemberByGuid: (guid: string) => Promise<MemberResponseType>
  // Institutions
  loadInstitutionByGuid: (guid: string) => Promise<InstitutionType>
>>>>>>> def4c34404 (Fixed member types)
  loadInstitutions: (data: {
    routing_number: string
    account_verification_is_enabled: boolean
    account_identification_is_enabled: boolean
  }) => Promise<InstitutionType[]>
<<<<<<< HEAD
  loadInstitutionByGuid: (guid: string) => Promise<InstitutionType>
  loadPopularInstitutions: (params: object) => Promise<InstitutionType[]>
=======
>>>>>>> def4c34404 (Fixed member types)
  // Microdeposits
  loadMicrodepositByGuid: (guid: string) => Promise<MicrodepositResponseType>
  refreshMicrodepositStatus: (guid: string) => Promise<void>
  verifyRoutingNumber: (routingNumber: string, includeIdentity: boolean) => Promise<any>
  createMicrodeposit: (data: MicrodepositCreateType) => Promise<MicrodepositResponseType>
  updateMicrodeposit: (
    guid: string,
    data: MicrodepositUpdateType,
  ) => Promise<MicrodepositResponseType>
  verifyMicrodeposit: (
    guid: string,
    data: MicroDepositVerifyType,
  ) => Promise<MicroDepositVerifyResponseType>
  //OAuth
  getOAuthWindowURI: (memberGuid: string, config: configType) => Promise<OAuthWindowURIType>
  //MFA
  updateMFA: (member: object, config: configType, isHuman: boolean) => Promise<MemberType>
  // Support
  createSupportTicket: (data: SupportTicketType) => Promise<void>
}

type ApiProviderTypes = { apiValue: ApiContextTypes; children: React.ReactNode }

// ADD DEFAULTS AS YOU GO
const defaultApiValue: ApiContextTypes = {
  addMember: () => Promise.resolve({} as MemberType),
  createAccount: () => Promise.resolve({} as AccountType),
  createMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  getInstitutionCredentials: () => Promise.resolve([] as CredentialType[]),
  getMemberCredentials: () => Promise.resolve([] as CredentialType[]),
  getOAuthWindowURI: () => Promise.resolve({} as OAuthWindowURIType),
  loadDiscoveredInstitutions: () => Promise.resolve([] as InstitutionType[]),
  loadInstitutions: () => Promise.resolve([] as InstitutionType[]),
  // Accounts
  createAccount: () => Promise.resolve({} as AccountType),
  // Members
  deleteMember: () => Promise.resolve(),
  loadMemberByGuid: () => Promise.resolve({} as MemberResponseType),
  // Institutions
  loadInstitutionByGuid: () => Promise.resolve({} as InstitutionType),
  // Microdeposits
  loadMicrodepositByGuid: () => Promise.resolve({} as MicrodepositResponseType),
  loadMemberByGuid: () => Promise.resolve({} as MemberType),
  loadPopularInstitutions: () => Promise.resolve([] as InstitutionType[]),
  refreshMicrodepositStatus: () => Promise.resolve(),
  updateMember: () => Promise.resolve({} as MemberType),
  updateMFA: () => Promise.resolve({} as MemberType),
  updateMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyRoutingNumber: () => Promise.resolve({} as any),
  // Support
  createSupportTicket: () => Promise.resolve(),
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
