import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/redux/Store'
import { screen, render } from 'src/utilities/testingLibrary'
import useLoadConnect from 'src/hooks/useLoadConnect'
import { initialState } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'
import { ApiProvider } from 'src/context/ApiContext'
import { apiValue } from 'src/const/apiProviderMock'

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
  it('returns an error when something bad happens when loading connect', async () => {
    const loadMembers = () => Promise.reject({})

    render(
      <ApiProvider apiValue={{ ...apiValue, loadMembers }}>
        <TestLoadConnectComponent clientConfig={initialState.config} />
      </ApiProvider>,
    )
    expect(await screen.findByText(/Oops something went wrong/i)).toBeInTheDocument()
  })
})
