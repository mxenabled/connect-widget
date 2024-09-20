import * as React from 'react'

// ADD TYPES AS YOU GO
type ApiContextTypes = object
type ApiProviderTypes = { apiValue: ApiContextTypes; children: React.ReactNode }

// ADD DEFAULTS AS YOU GO
const defaultApiValue = {}

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
  return context
}

export { ApiProvider, useApi }
