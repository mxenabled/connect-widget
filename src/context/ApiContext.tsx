/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'

// ADD TYPES AS YOU GO
type ApiContextTypes = {
  // Accounts
  createAccount: (data: AccountType) => Promise<AccountType>
  // Members
  deleteMember: (member: MemberDeleteType) => Promise<void>
  loadMemberByGuid: (guid: string) => Promise<MemberResponseType>
  // Institutions
  loadInstitutionByGuid: (guid: string) => Promise<InstitutionType>
  loadInstitutions: (data: {
    routing_number: string
    account_verification_is_enabled: boolean
    account_identification_is_enabled: boolean
  }) => Promise<InstitutionType[]>
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
  ) => Promise<MicrodepositResponseType>
  // Support
  createSupportTicket: (data: SupportTicketType) => Promise<void>
}

type ApiProviderTypes = { apiValue: ApiContextTypes; children: React.ReactNode }

// ADD DEFAULTS AS YOU GO
const defaultApiValue: ApiContextTypes = {
  // Accounts
  createAccount: () => Promise.resolve({} as AccountType),
  // Members
  deleteMember: () => Promise.resolve(),
  loadMemberByGuid: () => Promise.resolve({} as MemberResponseType),
  // Institutions
  loadInstitutionByGuid: () => Promise.resolve({} as InstitutionType),
  // Microdeposits
  loadMicrodepositByGuid: () => Promise.resolve({} as MicrodepositResponseType),
  refreshMicrodepositStatus: () => Promise.resolve(),
  verifyRoutingNumber: () => Promise.resolve({} as any),
  loadInstitutions: () => Promise.resolve([] as InstitutionType[]),
  createMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  updateMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
  verifyMicrodeposit: () => Promise.resolve({} as MicrodepositResponseType),
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
