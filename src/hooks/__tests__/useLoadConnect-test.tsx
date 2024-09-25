import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/redux/Store'
import type { configType } from 'src/redux/reducers/configSlice'
import { screen, render } from 'src/utilities/testingLibrary'
import useLoadConnect from 'src/hooks/useLoadConnect'
import { initialState } from 'src/services/mockedData'
import { STEPS } from 'src/const/Connect'
import { server } from 'src/services/testServer'
import { ApiEndpoints } from 'src/services/testServerHandlers'
import { HttpResponse, http } from 'msw'

const TestLoadConnectComponent: React.FC<{ clientConfig: configType }> = ({ clientConfig }) => {
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
    server.use(
      http.get(ApiEndpoints.MEMBERS, () => {
        return HttpResponse.error()
      }),
    )

    render(<TestLoadConnectComponent clientConfig={initialState.config} />)
    expect(await screen.findByText(/Oops something went wrong/i)).toBeInTheDocument()
  })
})
