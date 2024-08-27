/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { screen, render, waitFor } from 'src/utilities/testingLibrary'

import { Credentials } from 'src/views/credentials/Credentials'
import { WaitForInstitution } from 'src/hooks/useFetchInstitution'
import { server } from 'src/services/testServer'
import { ApiEndpoints } from 'src/services/FireflyDataSource'
import { institutionData, masterData } from 'src/services/mockedData'
import { HttpResponse, http } from 'msw'

declare const global: {
  app: { config: any; clientConfig: any }
} & Window

const handleSubmitCredentials = vi.fn()
const onDeleteConnectionClick = vi.fn()
const onGoBackClick = vi.fn()

const credentialProps = {
  credentials: [
    { guid: 'CRD-123', label: 'Username', field_name: 'username' },
    { guid: 'CRD-456', label: 'Password', field_name: 'password' },
  ],
  error: {},
  handleSubmitCredentials,
  isProcessingMember: false,
  onDeleteConnectionClick,
  onGoBackClick,
}

describe('Credentials', () => {
  afterEach(() => {
    server.resetHandlers()
  })
  it('renders credentials, enters username and password', async () => {
    const ref = React.createRef()
    const { user } = render(
      <WaitForInstitution>
        <Credentials {...credentialProps} ref={ref} />
      </WaitForInstitution>,
    )

    await user.type(await screen.findByLabelText('Username'), 'user123')
    await user.type(await screen.findByLabelText('Password'), 'supersecretpassword')
    await user.click(await screen.findByText('Continue'))
    expect(handleSubmitCredentials).toHaveBeenCalled()
  })

  it(' clicks the go to website and goes to is leaving page', async () => {
    const ref = React.createRef()
    const { user } = render(
      <WaitForInstitution>
        <div id="connect-wrapper">
          <Credentials {...credentialProps} ref={ref} />
        </div>
      </WaitForInstitution>,
    )

    await user.click(await screen.findByTestId('credentials-recovery-button-institution-website'))

    const leavingNotice = await screen.findByText('You are leaving')

    expect(leavingNotice).toBeInTheDocument()
  })

  it('clicks the trouble signing in button and goes to is leaving page', async () => {
    const ref = React.createRef()
    const institutionDataCopy = {
      ...institutionData,
      institution: { ...institutionData.institution },
    }

    institutionDataCopy.institution['trouble_signing_credential_recovery_url'] = 'www.test.com'

    server.use(
      http.get(`${ApiEndpoints.INSTITUTIONS}/:id`, () => {
        return HttpResponse.json(institutionDataCopy)
      }),
    )

    const { user } = render(
      <WaitForInstitution>
        <div id="connect-wrapper">
          <Credentials {...credentialProps} ref={ref} />
        </div>
      </WaitForInstitution>,
    )
    await user.click(
      await screen.findByTestId('credential-recovery-button-forgot-trouble-signing-in'),
    )
    const leavingNotice = await screen.findByText('You are leaving')

    expect(leavingNotice).toBeInTheDocument()
  })

  it('clicks the go to website and goes to website directly', async () => {
    const masterDataCopy = {
      ...masterData,
      client_profile: {
        show_external_link_popup: false,
      },
    }
    server.use(
      http.get('/raja/data', () => {
        return HttpResponse.json(masterDataCopy)
      }),
      http.get(`${ApiEndpoints.INSTITUTIONS}/:id`, () => {
        return HttpResponse.json(institutionData)
      }),
    )
    const ref = React.createRef()
    const { user } = render(
      <WaitForInstitution>
        <Credentials {...credentialProps} ref={ref} />
      </WaitForInstitution>,
    )

    await user.click(await screen.findByTestId('credentials-recovery-button-institution-website'))
    waitFor(() => {
      expect(screen.queryByText('You are leaving')).not.toBeInTheDocument()
    })
  })

  it('renders credentials and clicks go back', async () => {
    const ref = React.createRef()
    const { user } = render(
      <WaitForInstitution>
        <Credentials {...credentialProps} ref={ref} />
      </WaitForInstitution>,
    )

    await user.click(await screen.findByText('Back'))
    waitFor(async () => {
      expect(onGoBackClick).toHaveBeenCalled()
    })
  })

  it('shows instructional data when present', async () => {
    const ref = React.createRef()
    const institutionDataCopy = {
      ...institutionData,
      institution: {
        ...institutionData.institution,
        instructional_data: {
          title: 'instructions',
          description: 'do these things',
          steps: ['1. do this first', '2. do this next'],
        },
      },
    }

    server.use(
      http.get(`${ApiEndpoints.INSTITUTIONS}/:id`, () => {
        return HttpResponse.json(institutionDataCopy)
      }),
    )
    render(
      <WaitForInstitution>
        <Credentials {...credentialProps} ref={ref} />
      </WaitForInstitution>,
    )

    expect(await screen.findByText('instructions')).toBeInTheDocument()
    expect(await screen.findByText('do these things')).toBeInTheDocument()
  })
  it('renders credentials and makes sure that the powered by MX footer is present', () => {
    const ref = React.createRef()
    const newConfig = { ...global.app.config }
    newConfig['show_mx_branding'] = true
    global.app.config = newConfig
    render(
      <WaitForInstitution>
        <Credentials {...credentialProps} ref={ref} />
      </WaitForInstitution>,
    )

    waitFor(() => {
      expect(screen.getByText('Data access by')).toBeInTheDocument()
    })
  })
  it('renders credentials and makes sure that the powered by MX footer is not present', () => {
    const ref = React.createRef()
    global.app.config['show_mx_branding'] = false
    render(
      <WaitForInstitution>
        <Credentials {...credentialProps} ref={ref} />
      </WaitForInstitution>,
    )

    waitFor(() => {
      expect(screen.queryByText('Data access by')).not.toBeInTheDocument()
    })
  })
})
