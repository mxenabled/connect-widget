/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'

// ADD TYPES AS YOU GO
type ApiContextTypes = {
  // Accounts
  createAccount: (data: AccountType) => Promise<AccountType>
  // Members
  loadMemberByGuid: (guid: string) => Promise<MemberType>
  // Institutions
  loadInstitutionByGuid: (guid: string) => Promise<InstitutionType>
  // Microdeposits
  loadMicrodepositByGuid: (guid: string) => Promise<MicroDepositType>
  refreshMicrodepositStatus: (guid: string) => Promise<void>
  verifyRoutingNumber: (routingNumber: string, includeIdentity: boolean) => Promise<any>
  loadInstitutions: (data: {
    routing_number: string
    account_verification_is_enabled: boolean
    account_identification_is_enabled: boolean
  }) => Promise<InstitutionType[]>
  createMicrodeposit: (data: MicroDepositType) => Promise<MicroDepositType>
  updateMicrodeposit: (guid: string, data: MicroDepositType) => Promise<MicroDepositType>
  verifyMicrodeposit: (
    guid: string,
    data: { deposit_amount_1: string; deposit_amount_2: string },
  ) => Promise<MicroDepositType>
}

type ApiProviderTypes = { apiValue: ApiContextTypes; children: React.ReactNode }

// ADD DEFAULTS AS YOU GO
const defaultApiValue: ApiContextTypes = {
  createAccount: () => Promise.resolve({} as AccountType),
  loadMemberByGuid: () => Promise.resolve({} as MemberType),
  loadInstitutionByGuid: () => Promise.resolve({} as InstitutionType),
  loadMicrodepositByGuid: () => Promise.resolve({} as MicroDepositType),
  refreshMicrodepositStatus: () => Promise.resolve(),
  verifyRoutingNumber: () => Promise.resolve({} as any),
  loadInstitutions: () => Promise.resolve([] as InstitutionType[]),
  createMicrodeposit: () => Promise.resolve({} as MicroDepositType),
  updateMicrodeposit: () => Promise.resolve({} as MicroDepositType),
  verifyMicrodeposit: () => Promise.resolve({} as MicroDepositType),
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
