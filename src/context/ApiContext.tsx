/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { configType } from 'src/redux/reducers/configSlice'

// ADD TYPES AS YOU GO
type ApiContextTypes = {
  // Accounts
  createAccount: (data: AccountType) => Promise<AccountType>
  // Members
  addMember: (addMember: object, config: configType, isHuman: boolean) => Promise<MemberType>
  getMemberCredentials: (memberGuid: string) => Promise<CredentialType[]>
  loadMemberByGuid: (guid: string) => Promise<MemberType>
  updateMember: (member: object, config: configType, isHuman: boolean) => Promise<MemberType>
  // Institutions
  getInstitutionCredentials: (institutionGuid: string) => Promise<CredentialType[]>
  loadDiscoveredInstitutions: () => Promise<InstitutionType[]>
  loadInstitutions: (data: {
    routing_number: string
    account_verification_is_enabled: boolean
    account_identification_is_enabled: boolean
  }) => Promise<InstitutionType[]>
  loadInstitutionByGuid: (guid: string) => Promise<InstitutionType>
  loadPopularInstitutions: (params: object) => Promise<InstitutionType[]>
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
  // Accounts
  createAccount: () => Promise.resolve({} as AccountType),
  // Members
  addMember: () => Promise.resolve({} as MemberType),
  getMemberCredentials: () => Promise.resolve([] as CredentialType[]),
  loadMemberByGuid: () => Promise.resolve({} as MemberType),
  // Institutions
  getInstitutionCredentials: () => Promise.resolve([] as CredentialType[]),
  loadDiscoveredInstitutions: () => Promise.resolve([] as InstitutionType[]),
  loadInstitutions: () => Promise.resolve([] as InstitutionType[]),
  loadInstitutionByGuid: () => Promise.resolve({} as InstitutionType),
  // Microdeposits
  createMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  loadMicrodepositByGuid: () => Promise.resolve({} as MicrodepositResponseType),
  loadPopularInstitutions: () => Promise.resolve([] as InstitutionType[]),
  refreshMicrodepositStatus: () => Promise.resolve(),
  updateMember: () => Promise.resolve({} as MemberType),
  updateMFA: () => Promise.resolve({} as MemberType),
  updateMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyRoutingNumber: () => Promise.resolve({} as any),
  //OAuth
  getOAuthWindowURI: () => Promise.resolve({} as OAuthWindowURIType),
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
