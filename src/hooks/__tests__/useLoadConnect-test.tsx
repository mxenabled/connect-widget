import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/redux/Store'
import { screen, render } from 'src/utilities/testingLibrary'
import useLoadConnect from 'src/hooks/useLoadConnect'
import { initialState, institutionData } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue } from 'src/const/apiProviderMock'
import { ConfigError } from 'src/components/ConfigError'

const addNormalizedProducts = (clientConfig: ClientConfigType) => {
  const products = []
  const mode = clientConfig?.mode?.toLowerCase()
  const includeTransactions = clientConfig?.include_transactions
  const includeIdentity = clientConfig?.include_identity

  if (mode === 'reward') {
    products.push('rewards')
  } else if (mode === 'verification') {
    products.push('account_verification')
  } else {
    products.push('transactions')
  }

  if (includeTransactions) {
    products.push('transactions')
  }

  if (includeIdentity) {
    products.push('identity_verification')
  }

  const result = {
    ...clientConfig,
    data_request: {
      products: [...new Set(products)] as [string],
    },
  }

  return result
}

const TestLoadConnectComponent: React.FC<{ clientConfig: ClientConfigType }> = ({
  clientConfig,
}) => {
  const step = useSelector(
    (state: RootState) =>
      state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )
  const loadError = useSelector((state: RootState) => state.connect.loadError)
  const { loadConnect } = useLoadConnect()

  useEffect(() => {
    loadConnect(addNormalizedProducts(clientConfig))
  }, [])

  if (loadError) {
    if (loadError.type === 'config') {
      return <ConfigError error={loadError} />
    }
    return <p>Oops something went wrong</p>
  }

  if (step === STEPS.SEARCH) {
    return <p>Search</p>
  } else if (step === STEPS.ENTER_CREDENTIALS) {
    return <p>Enter credentials</p>
  } else {
    return <p>Search</p>
  }
}

describe('useLoadConnect', () => {
  it('sets the step to SEARCH when connect is loaded with the default aggregation mode', () => {
    render(<TestLoadConnectComponent clientConfig={initialState.config} />)
    expect(screen.getByText(/Search/i)).toBeInTheDocument()
  })
  it('sets the step to ENTER_CREDENTIALS when connect is loaded with the current_institution_guid', async () => {
    render(
      <TestLoadConnectComponent
        clientConfig={{ ...initialState.config, current_institution_guid: 'INS-123' }}
      />,
    )
    expect(await screen.findByText(/Enter credentials/i)).toBeInTheDocument()
  })
  it('returns a generic error when something bad happens when loading connect', async () => {
    const loadMembers = () => Promise.reject({})

    render(
      <ApiProvider apiValue={{ ...apiValue, loadMembers }}>
        <TestLoadConnectComponent clientConfig={initialState.config} />
      </ApiProvider>,
    )
    expect(await screen.findByText(/Oops something went wrong/i)).toBeInTheDocument()
  })

  it('returns a config error when client account verification is disabled and mode is verification ', async () => {
    render(
      <TestLoadConnectComponent clientConfig={{ ...initialState.config, mode: 'verification' }} />,
      {
        preloadedState: {
          profiles: {
            ...initialState.profiles,
            clientProfile: {
              ...initialState.profiles.clientProfile,
              account_verification_is_enabled: false,
            },
          },
        },
      },
    )
    expect(await screen.findByText(/Mode not enabled/i)).toBeInTheDocument()
    expect(
      await screen.findByText(
        /This mode isn’t available in your current plan. Please contact your representative to explore options./i,
      ),
    ).toBeInTheDocument()
  })

  it('returns a config error when client account identification is disabled and include_identity is true ', async () => {
    render(
      <TestLoadConnectComponent
        clientConfig={{ ...initialState.config, include_identity: true }}
      />,
      {
        preloadedState: {
          profiles: {
            ...initialState.profiles,
            clientProfile: {
              ...initialState.profiles.clientProfile,
              account_identification_is_enabled: false,
            },
          },
        },
      },
    )
    expect(await screen.findByText(/Mode not enabled/i)).toBeInTheDocument()
    expect(
      await screen.findByText(
        /This mode isn’t available in your current plan. Please contact your representative to explore options./i,
      ),
    ).toBeInTheDocument()
  })

  it('returns a config error when institution account verification is disabled and mode is verification', async () => {
    const mockApi = {
      ...apiValue,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(
        Promise.resolve({
          ...institutionData.institution,
          account_verification_is_enabled: false,
        }),
      ),
    }
    render(
      <ApiProvider apiValue={mockApi}>
        <TestLoadConnectComponent
          clientConfig={{
            ...initialState.config,
            mode: 'verification',
            current_institution_guid: 'INS-123',
          }}
        />
      </ApiProvider>,
    )
    expect(await screen.findByText(/Feature not available/i)).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Test Bank does not offer this feature. Please try another institution./i,
      ),
    ).toBeInTheDocument()
  })

  it('returns a config error when institution account identification is disabled and include_identity is true', async () => {
    const mockApi = {
      ...apiValue,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(
        Promise.resolve({
          ...institutionData.institution,
          account_identification_is_enabled: false,
        }),
      ),
    }
    render(
      <ApiProvider apiValue={mockApi}>
        <TestLoadConnectComponent
          clientConfig={{
            ...initialState.config,
            include_identity: true,
            current_institution_guid: 'INS-123',
          }}
        />
      </ApiProvider>,
    )
    expect(await screen.findByText(/Feature not available/i)).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Test Bank does not offer this feature. Please try another institution./i,
      ),
    ).toBeInTheDocument()
  })

  it('returns a config error when member institution account verification is disabled and mode is verification', async () => {
    const mockApi = {
      ...apiValue,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(
        Promise.resolve({
          ...institutionData.institution,
          account_verification_is_enabled: false,
        }),
      ),
    }
    render(
      <ApiProvider apiValue={mockApi}>
        <TestLoadConnectComponent
          clientConfig={{
            ...initialState.config,
            mode: 'verification',
            current_member_guid: 'MBR-123',
          }}
        />
      </ApiProvider>,
    )
    expect(await screen.findByText(/Feature not available/i)).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Test Bank does not offer this feature. Please try another institution./i,
      ),
    ).toBeInTheDocument()
  })

  it('returns a config error when member institution account identification is disabled and include_identity is true', async () => {
    const mockApi = {
      ...apiValue,
      loadInstitutionByGuid: vi.fn().mockResolvedValue(
        Promise.resolve({
          ...institutionData.institution,
          account_identification_is_enabled: false,
        }),
      ),
    }
    render(
      <ApiProvider apiValue={mockApi}>
        <TestLoadConnectComponent
          clientConfig={{
            ...initialState.config,
            include_identity: true,
            current_member_guid: 'MBR-123',
          }}
        />
      </ApiProvider>,
    )
    expect(await screen.findByText(/Feature not available/i)).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Test Bank does not offer this feature. Please try another institution./i,
      ),
    ).toBeInTheDocument()
  })
})
