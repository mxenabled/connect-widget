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
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

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
    loadConnect(clientConfig)
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
        clientConfig={{
          ...initialState.config,
          data_request: { products: [COMBO_JOB_DATA_TYPES.TRANSACTIONS] },
          current_institution_guid: 'INS-123',
        }}
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
      <TestLoadConnectComponent
        clientConfig={{
          ...initialState.config,
          data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER] },
        }}
      />,
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
        clientConfig={{
          ...initialState.config,
          data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER] },
        }}
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
            data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER] },
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
            data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER] },
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
            data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER] },
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
            data_request: { products: [COMBO_JOB_DATA_TYPES.ACCOUNT_OWNER] },
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
